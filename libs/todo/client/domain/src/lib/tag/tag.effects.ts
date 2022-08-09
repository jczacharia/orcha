import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TagQueryModel } from '@orcha/todo/shared/domain';
import { catchError, of, switchMap } from 'rxjs';
import * as TodoActions from '../todo/todo.actions';
import * as TagActions from './tag.actions';
import { TagGateway } from './tag.gateway';

@Injectable()
export class TagEffects {
  readonly readTags$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TagActions.readTags),
      switchMap(() =>
        this._tag.listen(TagQueryModel).pipe(
          switchMap((tags) => {
            return of(TagActions.readTagsSuccess({ tags }), TodoActions.readTodos());
          })
        )
      ),
      catchError((error) => {
        alert(error.message);
        return of(TagActions.readTagsError({ error }));
      })
    )
  );

  constructor(private readonly _actions$: Actions, private readonly _tag: TagGateway) {}
}
