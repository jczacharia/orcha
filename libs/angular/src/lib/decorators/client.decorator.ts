import {
  __KIRTAN_SUBSCRIPTIONS,
  __KIRTAN_GATEWAY_NAME,
  __KIRTAN_GATEWAY_PLACEHOLDER,
  __KIRTAN_OPERATIONS,
  __KIRTAN_ORCHESTRATION_NAME,
  __KIRTAN_ORCHESTRATION_PLACEHOLDER,
} from '@kirtan/common';

export function ClientOrchestration(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__KIRTAN_ORCHESTRATION_NAME] = name;
  };
}

export function ClientOperation(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const orchestration = target[__KIRTAN_OPERATIONS];
    if (!orchestration) {
      target[__KIRTAN_OPERATIONS] = {};
    }
    target[__KIRTAN_OPERATIONS][propertyKey] = __KIRTAN_ORCHESTRATION_PLACEHOLDER;
  };
}

export function ClientGateway(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__KIRTAN_GATEWAY_NAME] = name;
  };
}

export function ClientSubscription(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const subscriptions = target[__KIRTAN_SUBSCRIPTIONS];
    if (!subscriptions) {
      target[__KIRTAN_SUBSCRIPTIONS] = {};
    }
    target[__KIRTAN_SUBSCRIPTIONS][propertyKey] = __KIRTAN_GATEWAY_PLACEHOLDER;
  };
}
