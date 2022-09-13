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
  ValidationPipeOptions,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ORCHA, ORCHA_DTO, ORCHA_FILES, ORCHA_TOKEN } from '@orcha/common';

/**
 * Decorates a NestJS class (Controller) of Operations to receive inbound requests and produce responses.
 *
 * @example
 * ```ts
 * @ServerController('user')
 * export class UserController implements IServerController<IUserController> {
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
 * @param name Name of controller class.
 */
export function ServerController(name: string | number): ClassDecorator {
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

const defaultValidationPipeOptions: ValidationPipeOptions = {
  transform: true,
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const errorStr = validationErrors
      .map((err) => {
        const errors: string[] = [];
        const recurse = ({ constraints, children }: ValidationError) => {
          if (constraints) {
            for (const constraint of Object.values(constraints)) {
              errors.push(constraint);
            }
          }
          if (!children) {
            return;
          }
          for (const child of children) {
            recurse(child);
          }
        };
        recurse(err);
        return errors;
      })
      .filter((v) => v.length > 0)
      .flat()
      .join(', ');
    return new BadRequestException(`Validation failed: ${errorStr}`);
  },
};

/**
 * Maps an Controllers method to an Controller endpoint.
 *
 * @note It is highly advised to use the `validateQuery` option in `options` for endpoint security.
 *
 * @example
 * ```ts
 * @ServerController('user')
 * export class UserController implements IServerController<IUserController> {
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
export function ServerOperation(options?: { dtoValidationPipe?: ValidationPipe }): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    Body(ORCHA_TOKEN)(target, propertyKey, 0);

    Body(
      ORCHA_DTO,
      { transform },
      options?.dtoValidationPipe
        ? options.dtoValidationPipe
        : new ValidationPipe(defaultValidationPipeOptions)
    )(target, propertyKey, 1);

    UploadedFiles()(target, propertyKey, 2);
    UseInterceptors(FilesInterceptor(ORCHA_FILES))(target, propertyKey, descriptor);

    Post(propertyKey as string)(target, propertyKey, descriptor);
  };
}
