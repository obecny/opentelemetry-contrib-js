import { getFromCache } from '../cache';
import { METRIC_NAMES } from '../enum';
import { NativeStats } from '../types';

const nodeGypBuild = require('node-gyp-build');
const path = require('path');
const base = path.resolve(`${__dirname}/../../..`);
const nativeMetrics = nodeGypBuild(base);

nativeMetrics.start();

export function getStats(): NativeStats {
  return getFromCache(METRIC_NAMES.CPU, () => {
    return nativeMetrics ? nativeMetrics.stats() : undefined;
  });
}
