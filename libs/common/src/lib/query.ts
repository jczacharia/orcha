/* eslint-disable @typescript-eslint/ban-types */
import { ORCHESTRA_LIMIT, ORCHESTRA_PAGE, ORCHESTRA_PAGINATE } from './constants';
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
  [ORCHESTRA_PAGINATE]?: {
    [ORCHESTRA_PAGE]: number;
    [ORCHESTRA_LIMIT]: number;
  };
}
