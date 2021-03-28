import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export abstract class CreateTodoDto {
  @IsString()
  content!: string;

  @IsString()
  userId!: string;
}

export abstract class UpdateTodoDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsUUID()
  todoId!: string;
}

export abstract class DeleteTodoDto {
  @IsUUID()
  todoId!: string;
}
