import { IOperation } from '@kirtan/common';
import {
  createNestjsFastifyTestOperations,
  ITestOperation,
  ITestOperations,
  TestOperation,
  TestOperations,
} from '@kirtan/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppTestModule } from '../core/app-test.module';
import { DatabaseService } from '../core/database.service';

class IUserOperations {
  getData!: IOperation<{ data: string }[]>;
}

@TestOperations('hello')
class UserOperations implements ITestOperations<IUserOperations> {
  @TestOperation()
  getData!: ITestOperation<{ data: string }[]>;
}

describe('User Operations Integration Tests', () => {
  let app: NestFastifyApplication;
  let db: DatabaseService;

  let operations: UserOperations;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    db = moduleRef.get(DatabaseService);

    operations = createNestjsFastifyTestOperations(app, UserOperations);
    console.log(operations);

    await app.init();
  });

  beforeEach(async () => await db.clearDb());

  afterAll(async () => await app.close());

  it('should signUp', async () => {
    await operations.getData({ data: true, __paginate: { limit: 10, page: 1 } }, undefined);
  });
});
