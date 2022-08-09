import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DeleteTodoQueryModel, TodoQueryModel } from '@orcha/todo/shared/domain';
import { catchError, map, of, switchMap } from 'rxjs';
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
        this._todoGateway.listen(TodoQueryModel).pipe(
          map((todos) => {
            console.log(todos);
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
        this._todoOrcha.create(TodoQueryModel, { content }).pipe(
          map((todo) => {
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
        this._todoOrcha.delete(DeleteTodoQueryModel, { todoId: todo.id }).pipe(
          map(({ deletedId }) => {
            return TodoActions.deleteTodoSuccess({ deletedId });
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
        this._todoOrcha.update(TodoQueryModel, dto).pipe(
          map((todo) => {
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
        this._todoOrcha.tag(TodoQueryModel, { todoId: todo.id, tagName }).pipe(
          switchMap((todo) => {
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
        this._todoOrcha.untag(TodoQueryModel, { taggedTodoId }).pipe(
          switchMap((todo) => {
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
      switchMap(() =>
        this._todoOrcha.paginate({ ...TodoQueryModel, __paginate: { offset: 0, limit: 2 } }).pipe(
          switchMap((todo) => {
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

  constructor(
    private readonly _actions$: Actions,
    private readonly _todoOrcha: TodoOrchestration,
    private readonly _todoGateway: TodoGateway
  ) {}
}
