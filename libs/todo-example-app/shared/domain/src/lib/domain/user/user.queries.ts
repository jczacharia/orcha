import { User } from '@orcha-todo-example-app/shared/domain';
import { createQueryModel } from '@orcha/common';

export const UserQueryModel = createQueryModel<User>()({
  id: true,
  dateCreated: true,
  dateLastLoggedIn: true,
});

export const LoginQueryModel = createQueryModel<{ token: string }>()({ token: true });
export const SignUpQueryModel = LoginQueryModel;
