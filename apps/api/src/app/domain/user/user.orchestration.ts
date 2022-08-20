import { IServerOrchestration, Operation, OrchestrationController } from '@orcha/nestjs';
import { UserService } from '@todo-example-app-lib/server';
import {
  IUserOrchestration,
  LoginDto,
  SignUpDto,
  USER_ORCHESTRATION_NAME,
} from '@todo-example-app-lib/shared';

@OrchestrationController(USER_ORCHESTRATION_NAME)
export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
  constructor(private user: UserService) {}

  @Operation()
  login(_: string, dto: LoginDto) {
    return this.user.login(dto);
  }

  @Operation()
  signUp(_: string, dto: SignUpDto) {
    return this.user.signUp(dto);
  }

  @Operation()
  getProfile(token: string) {
    return this.user.getProfile(token);
  }

  @Operation()
  updateProfilePic(token: string, _: null, file: Express.Multer.File[]) {
    console.log(file);
    return {} as any;
  }
}
