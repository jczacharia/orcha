/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { IQueryModel, ORCHA_ID } from '@orcha/common';

@Injectable()
export class QueryValidationPipe implements PipeTransform<unknown> {
  query: IQueryModel;

  constructor(query: IQueryModel) {
    this.query = query;
  }

  async transform(value: unknown): Promise<unknown> {
    const recurse = (val: IQueryModel, query: IQueryModel) => {
      for (const k of Object.keys(val)) {
        if (k === ORCHA_ID) {
          continue;
        }

        const incoming = val[k as keyof IQueryModel];
        const comparison = query[k as keyof IQueryModel];
        if (!!comparison !== !!incoming) {
          throw new UnauthorizedException(`Unauthorized query key "${k}".`);
        } else if (typeof incoming === 'object') {
          recurse(incoming as IQueryModel, comparison as IQueryModel);
        }
      }
    };

    recurse(value as IQueryModel, this.query);

    return value;
  }
}
