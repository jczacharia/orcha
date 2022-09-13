import {
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ORCHA_ID } from './constants';
import { IExactQuery, IQuery, IQueryModel } from './query';
import { IOrchaModel } from './relations';

@ValidatorConstraint({ name: 'orchaQueryValidator', async: false })
class OrchaQueryValidator implements ValidatorConstraintInterface {
  forbiddenKeys: string[] = [];

  validate(query: IQueryModel, args: ValidationArguments) {
    const recurse = (val: IQueryModel, q: IQueryModel) => {
      for (const k of Object.keys(val)) {
        if (k === ORCHA_ID) {
          continue;
        }

        const incoming = val[k as keyof IQueryModel];
        const comparison = q[k as keyof IQueryModel];
        if (!!comparison !== !!incoming) {
          this.forbiddenKeys.push(k);
        } else if (typeof incoming === 'object') {
          recurse(incoming as IQueryModel, comparison as IQueryModel);
        }
      }
    };

    recurse(query, args.constraints[0]);

    return this.forbiddenKeys.length === 0;
  }

  defaultMessage() {
    // here you can provide default error message if validation failed
    return `Unauthorized Orcha Query key(s): ${this.forbiddenKeys.join(', ')}`;
  }
}

export function ValidateOrchaQuery<T extends IOrchaModel<any>>(
  query: IExactQuery<T, IQuery<T>>,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    Validate(OrchaQueryValidator, [query], validationOptions)(object, propertyName);
  };
}
