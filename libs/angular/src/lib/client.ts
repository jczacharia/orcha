/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent } from '@angular/common/http';
import {
  IExactQuery,
  IGateway,
  IOperation,
  IOrchestration,
  IParser,
  IQuery,
  ISubscription,
} from '@orcha/common';
import { Observable } from 'rxjs';

/**
 * Implements a Client Operation from an `IOperation`.
 */
export type IClientOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> = DTO extends undefined
  ? F extends undefined
    ? <Q extends IQuery<T>>(query: IExactQuery<T, Q>) => Observable<IParser<T, Q>>
    : <Q extends IQuery<T>>(
        query: IExactQuery<T, Q>,
        _: undefined,
        files: F
      ) => Observable<HttpEvent<IParser<T, Q>>>
  : F extends undefined
  ? <Q extends IQuery<T>>(query: IExactQuery<T, Q>, dto: DTO) => Observable<IParser<T, Q>>
  : <Q extends IQuery<T>>(
      query: IExactQuery<T, Q>,
      dto: DTO,
      files: F
    ) => Observable<HttpEvent<IParser<T, Q>>>;

/**
 * Implements a Client Orchestration from an `IOrchestration`.
 */
export type IClientOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props, infer F>
    ? IClientOperation<T, Props, F>
    : never;
};

export type IClientSubscription<T, DTO> = DTO extends undefined
  ? <Q extends IQuery<T>>(query: Q) => Observable<IParser<T, Q>>
  : <Q extends IQuery<T>>(query: Q, dto: DTO) => Observable<IParser<T, Q>>;

export type IClientGateway<Gateways extends IGateway> = {
  [K in keyof Gateways]: Gateways[K] extends ISubscription<infer T, infer Props>
    ? IClientSubscription<T, Props>
    : never;
};
