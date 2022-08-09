import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Tag, TagQueryModel } from '@orcha/todo/shared/domain';
import { IParser, ISubscriptionResult } from '@orcha/common';
import * as TagActions from './tag.actions';

export const TAG_KEY = 'tag';

export type TagStoreModel = IParser<Tag, typeof TagQueryModel>;
export type TagStoreSubscriptionResult = ISubscriptionResult<Tag, typeof TagQueryModel>;

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
    const updated = tagsAdapter.upsertMany([...tags.created, ...tags.updated], state.tags);
    const deleted = tagsAdapter.removeMany(tags.deleted, updated);
    return {
      ...state,
      tags: deleted,
      loaded: true,
    };
  })
);
