import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TagRepository, TodoRepository, TodoTagRepository } from '@orcha-todo-example-app/server/core/domain';
import {
  CreateTodoDto,
  DeleteTodoDto,
  TagDto,
  Todo,
  UnTagDto,
  UpdateTodoDto,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery, parseOrchaQuery } from '@orcha/common';
import * as uuid from 'uuid';
import { DbTransactionCreator } from '../transaction-creator/transaction-creator.service';
import { UserService } from '../user';

@Injectable()
export class TodoService {
  constructor(
    private readonly todoRepo: TodoRepository,
    private readonly user: UserService,
    private readonly tagRepo: TagRepository,
    private readonly todoTagRepo: TodoTagRepository,
    private readonly transaction: DbTransactionCreator
  ) {}

  async create(query: IQuery<Todo>, token: string, dto: CreateTodoDto) {
    const user = await this.user.verifyUserToken(token);
    return this.todoRepo.upsert(
      {
        id: uuid.v4(),
        content: dto.content,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        done: false,
        user: user.id,
        todoTags: [],
      },
      query
    );
  }

  async read(query: IQuery<Todo[]>, token: string) {
    const user = await this.user.verifyUserToken(token);
    return this.todoRepo.query(query, { where: { user: user.id } });
  }

  async update(query: IQuery<Todo>, token: string, dto: UpdateTodoDto) {
    const user = await this.user.verifyUserToken(token);
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      user: { id: true },
      done: true,
      content: true,
    });

    if (user.id !== todo.user.id) {
      throw new HttpException('You cannot update a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    return this.todoRepo.update(
      dto.todoId,
      { content: dto.content, done: dto.done, dateUpdated: new Date() },
      query
    );
  }

  async delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoDto) {
    const user = await this.user.verifyUserToken(token);
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      user: { id: true },
      todoTags: { id: true },
    });

    if (user.id !== todo.user.id) {
      throw new HttpException('You cannot delete a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    await this.transaction.run(async () => {
      await this.todoTagRepo.deleteMany(todo.todoTags.map((tt) => tt.id));
      await this.todoRepo.delete(dto.todoId);
      await this.deleteLonelyTags();
    });

    return parseOrchaQuery(query, { deletedId: dto.todoId });
  }

  async tag(query: IQuery<Todo>, token: string, dto: TagDto) {
    const user = await this.user.verifyUserToken(token);

    const todo = await this.todoRepo.findOneOrFail(dto.todoId, { id: true, user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot add a tag to someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    const tags = await this.tagRepo.query(
      { id: true, name: true, user: { id: true } },
      { where: { name: dto.tagName } }
    );

    const tagAlreadyExists = tags[0];
    if (!tagAlreadyExists) {
      await this.tagRepo.upsert({
        id: uuid.v4(),
        dateCreated: new Date(),
        dateUpdated: new Date(),
        name: dto.tagName,
        user: user.id,
        todoTags: [
          {
            id: uuid.v4(),
            dateLinked: new Date(),
            todo: todo.id,
          },
        ],
      });
      return this.todoRepo.findOneOrFail(todo.id, query);
    }

    const tts = await this.todoTagRepo.query({}, { where: { tag: tagAlreadyExists.id, todo: todo.id } });
    if (!tts[0]) {
      await this.todoTagRepo.upsert({
        id: uuid.v4(),
        dateLinked: new Date(),
        todo: todo.id,
        tag: tagAlreadyExists.id,
      });
    }
    return this.todoRepo.findOneOrFail(todo.id, query);
  }

  async untag(query: IQuery<Todo>, token: string, dto: UnTagDto) {
    const user = await this.user.verifyUserToken(token);
    const todoTag = await this.todoTagRepo.findOneOrFail(dto.todoTagId, {
      todo: { id: true },
      tag: { id: true },
    });

    const todo = await this.todoRepo.findOneOrFail(todoTag.todo.id, { user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot untag someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    await this.transaction.run(async () => {
      await this.todoTagRepo.delete(dto.todoTagId);
      await this.deleteLonelyTags();
    });

    return this.todoRepo.findOneOrFail(todoTag.todo.id, query);
  }

  private async deleteLonelyTags() {
    const tags = await this.tagRepo.findAll({ id: true, todoTags: {} });
    const lonelyTags = tags.filter((tag) => tag.todoTags.length === 0);
    await this.tagRepo.deleteMany(lonelyTags.map((t) => t.id));
  }
}
