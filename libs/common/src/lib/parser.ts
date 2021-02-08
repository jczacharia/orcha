import { IPagination } from './pagination';
import { IPaginate } from './query';

export type IParser<CompleteType, QueriedType> = CompleteType extends Array<infer A>
  ? QueriedType extends Required<IPaginate>
    ? IPagination<IParseUndefined<A, QueriedType>>
    : IParseUndefined<A, QueriedType>[]
  : IParseUndefined<CompleteType, QueriedType>;

export type IParseUndefined<CompleteType, QueriedType> = CompleteType extends undefined
  ? IParseArray<NonNullable<CompleteType>, QueriedType> | undefined | null
  : IParseArray<CompleteType, QueriedType>;

export type IParseArray<CompleteType, QueriedType> = CompleteType extends Array<infer A>
  ? IParserObject<A, QueriedType>[]
  : IParserObject<CompleteType, QueriedType>;

export type IParserObject<CompleteType, QueriedType> = {
  [K in keyof QueriedType as K extends keyof CompleteType ? K : never]: K extends keyof CompleteType
    ? QueriedType[K] extends true
      ? CompleteType[K]
      : IParseUndefined<CompleteType[K], QueriedType[K]>
    : never;
};
