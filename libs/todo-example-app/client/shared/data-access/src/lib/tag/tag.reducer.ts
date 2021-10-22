import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { TagQueryModel, Todo } from '@orcha-todo-example-app/shared/domain';
import { IParser } from '@orcha/common';
import * as TagActions from './tag.actions';

export const TAG_KEY = 'tag';

export type TagStoreModel = IParser<Todo, typeof TagQueryModel>;

export interface TagState {
  tags: EntityState<TagStoreModel>;
  loaded: boolean;
}

export const tagsAdapter = createEntityAdapter<TagStoreModel>();

const initialState: TagState = {
  tags: tagsAdapter.getInitialState(),
  loaded: false,
};

export const TagReducer = createReducer(
  initialState,
  on(TagActions.readTagsSuccess, (state, { tags }): TagState => {
    return {
      ...state,
      tags: tagsAdapter.setAll(tags, state.tags),
      loaded: true,
    };
  })
);
