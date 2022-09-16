/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { ORCHA_ID } from '@orcha/common';

type QueryModel = Record<string, any>;

@Injectable()
export class QueryValidationPipe implements PipeTransform<unknown> {
  query: { [k: string]: true };

  constructor(query: QueryModel) {
    this.query = query;
  }

  async transform(value: unknown): Promise<unknown> {
    const unAuthKeys: string[] = [];

    const recurse = (val: QueryModel, query: QueryModel) => {
      for (const k of Object.keys(val)) {
        if (k === ORCHA_ID) {
          continue;
        }

        const incoming = val[k as keyof QueryModel];
        const comparison = query[k as keyof QueryModel];
        if (!!comparison !== !!incoming) {
          unAuthKeys.push(k);
        } else if (typeof incoming === 'object') {
          recurse(incoming as QueryModel, comparison as QueryModel);
        }
      }
    };

    recurse(value as QueryModel, this.query);

    if (unAuthKeys.length > 1) {
      throw new UnauthorizedException(
        `Validation failed: Unauthorized Orcha Query key(s): ${unAuthKeys.join(', ')}`
      );
    }

    return value;
  }
}
