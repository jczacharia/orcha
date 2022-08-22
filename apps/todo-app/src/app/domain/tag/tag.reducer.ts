import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { IExtractOperationReturnSchema } from '@orcha/angular';
import { ITagOrchestration } from '@todo-example-app-lib/shared';
import { UnArray } from '../../util/unarray';
import * as TagActions from './tag.actions';

export const TAG_KEY = 'tag';

export type TagStoreModel = UnArray<IExtractOperationReturnSchema<ITagOrchestration['getMine']>>;

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
