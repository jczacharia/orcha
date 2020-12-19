import { IPagination } from './pagination';
import { IPaginate } from './query';
import { IAnyRelation } from './relations';

export type IParser<CompleteType, QueriedType> = CompleteType extends Array<infer A>
  ? QueriedType extends Required<IPaginate>
    ? IPagination<IIParser<A, QueriedType>>
    : IIParser<A, QueriedType>[]
  : IIParser<CompleteType, QueriedType>;

type IIParser<CompleteType, QueriedType> = {
  [K in keyof QueriedType]: K extends keyof CompleteType
    ? CompleteType[K] extends IAnyRelation<any, any>
      ? IIParser<CompleteType[K], QueriedType[K]>
      : CompleteType[K]
    : never;
};
