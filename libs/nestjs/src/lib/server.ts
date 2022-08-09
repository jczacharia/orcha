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
  D extends Record<string, unknown> | null = null,
  F extends File | File[] | null = null
> = (
  query: IExactQuery<T, IQuery<T>>,
  token: string,
  ...args: D extends null
    ? F extends null
      ? []
      : [dto: null, files: Express.Multer.File[]]
    : F extends null
    ? [dto: D]
    : [dto: D, files: Express.Multer.File[]]
) => ServerResponseType<IParser<T, IQuery<T>>>;

/**
 * Implements a Server Orchestration from an `IOrchestration`.
 */
export type IServerOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer D, infer F> ? IServerOperation<T, D, F> : never;
};

export type IServerSubscription<T, D> = (
  socket: Socket,
  query: IQuery<T>,
  token: string,
  ...dto: D extends null ? [undefined?] : [D]
) => Promise<unknown>;

export type IServerGateway<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends ISubscription<infer T, infer Props> ? IServerSubscription<T, Props> : never;
};
