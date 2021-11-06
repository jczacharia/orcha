/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { IQueryModel, ORCHA, ORCHA_DTO, ORCHA_FILES, ORCHA_QUERY, ORCHA_TOKEN } from '@orcha/common';
import { ValidationPipe } from '../pipes';
import { QueryValidationPipe } from '../pipes/query-validation.pipe';

/**
 * Decorates a NestJS class (Orchestration) of Operations to receive inbound requests and produce responses.
 *
 * @example
 * ```ts
 * @ServerOrchestration('user')
 * export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
 *   constructor(private readonly _user: UserService) {}
 *
 *   // `/orcha/user/login`
 *   @ServerOperation({ validateQuery: LoginQueryModel })
 *   login(query: IQuery<{ token: string }>, _: string, { id, password }: LoginDto) {
 *     return this._user.login(id, password, query);
 *   }
 *
 *   // `/orcha/user/signUp`
 *   @ServerOperation({ validateQuery: SignUpQueryModel })
 *   signUp(query: IQuery<{ token: string }>, _: string, { id, password }: SignUpDto) {
 *     return this._user.signUp(id, password, query);
 *   }
 *
 *   // `/orcha/user/getProfile`
 *   @ServerOperation({ validateQuery: EntireProfile })
 *   getProfile(query: IQuery<User>, token: string) {
 *     return this._user.verifyUserToken(token, query);
 *   }
 * }
 * ```
 *
 * @param name Name of orchestration class.
 */
export function ServerOrchestration(name: string | number): ClassDecorator {
  return function (target: Function) {
    if (!name) throw new Error('No orchestration name provided for @ServerOrchestration');
    Controller(`${ORCHA}/${name}`)(target);
  };
}

function transform(val: string) {
  try {
    return JSON.parse(val);
  } catch (error) {
    return {};
  }
}

/**
 * Maps an Orchestrations method to an Orchestration endpoint.
 *
 * ! Note: It is highly advised to use the `validateQuery` option in `options` for endpoint security.
 *
 * @example
 * ```ts
 * @ServerOrchestration('user')
 * export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
 *   constructor(private readonly _user: UserService) {}
 *
 *   // `/orcha/user/login`
 *   @ServerOperation({ validateQuery: LoginQueryModel })
 *   login(query: IQuery<{ token: string }>, _: string, { id, password }: LoginDto) {
 *     return this._user.login(id, password, query);
 *   }
 *
 *   // `/orcha/user/signUp`
 *   @ServerOperation({ validateQuery: SignUpQueryModel })
 *   signUp(query: IQuery<{ token: string }>, _: string, { id, password }: SignUpDto) {
 *     return this._user.signUp(id, password, query);
 *   }
 *
 *   // `/orcha/user/getProfile`
 *   @ServerOperation({ validateQuery: EntireProfile })
 *   getProfile(query: IQuery<User>, token: string) {
 *     return this._user.verifyUserToken(token, query);
 *   }
 * }
 * ```
 */
export function ServerOperation(options?: {
  /**
   * Whether the operation has singular or multiple file upload. Defaults to `singular`.
   */
  fileUpload?: 'singular' | 'multiple';
  /**
   * Validates the query object. If query object has extra fields in any of its objects,
   * compared to `validateQuery`, an unauthorized exception will be thrown. `__paginate` is ignored.
   *
   * @remarks
   * It is highly recommended that you use this feature to prevent unauthorized access to data.
   */
  validateQuery?: IQueryModel;
}): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    if (options?.validateQuery) {
      Body(ORCHA_QUERY, { transform }, new QueryValidationPipe(options.validateQuery))(
        target,
        propertyKey,
        0
      );
    } else {
      Body(ORCHA_QUERY, { transform })(target, propertyKey, 0);
    }

    Body(ORCHA_TOKEN)(target, propertyKey, 1);
    Body(ORCHA_DTO, { transform }, new ValidationPipe())(target, propertyKey, 2);

    if (options?.fileUpload === 'multiple') {
      UploadedFiles()(target, propertyKey, 3);
      UseInterceptors(FilesInterceptor(ORCHA_FILES))(target, propertyKey, descriptor);
    } else {
      UploadedFile()(target, propertyKey, 3);
      UseInterceptors(FileInterceptor(ORCHA_FILES))(target, propertyKey, descriptor);
    }

    Post(propertyKey as string)(target, propertyKey, descriptor);
  };
}

export function ServerGateway(name: string): ClassDecorator {
  return function (target: Function) {
    WebSocketGateway(80, { namespace: name, cors: true })(target);
  };
}

export function ServerSubscription(options?: {
  /**
   * Validates the query object. If query object has extra fields in any of its objects,
   * compared to `validateQuery`, an unauthorized exception will be thrown. `__paginate` is ignored.
   *
   * @remarks
   * It is highly recommended that you use this feature to prevent unauthorized access to data.
   */
  validateQuery?: IQueryModel;
}): MethodDecorator {
  return function <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    ConnectedSocket()(target, propertyKey, 0);
    if (options?.validateQuery) {
      MessageBody(ORCHA_QUERY, new QueryValidationPipe(options.validateQuery))(target, propertyKey, 1);
    } else {
      MessageBody(ORCHA_QUERY)(target, propertyKey, 1);
    }
    MessageBody(ORCHA_TOKEN)(target, propertyKey, 2);
    MessageBody(ORCHA_DTO, new ValidationPipe())(target, propertyKey, 3);
    const original = descriptor.value;
    if (original) {
      (descriptor as any).value = async function (...args: any[]) {
        try {
          return await (original as any).apply(this, args);
        } catch (error) {
          throw new WsException(error);
        }
      };
    }
    SubscribeMessage(propertyKey as string)(target, propertyKey, descriptor);
    return descriptor;
  };
}
