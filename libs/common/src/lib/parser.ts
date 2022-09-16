/* eslint-disable @typescript-eslint/ban-types */
import { ORCHA_ID } from './constants';
import { IOrchaModel } from './relations';
import { RecursivelyConvertDatesToStrings } from './util';

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
export type IParser<T, Q> = T extends Array<infer A> ? IParserUndefined<A, Q>[] : IParserUndefined<T, Q>;

export type IParserUndefined<T, Q> = T extends undefined
  ? IParserArray<NonNullable<T>, Q> | undefined
  : T extends null
  ? IParserArray<NonNullable<T>, Q> | null
  : IParserArray<T, Q>;

export type IParserArray<T, Q> = T extends Array<infer A> ? IParserObject<A, Q>[] : IParserObject<T, Q>;

export type IParserObject<C, Q> = {
  [K in keyof Q as K extends keyof C ? K : never]: K extends keyof C
    ? Q[K] extends true
      ? C[K]
      : IParserUndefined<C[K], Q[K]>
    : never;
} & (C extends IOrchaModel<infer ID> ? { [ORCHA_ID]: ID } : {});

/**
 * Serialized Parser. Basically only converts Dates to strings.
 */
export type IParserSerialized<T, Q> = RecursivelyConvertDatesToStrings<IParser<T, Q>>;
