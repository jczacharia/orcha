/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { ORCHA_LIMIT, ORCHA_PAGE, ORCHA_PAGINATE } from './constants';
import { IAnyRelation } from './relations';

/**
 * Describes the fundamental type for an Orcha Query.
 */
export type IQueryModel = { [k: string]: true | IQueryModel } | IPaginate;

/**
 * Create a primitive Orcha Query from a model.
 */
export type IQuery<T> = T extends Array<infer A> ? IQueryArray<A> & IPaginate : IQueryArray<T>;

export type IQueryArray<T> = T extends Array<infer A> ? IQueryUndefined<A> : IQueryUndefined<T>;

export type IQueryUndefined<T> = T extends undefined
  ? IQueryObject<NonNullable<T>> | undefined
  : IQueryObject<T>;

export type IQueryObject<T> = {
  [K in keyof T]?: NonNullable<T[K]> extends object
    ? {
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer _>
          ? Required<T> extends Required<R>
            ? true
            : IQueryArray<T[K]>
          : true;
      }[keyof NonNullable<T[K]>]
    : true;
};

/**
 * Required fields for pagination information.
 */
export interface IPaginate {
  [ORCHA_PAGINATE]?: {
    [ORCHA_PAGE]: number;
    [ORCHA_LIMIT]: number;
  };
}

/**
 * Utility type or an Orcha Query that does not allow for properties that are not specified in the model `T`.
 */
export type IExactQuery<T, Q> = T extends Array<infer A> ? IExactQueryObject<A, Q> : IExactQueryObject<T, Q>;
export type IExactQueryObject<T, Q> = Q &
  {
    [K in keyof Q]: K extends typeof ORCHA_PAGINATE
      ? Q[K]
      : K extends keyof T
      ? IExactQuery<T[K], Q[K]>
      : never;
  };
