import { createQuery } from '@orcha/common';
import { User } from './user.model';

export const UserQueryModel = createQuery<User>()({
  id: true,
  dateCreated: true,
  dateLastLoggedIn: true,
  view: true,
});

export const LoginQueryModel = createQuery<{ token: string }>()({ token: true });
export const SignUpQueryModel = LoginQueryModel;

export const EntireProfile = createQuery<User>()({
  id: true,
  dateCreated: true,
  dateLastLoggedIn: true,
  view: true,
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
