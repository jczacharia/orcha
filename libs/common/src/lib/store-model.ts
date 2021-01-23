import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';

/**
 * Creates a type-safe query model. Note this is a curried function to get around Typescript limitations.
 *
 * @example
 * ```typescript
 * export const UserQueryModel = createQueryModel<User>()({
 *   id: true,
 *   name: true,
 *   items: {
 *     id: true,
 *     title: true,
 *   }
 * });
 * ```
 */
export const createQueryModel = <T>() => <Q extends IQuery<T>>(query: IExactQuery<T, Q>) => query as Q;

/**
 * Creates a Store Model type based on a Query Model.
 * 
 * @example
 * ```typescript
 * export const UserQueryModel = createQueryModel<User>()({
 *   id: true,
 *   name: true,
 *   items: {
 *     id: true,
 *     title: true,
 *   }
 * });
 * 
 * export type IUserStoreModel = IStoreModel<User, typeof UserQueryModel>;
 * ```
 */
export type IStoreModel<T, Q extends IQuery<T>> = IParser<T, Q>;
