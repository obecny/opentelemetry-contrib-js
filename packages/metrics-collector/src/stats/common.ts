import * as v8 from 'v8';
import * as os from 'os';
import { getFromCache } from '../cache';
import {
  CPU_LABELS,
  HEAP_LABELS,
  MEMORY_LABELS,
  MEMORY_LABELS_RUNTIME,
  METRIC_NAMES,
  PROCESS_LABELS,
} from '../enum';
import { CpuUsageData, HeapData, MemoryData, ProcessData } from '../types';
import CpuUsage = NodeJS.CpuUsage;

const MICROSECOND = 1 / 1e6;
let cpuUsage: CpuUsage | undefined;

/**
 * It returns cpu load delta from last time
 */
export function getCpuUsageData(): CpuUsageData {
  return getFromCache(METRIC_NAMES.CPU, () => {
    const elapsedUsage = process.cpuUsage(cpuUsage);
    cpuUsage = process.cpuUsage();
    return {
      [CPU_LABELS.USER]: elapsedUsage.user * MICROSECOND,
      [CPU_LABELS.SYSTEM]: elapsedUsage.system * MICROSECOND,
      [CPU_LABELS.USAGE]:
        (elapsedUsage.user + elapsedUsage.system) * MICROSECOND,
      [CPU_LABELS.TOTAL]: (cpuUsage.user + cpuUsage.system) * MICROSECOND,
    };
  });
}

export function getMemoryData(): MemoryData {
  return getFromCache(METRIC_NAMES.MEMORY, () => {
    const memoryUsage = process.memoryUsage();
    return {
      [MEMORY_LABELS.AVAILABLE]: os.freemem(),
      [MEMORY_LABELS_RUNTIME.EXTERNAL]: memoryUsage.external,
      [MEMORY_LABELS_RUNTIME.FREE]: os.freemem(),
      [MEMORY_LABELS_RUNTIME.HEAP_TOTAL]: memoryUsage.heapTotal,
      [MEMORY_LABELS_RUNTIME.HEAP_USED]: memoryUsage.heapUsed,
      [MEMORY_LABELS_RUNTIME.RSS]: memoryUsage.rss,
      [MEMORY_LABELS.TOTAL]: os.totalmem(),
    };
  });
}

export function getHeapData(): HeapData {
  return getFromCache(METRIC_NAMES.HEAP, () => {
    const stats = v8.getHeapStatistics();
    return {
      [HEAP_LABELS.TOTAL_HEAP_SIZE]: stats.total_heap_size,
      [HEAP_LABELS.TOTAL_HEAP_SIZE_EXECUTABLE]:
        stats.total_heap_size_executable,
      [HEAP_LABELS.TOTAL_PHYSICAL_SIZE]: stats.total_physical_size,
      [HEAP_LABELS.TOTAL_AVAILABLE_SIZE]: stats.total_available_size,
      [HEAP_LABELS.USED_HEAP_SIZE]: stats.used_heap_size,
      [HEAP_LABELS.HEAP_SIZE_LIMIT]: stats.heap_size_limit,
      [HEAP_LABELS.MALLOCED_MEMORY]: stats.malloced_memory,
      [HEAP_LABELS.PEAK_MALLOCED_MEMORY]: stats.peak_malloced_memory,
      [HEAP_LABELS.DOES_ZAP_GARBAGE]: stats.does_zap_garbage,
    };
  });
}

export function getProcessData(): ProcessData {
  return getFromCache(METRIC_NAMES.PROCESS, () => {
    return {
      [PROCESS_LABELS.UP_TIME]: Math.round(process.uptime()),
    };
  });
}
