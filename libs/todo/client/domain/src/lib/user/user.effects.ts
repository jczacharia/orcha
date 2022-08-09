import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserQueryModel } from '@orcha/todo/shared/domain';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import * as UserActions from './user.actions';
import { UserOrchestration } from './user.orchestration';

@Injectable()
export class UserEffects {
  readonly userLogin$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userLogin),
      switchMap(({ id, password }) =>
        this._user.login({ token: true }, { id, password }).pipe(
          map(({ token }) => {
            this._authTokenStorage.setAuthToken(token);
            this._router.navigate(['']);
            return UserActions.userLoginSuccess({ id, token });
          })
        )
      ),
      catchError((error) => {
        return of(UserActions.userLoginError({ error }));
      })
    )
  );

  readonly userSignUp$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userSignUp),
      switchMap(({ id, password }) =>
        this._user.signUp({ token: true }, { id, password }).pipe(
          map(({ token }) => {
            this._authTokenStorage.setAuthToken(token);
            this._router.navigate(['/login']);
            return UserActions.userSignUpSuccess({ token });
          })
        )
      ),
      catchError((error) => {
        return of(UserActions.userSignUpError({ error }));
      })
    )
  );

  readonly getProfile$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.getProfile),
      switchMap(() => this._user.getProfile(UserQueryModel)),
      map((user) => UserActions.getProfileSuccess({ user })),
      catchError((error) => {
        this._authTokenStorage.deleteToken();
        window.location.href = '/';
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

  readonly updateProfilePic$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.updateProfilePic),
      switchMap(({ file }) =>
        this._user.updateProfilePic(UserQueryModel, null, [file]).pipe(
          map((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                {
                  const progress = Math.round((100 * event.loaded) / (event.total ?? 1));
                  console.log(progress);
                }
                break;
              case HttpEventType.Response:
                return event.body;
            }
            return null;
          }),
          filter((body) => !!body),
          map((user) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return UserActions.updateProfilePicSuccess({ user: user! });
          })
        )
      ),
      catchError((error) => {
        return of(UserActions.updateProfilePicError({ error }));
      })
    )
  );

  constructor(
    private readonly _actions$: Actions,
    private readonly _user: UserOrchestration,
    private readonly _router: Router,
    private readonly _authTokenStorage: OrchaAuthTokenLocalStorage
  ) {}
}
