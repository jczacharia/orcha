import { IQuery, ValidateOrchaQuery } from '@orcha/common';
import { IsEmail, IsObject, IsOptional, MinLength } from 'class-validator';
import { User } from './user.model';
import { EntireProfile } from './user.queries';

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

export abstract class UpdateUserProfileDto {
  @IsOptional()
  @IsObject()
  firstName?: User['firstName'];
  @IsOptional()
  @IsObject()
  middleName?: User['middleName'];
  @IsOptional()
  @IsObject()
  lastName?: User['lastName'];
  @IsOptional()
  @IsObject()
  phone?: User['phone'];
}

export abstract class GetProfileDto<Q extends IQuery<User> = IQuery<User>> {
  @ValidateOrchaQuery<User>(EntireProfile)
  query!: Q;
}
