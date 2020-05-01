import { DoesZapCodeSpaceFlag } from 'v8';

export type KeyValue = { [key: string]: string };
export type CollectorHeaders = { [key: string]: string };

export interface MemoryData {
  total: number;
  free: number;
  used: number;
  active: number;
  available: number;
  buffCache: number;
  buffers: number;
  cached: number;
  slab: number;
  swapTotal: number;
  swapUsed: number;
  swapFree: number;
}

export interface NetworkData {
  bytesRecv: number;
  bytesSent: number;
}

export interface ProcessData {
  upTime: number;
}

export interface CpuUsageData {
  user: number;
  sys: number;
  usage: number;
  total: number;
}

export interface MemoryData {
  available: number;
  external: number;
  free: number;
  heapTotal: number;
  heapUsed: number;
  rss: number;
  total: number;
}

export interface HeapData {
  doesZapGarbage: DoesZapCodeSpaceFlag;
  heapSizeLimit: number;
  mallocedMemory: number;
  peakMallocedMemory: number;
  totalAvailableSize: number;
  totalHeapSize: number;
  totalHeapSizeExecutable: number;
  totalPhysicalSize: number;
  usedHeapSize: number;
}

export interface NativeStatsObj {
  stats: () => NativeStats;
  start: () => void;
  stop: () => void;
}

export interface NativeStats {
  eventLoop: NativeStatsItem;
  gc: { [key: string]: NativeStatsItem };
  heap: {
    spaces: (NativeStatsSpaceItem & NativeStatsSpaceItemNumbers)[];
  };
}

export interface NativeStatsSpaceItem {
  spaceName: string;
}

export interface NativeStatsSpaceItemNumbers {
  size: number;
  usedSize: number;
  availableSize: number;
  physicalSpaceSize: number;
}

export interface NativeStatsItem {
  min: number;
  max: number;
  sum: number;
  avg: number;
  count: number;
  median: number;
  p95: number;
  total: number;
}

export interface CacheItem {
  timestamp: number;
  data: any;
}
