import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Type } from '@angular/core';
import { ORCHA } from '@orcha/common';

export interface OrchaInterceptor extends HttpInterceptor {}

export function createOrchaInterceptorFilter(interceptor: Type<OrchaInterceptor>) {
  const originalFunction = interceptor.prototype.intercept;
  interceptor.prototype.intercept = function (req: HttpRequest<any>, next: HttpHandler) {
    // Filter out non-orcha http calls.
    const firstParam = req.url.replace(/(https:\/\/)|(http:\/\/)/g, '').split('/')[1];
    if (firstParam !== ORCHA) {
      return next.handle(req);
    }
    return originalFunction.call(this, req, next);
  };
  return interceptor;
}
