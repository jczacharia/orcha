import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { pessimisticUpdate } from '@nrwl/angular';
import { DeleteTodoQueryModel, TodoQueryModel } from '@orcha-todo-example-app/shared/domain';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as TagActions from '../tag/tag.actions';
import * as TodoActions from './todo.actions';
import { TodoGateway } from './todo.gateway';
import { TodoOrchestration } from './todo.orchestration';

@Injectable()
export class TodoEffects {
  readonly readTodos$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.readTodos),
      switchMap(() =>
        this._todoGateway.read(TodoQueryModel).pipe(
          map((todos) => {
            return TodoActions.readTodosSuccess({ todos });
          })
        )
      ),
      catchError((error) => {
        alert(error.message);
        return of(TodoActions.readTodosError({ error }));
      })
    )
  );

  readonly createTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.createTodo),
      pessimisticUpdate({
        run: ({ content }) =>
          this._todoOrcha.create(TodoQueryModel, { content }).pipe(
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
          this._todoOrcha.delete(DeleteTodoQueryModel, { todoId: todo.id }).pipe(
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
          this._todoOrcha.update(TodoQueryModel, dto).pipe(
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
          this._todoOrcha.tag(TodoQueryModel, { todoId: todo.id, tagName }).pipe(
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
          this._todoOrcha.untag(TodoQueryModel, { taggedTodoId }).pipe(
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

  constructor(
    private readonly _actions$: Actions,
    private readonly _todoOrcha: TodoOrchestration,
    private readonly _todoGateway: TodoGateway
  ) {}
}
