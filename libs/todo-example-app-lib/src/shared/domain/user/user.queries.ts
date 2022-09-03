import { createQuery, ORCHA_VIEW } from '@orcha/common';
import { User } from './user.model';

export const EntireProfile = createQuery<User>()({
  email: true,
  dateCreated: true,
  dateLastLoggedIn: true,
  firstName: true,
  middleName: true,
  lastName: true,
  phone: true,
  [ORCHA_VIEW]: true,
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
    [ORCHA_VIEW]: true,
    taggedTodos: {
      dateLinked: true,
      tag: {},
    },
  },
});
