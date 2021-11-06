import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch } from '@nrwl/angular';
import { TagQueryModel } from '@orcha-todo-example-app/shared/domain';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as TodoActions from '../todo/todo.actions';
import * as TagActions from './tag.actions';
import { TagGateway } from './tag.gateway';

@Injectable()
export class TagEffects {
  readonly readTags$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TagActions.readTags),
      fetch({
        run: () =>
          this._tag.read(TagQueryModel).pipe(
            switchMap((tags) => {
              return of(TagActions.readTagsSuccess({ tags }), TodoActions.readTodos());
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TagActions.readTagsError({ error });
        },
      })
    )
  );

  constructor(private readonly _actions$: Actions, private readonly _tag: TagGateway) {}
}
