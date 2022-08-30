import { createAction, props } from '@ngrx/store';
import { ServerOperationError } from '@orcha/common';
import { TagStoreModel } from './tag.reducer';

/*
    ___             _ 
   | _ \___ __ _ __| |
   |   / -_) _` / _` |
   |_|_\___\__,_\__,_|
                      
 */

export const readTags = createAction('[Tags] Read Tags');

export const readTagsSuccess = createAction('[Tags] Read Tags Success', props<{ tags: TagStoreModel[] }>());

export const readTagsError = createAction('[Tags] Read Tags Error', props<{ error: ServerOperationError }>());
