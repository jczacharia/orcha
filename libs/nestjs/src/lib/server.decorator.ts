/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ORCHA, ORCHA_DTO, ORCHA_FILES, ORCHA_TOKEN } from '@orcha/common';

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
export function ServerOrchestrationController(name: string | number): ClassDecorator {
  return function (target: Function) {
    Controller(`${ORCHA}/${name}`)(target);
  };
}

function transform(val: string) {
  try {
    return JSON.parse(val);
  } catch (error) {
    return val;
  }
}

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const errorStr = validationErrors
      .map(({ constraints }) => {
        const errors: string[] = [];
        if (constraints) {
          for (const constraint of Object.values(constraints)) {
            errors.push(constraint);
          }
        }
        return errors;
      })
      .filter((v) => v.length > 0)
      .flat()
      .join(', ');
    return new BadRequestException(`Validation failed: ${errorStr}`);
  },
};

/**
 * Maps an Orchestrations method to an Orchestration endpoint.
 *
 * @note It is highly advised to use the `validateQuery` option in `options` for endpoint security.
 *
 * @example
 * ```ts
 * @ServerOrchestration('user')
 * export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
 *   constructor(private readonly _user: UserService) {}
 *
 *   // `/orcha/user/login`
 *   @ServerOperation()
 *   login(query: IQuery<{ token: string }>, _: string, { id, password }: LoginDto) {
 *     return this._user.login(id, password, query);
 *   }
 *
 *   // `/orcha/user/signUp`
 *   @ServerOperation()
 *   signUp(query: IQuery<{ token: string }>, _: string, { id, password }: SignUpDto) {
 *     return this._user.signUp(id, password, query);
 *   }
 *
 *   // `/orcha/user/getProfile`
 *   @ServerOperation()
 *   getProfile(query: IQuery<User>, token: string) {
 *     return this._user.verifyUserToken(token, query);
 *   }
 * }
 * ```
 */
export function ServerOperation(): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    Body(ORCHA_TOKEN)(target, propertyKey, 0);
    Body(ORCHA_DTO, { transform }, new ValidationPipe(validationPipeOptions))(target, propertyKey, 1);

    UploadedFiles()(target, propertyKey, 2);
    UseInterceptors(FilesInterceptor(ORCHA_FILES))(target, propertyKey, descriptor);

    Post(propertyKey as string)(target, propertyKey, descriptor);
  };
}
