import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Type } from '@angular/core';
import { KIRTAN } from '@kirtan/common';

export interface KirtanInterceptor extends HttpInterceptor {}

export function createKirtanInterceptorFilter(interceptor: Type<KirtanInterceptor>) {
  const originalFunction = interceptor.prototype.intercept;
  interceptor.prototype.intercept = function (req: HttpRequest<any>, next: HttpHandler) {
    // Filter out non-kirtan http calls.
    const firstParam = req.url.replace('http://', '').split('/')[1];
    if (firstParam !== KIRTAN) {
      return next.handle(req);
    }
    return originalFunction.call(this, req, next);
  };
  return interceptor;
}
