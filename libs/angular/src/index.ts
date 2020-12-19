import {
  IClientOperation,
  IClientSubscription,
  IOperation,
  IOperations,
  ISubscription,
  ISubscriptions,
} from '@kirtan/common';

export * from './lib/angular.module';
export * from './lib/decorators';

export type IClientOperations<Operations extends IOperations> = {
  [K in keyof Operations]: Operations[K] extends IOperation<infer T, infer Props>
    ? IClientOperation<T, Props>
    : never;
};

export type IClientSubscriptions<Subscriptions extends ISubscriptions> = {
  [K in keyof Subscriptions]: Subscriptions[K] extends ISubscription<infer T, infer Props>
    ? IClientSubscription<T, Props>
    : never;
};
