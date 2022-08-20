import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';
import { filter, map, mapTo, merge, Observable, take } from 'rxjs';
import { AppFacade } from '../domain/app.facade';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    private app: AppFacade,
    private router: Router,
    private authTokenStorage: OrchaAuthTokenLocalStorage
  ) {}

  canActivate(): Observable<boolean> | boolean {
    const token = this.authTokenStorage.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    return merge(
      this.app.user.actionListeners.getProfile.error.pipe(
        map(() => {
          this.router.navigate(['/login']);
          return false;
        })
      ),
      this.app.user.selectors.state$.pipe(
        filter(({ loaded }) => {
          if (!loaded) {
            this.app.user.dispatchers.getProfile();
            return false;
          }
          return true;
        }),
        mapTo(true)
      )
    ).pipe(take(1));
  }
}
