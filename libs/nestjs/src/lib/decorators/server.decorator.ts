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

// export function ServerGateway(namespace: string, port = 80): ClassDecorator {
//   return function (target: Function) {
//     WebSocketGateway(port, { namespace, cors: true })(target);
//   };
// }

// export function ServerSubscription(options?: {
//   /**
//    * Validates the query object. If query object has extra fields in any of its objects,
//    * compared to `validateQuery`, an unauthorized exception will be thrown. `__paginate` is ignored.
//    *
//    * @remarks
//    * It is highly recommended that you use this feature to prevent unauthorized access to data.
//    */
//   validateQuery?: IQueryModel;
// }): MethodDecorator {
//   const orm = Inject(MikroORM);
//   return function <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
//     ConnectedSocket()(target, propertyKey, 0);
//     if (options?.validateQuery) {
//       MessageBody(ORCHA_QUERY, new QueryValidationPipe(options.validateQuery))(target, propertyKey, 1);
//     } else {
//       MessageBody(ORCHA_QUERY)(target, propertyKey, 1);
//     }
//     orm(target, 'orm');
//     UseRequestContext()(target, 'orm', descriptor);
//     MessageBody(ORCHA_TOKEN)(target, propertyKey, 2);
//     MessageBody(ORCHA_DTO, new ValidationPipe(validationPipeOptions))(target, propertyKey, 3);
//     const original = descriptor.value;
//     if (original) {
//       (descriptor as any).value = async function (...args: any[]) {
//         try {
//           // `await` here is important since it is in the try.
//           return await (original as any).apply(this, args);
//         } catch (error) {
//           throw new WsException(error as string);
//         }
//       };
//     }
//     SubscribeMessage(propertyKey as string)(target, propertyKey, descriptor);
//     UseFilters(new OrchaSubscriptionErrorFilter(propertyKey as string))(target, propertyKey, descriptor);
//     return descriptor;
//   };
// }
