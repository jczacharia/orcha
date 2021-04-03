import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { UpdateTagDto, UpdateTodoDto } from '@orcha-todo-example-app/shared/domain';
import { map, switchMap, tap } from 'rxjs/operators';
import * as TagActions from './tag/tag.actions';
import { TagStoreModel } from './tag/tag.reducer';
import * as TagSelectors from './tag/tag.selectors';
import * as TodoTagActions from './todo-tag/todo-tag.actions';
import * as TodoActions from './todo/todo.actions';
import { TodoStoreModel } from './todo/todo.reducer';
import * as TodoSelectors from './todo/todo.selectors';
import * as UserActions from './user/user.actions';
import * as UserSelectors from './user/user.selectors';
import { combineLatest } from 'rxjs';

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

  readonly todoTags = {
    dispatchers: {
      create: (todo: TodoStoreModel, tagName: string) => {
        this.store.dispatch(TodoTagActions.createTodoTag({ todo, tagName }));
      },
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
    },
    selectors: {
      todos$: this.todos$.pipe(
        switchMap(({ todos, loaded: todosLoaded }) =>
          this.tags$.pipe(
            map(({ tagEntities, loaded: tagsLoaded }) => {
              return {
                todos: todos.map((todo) => ({
                  ...todo,
                  tags: todo.todoTags.map((tt) => tagEntities[tt.tag.id]),
                })),
                loaded: tagsLoaded && todosLoaded,
              };
            })
          )
        )
      ),
    },
  };

  readonly tag = {
    dispatchers: {
      create: (name: string) => {
        this.store.dispatch(TagActions.createTag({ name }));
      },
      delete: (tag: TagStoreModel) => {
        this.store.dispatch(TagActions.deleteTag({ tag }));
      },
      update: (dto: UpdateTagDto) => {
        this.store.dispatch(TagActions.updateTag({ dto }));
      },
    },
    selectors: {
      tags$: this.tags$.pipe(
        switchMap(({ tags, loaded: tagsLoaded }) =>
          this.todos$.pipe(
            map(({ todoEntities, loaded: todosLoaded }) => {
              return {
                tags: tags.map((tag) => ({
                  ...tag,
                  todos: tag.todoTags.map((tt) => todoEntities[tt.todo.id]),
                })),
                loaded: tagsLoaded && todosLoaded,
              };
            })
          )
        )
      ),
    },
  };

  constructor(private readonly store: Store, private readonly actions$: Actions) {}

  private get tags$() {
    return this.store.pipe(select(TagSelectors.getTags)).pipe(
      tap(({ loaded }) => {
        if (!loaded) {
          this.store.dispatch(TagActions.readTags());
        }
      })
    );
  }

  private get todos$() {
    return this.store.pipe(select(TodoSelectors.getTodos)).pipe(
      tap(({ loaded }) => {
        if (!loaded) {
          this.store.dispatch(TodoActions.readTodos());
        }
      })
    );
  }
}
