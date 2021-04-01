import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TodoRepository } from '@orcha-todo-example-app/server/core/domain';
import { ITodoOrchestration, IUserOrchestration, Todo } from '@orcha-todo-example-app/shared/domain';
import { createQuery } from '@orcha/common';
import { ITestOrchestration } from '@orcha/testing';
import { AppTestModule } from '../../core/app-test.module';
import { DatabaseService } from '../../core/database.service';
import { createUserOrchestration } from '../user/user.orchestration';
import { createTodoOrchestration } from './todo.orchestration';

describe('Todo Orchestration Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let userOrcha: ITestOrchestration<IUserOrchestration>;
  let todoOrcha: ITestOrchestration<ITodoOrchestration>;

  let todoRepo: TodoRepository;

  const credentials = { id: 'email@email.com', password: 'GoodPwd341' };
  let auth: { body: { token: string }; statusCode: HttpStatus };

  const todoQuery = createQuery<Todo>()({
    id: true,
    content: true,
    dateCreated: true,
    dateUpdated: true,
    done: true,
    user: { id: true },
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication();
    db = moduleRef.get(DatabaseService);

    userOrcha = createUserOrchestration(app);
    todoOrcha = createTodoOrchestration(app);

    todoRepo = moduleRef.get(TodoRepository);

    await app.init();
  });

  beforeEach(async () => {
    await db.clearDb();
    auth = await userOrcha.signUp({ token: true }, '', credentials);
  });

  afterAll(async () => await app.close());

  describe('create', () => {
    it('should create todo', async () => {
      const { body } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      expect(body.user.id).toBe(credentials.id);
      expect(body.content).toBe('content');
      expect(body.done).toBe(false);
    });
    // Silly business logic.
    it('should not create todo if there is already one that as the same content', async () => {
      await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      const { error } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      expect(error).toBe(`But you already have a todo that has content "content".`);
    });
  });
  describe('read', () => {
    it('should get no todos at system init', async () => {
      const { body } = await todoOrcha.read(todoQuery, auth.body.token);
      expect(body.length).toBe(0);
    });
    it('should get my todo items', async () => {
      await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      const { body } = await todoOrcha.read(todoQuery, auth.body.token);
      expect(body.length).toBe(1);
      expect(body[0].content).toBe('content');
      expect(body[0].user.id).toBe(credentials.id);
    });
  });
  describe('update', () => {
    it('should not update if owned by another user', async () => {
      const { body: otherUser } = await userOrcha.signUp({ token: true }, '', {
        id: 'other@user.com',
        password: 'PAsWd12!',
      });
      const { body: otherTodo } = await todoOrcha.create(todoQuery, otherUser.token, { content: 'content' });
      const { error } = await todoOrcha.update(todoQuery, auth.body.token, {
        todoId: otherTodo.id,
        content: 'new content',
      });
      expect(error).toBe('You cannot update a todo item for another user.');
    });
    it('should update todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body } = await todoOrcha.update(todoQuery, auth.body.token, { todoId: todo.id });
      expect(body.content).toBe('new content');
      expect(body.user.id).toBe(credentials.id);
    });
    // More silly business logic.
    it('should not update todo if already done', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      await todoOrcha.update(todoQuery, auth.body.token, { todoId: todo.id, done: true });
      const { error } = await todoOrcha.update(todoQuery, auth.body.token, { todoId: todo.id, done: true });
      expect(error).toBe('Todo item is already done!');
    });
  });
  describe('delete', () => {
    it('should not delete if owned by another user', async () => {
      const { body: otherUser } = await userOrcha.signUp({ token: true }, '', {
        id: 'other@user.com',
        password: 'PAsWd12!',
      });
      const { body: otherTodo } = await todoOrcha.create(todoQuery, otherUser.token, { content: 'content' });
      const { error } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: otherTodo.id,
      });
      expect(error).toBe('You cannot delete a todo item for another user.');
    });
    it('should delete todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body } = await todoOrcha.delete({ deletedId: true }, auth.body.token, { todoId: todo.id });
      expect(body.deletedId).toBe(todo.id);
      expect(await todoRepo.findOne(todo.id)).toBeFalsy();
    });
  });
});
