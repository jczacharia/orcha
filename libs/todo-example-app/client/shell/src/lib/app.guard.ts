import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, take } from 'rxjs/operators';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private readonly _app: AppFacade, private readonly _router: Router) {}

  canActivate(): Observable<boolean> {
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
        take(1),
        mapTo(true)
      )
    );
  }
}
