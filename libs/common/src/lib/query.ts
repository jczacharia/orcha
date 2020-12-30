/* eslint-disable @typescript-eslint/ban-types */
import { KIRTAN_LIMIT, KIRTAN_PAGE, KIRTAN_PAGINATE } from './constants';
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
      Q[K] extends IAnyRelation<Q[K], Required<infer _>>
      ? true
      : IQueryArray<Q[K]>
    : true;
};

// Q[K] extends IAnyRelation<Q[K], Required<infer _>> ? true : IQueryArray<Q[K]>;

export interface IPaginate {
  [KIRTAN_PAGINATE]?: {
    [KIRTAN_PAGE]: number;
    [KIRTAN_LIMIT]: number;
  };
}
