import { Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { IQueryModel, ORCHA_PAGINATE } from '@orcha/common';

@Injectable()
export class QueryValidationPipe implements PipeTransform<unknown> {
  query: IQueryModel;

  constructor(query: IQueryModel) {
    this.query = query;
  }

  transform(requestedQuery: unknown) {
    const recurse = (reqQ: IQueryModel, query: IQueryModel) => {
      const incomingKeys = Object.keys(reqQ);
      for (const incomingKey of incomingKeys) {
        if (incomingKey === ORCHA_PAGINATE) {
          continue;
        }
        const validKeys = Object.keys(query);
        if (!validKeys.includes(incomingKey)) {
          throw new UnauthorizedException(`Unauthorized query key "${incomingKey}".`);
        }
        const incomingValue = reqQ[incomingKey as keyof IQueryModel];
        const validValue = query[incomingKey as keyof IQueryModel];
        if (typeof incomingValue === 'object') {
          recurse(incomingValue as IQueryModel, validValue as IQueryModel);
          continue;
        }
        if (incomingValue !== validValue) {
          throw new UnauthorizedException(`Unauthorized query key "${incomingKey}".`);
        }
      }
    };
    recurse(requestedQuery as IQueryModel, this.query);
    return requestedQuery;
  }
}
