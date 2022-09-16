/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent } from '@angular/common/http';
import {
  IController,
  IExactQuery,
  IOperationEvent,
  IOperationFilesUpload,
  IOperationFileUpload,
  IOperationPaginate,
  IOperationQuery,
  IOperationSimple,
  IPaginateQuery,
  IPagination,
  IParserSerialized,
  IQuery,
  OrchaResponse,
} from '@orcha/common';
import { Observable } from 'rxjs';

/**
 * Implements a Client Operation from an `IOperation`.
 */
export type IClientOperationSimple<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  ...args: D extends null ? [] : [dto: D]
) => Observable<OrchaResponse<IParserSerialized<T, Q>>>;

export type IClientOperationFileUpload<
  T,
  Q extends IQuery<T>,
  D extends Record<string, any> | null = null
> = (
  file: File,
  ...args: D extends null ? [] : [dto: D]
) => Observable<HttpEvent<OrchaResponse<IParserSerialized<T, Q>>>>;

export type IClientOperationFilesUpload<
  T,
  Q extends IQuery<T>,
  D extends Record<string, any> | null = null
> = (
  files: File[],
  ...args: D extends null ? [] : [dto: D]
) => Observable<HttpEvent<OrchaResponse<IParserSerialized<T, Q>>>>;

export type IClientOperationPaginate<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  paginate: IPaginateQuery,
  ...args: D extends null ? [] : [dto: D]
) => Observable<OrchaResponse<IPagination<IParserSerialized<T, Q>>>>;

export type IClientOperationEvent<
  T,
  Q extends IQuery<T>,
  D extends Record<string, string | number> | null = null
> = (...args: D extends null ? [] : [dto: D]) => Observable<IParserSerialized<T, Q>>;

export type IClientOperationQuery<T, D extends Record<string, string | number> | null = null> = <
  Q extends IQuery<T>
>(
  query: IExactQuery<T, Q>,
  ...args: D extends null ? [] : [dto: D]
) => Observable<OrchaResponse<IParserSerialized<T, Q>>>;

/**
 * Implements a Client Controller from an `IController`.
 */
export type IClientController<O extends IController> = {
  [K in keyof O]: O[K] extends IOperationSimple<infer T, infer Q, infer D>
    ? IClientOperationSimple<T, Q, D>
    : O[K] extends IOperationFileUpload<infer T, infer Q, infer D>
    ? IClientOperationFileUpload<T, Q, D>
    : O[K] extends IOperationFilesUpload<infer T, infer Q, infer D>
    ? IClientOperationFilesUpload<T, Q, D>
    : O[K] extends IOperationPaginate<infer T, infer Q, infer D>
    ? IClientOperationPaginate<T, Q, D>
    : O[K] extends IOperationEvent<infer T, infer Q, infer D>
    ? IClientOperationEvent<T, Q, D>
    : O[K] extends IOperationQuery<infer T, infer D>
    ? IClientOperationQuery<T, D>
    : never;
};
