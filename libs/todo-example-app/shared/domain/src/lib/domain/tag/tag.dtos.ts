import { IsOptional, IsString, IsUUID } from 'class-validator';

export abstract class CreateTagDto {
  @IsString()
  name!: string;
}

export abstract class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsUUID()
  tagId!: string;
}

export abstract class DeleteTagDto {
  @IsUUID()
  tagId!: string;
}
