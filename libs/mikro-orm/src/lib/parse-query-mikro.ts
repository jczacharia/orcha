import { IQuery, IExactQuery, ORCHA_ID, IParser } from '@orcha/common';

export function parseQuery<T, Q extends IQuery<T>>(entities: T | T[], query: IExactQuery<T, Q>) {
  if (!entities) {
    return null;
  }

  if (Array.isArray(query)) {
    query = query[0];
  }

  const remove = (e: T) => {
    const obj: any = {};

    const qKeys = Object.keys(query) as (keyof T)[];
    for (const k of Object.keys(e) as (keyof T)[]) {
      if (k === ORCHA_ID || qKeys.includes(k)) {
        obj[k] = e[k];
      }
    }

    for (const [k, q] of Object.entries(query as object)) {
      if (typeof q === 'object') {
        obj[k] = parseQuery(obj[k], q);
      }
    }

    return obj;
  };

  if (Array.isArray(entities)) {
    return entities.map((e) => remove(e)) as unknown as IParser<T[], Q>;
  } else {
    return remove(entities) as unknown as IParser<T, Q>;
  }
}
