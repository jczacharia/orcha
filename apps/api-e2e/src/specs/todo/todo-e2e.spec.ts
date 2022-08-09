import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TagRepository, TodoRepository } from '@orcha/todo/server/domain';
import { ITodoGateway, ITodoOrchestration, IUserOrchestration, Todo } from '@orcha/todo/shared/domain';
import { createQuery, OrchaSubscriptionError, subscriptionChannelErrorRoute } from '@orcha/common';
import { ITestGateway, ITestOrchestration } from '@orcha/testing';
import { AppTestModule } from '../../core/app-test.module';
import { DatabaseService } from '../../core/database.service';
import { createUserOrchestration } from '../user/user.orchestration';
import { createTodoGateway } from './todo.gateway';
import { createTodoOrchestration } from './todo.orchestration';

describe('Todo Orchestration Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let userOrcha: ITestOrchestration<IUserOrchestration>;
  let todoOrcha: ITestOrchestration<ITodoOrchestration>;

  let todoGateway: ITestGateway<ITodoGateway>;

  let todoRepo: TodoRepository;
  let tagRepo: TagRepository;

  const credentials = { id: 'email@email.com', password: 'GoodPwd341' };
  let auth: { body: { token: string }; statusCode: HttpStatus };

  const todoQuery = createQuery<Todo>()({
    id: true,
    content: true,
    dateCreated: true,
    dateUpdated: true,
    done: true,
    user: {
      id: true,
    },
    taggedTodos: {
      id: true,
      tag: {
        id: true,
        name: true,
      },
    },
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
    todoGateway = createTodoGateway(app);

    todoRepo = moduleRef.get(TodoRepository);
    tagRepo = moduleRef.get(TagRepository);

    await app.init();
  });

  beforeEach(async () => {
    await db.clearDb();
    todoRepo.gatewaysStorage['_sockets'].clear();
    auth = await userOrcha.signUp({ token: true }, '', credentials);
  });

  afterAll(async () => await app.close());

  describe('create', () => {
    it('should create todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      expect(todo.user.id).toBe(credentials.id);
      expect(todo.content).toBe('content');
      expect(todo.done).toBe(false);
    });
    // });
    // describe('read', () => {
    //   it('should get no todos at system init', async () => {
    //     const { body: todos } = await todoOrcha.read(todoQuery, auth.body.token);
    //     expect(todos.length).toBe(0);
    //   });
    //   it('should get my todo items', async () => {
    //     await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
    //     const { body: todos } = await todoOrcha.read(todoQuery, auth.body.token);
    //     expect(todos.length).toBe(1);
    //     expect(todos[0].content).toBe('content');
    //     expect(todos[0].user.id).toBe(credentials.id);
    //   });
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
    it('should update todo and trim', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, {
        content: '  new content    ',
      });
      const { body: updatedTodo } = await todoOrcha.update(todoQuery, auth.body.token, { todoId: todo.id });
      expect(updatedTodo.content).toBe('new content');
      expect(updatedTodo.user.id).toBe(credentials.id);
    });
    it('should get user profile with todos', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: user } = await userOrcha.getProfile({ id: true, todos: { id: true } }, auth.body.token);
      expect(user.todos[0].id).toBe(todo.id);
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
      // console.log(
      //   await todoRepo['_repo'].findOneOrFail(
      //     { id: todo.id },
      //     {
      //       fields: ['user', 'user.id', 'taggedTodos', 'taggedTodos.id'],
      //       strategy: LoadStrategy.JOINED,
      //     }
      //   )
      // );
      const { body: deletedTodo } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: todo.id,
      });
      expect(deletedTodo.deletedId).toBe(todo.id);
      expect(await todoRepo.repo.findOne(todo.id)).toBeFalsy();
    });
    it('should delete todo and all lonely tags', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: taggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tag',
      });
      const { body: deletedTodo } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: todo.id,
      });
      expect(deletedTodo.deletedId).toBe(todo.id);
      expect(await todoRepo.repo.findOne(todo.id)).toBeFalsy();
      expect(await tagRepo.repo.findOne(taggedTodo.taggedTodos[0].tag.id)).toBeFalsy();
    });
    it('should delete todo and keep non-lonely tags', async () => {
      const { body: todoToDelete } = await todoOrcha.create(todoQuery, auth.body.token, {
        content: 'new content',
      });
      const { body: todoToKeep } = await todoOrcha.create(todoQuery, auth.body.token, {
        content: 'new content',
      });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todoToDelete.id, tagName: 'shouldDelete' });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todoToKeep.id, tagName: 'shouldKeep' });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todoToKeep.id, tagName: 'shouldKeep' });
      const { body } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: todoToDelete.id,
      });
      expect(body.deletedId).toBe(todoToDelete.id);
      expect(await todoRepo.repo.findOne(todoToDelete.id)).toBeFalsy();
      expect(
        (await tagRepo.orcha.find({ id: true }, { name: 'shouldDelete', user: { id: credentials.id } }))
          .length
      ).toBe(0);
      expect(
        (await tagRepo.orcha.find({ id: true }, { name: 'shouldKeep', user: { id: credentials.id } })).length
      ).toBe(1);
    });
  });
  describe('tag', () => {
    it('should tag a todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: taggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tag1',
      });
      expect(taggedTodo.taggedTodos[0].tag.name).toBe('tag1');
    });
    // it('should reuse a tag', async () => {
    //   const { body: todo1 } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
    //   const { body: todo2 } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
    //   await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todo1.id, tagName: 'tag1' });
    //   await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todo2.id, tagName: 'tag1' });
    //   const { body: todos } = await todoOrcha.read(todoQuery, auth.body.token);
    //   expect(todos[0].taggedTodos[0].tag.id).toBe(todos[1].taggedTodos[0].tag.id);
    // });
    it('should create separate tag entities if same name but different user', async () => {
      const { body: otherUser } = await userOrcha.signUp({ token: true }, '', {
        id: 'other@user.com',
        password: 'PAsWd12!',
      });
      const { body: myTodo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: otherTodo } = await todoOrcha.create(todoQuery, otherUser.token, {
        content: 'new content',
      });
      const { body: myTaggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: myTodo.id,
        tagName: 'sameTagName',
      });
      const { body: otherTaggedTodo } = await todoOrcha.tag(todoQuery, otherUser.token, {
        todoId: otherTodo.id,
        tagName: 'sameTagName',
      });
      expect(myTaggedTodo.taggedTodos[0].tag.id).not.toBe(otherTaggedTodo.taggedTodos[0].tag.id);
    });
  });
  describe('untag', () => {
    it('should untag and delete lonely tag', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: taggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tag1',
      });
      const { body: untaggedTodo } = await todoOrcha.untag(todoQuery, auth.body.token, {
        taggedTodoId: taggedTodo.taggedTodos[0].id,
      });
      expect(untaggedTodo.taggedTodos.length).toBe(0);
      expect(await tagRepo.repo.findOne(taggedTodo.taggedTodos[0].tag.id)).toBeFalsy();
    });
    it('should untag and keep non-lonely tags', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: tagToDelete } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tagToDelete',
      });
      await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tagToKeep',
      });
      await todoOrcha.untag(todoQuery, auth.body.token, {
        taggedTodoId: tagToDelete.taggedTodos[0].id,
      });
      expect(
        (await tagRepo.orcha.find({ id: true }, { name: 'tagToDelete', user: { id: credentials.id } })).length
      ).toBe(0);
      expect(
        (await tagRepo.orcha.find({ id: true }, { name: 'tagToKeep', user: { id: credentials.id } })).length
      ).toBe(1);
    });
  });
  describe('paginate', () => {
    it('paginate', async () => {
      await todoOrcha.create(todoQuery, auth.body.token, { content: 'content1' });
      await todoOrcha.create(todoQuery, auth.body.token, { content: 'content2' });
      await todoOrcha.create(todoQuery, auth.body.token, { content: 'content3' });
      const { body } = await todoOrcha.paginate(
        { ...todoQuery, __paginate: { offset: 0, limit: 1 } },
        auth.body.token
      );
      expect(body.items.length).toBe(1);
      const { body: body2 } = await todoOrcha.paginate(
        { ...todoQuery, __paginate: { offset: 0, limit: 2 } },
        auth.body.token
      );
      expect(body2.items.length).toBe(2);
      const { body: body3 } = await todoOrcha.paginate(
        { ...todoQuery, __paginate: { offset: 0, limit: 3 } },
        auth.body.token
      );
      expect(body3.items.length).toBe(3);
      const { body: body4 } = await todoOrcha.paginate(
        { ...todoQuery, __paginate: { offset: 2, limit: 1 } },
        auth.body.token
      );
      expect(body4.items.length).toBe(1);
    });
  });
  describe('subscriptions', () => {
    it('initially responds with zero', (done) => {
      const sub = todoGateway.listen({}, auth.body.token).subscribe((res) => {
        expect(res.created.length).toBe(0);
        expect(res.updated.length).toBe(0);
        expect(res.deleted.length).toBe(0);
        sub.unsubscribe();
        done();
      });
    });
    it('initially responds with one', (done) => {
      todoOrcha.create(todoQuery, auth.body.token, { content: 'content1' }).then(() => {
        const sub = todoGateway.listen({ content: true }, auth.body.token).subscribe((res) => {
          expect(res.created[0]).toStrictEqual({ content: 'content1' });
          expect(res.updated.length).toBe(0);
          expect(res.deleted.length).toBe(0);
          sub.unsubscribe();
          done();
        });
      });
    });
    it('updates and trims', (done) => {
      todoOrcha.create(todoQuery, auth.body.token, { content: 'content1' }).then((t) => {
        const sub = todoGateway
          .updateAndListenOne({ content: true }, auth.body.token, {
            todoId: t.body.id,
            content: '  updated          ',
          })
          .subscribe((res) => {
            expect(res.created[0]).toStrictEqual({ content: 'updated' });
            expect(res.updated.length).toBe(0);
            expect(res.deleted.length).toBe(0);
            sub.unsubscribe();
            done();
          });
      });
    });
    it('rejects other users', (done) => {
      todoOrcha.create(todoQuery, auth.body.token, { content: 'content1' }).then(async ({ body: { id } }) => {
        const user2 = await userOrcha.signUp({ token: true }, '', {
          id: 'user2@user2.com',
          password: '1Qazxsw2',
        });
        const sub = todoGateway.listenOne({ content: true }, user2.body.token, { todoId: id }).subscribe({
          error: (error: OrchaSubscriptionError) => {
            expect(error.channel).toBe(subscriptionChannelErrorRoute('listenOne'));
            expect(error.message).toBe('This todo is not yours.');
            sub.unsubscribe();
            done();
          },
        });
      });
    });
    it('creates/updates with one', (done) => {
      let init = true;
      let created = true;
      const sub = todoGateway.listen({ id: true, content: true }, auth.body.token).subscribe((res) => {
        if (init) {
          expect(res.created.length).toBe(0);
          expect(res.updated.length).toBe(0);
          expect(res.deleted.length).toBe(0);
          todoOrcha.create(todoQuery, auth.body.token, { content: 'content1' });
          init = false;
          return;
        }

        if (created) {
          expect(res.created[0].content).toBe('content1');
          expect(res.updated.length).toBe(0);
          expect(res.deleted.length).toBe(0);
          todoOrcha.update(todoQuery, auth.body.token, { todoId: res.created[0].id, content: 'up' });
          created = false;
          return;
        }

        expect(res.created.length).toBe(0);
        expect(res.updated[0].content).toBe('up');
        expect(res.deleted.length).toBe(0);
        sub.unsubscribe();
        done();
      });
    });
  });
});
