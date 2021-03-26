import { createAction, props } from '@ngrx/store';
import { UpdateTodoDto } from '@orcha-todo-example-app/shared/domain';
import { OrchaOperationError } from '@orcha/common';
import { TodoStoreModel } from './todo.reducer';

/*
    ___             _ 
   | _ \___ __ _ __| |
   |   / -_) _` / _` |
   |_|_\___\__,_\__,_|
                      
 */

export const readTodos = createAction('[Todos] Read Todos');

export const readTodosSuccess = createAction(
  '[Todos] Read Todos Success',
  props<{ todos: TodoStoreModel[] }>()
);

export const readTodosError = createAction(
  '[Todos] Read Todos Error',
  props<{ error: OrchaOperationError }>()
);

/*
     ___              _       
    / __|_ _ ___ __ _| |_ ___ 
   | (__| '_/ -_) _` |  _/ -_)
    \___|_| \___\__,_|\__\___|
                              
  */

export const createTodo = createAction('[Todos] Create Todos', props<{ content: string }>());

export const createTodoSuccess = createAction(
  '[Todos] Create Todos Success',
  props<{ todo: TodoStoreModel }>()
);

export const createTodoError = createAction(
  '[Todos] Create Todos Error',
  props<{ error: OrchaOperationError }>()
);

/*
    ___      _     _       
   |   \ ___| |___| |_ ___ 
   | |) / -_) / -_)  _/ -_)
   |___/\___|_\___|\__\___|
                           
*/
export const deleteTodo = createAction('[Todos] Delete Todos', props<{ todo: TodoStoreModel }>());

export const deleteTodoSuccess = createAction('[Todos] Delete Todos Success', props<{ deletedId: string }>());

export const deleteTodoError = createAction(
  '[Todos] Delete Todos Error',
  props<{ error: OrchaOperationError }>()
);

/*
    _   _          _      _       
   | | | |_ __  __| |__ _| |_ ___ 
   | |_| | '_ \/ _` / _` |  _/ -_)
    \___/| .__/\__,_\__,_|\__\___|
         |_|                        
*/
export const updateTodo = createAction('[Todos] Update Todo', props<{ dto: UpdateTodoDto }>());

export const updateTodoSuccess = createAction(
  '[Todos] Update Todo Success',
  props<{ todo: TodoStoreModel }>()
);

export const updateTodoError = createAction(
  '[Todos] Update Todo Error',
  props<{ error: OrchaOperationError }>()
);
