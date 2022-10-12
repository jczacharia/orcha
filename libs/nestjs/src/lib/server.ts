/* eslint-disable @typescript-eslint/no-explicit-any */
import 'multer';

import { StreamableFile } from '@nestjs/common';
import {
  IController,
  IOperationEvent,
  IOperationFileDownload,
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
import type { Response } from 'express';
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

type IServerOperationPaginate<
  T,
  Q extends IQuery<T>,
  D extends Record<string, any> | null = null,
  Extra extends Record<string, any> = object
> = (
  token: string,
  paginate: IPaginateQuery,
  ...args: D extends null ? [] : [dto: D]
) => Promise<Extra & IPagination<IParser<T, Q>>>;

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

type IServerOperationFileDownload<D extends Record<string, any> | null = null> = (
  token: string,
  res: Response,
  ...args: D extends null ? [] : [dto: D]
) => Promise<StreamableFile> | Observable<StreamableFile> | StreamableFile;

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
    : O[K] extends IOperationPaginate<infer T, infer Q, infer D, infer E>
    ? IServerOperationPaginate<T, Q, D, E>
    : O[K] extends IOperationEvent<infer T, infer Q, infer D>
    ? IServerOperationEvent<T, Q, D>
    : O[K] extends IOperationQuery<infer T, infer D>
    ? IServerOperationQuery<T, D>
    : O[K] extends IOperationFileDownload<infer D>
    ? IServerOperationFileDownload<D>
    : never;
};
