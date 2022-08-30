import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import * as TagActions from '../tag/tag.actions';
import * as TodoActions from './todo.actions';
import { TodoController } from './todo.controller';

// TODO fetch and pessimisticUpdate

@Injectable()
export class TodoEffects {
  readonly readTodos$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.readTodos),
      switchMap(() =>
        this._todoOrcha.getMine().pipe(
          map(({ data: todos }) => {
            return TodoActions.readTodosSuccess({ todos });
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.readTodosError({ error }));
      })
    )
  );

  readonly createTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.createTodo),
      switchMap(({ content }) =>
        this._todoOrcha.create({ content }).pipe(
          map(({ data: todo }) => {
            return TodoActions.createTodoSuccess({ todo });
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.createTodoError({ error }));
      })
    )
  );

  readonly deleteTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.deleteTodo),
      switchMap(({ todo }) =>
        this._todoOrcha.delete({ todoId: todo.id }).pipe(
          map(({ data: deletedId }) => {
            return TodoActions.deleteTodoSuccess(deletedId);
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.deleteTodoError({ error }));
      })
    )
  );

  readonly updateTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.updateTodo),
      switchMap(({ dto }) =>
        this._todoOrcha.update(dto).pipe(
          map(({ data: todo }) => {
            return TodoActions.updateTodoSuccess({ todo });
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.updateTodoError({ error }));
      })
    )
  );

  readonly tagTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.tagTodo),
      switchMap(({ todo, tagName }) =>
        this._todoOrcha.tag({ todoId: todo.id, tagName }).pipe(
          switchMap(({ data: todo }) => {
            // Here reload tags since it's possible a new one was created.
            return of(TodoActions.tagTodoSuccess({ todo }), TagActions.readTags());
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.tagTodoError({ error }));
      })
    )
  );

  readonly untagTodo$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.untagTodo),
      switchMap(({ taggedTodoId }) =>
        this._todoOrcha.untag({ taggedTodoId }).pipe(
          switchMap(({ data: todo }) => {
            // Here reload tags since it's possible one was deleted.
            return of(TodoActions.untagTodoSuccess({ todo }), TagActions.readTags());
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.untagTodoError({ error }));
      })
    )
  );

  readonly paginateTodos$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TodoActions.paginateTodos),
      switchMap(({ paginate }) =>
        this._todoOrcha.paginateAll(paginate).pipe(
          switchMap(({ data: todo }) => {
            return of(TodoActions.paginateTodosSuccess({ todos: todo.items }), TagActions.readTags());
          })
        )
      ),
      catchError((error) => {
        console.error(error.message);
        return of(TodoActions.paginateTodosError({ error }));
      })
    )
  );

  constructor(private readonly _actions$: Actions, private readonly _todoOrcha: TodoController) {}
}
