/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import {
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME,
  __ORCHA_ORCHESTRATION_PLACEHOLDER,
} from './constants';

/**
 * Decorates an Angular class (Orchestration) of Operations under a single parent endpoint.
 * An endpoint looks as follows: `/orcha/<orchestration name>/<operation name>`.
 *
 * @example
 * ```ts
 * @ClientOrchestration('user')
 * export class UserOrchestration implements IClientOrchestration<IUserOrchestration> {
 *   @ClientOperation() // `/orcha/user/signUp`
 *   signUp!: IClientOrchestration<IUserOrchestration>['signUp'];
 *   @ClientOperation() // `/orcha/user/login`
 *   login!: IClientOrchestration<IUserOrchestration>['login'];
 *   @ClientOperation() // `/orcha/user/getProfile`
 *   getProfile!: IClientOrchestration<IUserOrchestration>['getProfile'];
 * }
 * ```
 *
 * @param name Name of the Orchestration.
 */
export function ClientOrchestration(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__ORCHA_ORCHESTRATION_NAME] = name;
  };
}

/**
 * Decorates a method of an Orchestration to be an Operation under a single HTTP endpoint.
 * An endpoint looks as follows: `/orcha/<orchestration name>/<operation name>`.
 *
 * @example
 * ```ts
 * @ClientOrchestration('user')
 * export class UserOrchestration implements IClientOrchestration<IUserOrchestration> {
 *   @ClientOperation() // `/orcha/user/signUp`
 *   signUp!: IClientOrchestration<IUserOrchestration>['signUp'];
 *   @ClientOperation() // `/orcha/user/login`
 *   login!: IClientOrchestration<IUserOrchestration>['login'];
 *   @ClientOperation() // `/orcha/user/getProfile`
 *   getProfile!: IClientOrchestration<IUserOrchestration>['getProfile'];
 * }
 * ```
 */
export function ClientOperation(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const orchestration = target[__ORCHA_OPERATIONS];
    if (!orchestration) {
      target[__ORCHA_OPERATIONS] = {};
    }
    target[__ORCHA_OPERATIONS][propertyKey] = __ORCHA_ORCHESTRATION_PLACEHOLDER;
  };
}
