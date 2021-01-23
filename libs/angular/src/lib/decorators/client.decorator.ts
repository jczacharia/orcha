import {
  __ORCHA_GATEWAY_NAME,
  __ORCHA_GATEWAY_PLACEHOLDER,
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME,
  __ORCHA_ORCHESTRATION_PLACEHOLDER,
  __ORCHA_SUBSCRIPTIONS,
} from '@orcha/common';

export function ClientOrchestration(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__ORCHA_ORCHESTRATION_NAME] = name;
  };
}

export function ClientOperation(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const orchestration = target[__ORCHA_OPERATIONS];
    if (!orchestration) {
      target[__ORCHA_OPERATIONS] = {};
    }
    target[__ORCHA_OPERATIONS][propertyKey] = __ORCHA_ORCHESTRATION_PLACEHOLDER;
  };
}

export function ClientGateway(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__ORCHA_GATEWAY_NAME] = name;
  };
}

export function ClientSubscription(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const subscriptions = target[__ORCHA_SUBSCRIPTIONS];
    if (!subscriptions) {
      target[__ORCHA_SUBSCRIPTIONS] = {};
    }
    target[__ORCHA_SUBSCRIPTIONS][propertyKey] = __ORCHA_GATEWAY_PLACEHOLDER;
  };
}
