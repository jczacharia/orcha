import { IPagination } from './pagination';
import { IParser } from './parser';
import { IQuery } from './query';

export function removeExtraFields<T, Q extends IQuery<T>>(entities: T | T[] | IPagination<T>, query: Q) {
  if (!entities || !query) return {} as IParser<T, Q>;

  // is pagination
  if ('items' in entities && 'meta' in entities) {
    const i = removeExtraFields((entities as any).items, query);
    (entities as any).items = i;
    return entities;
  }

  if (Array.isArray(query)) {
    query = query[0];
  }

  const remove = (e: T) => {
    const qKeys = Object.keys(query);
    for (const k of Object.keys(e)) {
      if (!qKeys.includes(k)) {
        delete e[k as keyof T];
      }
    }

    for (const [k, q] of Object.entries(query)) {
      if (typeof q === 'object') {
        removeExtraFields(e[k as keyof T], q);
      }
    }

    return e;
  };

  if (Array.isArray(entities)) {
    entities.map((e) => remove(e));
    // entities = entities.filter((e) => Object.entries(e).length > 0);
  } else {
    entities = remove(entities);
  }

  return (entities as unknown) as IParser<T, Q>;
}
