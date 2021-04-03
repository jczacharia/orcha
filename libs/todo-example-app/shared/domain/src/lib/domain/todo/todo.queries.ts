import { createQuery } from '@orcha/common';
import { Todo } from './todo.model';

export const TodoQueryModel = createQuery<Todo>()({
  id: true,
  content: true,
  dateCreated: true,
  dateUpdated: true,
  done: true,
  user: {
    id: true,
  },
  todoTags: {
    id: true,
    dateLinked: true,
    tag: {
      id: true,
    },
  },
});

export const DeleteTodoQueryModel = createQuery<{ deletedId: string }>()({ deletedId: true });
