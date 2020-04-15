import * as api from '@opentelemetry/api';
import * as metrics from '@opentelemetry/metrics';
import {
  CPU_LABELS,
  HEAP_LABELS,
  MEMORY_LABELS,
  MEMORY_USAGE_LABELS,
  METRIC_NAMES,
  NATIVE_SPACE_ITEM,
  NATIVE_STATS_ITEM,
  NETWORK_LABELS,
  PROCESS_LABELS,
} from './enum';
import {
  getCpuUsageData,
  getHeapData,
  getMemoryUsageData,
  getProcessData,
} from './stats/common';
import { getStats } from './stats/native';
import { getMemoryData, getNetworkData } from './stats/si';
import * as types from './types';

interface MetricsCollectorConfig {
  exporter: metrics.MetricExporter;
  headers?: types.CollectorHeaders;
  /**
   * Character to be used to join metrics - default is "."
   */
  metricBoundCharacter?: string;
  /**
   * Name of component
   */
  name: string;
  url: string;
  /**
   * How often the metrics should be collected
   */
  intervalCollect?: number;
  intervalExport?: number;
}

const DEFAULT_INTERVAL_COLLECT = 30 * 1000;
const DEFAULT_INTERVAL_EXPORT = 60 * 1000;
const DEFAULT_NAME = 'lightstep-metrics-collector';
const DEFAULT_METRIC_BOUND_CHARACTER = '.';
const DEFAULT_KEY = 'name';

export class MetricsCollector {
  private _intervalCollect: number | undefined;
  private _intervalExport: number | undefined;
  private _exporter: metrics.MetricExporter;
  private _headers: types.CollectorHeaders;
  private _meter: metrics.Meter;
  private _name: string;
  private _boundCounters: { [key: string]: api.BoundCounter } = {};
  private _counters: {
    counter: api.Metric<api.BoundCounter>;
    keys: string[];
  }[] = [];

  private _lastMemoryData: Partial<types.MemoryData> = {};
  private _metricBoundCharacter: string;

  constructor(config: MetricsCollectorConfig) {
    this._intervalCollect =
      typeof config.intervalCollect === 'number'
        ? config.intervalCollect
        : DEFAULT_INTERVAL_COLLECT;
    this._intervalExport =
      typeof config.intervalExport === 'number'
        ? config.intervalExport
        : DEFAULT_INTERVAL_EXPORT;
    this._exporter = config.exporter;
    this._headers = Object.assign({}, config.headers);
    this._exporter = config.exporter;
    this._name = config.name || DEFAULT_NAME;
    this._metricBoundCharacter =
      config.metricBoundCharacter || DEFAULT_METRIC_BOUND_CHARACTER;

    console.log(this._headers);

    this._meter = new metrics.MeterProvider({
      interval: this._intervalExport,
      exporter: this._exporter,
    }).getMeter(this._name);
    this._start().then();
  }

  private _boundKey(metricName: string, key: string) {
    const boundKey = `${metricName}${this._metricBoundCharacter}${key}`;
    // if (!boundKey.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
    //   throw `Provided key ${ boundKey } cannot be used`;
    // }
    return boundKey;
  }

  private _collectData(initial = false) {
    console.log('_collectData');

    getMemoryData().then(memoryData => {
      this._lastMemoryData = memoryData;
    });

    // CPU
    Object.values(CPU_LABELS).forEach(value => {
      this._counterUpdate(METRIC_NAMES.CPU, value, getCpuUsageData()[value]);
    });

    // NETWORK
    getNetworkData().then(networkData => {
      Object.values(NETWORK_LABELS).forEach(value => {
        this._counterUpdate(METRIC_NAMES.NETWORK, value, networkData[value]);
      });
    });
  }

  private _counterUpdate(metricName: string, key: string, value: number = 0) {
    const boundKey = this._boundKey(metricName, key);
    this._boundCounters[boundKey].add(value);
  }

