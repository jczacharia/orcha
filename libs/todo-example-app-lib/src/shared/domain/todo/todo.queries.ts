import { createQuery } from '@orcha/common';
import { Todo } from './todo.model';

export const TodoQueryModel = createQuery<Todo>()({
  content: true,
  dateCreated: true,
  dateUpdated: true,
  done: true,
  user: {
    email: true,
  },
  taggedTodos: {
    dateLinked: true,
    tag: {
      name: true,
      dateCreated: true,
      dateUpdated: true,
    },
  },
});

export const DeleteTodoQueryModel = createQuery<{ deletedId: string }>()({ deletedId: true });
