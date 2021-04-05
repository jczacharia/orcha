import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Type } from '@angular/core';
import { ORCHA } from '@orcha/common';

/**
 * Implements an Orcha Interceptor.
 * An Orcha Interceptor intercepts every Angular's HTTP client request whose URL is prefixed with `/orcha`.
 * This is commonly used to inject the user's auth token into each operation.
 */
export type OrchaInterceptor = HttpInterceptor;

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
