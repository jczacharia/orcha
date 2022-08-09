import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IUserOrchestration } from '@orcha/todo/shared/domain';
import { ITestOrchestration } from '@orcha/testing';
import { AppTestModule } from '../../core/app-test.module';
import { DatabaseService } from '../../core/database.service';
import { createUserOrchestration } from './user.orchestration';

describe('User Orchestration Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let userOrcha: ITestOrchestration<IUserOrchestration>;

  const credentials = { id: 'email@email.com', password: 'GoodPwd341' };
  let auth: { body: { token: string }; statusCode: HttpStatus };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication();
    db = moduleRef.get(DatabaseService);

    userOrcha = createUserOrchestration(app);

    await db.setSchema();
    await app.init();
  });

  beforeEach(async () => await db.clearDb());

  afterAll(async () => await app.close());

  describe('signUp', () => {
    it('should signUp', async () => {
      auth = await userOrcha.signUp({ token: true }, '', credentials);
      expect(typeof auth.body.token).toBe('string');
      expect(auth.statusCode).toBe(HttpStatus.CREATED);
    });
    it('should not signUp if user email already exists', async () => {
      auth = await userOrcha.signUp({ token: true }, '', credentials);
      const { error } = await userOrcha.signUp({ token: true }, '', credentials);
      expect(error).toBe(`User with email "${credentials.id}" already exists.`);
    });
    it('should not signUp if email pattern matches fails', async () => {
      const { error } = await userOrcha.signUp({ token: true }, '', { id: 'ssd', password: 'GoodPwd341' });
      expect(error).toBe(`Validation failed: id must be an email`);
    });
    it('should not signUp if email pattern matches fails', async () => {
      const { error } = await userOrcha.signUp({ token: true }, '', {
        id: 'good@email.com',
        password: 'bad',
      });
      expect(error).toBe(`Validation failed: password must be longer than or equal to 6 characters`);
    });
    it('should not signUp if email and password pattern matches fails', async () => {
      const { error } = await userOrcha.signUp({ token: true }, '', {
        id: 'bad',
        password: 'bad',
      });
      expect(error).toBe(
        `Validation failed: id must be an email, password must be longer than or equal to 6 characters`
      );
    });
  });
  describe('login', () => {
    it('should login', async () => {
      auth = await userOrcha.signUp({ token: true }, '', credentials);
      auth = await userOrcha.login({ token: true }, '', credentials);
      expect(typeof auth.body.token).toBe('string');
      expect(auth.statusCode).toBe(HttpStatus.CREATED);
    });
    it('should not login with unknown user', async () => {
      const { error } = await userOrcha.login({ token: true }, '', {
        id: 'who@dis.com',
        password: 'Idk12341!',
      });
      expect(error).toBe(`User "who@dis.com" does not exist.`);
    });
    it('should not login with wrong password', async () => {
      auth = await userOrcha.signUp({ token: true }, '', credentials);
      const { statusCode, error } = await userOrcha.login({ token: true }, '', {
        ...credentials,
        password: 'WrongPassword!1',
      });
      expect(error).toBe(`Incorrect password.`);
      expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
  describe('getProfile', () => {
    it('should get user data', async () => {
      auth = await userOrcha.signUp({ token: true }, '', credentials);
      const { body } = await userOrcha.getProfile({ id: true }, auth.body.token);
      expect(body.id).toBe(credentials.id);
    });
  });
});
