export enum METRIC_NAMES {
  CPU = 'cpu',
  EVENT_LOOP_DELAY = 'eventLoopDelay',
  GC = 'gc',
  GC_BY_TYPE = 'gcByType',
  HEAP = 'heap',
  HEAP_SPACE = 'heapSpace',
  NETWORK = 'net',
  MEMORY_USAGE = 'memUsage',
  MEMORY = 'mem',
  NATIVE = 'native',
  PROCESS = 'process',
}

export enum CPU_LABELS {
  USER = 'user',
  SYSTEM = 'system',
  USAGE = 'usage',
  TOTAL = 'total',
}

export enum NETWORK_LABELS {
  BYTES_SENT = 'txBytes',
  BYTES_RECEIVED = 'rxBytes',
}

export enum MEMORY_USAGE_LABELS {
  HEAP_TOTAL = 'heapTotal',
  HEAP_USED = 'heapUsed',
  RSS = 'rss',
  TOTAL = 'total',
  FREE = 'free',
}

export enum MEMORY_LABELS {
  MEMORY_TOTAL = 'total',
  MEMORY_AVAILABLE = 'available',
}

export enum HEAP_LABELS {
  TOTAL_SIZE = 'totalHeapSize',
  TOTAL_SIZE_EXECUTABLE = 'totalHeapSizeExecutable',
  TOTAL_PHYSICAL_SIZE = 'totalPhysicalSize',
  TOTAL_AVAILABLE_SIZE = 'totalAvailableSize',
  SIZE_LIMIT = 'heapSizeLimit',
}

export enum PROCESS_LABELS {
  UP_TIME = 'upTime',
}

export enum NATIVE_STATS_ITEM {
  MIN = 'min',
  MAX = 'max',
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MEDIAN = 'median',
  P95 = 'p95',
}

export enum NATIVE_SPACE_ITEM {
  SPACE_SIZE = 'spaceSize',
  SPACE_USED_SIZE = 'spaceUsedSize',
  SPACE_AVAILABLE_SIZE = 'spaceAvailableSize',
  PHYSICAL_SPACE_SIZE = 'physicalSpaceSize',
}
