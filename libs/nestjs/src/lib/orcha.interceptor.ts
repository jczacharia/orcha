import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { OrchaResponse } from '@orcha/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class OrchaInterceptor<T> implements NestInterceptor<T, OrchaResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<OrchaResponse<T>> {
    const { statusCode } = context.switchToHttp().getResponse();
    return next.handle().pipe(map((data) => ({ data, statusCode })));
  }
}
