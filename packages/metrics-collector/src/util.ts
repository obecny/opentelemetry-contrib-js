export function ObjectKeys<T>(t: T) {
  return Object.keys(t) as (keyof T)[];
}
