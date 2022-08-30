import { ORCHA_ID } from './constants';
import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';

/**
 * Manually parse an Orcha Query.
 *
 * This will recursively go through all `entities` and remove values that are not specified in the query.
 * (The object returned is a new object instance.)
 *
 * @example
 * ```ts
 * const query = createQuery<{ id: string; data: { name: string } }>()({
 *   data: {
 *     name: true,
 *   },
 * });
 * const parsed = parseQuery([
 *   {
 *     id: 1,
 *     extraField: 'field',
 *     data: {
 *       name: 'James',
 *       initial: 'J',
 *     },
 *   },
 *   {
 *     id: 2,
 *     extraField: 'field',
 *     data: {
 *       name: 'Lilly',
 *       initial: 'L',
 *     },
 *   },
 * ], query);
 *
 * // output:
 * // [
 * //   {
 * //     id: 1,
 * //     data: {
 * //       name: 'James',
 * //     },
 * //   },
 * //   {
 * //     id: 2,
 * //     data: {
 * //       name: 'Lilly',
 * //     },
 * //   },
 * // ]
 * ```
 *
 * @param query Reference Query.
 * @param entities Objects to parse.
 * @returns A parsed objected based on the query. The object returned is a new object instance.
 */
export function parseQuery<T, Q extends IQuery<T>>(entities: T, query: IExactQuery<T, Q>): IParser<T, Q>;
export function parseQuery<T, Q extends IQuery<T>>(entities: T[], query: IExactQuery<T, Q>): IParser<T[], Q>;
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
