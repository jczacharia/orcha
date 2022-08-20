import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private authTokenStorage: OrchaAuthTokenLocalStorage) {}

  canActivate(): boolean {
    const token = this.authTokenStorage.getToken();
    if (token) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
