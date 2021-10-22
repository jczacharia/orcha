/* eslint-disable @typescript-eslint/ban-types */
import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this._toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new HttpException(
        `Validation failed: ${this._formatErrors(errors as { constraints: {} }[])}`,
        HttpStatus.BAD_REQUEST
      );
    }
    return value;
  }

  private _toValidate(metaType: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metaType);
  }

  private _formatErrors(errors: { constraints: {} }[]): string {
    return errors
      .map(({ constraints }) => {
        for (const value of Object.values(constraints)) {
          return value;
        }
      })
      .join(', ');
  }
}
