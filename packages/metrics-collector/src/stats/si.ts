import * as SI from 'systeminformation';
import { MemoryData, NetworkData } from '../types';
import { ObjectKeys } from '../util';

export function getMemoryData() {
  return new Promise<MemoryData>(resolve => {
    SI.mem()
      .then(result => {
        resolve({
          total: result.total,
          free: result.free,
          used: result.used,
          active: result.active,
          available: result.available,
          buffCache: result.buffcache,
          buffers: result.buffers,
          cached: result.cached,
          slab: result.slab,
          swapTotal: result.swaptotal,
          swapUsed: result.swapused,
          swapFree: result.swapfree,
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          free: 0,
          used: 0,
          active: 0,
          available: 0,
          buffCache: 0,
          buffers: 0,
          cached: 0,
          slab: 0,
          swapTotal: 0,
          swapUsed: 0,
          swapFree: 0,
        });
      });
  });
}

let previousNetworkStats: Partial<NetworkData> = {};

/**
 * It returns network usage delta from last time
 */
export function getNetworkData() {
  return new Promise<NetworkData>(resolve => {
    const stats: NetworkData = {
      rxBytes: 0,
      rxDropped: 0,
      rxErrors: 0,
      txSec: 0,
      txBytes: 0,
      txDropped: 0,
      txErrors: 0,
      rxSec: 0,
      ms: 0,
    };
    SI.networkStats()
      .then(results => {
        results.forEach(result => {
          stats.rxBytes += result.rx_bytes;
          stats.rxDropped += result.rx_dropped;
          stats.rxErrors += result.rx_errors;
          stats.rxSec += result.rx_sec;
          stats.txBytes += result.tx_bytes;
          stats.txDropped += result.tx_dropped;
          stats.txErrors += result.tx_errors;
          stats.txSec += result.tx_sec;
          stats.ms += result.ms;
        });
        const lastStats = Object.assign({}, stats);

        if (previousNetworkStats) {
          ObjectKeys(stats).forEach(key => {
            stats[key] = stats[key] - (previousNetworkStats[key] || 0);
          });
        }
        previousNetworkStats = lastStats;
        resolve(stats);
      })
      .catch(() => {
        resolve(stats);
      });
  });
}
