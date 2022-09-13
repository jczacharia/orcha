import { IServerController, ServerController, ServerOperation } from '@orcha/nestjs';
import { UserService } from '@todo-example-app-lib/server';
import {
  GetProfileDto,
  IUserController,
  LoginDto,
  SignUpDto,
  USER_CONTROLLER_NAME,
} from '@todo-example-app-lib/shared';

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
  getProfile(token: string, dto: GetProfileDto) {
    return this.user.getProfile(token, dto.query);
  }

  @ServerOperation()
  updateProfilePic(token: string, _: null, file: Express.Multer.File[]) {
    console.log(file);
    return {} as any;
  }
}
