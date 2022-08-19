import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export abstract class CreateTodoDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  content!: string;
}

export abstract class TodoListenOneDto {
  @IsNumber()
  todoId!: number;
}

export abstract class TodoUpdateAndListenOneDto {
  @IsNumber()
  todoId!: number;

  @IsString()
  @Transform(({ value }) => value.trim())
  content!: string;
}

export abstract class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  content?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsNumber()
  todoId!: number;
}

export abstract class DeleteTodoDto {
  @IsNumber()
  todoId!: number;
}

export abstract class TagDto {
  @IsNumber()
  todoId!: number;

  @IsString()
  tagName!: string;
}

export abstract class UnTagDto {
  @IsString()
  taggedTodoId!: string;
}
