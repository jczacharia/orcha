import { createAction, props } from '@ngrx/store';
import { UpdateTagDto } from '@orcha-todo-example-app/shared/domain';
import { OrchaOperationError } from '@orcha/common';
import { TagStoreModel } from './tag.reducer';

/*
    ___             _ 
   | _ \___ __ _ __| |
   |   / -_) _` / _` |
   |_|_\___\__,_\__,_|
                      
 */

export const readTags = createAction('[Tags] Read Tags');

export const readTagsSuccess = createAction('[Tags] Read Tags Success', props<{ tags: TagStoreModel[] }>());

export const readTagsError = createAction('[Tags] Read Tags Error', props<{ error: OrchaOperationError }>());

/*
     ___              _       
    / __|_ _ ___ __ _| |_ ___ 
   | (__| '_/ -_) _` |  _/ -_)
    \___|_| \___\__,_|\__\___|
                              
  */

export const createTag = createAction('[Tags] Create Tags', props<{ name: string }>());

export const createTagSuccess = createAction('[Tags] Create Tags Success', props<{ tag: TagStoreModel }>());

export const createTagError = createAction(
  '[Tags] Create Tags Error',
  props<{ error: OrchaOperationError }>()
);

/*
    ___      _     _       
   |   \ ___| |___| |_ ___ 
   | |) / -_) / -_)  _/ -_)
   |___/\___|_\___|\__\___|
                           
*/
export const deleteTag = createAction('[Tags] Delete Tags', props<{ tag: TagStoreModel }>());

export const deleteTagSuccess = createAction('[Tags] Delete Tags Success', props<{ deletedId: string }>());

export const deleteTagError = createAction(
  '[Tags] Delete Tags Error',
  props<{ error: OrchaOperationError }>()
);

/*
    _   _          _      _       
   | | | |_ __  __| |__ _| |_ ___ 
   | |_| | '_ \/ _` / _` |  _/ -_)
    \___/| .__/\__,_\__,_|\__\___|
         |_|                        
*/
export const updateTag = createAction('[Tags] Update Tag', props<{ dto: UpdateTagDto }>());

export const updateTagSuccess = createAction('[Tags] Update Tag Success', props<{ tag: TagStoreModel }>());

export const updateTagError = createAction(
  '[Tags] Update Tag Error',
  props<{ error: OrchaOperationError }>()
);
