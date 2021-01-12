import { ServerOperation, ServerOrchestration } from '@orchestra/nestjs';
import { UserRepository } from './user.repository';

@ServerOrchestration('hello')
export class AppOrchestration {
  constructor(private readonly userRepo: UserRepository) {}

  @ServerOperation()
  getData(q: any) {
    return this.userRepo.query(q);
  }
}
