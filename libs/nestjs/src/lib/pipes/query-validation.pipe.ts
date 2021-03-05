/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { IQuery } from '@orcha/common';

@Injectable()
export class QueryValidationPipe<T, Q extends IQuery<T>> implements PipeTransform<unknown> {
  query: Q;

  constructor(query: Q) {
    this.query = query;
  }

  async transform(value: unknown): Promise<unknown> {
    const recurse = (val: any, query: any) => {
      for (const k of Object.keys(val)) {
        if (typeof val[k] === 'object') {
          recurse(val[k], query[k]);
        } else if (!!val[k] !== !!query[k]) {
          throw new UnauthorizedException(`Unauthorized query key "${k}".`);
        }
      }
    };

    recurse(value, this.query);

    return value;
  }
}
