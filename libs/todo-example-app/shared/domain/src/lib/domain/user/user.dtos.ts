import { IsEmail, MinLength } from 'class-validator';

export abstract class LoginDto {
  @IsEmail()
  id!: string;

  @MinLength(6)
  password!: string;
}

export abstract class SignUpDto {
  @IsEmail()
  id!: string;

  @MinLength(6)
  password!: string;
}
