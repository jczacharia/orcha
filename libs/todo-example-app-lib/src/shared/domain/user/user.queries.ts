import { createQuery } from '@orcha/common';
import { User } from './user.model';

export const EntireProfile = createQuery<User>()({
  email: true,
  dateCreated: true,
  dateLastLoggedIn: true,
  firstName: true,
  middleName: true,
  lastName: true,
  phone: true,
  viewNumOfTodos: true,
  tags: {
    name: true,
    dateCreated: true,
    dateUpdated: true,
    taggedTodos: {
      dateLinked: true,
      todo: {},
    },
  },
  todos: {
    content: true,
    done: true,
    dateCreated: true,
    dateUpdated: true,
    viewNumOfTaggedTodos: true,
    taggedTodos: {
      dateLinked: true,
      tag: {},
    },
  },
});
