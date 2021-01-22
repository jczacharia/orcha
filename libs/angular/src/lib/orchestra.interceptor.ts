import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Type } from '@angular/core';
import { ORCHESTRA } from '@orcha/common';

export interface OrchestraInterceptor extends HttpInterceptor {}

export function createOrchestraInterceptorFilter(interceptor: Type<OrchestraInterceptor>) {
  const originalFunction = interceptor.prototype.intercept;
  interceptor.prototype.intercept = function (req: HttpRequest<any>, next: HttpHandler) {
    // Filter out non-orchestra http calls.
    const firstParam = req.url.replace(/(https:\/\/)|(http:\/\/)/g, '').split('/')[1];
    if (firstParam !== ORCHESTRA) {
      return next.handle(req);
    }
    return originalFunction.call(this, req, next);
  };
  return interceptor;
}
