/* eslint-disable @typescript-eslint/no-explicit-any */
import 'multer';

import {
  IController,
  IOperationEvent,
  IOperationFilesUpload,
  IOperationFileUpload,
  IOperationPaginate,
  IOperationQuery,
  IOperationSimple,
  IPaginateQuery,
  IPagination,
  IParser,
  IQuery,
} from '@orcha/common';
import { Observable } from 'rxjs';

/**
 * Implements a Server Operation from an `IOperation`.
 */
type IServerOperationSimple<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  ...args: D extends null ? [] : [dto: D]
) => Promise<IParser<T, Q>>;

type IServerOperationQuery<T, D extends Record<string, string | number> | null = null> = (
  token: string,
  query: IQuery<T>,
  ...args: D extends null ? [] : [dto: D]
) => Promise<IParser<T, IQuery<T>>>;

type IServerOperationPaginate<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  paginate: IPaginateQuery,
  ...args: D extends null ? [] : [dto: D]
) => Promise<IPagination<IParser<T, Q>>>;

type IServerOperationFileUpload<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  file: Express.Multer.File,
  ...args: D extends null ? [] : [dto: D]
) => Promise<IParser<T, Q>>;

type IServerOperationFilesUpload<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  files: Express.Multer.File[],
  ...args: D extends null ? [] : [dto: D]
) => Promise<IParser<T, Q>>;

type IServerOperationEvent<
  T,
  Q extends IQuery<T>,
  D extends Record<string, string | number> | null = null
> = (token: string, ...args: D extends null ? [] : [dto: D]) => Observable<IParser<T, Q>>;

/**
 * Implements a Server Controller from an `IController`.
 */
export type IServerController<O extends IController> = {
  [K in keyof O]: O[K] extends IOperationSimple<infer T, infer Q, infer D>
    ? IServerOperationSimple<T, Q, D>
    : O[K] extends IOperationFileUpload<infer T, infer Q, infer D>
    ? IServerOperationFileUpload<T, Q, D>
    : O[K] extends IOperationFilesUpload<infer T, infer Q, infer D>
    ? IServerOperationFilesUpload<T, Q, D>
    : O[K] extends IOperationPaginate<infer T, infer Q, infer D>
    ? IServerOperationPaginate<T, Q, D>
    : O[K] extends IOperationEvent<infer T, infer Q, infer D>
    ? IServerOperationEvent<T, Q, D>
    : O[K] extends IOperationQuery<infer T, infer D>
    ? IServerOperationQuery<T, D>
    : never;
};
