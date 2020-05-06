import * as api from '@opentelemetry/api';
import { unrefTimer } from '@opentelemetry/core';
import * as metrics from '@opentelemetry/metrics';
import {
  CPU_LABELS,
  HEAP_LABELS,
  MEMORY_LABELS,
  METRIC_NAMES,
  NATIVE_SPACE_ITEM,
  NETWORK_LABELS,
  PROCESS_LABELS,
  NATIVE_STATS_ITEM,
  NATIVE_STATS_ITEM_COUNTER,
  MEMORY_LABELS_RUNTIME,
} from './enum';
import {
  getCpuUsageData,
  getHeapData,
  getMemoryData,
  getProcessData,
} from './stats/common';
import { getStats } from './stats/native';
import { getNetworkData } from './stats/si';
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
  private _meter: metrics.Meter;
  private _name: string;
  private _boundCounters: { [key: string]: api.BoundCounter } = {};
  private _counters: {
    counter: api.Metric<api.BoundCounter>;
    keys: string[];
  }[] = [];

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
    this._exporter = config.exporter;
    this._name = config.name || DEFAULT_NAME;
    this._metricBoundCharacter =
      config.metricBoundCharacter || DEFAULT_METRIC_BOUND_CHARACTER;
    this._meter = new metrics.MeterProvider({
      interval: this._intervalExport,
      exporter: this._exporter,
    }).getMeter(this._name);
    this._start();
  }

  private _boundKey(metricName: string, key: string) {
    if (!key) {
      return metricName;
    }
    return `${metricName}${this._metricBoundCharacter}${key}`;
  }

  private _collectData(initial = false) {
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

    // EVENT LOOP COUNTERS
    const stats = getStats();
    if (stats) {
      this._counterUpdate(
        METRIC_NAMES.EVENT_LOOP_DELAY_COUNTER,
        NATIVE_STATS_ITEM_COUNTER.COUNT,
        stats.eventLoop.count
      );
      this._counterUpdate(
        METRIC_NAMES.EVENT_LOOP_DELAY_COUNTER,
        NATIVE_STATS_ITEM_COUNTER.SUM,
        stats.eventLoop.sum
      );
      this._counterUpdate(
        METRIC_NAMES.EVENT_LOOP_DELAY_COUNTER,
        NATIVE_STATS_ITEM_COUNTER.TOTAL,
        stats.eventLoop.sum
      );
    }
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
    callback: (value: string, key?: string) => number | undefined,
    description: string,
    labelValues: string[] = [],
    labelKey: string = '',
    afterKey: string = ''
  ) {
    const labelKeys = [DEFAULT_KEY];
    if (labelKey) {
      labelKeys.push(labelKey);
    }
    const observer = this._meter.createObserver(metricName, {
      monotonic: false,
      labelKeys: labelKeys,
      description: description || metricName,
    }) as metrics.ObserverMetric;

    observer.setCallback(observerResult => {
      values.forEach(value => {
        const boundKey = this._boundKey(
          this._boundKey(metricName, value),
          afterKey
        );
        if (labelKey) {
          // there is extra label to be observed mixed with default one
          // for example we want to be able to observe name and gc_type
          labelValues.forEach(label => {
            const observedLabels = Object.assign(
              {},
              { [DEFAULT_KEY]: boundKey },
              {
                [labelKey]: label,
              }
            );
            observerResult.observe(() => {
              return callback(value, label) || 0;
            }, observedLabels);
          });
        } else {
          observerResult.observe(
            () => {
              return callback(value);
            },
            { [DEFAULT_KEY]: boundKey }
          );
        }
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

    // MEMORY
    this._createObserver(
      METRIC_NAMES.MEMORY,
      Object.values(MEMORY_LABELS),
      key => {
        return getMemoryData()[key as keyof types.MemoryData];
      },
      'Memory'
    );

    // MEMORY RUNTIME
    this._createObserver(
      METRIC_NAMES.MEMORY_RUNTIME,
      Object.values(MEMORY_LABELS_RUNTIME),
      key => {
        return getMemoryData()[key as keyof types.MemoryData];
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
        const stats = getStats();
        return stats?.eventLoop[key as keyof types.NativeStatsItem];
      },
      'Event Loop'
    );

    // EVENT LOOP COUNTERS
    this._createCounter(
      METRIC_NAMES.EVENT_LOOP_DELAY_COUNTER,
      Object.values(NATIVE_STATS_ITEM_COUNTER),
      'Event Loop'
    );

    // GC ALL
    this._createObserver(
      METRIC_NAMES.GC,
      Object.values(NATIVE_STATS_ITEM),
      key => {
        const stats = getStats();
        return stats?.gc.all[key as keyof types.NativeStatsItem];
      },
      'GC for all'
    );

    // GC BY TYPE
    this._createObserver(
      METRIC_NAMES.GC_BY_TYPE,
      Object.values(NATIVE_STATS_ITEM),
      (key, label = '') => {
        const stats = getStats();
        const stat = stats?.gc[label];
        if (stat) {
          return stat[key as keyof types.NativeStatsItem];
        }
        return undefined;
      },
      'GC by type',
      [
        'scavenge',
        'markSweepCompact',
        'incrementalMarking',
        'processWeakCallbacks',
      ],
      'gc_type'
    );

    // HEAP SPACE
    const stats = getStats();
    const spacesLabels = stats?.heap.spaces.map(space => space.spaceName);

    this._createObserver(
      METRIC_NAMES.HEAP_SPACE,
      Object.values(NATIVE_SPACE_ITEM),
      (key, label = '') => {
        if (spacesLabels === undefined) {
          return undefined;
        }
        const index = spacesLabels.indexOf(label);
        const stats = getStats();
        const stat = stats?.heap.spaces[index];
        if (stat) {
          return stat[key as keyof types.NativeStatsSpaceItemNumbers];
        }
        return undefined;
      },
      'Heap Spaces',
      spacesLabels,
      'heap_space',
      this._boundKey('by', 'space')
    );
  }

  private _start() {
    // initial collection
    getCpuUsageData();
    getMemoryData();
    getHeapData();
    getProcessData();
    getNetworkData();
    getStats();

    this._createMetrics();
    const timer = setInterval(() => {
      this._collectData();
    }, this._intervalCollect);
    unrefTimer((timer as unknown) as NodeJS.Timeout);
  }
}
