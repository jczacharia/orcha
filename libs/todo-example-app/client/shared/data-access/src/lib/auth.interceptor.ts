import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrchaInterceptor } from '@orcha/angular';
import { ORCHA_TOKEN } from '@orcha/common';
import { Observable } from 'rxjs';
import { AuthTokenStorage } from './user/user.storage';

@Injectable()
export class AuthInterceptor implements OrchaInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers = req.headers;
    const body = req.body as FormData;

    const userToken = AuthTokenStorage.getValue();
    if (body) {
      body.set(ORCHA_TOKEN, userToken?.token ?? '');
    }

    const authReq = req.clone({ headers, body });
    return next.handle(authReq);
    // Simulate HTTP delay for development.
    // .pipe(environment.production ? tap() : delay(Math.floor(Math.random() * (1000 - 200 + 1) + 200)))
  }
}
