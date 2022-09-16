/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Post,
  Query,
  Sse,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { IExactQuery, IOrchaModel, IQuery, ORCHA, OrchaOperationType, OrchaProps } from '@orcha/common';
import { defaultValidationPipeOptions } from './default-validation.pipe-options';
import { QueryValidationPipe } from './query-validation.pipe';

/**
 * Decorates a NestJS class (Controller) of Operations to receive inbound requests and produce responses.
 *
 * @example
 * ```ts
 *
 * // User Controller
 *
 * @ServerController('user')
 * export class UserController implements IServerController<IUserController> {
 *   constructor(private readonly _user: UserService) {}
 *
 *   // `/orcha/user/login`
 *   @ServerOperation({ type: 'query', validateQuery: LoginQueryModel })
 *   login(token: string, { id, password }: LoginDto) {
 *     return this._user.login(id, password);
 *   }
 *
 *   // `/orcha/user/signUp`
 *   @ServerOperation()
 *   signUp(_: string, { id, password }: SignUpDto) {
 *     return this._user.signUp(id, password);
 *   }
 *
 *   // `/orcha/user/getProfile`
 *   @ServerOperation()
 *   queryProfile(token: string) {
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
  } catch (_) {
    return val;
  }
}

/**
 * Decorates a class function with an HTTP endpoint.
 *
 * `options.type` defaults to `SIMPLE`
 */
export function ServerOperation<T extends IOrchaModel<any>>(options?: {
  /**
   * The type of Operation. Defaults to `SIMPLE`
   */
  type?: OrchaOperationType;
  /**
   * Used to override the default validation pipe for the DTO
   */
  dtoValidationPipe?: ValidationPipe;
  /**
   * Only works for `OperationType.QUERY`
   *
   * Validates the query object. If query object has extra fields in any of its objects,
   * compared to `validateQuery`, an unauthorized exception will be thrown.
   *
   * @remarks
   * It is recommended that you use this feature to prevent unauthorized access to data.
   */
  validateQuery?: IExactQuery<T, IQuery<T>>;
}): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    // Get token from headers
    createParamDecorator((_, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const token: string = request.headers[OrchaProps.TOKEN];
      return token || '';
    })()(target, propertyKey, 0);

    const validationPipe = options?.dtoValidationPipe
      ? options.dtoValidationPipe
      : new ValidationPipe(defaultValidationPipeOptions);

    switch (options?.type) {
      case 'query':
        {
          Post(propertyKey as string)(target, propertyKey, descriptor);
          Body(
            OrchaProps.QUERY,
            { transform },
            ...(options?.validateQuery ? [new QueryValidationPipe(options.validateQuery)] : [])
          )(target, propertyKey, 1);
          Body(OrchaProps.DTO, { transform }, validationPipe)(target, propertyKey, 2);
        }
        break;

      case 'paginate':
        Post(propertyKey as string)(target, propertyKey, descriptor);
        Body(OrchaProps.PAGINATE, { transform })(target, propertyKey, 1);
        Body(OrchaProps.DTO, { transform }, validationPipe)(target, propertyKey, 2);
        break;

      case 'file-upload':
        Post(propertyKey as string)(target, propertyKey, descriptor);
        UseInterceptors(FileInterceptor(OrchaProps.FILE))(target, propertyKey, descriptor);
        UploadedFile()(target, propertyKey, 1);
        Body(OrchaProps.DTO, { transform }, validationPipe)(target, propertyKey, 2);
        break;

      case 'files-upload':
        Post(propertyKey as string)(target, propertyKey, descriptor);
        UseInterceptors(FilesInterceptor(OrchaProps.FILES))(target, propertyKey, descriptor);
        UploadedFiles()(target, propertyKey, 1);
        Body(OrchaProps.DTO, { transform }, validationPipe)(target, propertyKey, 2);
        break;

      case 'event':
        Sse(propertyKey as string)(target, propertyKey, descriptor);
        Query({ transform }, validationPipe)(target, propertyKey, 1);
        break;

      default:
        Post(propertyKey as string)(target, propertyKey, descriptor);
        Body(OrchaProps.DTO, { transform }, validationPipe)(target, propertyKey, 1);
        break;
    }
  };
}
