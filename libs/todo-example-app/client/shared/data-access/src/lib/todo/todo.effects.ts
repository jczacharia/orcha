import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch, pessimisticUpdate } from '@nrwl/angular';
import { DeleteTodoQueryModel, TodoQueryModel } from '@orcha-todo-example-app/shared/domain';
import { map, switchMap, take } from 'rxjs/operators';
import { AppFacade } from '../app.facade';
import * as TodoActions from './todo.actions';
import { TodoOrchestration } from './todo.orchestration';

@Injectable()
export class TodoEffects {
  readonly readTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.readTodos),
      fetch({
        run: () =>
          this.app.user.selectors.state$.pipe(
            take(1),
            switchMap(({ id }) =>
              this.todo.read(TodoQueryModel, { userId: id }).pipe(
                map((todos) => {
                  return TodoActions.readTodosSuccess({ todos });
                })
              )
            )
          ),
        onError: (action, { error }) => {
          return TodoActions.readTodosError({ error });
        },
      })
    )
  );

  readonly createTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.createTodo),
      pessimisticUpdate({
        run: ({ content }) =>
          this.app.user.selectors.state$.pipe(
            take(1),
            switchMap(({ id }) =>
              this.todo.create(TodoQueryModel, { userId: id, content }).pipe(
                map((todo) => {
                  return TodoActions.createTodoSuccess({ todo });
                })
              )
            )
          ),
        onError: (action, { error }) => {
          return TodoActions.createTodoError({ error });
        },
      })
    )
  );

  readonly deleteTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodo),
      pessimisticUpdate({
        run: ({ todo }) =>
          this.todo.delete(DeleteTodoQueryModel, { todoId: todo.id }).pipe(
            map(({ deletedId }) => {
              return TodoActions.deleteTodoSuccess({ deletedId });
            })
          ),
        onError: (action, { error }) => {
          return TodoActions.deleteTodoError({ error });
        },
      })
    )
  );

  readonly updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.updateTodo),
      pessimisticUpdate({
        run: ({ dto }) =>
          this.todo.update(TodoQueryModel, dto).pipe(
            map((todo) => {
              return TodoActions.updateTodoSuccess({ todo });
            })
          ),
        onError: (action, { error }) => {
          return TodoActions.updateTodoError({ error });
        },
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly app: AppFacade,
    private readonly todo: TodoOrchestration
  ) {}
}
