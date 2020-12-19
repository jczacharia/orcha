import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!value || (value instanceof Object && this.isEmpty(value))) {
      throw new BadRequestException('Validation failed: No body submitted.');
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(
        `Validation failed: ${this.formatErrors(errors as { constraints: {} }[])}`
      );
    }
    return value;
  }

  private toValidate(metaType: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metaType);
  }

  private formatErrors(errors: { constraints: {} }[]): string {
    return errors
      .map(({ constraints }) => {
        for (const value of Object.values(constraints)) {
          return value;
        }
      })
      .join(', ');
  }

  private isEmpty(value: Object): boolean {
    if (Object.keys(value).length > 0) {
      return false;
    }
    return true;
  }
}
