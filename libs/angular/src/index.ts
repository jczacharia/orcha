import {
  IClientOperation,
  IClientSubscription,
  IOperation,
  IOrchestration,
  ISubscription,
  IGateway,
} from '@kirtan/common';

export * from './lib/angular.module';
export * from './lib/decorators';
export * from './lib/kirtan.interceptor';

export type IClientOrchestration<Orchestration extends IOrchestration> = {
  [K in keyof Orchestration]: Orchestration[K] extends IOperation<infer T, infer Props>
    ? IClientOperation<T, Props>
    : never;
};

export type IClientSubscriptions<Subscriptions extends IGateway> = {
  [K in keyof Subscriptions]: Subscriptions[K] extends ISubscription<infer T, infer Props>
    ? IClientSubscription<T, Props>
    : never;
};
