import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, of, switchMap } from 'rxjs';
import * as TodoActions from '../todo/todo.actions';
import * as TagActions from './tag.actions';
import { TagOrchestration } from './tag.orchestration';

@Injectable()
export class TagEffects {
  readonly readTags$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TagActions.readTags),
      switchMap(() =>
        this.tag.getMine().pipe(
          switchMap(({ data: tags }) => {
            return of(TagActions.readTagsSuccess({ tags }), TodoActions.readTodos());
          })
        )
      ),
      catchError((error) => {
        return of(TagActions.readTagsError({ error }));
      })
    )
  );

  constructor(private readonly _actions$: Actions, private readonly tag: TagOrchestration) {}
}
