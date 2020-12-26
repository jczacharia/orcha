import {
  __KIRTAN_OPERATIONS,
  __KIRTAN_ORCHESTRATION_NAME,
  __KIRTAN_ORCHESTRATION_PLACEHOLDER,
  __KIRTAN_GATEWAY,
  __KIRTAN_GATEWAY_PLACEHOLDER,
} from '@kirtan/common';

export function ClientOrchestration(name: string | number): ClassDecorator {
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

export function ClientSubscription(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const orchestration = target[__KIRTAN_GATEWAY];
    if (!orchestration) {
      target[__KIRTAN_GATEWAY] = {};
    }
    target[__KIRTAN_GATEWAY][propertyKey] = __KIRTAN_GATEWAY_PLACEHOLDER;
  };
}
