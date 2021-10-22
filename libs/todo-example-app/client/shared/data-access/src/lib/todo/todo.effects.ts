import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch, pessimisticUpdate } from '@nrwl/angular';
import { DeleteTodoQueryModel, TodoQueryModel } from '@orcha-todo-example-app/shared/domain';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as TagActions from '../tag/tag.actions';
import * as TodoActions from './todo.actions';
import { TodoOrchestration } from './todo.orchestration';

@Injectable()
export class TodoEffects {
  readonly readTodos$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.readTodos),
      fetch({
        run: () =>
          this._.read(TodoQueryModel).pipe(
            map((todos) => {
              return TodoActions.readTodosSuccess({ todos });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.readTodosError({ error });
        },
      })
    )
  );

  readonly createTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.createTodo),
      pessimisticUpdate({
        run: ({ content }) =>
          this._.create(TodoQueryModel, { content }).pipe(
            map((todo) => {
              return TodoActions.createTodoSuccess({ todo });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.createTodoError({ error });
        },
      })
    )
  );

  readonly deleteTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.deleteTodo),
      pessimisticUpdate({
        run: ({ todo }) =>
          this._.delete(DeleteTodoQueryModel, { todoId: todo.id }).pipe(
            map(({ deletedId }) => {
              return TodoActions.deleteTodoSuccess({ deletedId });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.deleteTodoError({ error });
        },
      })
    )
  );

  readonly updateTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.updateTodo),
      pessimisticUpdate({
        run: ({ dto }) =>
          this._.update(TodoQueryModel, dto).pipe(
            map((todo) => {
              return TodoActions.updateTodoSuccess({ todo });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.updateTodoError({ error });
        },
      })
    )
  );

  readonly tagTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.tagTodo),
      pessimisticUpdate({
        run: ({ todo, tagName }) =>
          this._.tag(TodoQueryModel, { todoId: todo.id, tagName }).pipe(
            switchMap((todo) => {
              // Here reload tags since it's possible a new one was created.
              return of(TodoActions.tagTodoSuccess({ todo }), TagActions.readTags());
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.tagTodoError({ error });
        },
      })
    )
  );

  readonly untagTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.untagTodo),
      pessimisticUpdate({
        run: ({ taggedTodoId }) =>
          this._.untag(TodoQueryModel, { taggedTodoId }).pipe(
            switchMap((todo) => {
              // Here reload tags since it's possible one was deleted.
              return of(TodoActions.untagTodoSuccess({ todo }), TagActions.readTags());
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.untagTodoError({ error });
        },
      })
    )
  );

  constructor(private readonly _actions$: Actions, private readonly _: TodoOrchestration) {}
}
