import { IPagination } from './pagination';
import { IPaginate } from './query';
import { IArrayRelations, ISingularRelations } from './relations';

type UnArray<T> = T extends Array<infer U> ? U : T;

export type IParser<CompleteType, QueriedType> = CompleteType extends Array<infer A>
  ? QueriedType extends Required<IPaginate>
    ? IPagination<IIParser<A, QueriedType>>
    : IIParser<A, QueriedType>[]
  : IIParser<CompleteType, QueriedType>;

type IIParser<CompleteType, QueriedType> = {
  [K in keyof QueriedType]: K extends keyof CompleteType
    ? CompleteType[K] extends IArrayRelations
      ? IIParser<UnArray<CompleteType[K]>, QueriedType[K]>[]
      : CompleteType[K] extends ISingularRelations
      ? IIParser<CompleteType[K], QueriedType[K]>
      : CompleteType[K]
    : never;
};
