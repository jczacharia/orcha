import { OrchaMetadata, OrchaOperationType } from './constants';

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
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function) {
    target.prototype[OrchaMetadata.CONTROLLER_NAME] = name;
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
export function ClientOperation(options?: { type?: OrchaOperationType }): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any, propertyKey: string | symbol) {
    const controller = target[OrchaMetadata.CONTROLLER_METHODS];
    if (!controller) target[OrchaMetadata.CONTROLLER_METHODS] = {};
    target[OrchaMetadata.CONTROLLER_METHODS][propertyKey] = options?.type ?? 'simple';
  };
}
