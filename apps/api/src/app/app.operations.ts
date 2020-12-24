import { ServerOperation, ServerOperations } from '@kirtan/nestjs';
import { UserRepository } from './user.repository';

@ServerOperations('hello')
export class AppOperations {
  constructor(private readonly userRepo: UserRepository) {}

  @ServerOperation()
  getData(q: any) {
    return this.userRepo.query(q);
  }
}
