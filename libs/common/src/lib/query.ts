import { ORCHA_ID } from './constants';
import { IPagination } from './pagination';
import { IAnyRelation } from './relations';

/**
 * Describes the fundamental type for an Orcha Query.
 */
export type IQueryModel = { [k: string]: true | IQueryModel };

/**
 * Create a primitive Orcha Query from a model.
 */
export type IQuery<T> = T extends IPagination<infer P> ? IQueryArray<P> : IQueryArray<T>;

type IQueryArray<T> = T extends Array<infer A> ? IQueryUndefined<A> : IQueryUndefined<T>;

type IQueryUndefined<T> = T extends undefined
  ? IQueryObject<NonNullable<T>> | undefined
  : T extends null
  ? IQueryObject<NonNullable<T>> | null
  : IQueryObject<T>;

/* ** Typescript magic ** */

export type IQueryObject<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [K in keyof T as K extends typeof ORCHA_ID ? never : K]?: NonNullable<T[K]> extends object
    ? {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer __>
          ? Required<T> extends Required<R>
            ? true
            : IQueryArray<T[K]>
          : true;
      }[keyof NonNullable<T[K]>]
    : true;
};

/**
 * Utility type or an Orcha Query that only allows properties that are specified in the model `T`.
 */
export type IExactQuery<T, Q> = T extends Array<infer A> ? IExactQueryObject<A, Q> : IExactQueryObject<T, Q>;

type IExactQueryObject<T, Q> = Q & {
  [K in keyof Q]: K extends keyof Omit<T, typeof ORCHA_ID> ? IExactQuery<T[K], Q[K]> : never;
};
