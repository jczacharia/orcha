import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch, pessimisticUpdate } from '@nrwl/angular';
import { DeleteTodoQueryModel, TodoQueryModel } from '@orcha-todo-example-app/shared/domain';
import { map } from 'rxjs/operators';
import * as TodoActions from './todo.actions';
import { TodoOrchestration } from './todo.orchestration';

@Injectable()
export class TodoEffects {
  readonly readTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.readTodos),
      fetch({
        run: () =>
          this.todo.read(TodoQueryModel).pipe(
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
    this.actions$.pipe(
      ofType(TodoActions.createTodo),
      pessimisticUpdate({
        run: ({ content }) =>
          this.todo.create(TodoQueryModel, { content }).pipe(
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
          alert(error.message);
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
          alert(error.message);
          return TodoActions.updateTodoError({ error });
        },
      })
    )
  );

  readonly tagTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.tagTodo),
      pessimisticUpdate({
        run: ({ todo, tagName }) =>
          this.todo.tag(TodoQueryModel, { todoId: todo.id, tagName }).pipe(
            map((todo) => {
              return TodoActions.tagTodoSuccess({ todo });
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
    this.actions$.pipe(
      ofType(TodoActions.untagTodo),
      pessimisticUpdate({
        run: ({ todoTagId }) =>
          this.todo.untag(TodoQueryModel, { todoTagId }).pipe(
            map((todo) => {
              return TodoActions.untagTodoSuccess({ todo });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoActions.untagTodoError({ error });
        },
      })
    )
  );

  constructor(private readonly actions$: Actions, private readonly todo: TodoOrchestration) {}
}
