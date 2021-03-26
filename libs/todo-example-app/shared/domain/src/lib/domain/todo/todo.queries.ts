import { createQueryModel } from '@orcha/common';
import { Todo } from './todo.model';

export const TodoQueryModel = createQueryModel<Todo>()({
  id: true,
  content: true,
  dateCreated: true,
  dateUpdated: true,
  done: true,
  user: {
    id: true,
  },
});

export const DeleteTodoQueryModel = createQueryModel<{ deletedId: string }>()({ deletedId: true });
