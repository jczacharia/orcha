import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch, pessimisticUpdate } from '@nrwl/angular';
import { OrchaAuthTokenLocalStorage } from '@orcha/angular';
import { filter, map, of, tap } from 'rxjs';
import * as UserActions from './user.actions';
import { UserOrchestration } from './user.orchestration';

@Injectable()
export class UserEffects {
  readonly userLogin$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userLogin),
      pessimisticUpdate({
        run: ({ dto }) =>
          this._user.login(dto).pipe(
            map(({ data: { token } }) => {
              this._authTokenStorage.setAuthToken(token);
              this._router.navigate(['']);
              return UserActions.userLoginSuccess({ email: dto.email, token });
            })
          ),
        onError: (action, error) => {
          return of(UserActions.userLoginError({ error }));
        },
      })
    )
  );

  readonly userSignUp$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.userSignUp),
      pessimisticUpdate({
        run: ({ dto }) =>
          this._user.signUp(dto).pipe(
            map(({ data: { token } }) => {
              this._authTokenStorage.setAuthToken(token);
              this._router.navigate(['/login']);
              return UserActions.userSignUpSuccess({ token });
            })
          ),
        onError: (action, error) => {
          return of(UserActions.userSignUpError({ error }));
        },
      })
    )
  );

  readonly getProfile$ = createEffect(() =>
    this._actions$.pipe(
      ofType(UserActions.getProfile),
      fetch({
        run: () =>
          this._user.getProfile().pipe(
            map(({ data: user }) => {
              return UserActions.getProfileSuccess({ user });
            })
          ),
        onError: (action, error) => {
          this._authTokenStorage.deleteToken();
          window.location.href = '/';
          return of(UserActions.getProfileError({ error }));
        },
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
      pessimisticUpdate({
        run: ({ file }) =>
          this._user.updateProfilePic(null, [file]).pipe(
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
            map((data) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return UserActions.updateProfilePicSuccess({ user: data!.data });
            })
          ),
        onError: (action, error) => {
          return of(UserActions.updateProfilePicError({ error }));
        },
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
