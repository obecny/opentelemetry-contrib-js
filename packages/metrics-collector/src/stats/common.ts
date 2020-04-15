import * as v8 from 'v8';
import * as os from 'os';
import { getFromCache } from '../cache';
import { METRIC_NAMES } from '../enum';
import { CpuUsageData, HeapData, MemoryUsageData, ProcessData } from '../types';
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
      user: elapsedUsage.user * MICROSECOND,
      system: elapsedUsage.system * MICROSECOND,
      usage: (elapsedUsage.user + elapsedUsage.system) * MICROSECOND,
      total: (cpuUsage.user + cpuUsage.system) * MICROSECOND,
    };
  });
}

export function getMemoryUsageData(): MemoryUsageData {
  return getFromCache(METRIC_NAMES.MEMORY_USAGE, () => {
    const memoryUsage = process.memoryUsage();
    return {
      external: memoryUsage.external,
      free: os.freemem(),
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      rss: memoryUsage.rss,
      total: os.totalmem(),
    };
  });
}

export function getHeapData(): HeapData {
  return getFromCache(METRIC_NAMES.HEAP, () => {
    const stats = v8.getHeapStatistics();
    return {
      doesZapGarbage: stats.does_zap_garbage,
      heapSizeLimit: stats.heap_size_limit,
      mallocedMemory: stats.malloced_memory,
      peakMallocedMemory: stats.peak_malloced_memory,
      totalAvailableSize: stats.total_available_size,
      totalHeapSize: stats.total_heap_size,
      totalHeapSizeExecutable: stats.total_heap_size_executable,
      totalPhysicalSize: stats.total_physical_size,
      usedHeapSize: stats.used_heap_size,
    };
  });
}

export function getProcessData(): ProcessData {
  return getFromCache(METRIC_NAMES.PROCESS, () => {
    return {
      upTime: Math.round(process.uptime()),
    };
  });
}
