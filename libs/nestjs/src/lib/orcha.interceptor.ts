import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { OrchaResponse } from '@orcha/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class OrchaInterceptor<T> implements NestInterceptor<T, OrchaResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<OrchaResponse<T>> {
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data as unknown as OrchaResponse<T>;
        }
        return { data, statusCode: res.statusCode };
      })
    );
  }
}
