import { ORCHA_ID } from './constants';
import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';

/**
 * Manually parse an Orcha Query.
 *
 * This will recursively go through all `entities` and remove values that are not specified in the query.
 * The object returned is the same object instance.
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
 *       comments:
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
 * @returns A parsed objected based on the query. The object returned is the same object instance.
 */
export function parseQuery<T, Q extends IQuery<T>>(entities: T, query: IExactQuery<T, Q>): IParser<T, Q>;
export function parseQuery<T, Q extends IQuery<T>>(entities: T[], query: IExactQuery<T, Q>): IParser<T[], Q>;
export function parseQuery<T, Q extends IQuery<T>>(entities: T | T[], query: IExactQuery<T, Q>) {
  if (!entities) {
    return null;
  }

  const remove = (e: any) => {
    const qKeys = Object.keys(query);
    const objKeys = Object.keys(e);
    for (let i = 0; i < objKeys.length; i++) {
      const k = objKeys[i];
      if (k !== ORCHA_ID && !qKeys.includes(k)) {
        delete e[k];
      }
    }

    const entries = Object.entries(query);
    for (let i = 0; i < entries.length; i++) {
      const [k, q] = entries[i];
      if (typeof q === 'object') {
        parseQuery(e[k], q);
      }
    }
  };

  if (Array.isArray(entities)) {
    for (let i = 0; i < entities.length; i++) {
      remove(entities[i]);
    }
  } else {
    remove(entities) as unknown as IParser<T, Q>;
  }

  return entities;
}
