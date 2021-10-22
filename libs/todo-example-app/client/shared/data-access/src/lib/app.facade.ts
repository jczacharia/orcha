import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { UpdateTodoDto } from '@orcha-todo-example-app/shared/domain';
import { tap } from 'rxjs/operators';
import * as TagActions from './tag/tag.actions';
import * as TagSelectors from './tag/tag.selectors';
import * as TodoActions from './todo/todo.actions';
import { TodoStoreModel } from './todo/todo.reducer';
import * as TodoSelectors from './todo/todo.selectors';
import * as UserActions from './user/user.actions';
import * as UserSelectors from './user/user.selectors';

@Injectable()
export class AppFacade {
  readonly user = {
    dispatchers: {
      login: (id: string, password: string) => {
        this._store.dispatch(UserActions.userLogin({ id, password }));
      },
      signUp: (id: string, password: string) => {
        this._store.dispatch(UserActions.userSignUp({ id, password }));
      },
      getProfile: () => {
        this._store.dispatch(UserActions.getProfile());
      },
      logout: () => {
        this._store.dispatch(UserActions.logout());
      },
    },
    actionListeners: {
      login: {
        success: this._actions$.pipe(ofType(UserActions.userLoginSuccess)),
        error: this._actions$.pipe(ofType(UserActions.userLoginError)),
      },
      signUp: {
        success: this._actions$.pipe(ofType(UserActions.userSignUpSuccess)),
        error: this._actions$.pipe(ofType(UserActions.userSignUpError)),
      },
      getProfile: {
        success: this._actions$.pipe(ofType(UserActions.getProfileSuccess)),
        error: this._actions$.pipe(ofType(UserActions.getProfileError)),
      },
    },
    selectors: {
      state$: this._store.select(UserSelectors.getState),
    },
  };

  readonly todo = {
    dispatchers: {
      create: (content: string) => {
        this._store.dispatch(TodoActions.createTodo({ content }));
      },
      delete: (todo: TodoStoreModel) => {
        this._store.dispatch(TodoActions.deleteTodo({ todo }));
      },
      update: (dto: UpdateTodoDto) => {
        this._store.dispatch(TodoActions.updateTodo({ dto }));
      },
      tag: (todo: TodoStoreModel, tagName: string) => {
        this._store.dispatch(TodoActions.tagTodo({ todo, tagName }));
      },
      untag: (taggedTodoId: string) => {
        this._store.dispatch(TodoActions.untagTodo({ taggedTodoId }));
      },
    },
    selectors: {
      todos$: this._store.pipe(select(TodoSelectors.getTodos)).pipe(
        tap(({ loaded }) => {
          if (!loaded) {
            this._store.dispatch(TodoActions.readTodos());
          }
        })
      ),
    },
  };

  readonly tag = {
    selectors: {
      tags$: this._store.pipe(select(TagSelectors.getTags)).pipe(
        tap(({ loaded }) => {
          if (!loaded) {
            this._store.dispatch(TagActions.readTags());
          }
        })
      ),
    },
  };

  constructor(private readonly _store: Store, private readonly _actions$: Actions) {}
}
