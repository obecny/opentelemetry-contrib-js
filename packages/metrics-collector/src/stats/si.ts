import * as SI from 'systeminformation';
import { NetworkData } from '../types';
import { ObjectKeys } from '../util';

let previousNetworkStats: Partial<NetworkData> = {};

/**
 * It returns network usage delta from last time
 */
export function getNetworkData() {
  return new Promise<NetworkData>(resolve => {
    const stats: NetworkData = {
      bytesRecv: 0,
      bytesSent: 0,
    };
    SI.networkStats()
      .then(results => {
        results.forEach(result => {
          stats.bytesRecv += result.rx_bytes;
          stats.bytesSent += result.tx_bytes;
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
