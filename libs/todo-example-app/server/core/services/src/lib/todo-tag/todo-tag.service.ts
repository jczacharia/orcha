import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TagRepository, TodoRepository, TodoTagRepository } from '@orcha-todo-example-app/server/core/domain';
import { CreateTodoTagDto, DeleteTodoTagDto, TodoTag } from '@orcha-todo-example-app/shared/domain';
import { IQuery, parseOrchaQuery } from '@orcha/common';
import { In } from 'typeorm';
import * as uuid from 'uuid';
import { TagService } from '../tag';
import { UserService } from '../user';

@Injectable()
export class TodoTagService {
  constructor(
    private readonly todoTagRepo: TodoTagRepository,
    private readonly todoRepo: TodoRepository,
    private readonly tagRepo: TagRepository,
    private readonly tagService: TagService,
    private readonly user: UserService
  ) {}

  async create(query: IQuery<TodoTag>, token: string, dto: CreateTodoTagDto) {
    const user = await this.user.verifyUserToken(token);

    const todo = await this.todoRepo.findOneOrFail(dto.todoId, { id: true, user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot link someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    const tags = await this.tagRepo.query(
      { id: true, name: true, user: { id: true } },
      { where: { name: dto.tagName } }
    );
    let tag = tags[0];
    if (!tag) {
      tag = await this.tagService.create({ id: true, name: true, user: { id: true } }, token, {
        name: dto.tagName,
      });
    }

    // TODO Transaction

    const tts = await this.todoTagRepo.query(query, { where: { tag: tag.id, todo: todo.id } });

    return tts[0]
      ? tts[0]
      : this.todoTagRepo.upsert(
          {
            id: uuid.v4(),
            dateLinked: new Date(),
            todo: todo.id,
            tag: tag.id,
          },
          query
        );
  }

  async read(query: IQuery<TodoTag[]>, token: string) {
    const user = await this.user.verifyUserToken(token);
    /* Workaround for nested where clause. */
    const todos = await this.todoRepo.query({ id: true }, { where: { user: user.id } });
    return this.todoTagRepo.query(query, { where: { todo: In(todos.map((e) => e.id)) } });
  }

  async delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoTagDto) {
    const user = await this.user.verifyUserToken(token);
    const todoTag = await this.todoTagRepo.findOneOrFail(dto.todoTagId, { todo: { id: true } });

    const todo = await this.todoRepo.findOneOrFail(todoTag.todo.id, { user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot unlink someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    await this.todoTagRepo.delete(dto.todoTagId);
    return parseOrchaQuery(query, { deletedId: dto.todoTagId });
  }
}
