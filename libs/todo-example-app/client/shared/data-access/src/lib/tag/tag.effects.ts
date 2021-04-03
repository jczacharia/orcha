import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch, pessimisticUpdate } from '@nrwl/angular';
import { DeleteTagQueryModel, TagQueryModel } from '@orcha-todo-example-app/shared/domain';
import { map } from 'rxjs/operators';
import * as TagActions from './tag.actions';
import { TagOrchestration } from './tag.orchestration';

@Injectable()
export class TagEffects {
  readonly readTags$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.readTags),
      fetch({
        run: () =>
          this.tag.read(TagQueryModel).pipe(
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

  readonly createTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.createTag),
      pessimisticUpdate({
        run: ({ name }) =>
          this.tag.create(TagQueryModel, { name }).pipe(
            map((tag) => {
              return TagActions.createTagSuccess({ tag });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TagActions.createTagError({ error });
        },
      })
    )
  );

  readonly deleteTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.deleteTag),
      pessimisticUpdate({
        run: ({ tag }) =>
          this.tag.delete(DeleteTagQueryModel, { tagId: tag.id }).pipe(
            map(({ deletedId }) => {
              return TagActions.deleteTagSuccess({ deletedId });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TagActions.deleteTagError({ error });
        },
      })
    )
  );

  readonly updateTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.updateTag),
      pessimisticUpdate({
        run: ({ dto }) =>
          this.tag.update(TagQueryModel, dto).pipe(
            map((tag) => {
              return TagActions.updateTagSuccess({ tag });
            })
          ),
        onError: (action, { error }) => {
          alert(error.message);
          return TagActions.updateTagError({ error });
        },
      })
    )
  );

  constructor(private readonly actions$: Actions, private readonly tag: TagOrchestration) {}
}
