/* eslint-disable @typescript-eslint/no-unused-vars */
import { createQuery, IQuery } from '@orcha/common';
import { Tag, TagQueryModel } from '../tag';
import { Todo } from '../todo';
import { TodoTag } from '../todo-tag';
import { TodoQueryModel } from '../todo/todo.queries';

export const TodoTagQueryModel = createQuery<TodoTag>()({
  id: true,
  dateLinked: true,
  todo: TodoQueryModel,
  tag: TagQueryModel,
});

export const DeleteTodoTagQueryModel = createQuery<{ deletedId: string }>()({ deletedId: true });
