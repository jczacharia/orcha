import { IsEmail, MinLength } from 'class-validator';

export abstract class LoginDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

export abstract class SignUpDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}
