import { getFromCache } from '../cache';
import { METRIC_NAMES } from '../enum';
import { NativeStats } from '../types';

const nodeGypBuild = require('node-gyp-build');
const path = require('path');
const base = path.resolve(`${__dirname}/../../..`);
const nativeMetrics = nodeGypBuild(base);

nativeMetrics.start();

export function getStats(): NativeStats {
  return getFromCache(METRIC_NAMES.NATIVE, () => {
    const stats: NativeStats = nativeMetrics
      ? nativeMetrics.stats()
      : undefined;
    if (stats) {
      stats.eventLoop.total = stats.eventLoop.sum;
      Object.keys(stats.gc).forEach(key => {
        stats.gc[key].total = stats.gc[key].sum;
      });
    }
    return stats;
  });
}
