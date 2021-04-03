import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Tag, TagQueryModel } from '@orcha-todo-example-app/shared/domain';
import { IParser } from '@orcha/common';
import * as TagActions from './tag.actions';

export const TAG_KEY = 'tag';

export type TagStoreModel = IParser<Tag, typeof TagQueryModel>;

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
  on(
    TagActions.readTagsSuccess,
    (state, { tags }): TagState => {
      return {
        ...state,
        tags: tagsAdapter.upsertMany(tags, state.tags),
        loaded: true,
      };
    }
  ),
  on(
    TagActions.createTagSuccess,
    (state, { tag }): TagState => {
      return {
        ...state,
        tags: tagsAdapter.upsertOne(tag, state.tags),
      };
    }
  ),
  on(
    TagActions.deleteTagSuccess,
    (state, { deletedId }): TagState => {
      return {
        ...state,
        tags: tagsAdapter.removeOne(deletedId, state.tags),
      };
    }
  ),
  on(
    TagActions.updateTagSuccess,
    (state, { tag }): TagState => {
      return {
        ...state,
        tags: tagsAdapter.upsertOne(tag, state.tags),
      };
    }
  )
);
