import { IGateway, IOperation, IOrchestration, IParser, IQuery, ISubscription } from '@orchestra/common';
import { Observable } from 'rxjs';

export * from './lib/angular.module';
export * from './lib/decorators';
export * from './lib/orchestra.interceptor';

export type IClientOperation<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;

export type IClientOrchestration<Orchestration extends IOrchestration> = {
  [K in keyof Orchestration]: Orchestration[K] extends IOperation<infer T, infer Props>
    ? IClientOperation<T, Props>
    : never;
};

export type IClientSubscription<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;

export type IClientGateway<Gateways extends IGateway> = {
  [K in keyof Gateways]: Gateways[K] extends ISubscription<infer T, infer Props>
    ? IClientSubscription<T, Props>
    : never;
};
