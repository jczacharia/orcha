import {
  __KIRTAN_OPERATIONS,
  __KIRTAN_OPERATIONS_NAME,
  __KIRTAN_OPERATIONS_PLACEHOLDER,
  __KIRTAN_SUBSCRIPTIONS,
  __KIRTAN_SUBSCRIPTIONS_PLACEHOLDER,
} from '@kirtan/common';

export function ClientOperations(name: string | number): ClassDecorator {
  return function (target: Function) {
    target.prototype[__KIRTAN_OPERATIONS_NAME] = name;
  };
}

export function ClientOperation(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const operations = target[__KIRTAN_OPERATIONS];
    if (!operations) {
      target[__KIRTAN_OPERATIONS] = {};
    }
    target[__KIRTAN_OPERATIONS][propertyKey] = __KIRTAN_OPERATIONS_PLACEHOLDER;
  };
}

export function ClientSubscription(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const operations = target[__KIRTAN_SUBSCRIPTIONS];
    if (!operations) {
      target[__KIRTAN_SUBSCRIPTIONS] = {};
    }
    target[__KIRTAN_SUBSCRIPTIONS][propertyKey] = __KIRTAN_SUBSCRIPTIONS_PLACEHOLDER;
  };
}
