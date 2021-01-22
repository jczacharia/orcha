import { IOperation } from '@orcha/common';
import {
  createNestjsFastifyTestOrchestration,
  ITestOperation,
  ITestOrchestration,
  TestOperation,
  TestOrchestration,
} from '@orcha/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppTestModule } from '../core/app-test.module';
import { DatabaseService } from '../core/database.service';

class IUserOrchestration {
  getData!: IOperation<{ data: string }[]>;
}

@TestOrchestration('hello')
class UserOrchestration implements ITestOrchestration<IUserOrchestration> {
  @TestOperation()
  getData!: ITestOperation<{ data: string }[]>;
}

describe('User Orchestration Integration Tests', () => {
  let app: NestFastifyApplication;
  let db: DatabaseService;

  let orchestration: UserOrchestration;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    db = moduleRef.get(DatabaseService);

    orchestration = createNestjsFastifyTestOrchestration(app, UserOrchestration);
    console.log(orchestration);

    await app.init();
  });

  beforeEach(async () => await db.clearDb());

  afterAll(async () => await app.close());

  it('should signUp', async () => {
    await orchestration.getData({ data: true, __paginate: { limit: 10, page: 1 } }, undefined);
  });
});
