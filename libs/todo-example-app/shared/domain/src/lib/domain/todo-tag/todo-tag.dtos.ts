import { IsString, IsUUID } from 'class-validator';

export abstract class CreateTodoTagDto {
  @IsUUID()
  todoId!: string;

  @IsString()
  tagName!: string;
}

export abstract class DeleteTodoTagDto {
  @IsUUID()
  todoTagId!: string;
}
