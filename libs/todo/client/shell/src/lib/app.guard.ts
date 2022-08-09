import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppFacade } from '@orcha/todo/client/domain';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, take } from 'rxjs';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    private readonly _app: AppFacade,
    private readonly _router: Router,
    private readonly _authTokenStorage: OrchaAuthTokenLocalStorage
  ) {}

  canActivate(): Observable<boolean> | boolean {
    const token = this._authTokenStorage.getToken();
    if (!token) {
      this._router.navigate(['/login']);
      return false;
    }

    return merge(
      this._app.user.actionListeners.getProfile.error.pipe(
        map(() => {
          this._router.navigate(['/login']);
          return false;
        })
      ),
      this._app.user.selectors.state$.pipe(
        filter(({ loaded }) => {
          if (!loaded) {
            this._app.user.dispatchers.getProfile();
            return false;
          }
          return true;
        }),
        mapTo(true)
      )
    ).pipe(take(1));
  }
}
