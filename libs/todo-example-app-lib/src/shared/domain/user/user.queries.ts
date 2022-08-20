import { createQuery } from '@orcha/common';
import { User } from './user.model';

export const EntireProfile = createQuery<User>()({
  id: true,
  email: true,
  dateCreated: true,
  dateLastLoggedIn: true,
  tags: {
    id: true,
    name: true,
    dateCreated: true,
    dateUpdated: true,
    taggedTodos: {
      id: true,
      dateLinked: true,
      todo: {
        id: true,
      },
    },
  },
  todos: {
    id: true,
    content: true,
    done: true,
    dateCreated: true,
    dateUpdated: true,
    taggedTodos: {
      id: true,
      dateLinked: true,
      tag: {
        id: true,
      },
    },
  },
});
