import { createFeatureSelector, createSelector } from '@ngrx/store';
import { tagsAdapter, TagState, TAG_KEY } from './tag.reducer';

const { selectAll, selectEntities } = tagsAdapter.getSelectors();

const getTagState = createFeatureSelector<TagState>(TAG_KEY);

export const getTags = createSelector(getTagState, (state: TagState) => ({
  tagEntities: selectEntities(state.tags),
  tags: selectAll(state.tags),
  loaded: state.loaded,
}));
