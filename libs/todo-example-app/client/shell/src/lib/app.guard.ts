import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, take } from 'rxjs/operators';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private readonly app: AppFacade, private router: Router) {}

  canActivate(): Observable<boolean> {
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
        take(1),
        mapTo(true)
      )
    );
  }
}
