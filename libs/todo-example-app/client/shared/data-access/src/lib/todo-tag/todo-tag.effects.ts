import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { pessimisticUpdate } from '@nrwl/angular';
import { DeleteTodoTagQueryModel, TodoTagQueryModel } from '@orcha-todo-example-app/shared/domain';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as TagActions from '../tag/tag.actions';
import * as TodoActions from '../todo/todo.actions';
import * as TodoTagActions from './todo-tag.actions';
import { TodoTagOrchestration } from './todo-tag.orchestration';

@Injectable()
export class TodoTagEffects {
  readonly createTodoTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoTagActions.createTodoTag),
      pessimisticUpdate({
        run: ({ todo, tagName }) =>
          this.todo.create(TodoTagQueryModel, { tagName, todoId: todo.id }).pipe(
            switchMap((todoTag) => {
              return of(
                TodoTagActions.createTodoTagSuccess({ todoTag }),
                TodoActions.updateTodoSuccess({ todo: todoTag.todo }),
                TagActions.updateTagSuccess({ tag: todoTag.tag })
              );
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoTagActions.createTodoTagError({ error });
        },
      })
    )
  );

  readonly deleteTodoTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoTagActions.deleteTodoTag),
      pessimisticUpdate({
        run: ({ todoTag }) =>
          this.todo.delete(DeleteTodoTagQueryModel, { todoTagId: todoTag.id }).pipe(
            map(({ deletedId }) => {
              return TodoTagActions.deleteTodoTagSuccess({ deletedId });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TodoTagActions.deleteTodoTagError({ error });
        },
      })
    )
  );

  constructor(private readonly actions$: Actions, private readonly todo: TodoTagOrchestration) {}
}
