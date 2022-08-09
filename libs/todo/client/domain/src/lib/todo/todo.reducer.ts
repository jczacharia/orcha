import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Todo, TodoQueryModel } from '@orcha/todo/shared/domain';
import { IParser, ISubscriptionResult } from '@orcha/common';
import * as TodoActions from './todo.actions';

export const TODO_KEY = 'todo';

export type TodoStoreModel = IParser<Todo, typeof TodoQueryModel>;
export type TodoStoreSubscriptionResult = ISubscriptionResult<Todo, typeof TodoQueryModel>;

export interface TodoState {
  todos: EntityState<TodoStoreModel>;
  loaded: boolean;
}

export const todosAdapter = createEntityAdapter<TodoStoreModel>();

const initialState: TodoState = {
  todos: todosAdapter.getInitialState(),
  loaded: false,
};

export const TodoReducer = createReducer(
  initialState,
  on(TodoActions.readTodosSuccess, (state, { todos }): TodoState => {
    const updated = todosAdapter.upsertMany([...todos.created, ...todos.updated], state.todos);
    const deleted = todosAdapter.removeMany(todos.deleted, updated);
    return {
      ...state,
      todos: deleted,
      loaded: true,
    };
  }),
  on(TodoActions.createTodoSuccess, (state, { todo }): TodoState => {
    return {
      ...state,
      todos: todosAdapter.upsertOne(todo, state.todos),
    };
  }),
  on(TodoActions.deleteTodoSuccess, (state, { deletedId }): TodoState => {
    return {
      ...state,
      todos: todosAdapter.removeOne(deletedId, state.todos),
    };
  }),
  on(TodoActions.updateTodoSuccess, (state, { todo }): TodoState => {
    return {
      ...state,
      todos: todosAdapter.upsertOne(todo, state.todos),
    };
  }),
  on(TodoActions.tagTodoSuccess, (state, { todo }): TodoState => {
    return {
      ...state,
      todos: todosAdapter.upsertOne(todo, state.todos),
    };
  }),
  on(TodoActions.untagTodoSuccess, (state, { todo }): TodoState => {
    return {
      ...state,
      todos: todosAdapter.upsertOne(todo, state.todos),
    };
  })
);
