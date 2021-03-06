/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { IQuery, ORCHA_PAGINATE } from '@orcha/common';

@Injectable()
export class QueryValidationPipe<T, Q extends IQuery<T>> implements PipeTransform<unknown> {
  query: Q;

  constructor(query: Q) {
    this.query = query;
  }

  async transform(value: unknown): Promise<unknown> {
    const recurse = (val: any, query: any) => {
      for (const k of Object.keys(val)) {
        if (k === ORCHA_PAGINATE) {
          continue;
        }

        const incoming = val[k];
        const comparison = query[k];
        if (!!comparison !== !!incoming) {
          throw new UnauthorizedException(`Unauthorized query key "${k}".`);
        } else if (typeof incoming === 'object') {
          recurse(incoming, comparison);
        }
      }
    };

    recurse(value, this.query);

    return value;
  }
}
