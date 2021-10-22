import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch } from '@nrwl/angular';
import { TagQueryModel } from '@orcha-todo-example-app/shared/domain';
import { map } from 'rxjs/operators';
import * as TagActions from './tag.actions';
import { TagOrchestration } from './tag.orchestration';

@Injectable()
export class TagEffects {
  readonly readTags$ = createEffect(() =>
    this._actions$.pipe(
      ofType(TagActions.readTags),
      fetch({
        run: () =>
          this._tag.read(TagQueryModel).pipe(
            map((tags) => {
              return TagActions.readTagsSuccess({ tags });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TagActions.readTagsError({ error });
        },
      })
    )
  );

  constructor(private readonly _actions$: Actions, private readonly _tag: TagOrchestration) {}
}
