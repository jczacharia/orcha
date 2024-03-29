import { IExactQuery, IQuery } from './query';

/**
 * Creates a type-safe query object. Note this is a curried function to get around Typescript limitations.
 *
 * Use this when creating Operations.
 *
 * @example
 * ```typescript
 * export const UserQuery = createQuery<User>()({
 *   name: true,
 *   items: {
 *     title: true,
 *   }
 * });
 * ```
 */
export const createQuery =
  <T>() =>
  <Q extends IQuery<T>>(query: IExactQuery<T, Q>) =>
    query as Q;
