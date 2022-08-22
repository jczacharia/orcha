/* eslint-disable @typescript-eslint/ban-types */
import { ORCHA_ID } from './constants';
import { IPagination } from './pagination';
import { IOrchaModel } from './relations';

/**
 * Creates a parsed model type based on an Orcha Query type.
 *
 * @example
 * type IUserModel = IParser<
 *   User,
 *   {
 *     name: true;
 *     items: {
 *       title: true;
 *     };
 *   }
 * >;
 * ```
 *
 * Example using `createQuery`.
 * ```ts
 * const UserQueryModel = createQuery<User>()({
 *   name: true,
 *   items: {
 *     title: true,
 *   }
 * });
 * type IUserModel = IParser<User, typeof UserQueryModel>;
 * ```
 */
export type IParser<T, Q> = T extends IPagination<infer P>
  ? IPagination<IParseUndefined<P, Q>>
  : T extends Array<infer A>
  ? IParseUndefined<A, Q>[]
  : IParseUndefined<T, Q>;

export type IParseUndefined<T, Q> = T extends undefined
  ? IParseArray<NonNullable<T>, Q> | undefined
  : T extends null
  ? IParseArray<NonNullable<T>, Q> | null
  : IParseArray<T, Q>;

export type IParseArray<T, Q> = T extends Array<infer A> ? IParserObject<A, Q>[] : IParserObject<T, Q>;

export type IParserObject<C, Q> = {
  [K in keyof Q as K extends keyof C ? K : never]: K extends keyof C
    ? Q[K] extends true
      ? C[K]
      : IParseUndefined<C[K], Q[K]>
    : never;
} & (C extends IOrchaModel<infer ID> ? { [ORCHA_ID]: ID } : {});
