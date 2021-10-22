import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { UpdateTodoDto } from '@orcha-todo-example-app/shared/domain';
import { UnArray, UnObservable } from '@orcha-todo-example-app/shared/util';
import { tap } from 'rxjs/operators';
import * as TodoActions from './todo/todo.actions';
import * as TagActions from './tag/tag.actions';
import { TodoStoreModel } from './todo/todo.reducer';
import * as TodoSelectors from './todo/todo.selectors';
import * as TagSelectors from './tag/tag.selectors';
import * as UserActions from './user/user.actions';
import * as UserSelectors from './user/user.selectors';

export type TagStoreModel = UnArray<UnObservable<typeof AppFacade.prototype.tag.selectors.tags$>['tags']>;

@Injectable()
export class AppFacade {
  readonly user = {
    dispatchers: {
      login: (id: string, password: string) => {
        this.store.dispatch(UserActions.userLogin({ id, password }));
      },
      signUp: (id: string, password: string) => {
        this.store.dispatch(UserActions.userSignUp({ id, password }));
      },
      getProfile: () => {
        this.store.dispatch(UserActions.getProfile());
      },
      logout: () => {
        this.store.dispatch(UserActions.logout());
      },
    },
    actionListeners: {
      login: {
        success: this.actions$.pipe(ofType(UserActions.userLoginSuccess)),
        error: this.actions$.pipe(ofType(UserActions.userLoginError)),
      },
      signUp: {
        success: this.actions$.pipe(ofType(UserActions.userSignUpSuccess)),
        error: this.actions$.pipe(ofType(UserActions.userSignUpError)),
      },
      getProfile: {
        success: this.actions$.pipe(ofType(UserActions.getProfileSuccess)),
        error: this.actions$.pipe(ofType(UserActions.getProfileError)),
      },
    },
    selectors: {
      state$: this.store.select(UserSelectors.getState),
    },
  };

  readonly todo = {
    dispatchers: {
      create: (content: string) => {
        this.store.dispatch(TodoActions.createTodo({ content }));
      },
      delete: (todo: TodoStoreModel) => {
        this.store.dispatch(TodoActions.deleteTodo({ todo }));
      },
      update: (dto: UpdateTodoDto) => {
        this.store.dispatch(TodoActions.updateTodo({ dto }));
      },
      tag: (todo: TodoStoreModel, tagName: string) => {
        this.store.dispatch(TodoActions.tagTodo({ todo, tagName }));
      },
      untag: (taggedTodoId: string) => {
        this.store.dispatch(TodoActions.untagTodo({ taggedTodoId }));
      },
    },
    selectors: {
      todos$: this.store.pipe(select(TodoSelectors.getTodos)).pipe(
        tap(({ loaded }) => {
          if (!loaded) {
            this.store.dispatch(TodoActions.readTodos());
          }
        })
      ),
    },
  };

  readonly tag = {
    selectors: {
      tags$: this.store.pipe(select(TagSelectors.getTags)).pipe(
        tap(({ loaded }) => {
          if (!loaded) {
            this.store.dispatch(TagActions.readTags());
          }
        })
      ),
    },
  };

  constructor(private readonly store: Store, private readonly actions$: Actions) {}
}
