export enum METRIC_NAMES {
  CPU = 'cpu',
  EVENT_LOOP_DELAY = 'runtime.node.eventLoop.delay',
  EVENT_LOOP_DELAY_COUNTER = 'runtime.node.eventLoop.delayCounter',
  GC = 'runtime.node.gc.pause',
  GC_BY_TYPE = 'runtime.node.gc.pause.by.type',
  HEAP = 'runtime.node.heap',
  HEAP_SPACE = 'runtime.node.heapSpace',
  NETWORK = 'net',
  MEMORY = 'mem',
  MEMORY_RUNTIME = 'runtime.node.mem',
  NATIVE = 'native',
  PROCESS = 'runtime.node.process',
}

export enum CPU_LABELS {
  USER = 'user',
  SYSTEM = 'sys',
  USAGE = 'usage',
  TOTAL = 'total',
}

export enum NETWORK_LABELS {
  BYTES_SENT = 'bytesSent',
  BYTES_RECEIVED = 'bytesRecv',
}

export enum MEMORY_LABELS_RUNTIME {
  EXTERNAL = 'external',
  FREE = 'free',
  HEAP_TOTAL = 'heapTotal',
  HEAP_USED = 'heapUsed',
  RSS = 'rss',
}

export enum MEMORY_LABELS {
  AVAILABLE = 'available',
  TOTAL = 'total',
}

export enum HEAP_LABELS {
  TOTAL_HEAP_SIZE = 'totalHeapSize',
  TOTAL_HEAP_SIZE_EXECUTABLE = 'totalHeapSizeExecutable',
  TOTAL_PHYSICAL_SIZE = 'totalPhysicalSize',
  TOTAL_AVAILABLE_SIZE = 'totalAvailableSize',
  USED_HEAP_SIZE = 'usedHeapSize',
  HEAP_SIZE_LIMIT = 'heapSizeLimit',
  MALLOCED_MEMORY = 'mallocedMemory',
  PEAK_MALLOCED_MEMORY = 'peakMallocedMemory',
  DOES_ZAP_GARBAGE = 'doesZapGarbage',
}

export enum PROCESS_LABELS {
  UP_TIME = 'upTime',
}

export enum NATIVE_STATS_ITEM {
  MIN = 'min',
  MAX = 'max',
  AVG = 'avg',
  MEDIAN = 'median',
  P95 = 'p95',
}

export enum NATIVE_STATS_ITEM_COUNTER {
  SUM = 'sum',
  TOTAL = 'total',
  COUNT = 'count',
}

export enum NATIVE_SPACE_ITEM {
  SPACE_SIZE = 'size',
  SPACE_USED_SIZE = 'usedSize',
  SPACE_AVAILABLE_SIZE = 'availableSize',
  PHYSICAL_SPACE_SIZE = 'physicalSize',
}
