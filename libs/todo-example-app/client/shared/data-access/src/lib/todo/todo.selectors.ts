import { createFeatureSelector, createSelector } from '@ngrx/store';
import { todosAdapter, TodoState, TODO_KEY } from './todo.reducer';

const { selectAll, selectEntities } = todosAdapter.getSelectors();

const getTodoState = createFeatureSelector<TodoState>(TODO_KEY);

export const getTodos = createSelector(getTodoState, (state: TodoState) => ({
  todoEntities: selectEntities(state.todos),
  todos: selectAll(state.todos),
  loaded: state.loaded,
}));
