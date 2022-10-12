/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrchaMetadata, OrchaOperationType } from './constants';
import { IQuery } from './query';

/**
 * Creates an Operation model for HTTP endpoint calls.
 *
 * An Operation exposes the server to the outside world via an HTTP POST endpoint.
 * An endpoint's route is described as: `/orcha/<controller name>/<operation name>`.
 * Each Operation name should describe what the Operation does.
 * An Operation can either mutate or read data.
 *
 * An Operation's template parameters consist of:
 * @param T The base model/schema/entity to be returned from the Operation. This can either be a single
 * entity, an array of entities, or a paginated list of entities.
 * @example Single, multiple, and paginate.
 * ```ts
 * import { IOperation, IPagination } from '@orcha/common';
 * interface ITodoController {
 *   getSingleEntity: IOperation<Todo>;
 *   getMultipleEntities: IOperation<Todo[]>;
 *   paginateEntities: IOperation<IPagination<Todo>>;
 * }
 * ```
 *
 * @param D Data that describes the operational data of the Operation. It is null by default.
 * @example Creating a Todo entity.
 * ```ts
 * import { IOperation } from '@orcha/common';
 * import { IsString } from 'class-validator';
 * export abstract class CreateTodoDto {
 *   @IsString() // This decorator is used on the backend to ensure the content property is a string.
 *   content!: string;
 * }
 * interface ITodoController {
 *   create: IOperation<Todo, CreateTodoDto>;
 *   delete: IOperation<{ deletedTodoId: string }, { todoId: string }>; // Doesn't have to have validation.
 * }
 * ```
 *
 * @param F Whether the Operation has a files upload.
 * Type is always `Files[]`. It's array for simplification. Default is null.
 * @example Upload picture for Todo entity.
 * ```ts
 * import { IOperation } from '@orcha/common';
 * interface IExampleController {
 *   uploadTodoPhoto: IOperation<Todo, null, File[]>;
 * }
 * ```
 *
 * @example User Example
 * ```ts
 * interface IUserController {
 *   login: IOperation<{ token: string }, LoginDto>; // DTO contains username and password.
 *   getUserData: IOperation<User>;
 *   uploadProfilePic: IOperation<{ url: string }, null, File[]>;
 *   uploadFiles: IOperation<{ fileUrls: string[] }, UploadFilesDto, File[]>;
 * }
 * ```
 */
export interface IOperationSimple<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'simple';
}

export interface IOperationQuery<T, D extends Record<string, any> | null = null> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'query';
}

export interface IOperationPaginate<
  T,
  Q extends IQuery<T>,
  D extends Record<string, any> | null = null,
  Extra extends Record<string, any> = object
> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'paginate';
}

export interface IOperationFileUpload<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'file-upload';
}

export interface IOperationFilesUpload<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'files-upload';
}

export interface IOperationEvent<
  T,
  Q extends IQuery<T>,
  D extends Record<string, string | number> | null = null
> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'event';
}

export interface IOperationFileDownload<D extends Record<string, any> | null = null> {
  [OrchaMetadata.OPERATION_TYPE_KEY]: 'file-download';
}

/**
 * Creates an Controller model for a group of domain related Operations under HTTP endpoints.
 *
 * An Controller groups many Operations under a single parent endpoint.
 * An endpoint looks as follows: `/orcha/<controller name>/<operation name>`.
 *
 * @example
 * ```ts
 * interface IUserController {
 *   login: IOperation<{ token: string }, LoginDto>; // DTO contains username and password.
 *   getUserData: IOperation<User>;
 *   uploadProfilePic: IOperation<{ url: string }, null, File[]>;
 *   uploadFiles: IOperation<{ fileUrls: string[] }, UploadFilesDto, File[]>;
 * }
 * ```
 */
export type IController = Record<keyof unknown, IOperationSimple<unknown, any>>;
