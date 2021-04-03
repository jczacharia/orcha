import { createAction, props } from '@ngrx/store';
import { TodoTag, TodoTagQueryModel } from '@orcha-todo-example-app/shared/domain';
import { IParser, OrchaOperationError } from '@orcha/common';
import { TodoStoreModel } from '../todo/todo.reducer';

type TodoTagStoreModel = IParser<TodoTag, typeof TodoTagQueryModel>;

/*
    ___             _ 
   | _ \___ __ _ __| |
   |   / -_) _` / _` |
   |_|_\___\__,_\__,_|
                      
 */

export const readTodoTags = createAction('[TodoTags] Read TodoTags');

export const readTodoTagsSuccess = createAction(
  '[TodoTags] Read TodoTags Success',
  props<{ todoTags: TodoTagStoreModel }>()
);

export const readTodoTagsError = createAction(
  '[TodoTags] Read TodoTags Error',
  props<{ error: OrchaOperationError }>()
);

/*
     ___              _       
    / __|_ _ ___ __ _| |_ ___ 
   | (__| '_/ -_) _` |  _/ -_)
    \___|_| \___\__,_|\__\___|
                              
  */

export const createTodoTag = createAction(
  '[TodoTags] Create TodoTags',
  props<{ todo: TodoStoreModel; tagName: string }>()
);

export const createTodoTagSuccess = createAction(
  '[TodoTags] Create TodoTags Success',
  props<{ todoTag: TodoTagStoreModel }>()
);

export const createTodoTagError = createAction(
  '[TodoTags] Create TodoTags Error',
  props<{ error: OrchaOperationError }>()
);

/*
    ___      _     _       
   |   \ ___| |___| |_ ___ 
   | |) / -_) / -_)  _/ -_)
   |___/\___|_\___|\__\___|
                           
*/
export const deleteTodoTag = createAction(
  '[TodoTags] Delete TodoTags',
  props<{ todoTag: TodoTagStoreModel }>()
);

export const deleteTodoTagSuccess = createAction(
  '[TodoTags] Delete TodoTags Success',
  props<{ deletedId: string }>()
);

export const deleteTodoTagError = createAction(
  '[TodoTags] Delete TodoTags Error',
  props<{ error: OrchaOperationError }>()
);
