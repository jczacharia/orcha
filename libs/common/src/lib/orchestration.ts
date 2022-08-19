/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORCHA_DTO, ORCHA_FILES, ORCHA_TOKEN } from './constants';
import { IQuery } from './query';

/**
 * Creates an Operation model for HTTP endpoint calls.
 *
 * An Operation exposes the server to the outside world via an HTTP POST endpoint.
 * An endpoint's route is described as: `/orcha/<orchestration name>/<operation name>`.
 * Each Operation name should describe what the Operation does.
 * An Operation can either mutate or read data.
 *
 * An Operation's template parameters consist of:
 * @param T The base model/schema/entity to be returned from the Operation. This can either be a single
 * entity, an array of entities, or a paginated list of entities.
 * @example Single, multiple, and paginate.
 * ```ts
 * import { IOperation, IPagination } from '@orcha/common';
 * interface ITodoOrchestration {
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
 * interface ITodoOrchestration {
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
 * interface IExampleOrchestration {
 *   uploadTodoPhoto: IOperation<Todo, null, File[]>;
 * }
 * ```
 *
 * @example User Example
 * ```ts
 * interface IUserOrchestration {
 *   login: IOperation<{ token: string }, LoginDto>; // DTO contains username and password.
 *   getUserData: IOperation<User>;
 *   uploadProfilePic: IOperation<{ url: string }, null, File[]>;
 *   uploadFiles: IOperation<{ fileUrls: string[] }, UploadFilesDto, File[]>;
 * }
 * ```
 */
export interface IOperation<T, Q extends IQuery<T>, D = null, F extends File[] | null = null> {
  [ORCHA_TOKEN]: string;
  [ORCHA_DTO]: D | null;
  [ORCHA_FILES]: F;
}

/**
 * Creates an Orchestration model for a group of domain related Operations under HTTP endpoints.
 *
 * An Orchestration groups many Operations under a single parent endpoint.
 * An endpoint looks as follows: `/orcha/<orchestration name>/<operation name>`.
 *
 * @example
 * ```ts
 * interface IUserOrchestration {
 *   login: IOperation<{ token: string }, LoginDto>; // DTO contains username and password.
 *   getUserData: IOperation<User>;
 *   uploadProfilePic: IOperation<{ url: string }, null, File[]>;
 *   uploadFiles: IOperation<{ fileUrls: string[] }, UploadFilesDto, File[]>;
 * }
 * ```
 */
export type IOrchestration = Record<keyof unknown, IOperation<unknown, any>>;
