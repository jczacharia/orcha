/* eslint-disable @typescript-eslint/ban-types */
import { ORCHA_LIMIT, ORCHA_PAGE, ORCHA_PAGINATE } from './constants';
import { IAnyRelation } from './relations';

export type IQuery<Q> = Q extends Array<infer A> ? IQueryArray<A> & IPaginate : IQueryArray<Q>;

export type IQueryArray<Q> = Q extends Array<infer A> ? IQueryUndefined<A> : IQueryUndefined<Q>;

export type IQueryUndefined<Q> = Q extends undefined
  ? IQueryObject<NonNullable<Q>> | undefined
  : IQueryObject<Q>;

export type IQueryObject<Q> = {
  [K in keyof Q]?: NonNullable<Q[K]> extends object
    ? // `Required<infer _>` seems to work, but idk why.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      NonNullable<Q[K]> extends IAnyRelation<Q[K], Required<infer _>>
      ? true
      : IQueryArray<Q[K]>
    : true;
};

// Q[K] extends IAnyRelation<Q[K], Required<infer _>> ? true : IQueryArray<Q[K]>;

export interface IPaginate {
  [ORCHA_PAGINATE]?: {
    [ORCHA_PAGE]: number;
    [ORCHA_LIMIT]: number;
  };
}

export type IExactQuery<T, Q> = T extends Array<infer A> ? IExactQueryObject<A, Q> : IExactQueryObject<T, Q>;

export type IExactQueryObject<T, Q> = Q &
  {
    [K in keyof Q]: K extends typeof ORCHA_PAGINATE
      ? Q[K]
      : K extends keyof T
      ? IExactQuery<T[K], Q[K]>
      : never;
  };
