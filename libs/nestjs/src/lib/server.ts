import { IExactQuery, IOperation, IOrchestration, IParser, IQuery, ISubscription } from '@orcha/common';
import 'multer';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

type ServerResponseType<T> = T | Promise<T> | Observable<T>;

/**
 * Implements a Server Operation from an `IOperation`.
 */
export type IServerOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> = <Q extends IQuery<T>>(
  query: IExactQuery<T, Q>,
  token: string,
  dto: DTO,
  files: F extends undefined ? undefined : F extends File[] ? Express.Multer.File[] : Express.Multer.File
) => ServerResponseType<IParser<T, IQuery<T>>>;

/**
 * Implements a Server Orchestration from an `IOrchestration`.
 */
export type IServerOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props, infer F>
    ? IServerOperation<T, Props, F>
    : never;
};

export type IServerSubscription<T, DTO> = DTO extends undefined
  ? <Q extends IQuery<T>>(socket: Socket, query: IExactQuery<T, Q>, token: string) => Promise<unknown>
  : <Q extends IQuery<T>>(
      socket: Socket,
      query: IExactQuery<T, Q>,
      token: string,
      dto: DTO
    ) => Promise<unknown>;

export type IServerGateway<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends ISubscription<infer T, infer Props> ? IServerSubscription<T, Props> : never;
};
