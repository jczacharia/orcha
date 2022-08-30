/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import {
  __ORCHA_OPERATIONS,
  __ORCHA_CONTROLLER_NAME,
  __ORCHA_CONTROLLER_PLACEHOLDER,
} from './constants';

/**
 * Decorates an Angular class (Controller) of Operations under a single parent endpoint.
 * An endpoint looks as follows: `/orcha/<controller name>/<operation name>`.
 *
 * @example
 * ```ts
 * @ClientController('user')
 * export class UserController implements IClientController<IUserController> {
 *   @ClientOperation() // `/orcha/user/signUp`
 *   signUp!: IClientController<IUserController>['signUp'];
 *   @ClientOperation() // `/orcha/user/login`
 *   login!: IClientController<IUserController>['login'];
 *   @ClientOperation() // `/orcha/user/getProfile`
 *   getProfile!: IClientController<IUserController>['getProfile'];
 * }
 * ```
 *
 * @param name Name of the Controller.
 */
export function ClientController(name: string): ClassDecorator {
  return function (target: Function) {
    target.prototype[__ORCHA_CONTROLLER_NAME] = name;
  };
}

/**
 * Decorates a method of an Controller to be an Operation under a single HTTP endpoint.
 * An endpoint looks as follows: `/orcha/<controller name>/<operation name>`.
 *
 * @example
 * ```ts
 * @ClientController('user')
 * export class UserController implements IClientController<IUserController> {
 *   @ClientOperation() // `/orcha/user/signUp`
 *   signUp!: IClientController<IUserController>['signUp'];
 *   @ClientOperation() // `/orcha/user/login`
 *   login!: IClientController<IUserController>['login'];
 *   @ClientOperation() // `/orcha/user/getProfile`
 *   getProfile!: IClientController<IUserController>['getProfile'];
 * }
 * ```
 */
export function ClientOperation(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const controller = target[__ORCHA_OPERATIONS];
    if (!controller) {
      target[__ORCHA_OPERATIONS] = {};
    }
    target[__ORCHA_OPERATIONS][propertyKey] = __ORCHA_CONTROLLER_PLACEHOLDER;
  };
}
