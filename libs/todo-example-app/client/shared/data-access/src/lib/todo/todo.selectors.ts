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
  const todoTags = todos.map((todo) => todo.todoTags.map((tt) => ({ ...tt, todo: todo }))).flat();
  const tags = todoTags
    .map((todoTag) => ({
      ...todoTag.tag,
      todoTags: todoTags.filter((tt) => tt.tag.id === todoTag.tag.id),
    }))
    .filter((tag, i, arr) => arr.findIndex((t) => t.id === tag.id) === i);

  return {
    tags,
    loaded: state.loaded,
  };
});