  private _createCounter(
    metricName: string,
    values: string[],
    description?: string
  ) {
    const keys = values.map(key => this._boundKey(metricName, key));
    const counter = this._meter.createCounter(metricName, {
      monotonic: true,
      labelKeys: [DEFAULT_KEY],
      description: description || metricName,
    });
    keys.forEach(key => {
      this._boundCounters[key] = counter.bind({ [DEFAULT_KEY]: key });
    });
    this._counters.push({
      counter,
      keys,
    });
  }

  private _createObserver(
    metricName: string,
    values: string[],
    callback: (value: string) => number | undefined,
    description?: string
  ) {
    const observer = this._meter.createObserver(metricName, {
      monotonic: false,
      labelKeys: [DEFAULT_KEY],
      description: description || metricName,
    }) as metrics.ObserverMetric;

    observer.setCallback(observerResult => {
      values.forEach(value => {
        const boundKey = this._boundKey(metricName, value);
        observerResult.observe(
          () => {
            return callback(value);
          },
          { [DEFAULT_KEY]: boundKey }
        );
      });
    });
  }

  private _createMetrics() {
    // CPU
    this._createCounter(
      METRIC_NAMES.CPU,
      Object.values(CPU_LABELS),
      'CPU Usage'
    );

    // NETWORK
    this._createCounter(
      METRIC_NAMES.NETWORK,
      Object.values(NETWORK_LABELS),
      'Network Usage'
    );

    // MEMORY USED
    this._createObserver(
      METRIC_NAMES.MEMORY_USAGE,
      Object.values(MEMORY_USAGE_LABELS),
      key => {
        return getMemoryUsageData()[key as keyof types.MemoryUsageData];
      },
      'Memory Usage'
    );

    // MEMORY
    this._createObserver(
      METRIC_NAMES.MEMORY,
      Object.values(MEMORY_LABELS),
      key => {
        return this._lastMemoryData[key as keyof types.MemoryData];
      },
      'Memory'
    );

    // HEAP
    this._createObserver(
      METRIC_NAMES.HEAP,
      Object.values(HEAP_LABELS),
      key => {
        return getHeapData()[key as keyof types.HeapData];
      },
      'Heap Data'
    );

    // PROCESS
    this._createObserver(
      METRIC_NAMES.PROCESS,
      Object.values(PROCESS_LABELS),
      key => {
        return getProcessData()[key as keyof types.ProcessData];
      },
      'Process UpTime'
    );

    // EVENT LOOP
    this._createObserver(
      METRIC_NAMES.EVENT_LOOP_DELAY,
      Object.values(NATIVE_STATS_ITEM),
      key => {
        return getStats().eventLoop[key as keyof types.NativeStatsItem];
      },
      'Event Loop'
    );

    // GC
    Object.keys(getStats().gc).forEach(statsKey => {
      if (statsKey === 'all') {
        this._createObserver(
          METRIC_NAMES.GC,
          Object.values(NATIVE_STATS_ITEM),
          key => {
            return getStats().gc[statsKey][key as keyof types.NativeStatsItem];
          },
          'GC for all'
        );
      } else {
        this._createObserver(
          this._boundKey(METRIC_NAMES.GC_BY_TYPE, statsKey),
          Object.values(NATIVE_STATS_ITEM),
          key => {
            return getStats().gc[statsKey][key as keyof types.NativeStatsItem];
          },
          `GC for ${statsKey}`
        );
      }
    });

    // HEAP SPACE
    const spaces = getStats().heap.spaces;

    spaces.forEach((space, index) => {
      this._createObserver(
        this._boundKey(METRIC_NAMES.HEAP_SPACE, space.spaceName),
        Object.values(NATIVE_SPACE_ITEM),
        key => {
          return getStats().heap.spaces[index][
            key as keyof types.NativeStatsSpaceItemNumbers
          ];
        },
        'Heap Spaces'
      );
    });
  }

  private async _start() {
    // initial collection
    getCpuUsageData();
    getMemoryUsageData();
    getHeapData();
    getProcessData();
    this._lastMemoryData = await getMemoryData();

    this._createMetrics();
    setInterval(() => {
      this._collectData();
    }, this._intervalCollect);
  }
}
