import { CacheItem } from './types';

const cache: { [key: string]: CacheItem } = {};

const CACHE_VALID_MS = 10;

export function getFromCache(name: string, callback: () => any): any {
  let item = cache[name];
  const now = new Date().getTime();
  if (item && now - item.timestamp < CACHE_VALID_MS) {
    return item.data;
  }
  cache[name] = {
    timestamp: new Date().getTime(),
    data: callback(),
  };
  return cache[name].data;
}
