import { IQuery } from '@orcha/common';
import { IServerController, ServerController, ServerOperation } from '@orcha/nestjs';
import { UserService } from '@todo-example-app-lib/server';
import {
  EntireProfile,
  IUserController,
  LoginDto,
  SignUpDto,
  User,
  USER_CONTROLLER_NAME,
} from '@todo-example-app-lib/shared';
import { interval, map, take } from 'rxjs';

@ServerController(USER_CONTROLLER_NAME)
export class UserController implements IServerController<IUserController> {
  constructor(private user: UserService) {}

  @ServerOperation()
  login(_: string, dto: LoginDto) {
    return this.user.login(dto);
  }

  @ServerOperation()
  signUp(_: string, dto: SignUpDto) {
    return this.user.signUp(dto);
  }

  @ServerOperation()
  getProfile(token: string) {
    return this.user.getProfile(token);
  }

  @ServerOperation({ type: 'file-upload' })
  updateProfilePic(token: string, file: Express.Multer.File) {
    console.log(file);
    return {} as any;
  }

  @ServerOperation({ type: 'event' })
  event(token: string, dto: { dtoData: string }) {
    console.log(token, dto);
    return interval(2000).pipe(
      map(() => ({ rtn: 'rtn' })),
      take(3)
    );
  }

  @ServerOperation<User>({ type: 'query', validateQuery: EntireProfile })
  queryProfile(token: string, query: IQuery<User>) {
    return this.user.queryProfile(token, query);
  }
}
