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
  ISubscriptionResult,
} from '@orcha/common';
import { Observable } from 'rxjs';

/**
 * Implements a Client Operation from an `IOperation`.
 */
export type IClientOperation<
  T,
  D extends Record<string, any> | null = null,
  F extends File[] | null = null
> = <Q extends IQuery<T>>(
  query: IExactQuery<T, Q>,
  ...args: D extends null
    ? F extends null
      ? []
      : [dto: null, files: F]
    : F extends null
    ? [dto: D]
    : [dto: D, files: F]
) => Observable<F extends null ? IParser<T, Q> : HttpEvent<IParser<T, Q>>>;

/**
 * Implements a Client Orchestration from an `IOrchestration`.
 */
export type IClientOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer D, infer F> ? IClientOperation<T, D, F> : never;
};

export type IClientSubscription<T, D> = <Q extends IQuery<T>>(
  query: IExactQuery<T, Q>,
  ...dto: D extends null ? [dto?: undefined | null] : [D]
) => Observable<ISubscriptionResult<T, Q>>;

export type IClientGateway<Gateways extends IGateway> = {
  [K in keyof Gateways]: Gateways[K] extends ISubscription<infer T, infer Props>
    ? IClientSubscription<T, Props>
    : never;
};
