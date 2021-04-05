/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORCHA_DTO, ORCHA_FILES, ORCHA_QUERY, ORCHA_TOKEN } from './constants';
import { IQuery } from './query';

/**
 * Creates an Operation model.
 *
 * An Operation exposes the server to the outside world via an HTTP POST endpoint.
 * An endpoint looks as follows: `/orcha/<orchestration name>/<operation name>`.
 * Each Operation name describes what the Operation does. An Operation can either mutate or read data.
 *
 * An Operation's template parameters consist of:
 * @param T The base model/schema/entity to be returned from the Operation.
 * @param DTO Data that describes the details of the Operation. Exc: The ID of the entity to be deleted.
 * @param F Whether the Operation contains a file upload (singular or multiple).
 *
 * @example
 * ```ts
 * interface IExampleOrchestration {
 *   login: IOperation<{ token: string }, LoginDto>; // DTO contains username and password.
 *   getUserData: IOperation<User>;
 *   uploadProfilePic: IOperation<{ url: string }, undefined, File>;
 *   uploadFiles: IOperation<{ fileUrls: string[] }, UploadFilesDto, File[]>;
 * }
 * ```
 */
export interface IOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> {
  [ORCHA_QUERY]: IQuery<T>;
  [ORCHA_DTO]: DTO;
  [ORCHA_TOKEN]: string;
  [ORCHA_FILES]?: F;
}

/**
 * Creates an Orchestration model.
 *
 * An Orchestration groups many Operations under a single parent endpoint.
 * An endpoint looks as follows: `/orcha/<orchestration name>/<operation name>`.
 *
 * @example
 * ```ts
 * interface IExampleOrchestration {
 *   login: IOperation<{ token: string }, LoginDto>; // DTO contains username and password.
 *   getUserData: IOperation<User>;
 *   uploadProfilePic: IOperation<{ url: string }, undefined, File>;
 *   uploadFiles: IOperation<{ fileUrls: string[] }, UploadFilesDto, File[]>;
 * }
 * ```
 */
export type IOrchestration = Record<keyof unknown, IOperation<unknown>>;
