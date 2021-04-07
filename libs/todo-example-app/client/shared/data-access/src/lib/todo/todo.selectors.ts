import { createFeatureSelector, createSelector } from '@ngrx/store';
import { todosAdapter, TodoState, TODO_KEY } from './todo.reducer';

const { selectAll, selectEntities } = todosAdapter.getSelectors();

const getTodoState = createFeatureSelector<TodoState>(TODO_KEY);

export const getTodos = createSelector(getTodoState, (state: TodoState) => ({
  todoEntities: selectEntities(state.todos),
  todos: selectAll(state.todos),
  loaded: state.loaded,
}));

export const getTags = createSelector(getTodoState, (state: TodoState) => {
  /* Invert Many-to-Many relationship between Todos and Tags. */

  /*
    Note this could be done using https://github.com/paularmstrong/normalizr
  */

  const todos = selectAll(state.todos);
  const taggedTodos = todos.map((todo) => todo.taggedTodos.map((tt) => ({ ...tt, todo: todo }))).flat();
  const tags = taggedTodos
    .map((taggedTodo) => ({
      ...taggedTodo.tag,
      taggedTodos: taggedTodos.filter((tt) => tt.tag.id === taggedTodo.tag.id),
    }))
    .filter((tag, i, arr) => arr.findIndex((t) => t.id === tag.id) === i);

  return {
    tags,
    loaded: state.loaded,
  };
});
