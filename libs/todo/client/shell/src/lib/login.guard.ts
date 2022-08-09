import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private readonly _router: Router,
    private readonly _authTokenStorage: OrchaAuthTokenLocalStorage
  ) {}

  canActivate(): boolean {
    const token = this._authTokenStorage.getToken();
    if (token) {
      this._router.navigate(['']);
      return false;
    }
    return true;
  }
}
