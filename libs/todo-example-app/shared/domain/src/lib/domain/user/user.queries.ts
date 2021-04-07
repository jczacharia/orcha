import { User } from '@orcha-todo-example-app/shared/domain';
import { createQuery } from '@orcha/common';

export const UserQueryModel = createQuery<User>()({
  id: true,
  dateCreated: true,
  dateLastLoggedIn: true,
});

export const LoginQueryModel = createQuery<{ token: string }>()({ token: true });
export const SignUpQueryModel = LoginQueryModel;

export const EntireProfile = createQuery<User>()({
  id: true,
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
