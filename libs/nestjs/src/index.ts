import { IExactQuery, IOperation, IOrchestration, IParser, IQuery, ISubscription } from '@orcha/common';
import 'multer';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

/** Server Return Type */
type SRT<T> = T | Promise<T> | Observable<T>;

export type IServerOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> = DTO extends undefined
  ? <Q extends IQuery<T>>(query: IExactQuery<T, Q>, token: string) => SRT<IParser<T, IQuery<T>>>
  : F extends undefined
  ? <Q extends IQuery<T>>(query: IExactQuery<T, Q>, token: string, dto: DTO) => SRT<IParser<T, IQuery<T>>>
  : <Q extends IQuery<T>>(
      query: IExactQuery<T, Q>,
      token: string,
      dto: DTO,
      files: F extends File[] ? Express.Multer.File[] : Express.Multer.File
    ) => SRT<IParser<T, IQuery<T>>>;

export type IServerOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props, infer F>
    ? IServerOperation<T, Props, F>
    : never;
};

export type IServerSubscription<T, Dto> = (
  socket: Socket,
  query: IQuery<T>,
  dto: Dto,
  token: string
) => Promise<void>;

export type IServerGateway<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends ISubscription<infer T, infer Props> ? IServerSubscription<T, Props> : never;
};

export * from './lib/decorators';
export * from './lib/orchestra.module';
export * from './lib/pipes';
