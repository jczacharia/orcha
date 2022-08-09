import { createAction, props } from '@ngrx/store';
import { OrchaOperationError } from '@orcha/common';
import { TagStoreSubscriptionResult } from './tag.reducer';

/*
    ___             _ 
   | _ \___ __ _ __| |
   |   / -_) _` / _` |
   |_|_\___\__,_\__,_|
                      
 */

export const readTags = createAction('[Tags] Read Tags');

export const readTagsSuccess = createAction(
  '[Tags] Read Tags Success',
  props<{ tags: TagStoreSubscriptionResult }>()
);

export const readTagsError = createAction('[Tags] Read Tags Error', props<{ error: OrchaOperationError }>());
