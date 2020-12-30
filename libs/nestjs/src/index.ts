import { IOperation, IOrchestration, IParser, IQuery, ISubscription } from '@kirtan/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

type ServerOperationReturnType<T> = T | Promise<T> | Observable<T>;

export type IServerOperation<T, Dto = undefined> = (
  query: IQuery<T>,
  dto: Dto,
  auth?: string
) => ServerOperationReturnType<IParser<T, IQuery<T>>>;

export type IServerOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props> ? IServerOperation<T, Props> : never;
};

export type IServerSubscription<T, Dto = undefined> = (
  socket: Socket,
  query: IQuery<T>,
  dto: Dto,
  auth?: string
) => Promise<void>;

export type IServerGateway<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends ISubscription<infer T, infer Props> ? IServerSubscription<T, Props> : never;
};

export * from './lib/decorators';
export * from './lib/kirtan.module';
export * from './lib/pipes';
