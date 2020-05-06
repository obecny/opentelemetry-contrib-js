import { getFromCache } from '../cache';
import { METRIC_NAMES } from '../enum';
import { NativeStats, NativeStatsObj } from '../types';

const nodeGypBuild = require('node-gyp-build');
const path = require('path');
const base = path.resolve(`${__dirname}/../..`);
let nativeMetrics: NativeStatsObj;

export function getStats(): NativeStats | undefined {
  if (!nativeMetrics) {
    try {
      nativeMetrics = nodeGypBuild(base);
      nativeMetrics.start();
    } catch (e) {
      console.log(e.message);
    }
  }
  return getFromCache(METRIC_NAMES.NATIVE, () => {
    const stats: NativeStats | undefined = nativeMetrics
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
