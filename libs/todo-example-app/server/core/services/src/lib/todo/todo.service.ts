import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TodoRepository } from '@orcha-todo-example-app/server/core/domain';
import {
  CreateTodoDto,
  DeleteTodoDto,
  ReadTodosDto,
  Todo,
  UpdateTodoDto,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery, parseOrchaQuery } from '@orcha/common';
import * as uuid from 'uuid';
import { UserService } from '../user';

@Injectable()
export class TodoService {
  constructor(private readonly todoRepo: TodoRepository, private readonly user: UserService) {}

  async create(query: IQuery<Todo>, token: string, dto: CreateTodoDto) {
    const user = await this.user.verifyUserToken(token);

    if (user.id !== dto.userId) {
      throw new HttpException('You cannot create a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    return this.todoRepo.upsert(
      {
        id: uuid.v4(),
        content: dto.content,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        done: false,
        user: dto.userId,
      },
      query
    );
  }

  async read(query: IQuery<Todo[]>, token: string, dto: ReadTodosDto) {
    const user = await this.user.verifyUserToken(token);

    if (user.id !== dto.userId) {
      throw new HttpException('You cannot read todo items for another user.', HttpStatus.UNAUTHORIZED);
    }

    return this.todoRepo.query(query, { where: { user: dto.userId } });
  }

  async update(query: IQuery<Todo>, token: string, dto: UpdateTodoDto) {
    const user = await this.user.verifyUserToken(token);
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, { user: { id: true } });

    if (user.id !== todo.user.id) {
      throw new HttpException('You cannot update a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    return this.todoRepo.update(dto.todoId, { content: dto.content, done: dto.done }, query);
  }

  async delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoDto) {
    const user = await this.user.verifyUserToken(token);
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, { user: { id: true } });

    if (user.id !== todo.user.id) {
      throw new HttpException('You cannot delete a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    await this.todoRepo.delete(dto.todoId);
    return parseOrchaQuery(query, { deletedId: dto.todoId });
  }
}
