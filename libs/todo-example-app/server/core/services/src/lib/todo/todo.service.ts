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
import { IQuery, parseQuery } from '@orcha/common';
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

  /**
   * Creates a new todo entity.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Specs for creating the new todo entity.
   */
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

  /**
   * Gets all of a user's todo entities.
   * @param query Orcha query of todos.
   * @param token User's auth token.
   */
  async read(query: IQuery<Todo[]>, token: string) {
    const user = await this.user.verifyUserToken(token);
    return this.todoRepo.query(query, { where: { user: user.id } });
  }

  /**
   * Update a todo entity.
   * @param query Orcha query of todo.
   * @param token User auth token.
   * @param dto Id of todo to update.
   */
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

  /**
   * Deletes a todo entity, all of it's Tag links and any tags which were matched to only this Todo.
   * @param query Orcha query of the deleted Id of the Todo.
   * @param token User's auth token.
   * @param dto Id of todo to delete.
   */
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
      await this.deleteLonelyTags(user.id);
    });

    return parseQuery(query, { deletedId: dto.todoId });
  }

  /**
   * Links a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async tag(query: IQuery<Todo>, token: string, dto: TagDto) {
    const user = await this.user.verifyUserToken(token);

    const todo = await this.todoRepo.findOneOrFail(dto.todoId, { id: true, user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot add a tag to someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    const tags = await this.tagRepo.query(
      { id: true, name: true, user: { id: true } },
      { where: { name: dto.tagName, user: user.id } }
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

  /**
   * Unlinks a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
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
      await this.deleteLonelyTags(user.id);
    });

    return this.todoRepo.findOneOrFail(todoTag.todo.id, query);
  }

  /**
   * Deletes all Tags that are not linked to a todo by user.
   * @param userId Id of User to delete lonely Tags
   */
  private async deleteLonelyTags(userId: string) {
    const tags = await this.tagRepo.query({ id: true, todoTags: {} }, { where: { user: userId } });
    const lonelyTags = tags.filter((tag) => tag.todoTags.length === 0);
    await this.tagRepo.deleteMany(lonelyTags.map((t) => t.id));
  }
}
