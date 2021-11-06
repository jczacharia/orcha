import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { pessimisticUpdate } from '@nrwl/angular';
import { UserQueryModel } from '@orcha-todo-example-app/shared/domain';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as UserActions from './user.actions';
import { UserOrchestration } from './user.orchestration';

@Injectable()
export class UserEffects {
  readonly userLogin$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userLogin),
      pessimisticUpdate({
        run: ({ id, password }) =>
          this._user.login({ token: true }, { id, password }).pipe(
            map(({ token }) => {
              this._authTokenStorage.setAuthToken(token);
              this._router.navigate(['']);
              return UserActions.userLoginSuccess({ id, token });
            })
          ),
        onError: (action, { error }) => {
          return UserActions.userLoginError({ error });
        },
      })
    )
  );

  readonly userSignUp$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userSignUp),
      pessimisticUpdate({
        run: ({ id, password }) =>
          this._user.signUp({ token: true }, { id, password }).pipe(
            map(({ token }) => {
              this._authTokenStorage.setAuthToken(token);
              this._router.navigate(['/login']);
              return UserActions.userSignUpSuccess({ token });
            })
          ),
        onError: (action, { error }) => {
          return UserActions.userSignUpError({ error });
        },
      })
    )
  );

  readonly getProfile$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.getProfile),
      switchMap(() => this._user.getProfile(UserQueryModel)),
      map((user) => UserActions.getProfileSuccess({ user })),
      catchError((error) => {
        return of(UserActions.getProfileError({ error }));
      })
    )
  );

  readonly userLogOut$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(UserActions.logout),
        tap(() => {
          this._authTokenStorage.deleteToken();
          window.location.href = '/';
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly _actions$: Actions,
    private readonly _user: UserOrchestration,
    private readonly _router: Router,
    private readonly _authTokenStorage: OrchaAuthTokenLocalStorage
  ) {}
}
