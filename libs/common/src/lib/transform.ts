import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';

/**
 * Manually parse an Orcha Query.
 *
 * This will recursively go through all `entities` and remove values that are not specified in the query.
 *
 * @example
 * ```ts
 * const query = createQuery<{ id: string; data: { name: string } }>()({
 *   id: true,
 *   data: {
 *     name: true,
 *   },
 * });
 * const parsed = parseQuery(query, [
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
 * ]);
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
 */
export async function parseQuery<T, Q extends IQuery<T>>(
  query: IExactQuery<T, Q>,
  entities: T
): Promise<IParser<T, Q>>;
export async function parseQuery<T, Q extends IQuery<T>>(
  query: IExactQuery<T, Q>,
  entities: T[]
): Promise<IParser<T[], Q>>;
export async function parseQuery<T, Q extends IQuery<T>>(query: IExactQuery<T, Q>, entities: T | T[]) {
  if (!entities) {
    return null;
  }

  if (Array.isArray(query)) {
    query = query[0];
  }

  const remove = async (e: T) => {
    const qKeys = Object.keys(query) as (keyof T)[];
    for (const k of Object.keys(e) as (keyof T)[]) {
      if (!qKeys.includes(k)) {
        delete e[k];
      } else if (e[k] instanceof Promise) {
        e[k] = await e[k];
      }
    }

    for (const [k, q] of Object.entries(query as object)) {
      if (typeof q === 'object') {
        await parseQuery(q, e[k as keyof T]);
      }
    }

    return e;
  };

  if (Array.isArray(entities)) {
    entities = await Promise.all(entities.map((e) => remove(e)));
    return entities as unknown as IParser<T[], Q>;
  } else {
    entities = await remove(entities);
    return entities as unknown as IParser<T, Q>;
  }
}
