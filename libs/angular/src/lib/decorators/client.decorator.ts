import {
  __ORCHESTRA_GATEWAY_NAME,
  __ORCHESTRA_GATEWAY_PLACEHOLDER,
  __ORCHESTRA_OPERATIONS,
  __ORCHESTRA_ORCHESTRATION_NAME,
  __ORCHESTRA_ORCHESTRATION_PLACEHOLDER,
  __ORCHESTRA_SUBSCRIPTIONS,
} from '@orcha/common';

export function ClientOrchestration(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__ORCHESTRA_ORCHESTRATION_NAME] = name;
  };
}

export function ClientOperation(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const orchestration = target[__ORCHESTRA_OPERATIONS];
    if (!orchestration) {
      target[__ORCHESTRA_OPERATIONS] = {};
    }
    target[__ORCHESTRA_OPERATIONS][propertyKey] = __ORCHESTRA_ORCHESTRATION_PLACEHOLDER;
  };
}

export function ClientGateway(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__ORCHESTRA_GATEWAY_NAME] = name;
  };
}

export function ClientSubscription(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const subscriptions = target[__ORCHESTRA_SUBSCRIPTIONS];
    if (!subscriptions) {
      target[__ORCHESTRA_SUBSCRIPTIONS] = {};
    }
    target[__ORCHESTRA_SUBSCRIPTIONS][propertyKey] = __ORCHESTRA_GATEWAY_PLACEHOLDER;
  };
}
