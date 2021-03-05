import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';
import {
  createQueryModel,
  IManyToMany,
  IManyToOne,
  IOneToMany,
  IOneToOne,
  IOperation,
  IStoreModel,
} from '@orcha/common';
import { IsString } from 'class-validator';

export abstract class ExDto {
  @IsString()
  name!: string;
}

export interface IExOrchestration {
  fileUpload: IOperation<{ res: string; derp: string }, ExDto>;
}

@ClientOrchestration('ex')
export class ExOrchestration implements IClientOrchestration<IExOrchestration> {
  @ClientOperation()
  fileUpload!: IClientOrchestration<IExOrchestration>['fileUpload'];
}

const e = new ExOrchestration();
// e.fileUpload({res: true},{name: ''} ).subscribe(s => s.)

export interface Todo {
  id: string;
  title: string;
  content: string;
  dateCreated: Date;
  photoUrls: string[];
  ownedBy: IManyToOne<Todo, User>;
  tags: IManyToMany<Todo, Tag>;
}

export interface Tag {
  id: string;
  text: string;
  todos: IManyToMany<Tag, Todo>;
}
export interface User {
  id: string;
  name?: string;
  todos: IOneToMany<User, Todo>;
  privateProfile?: IOneToOne<User, UserPrivate>;
}

export interface UserPrivate {
  id: string;
  birthday: Date;
  publicProfile: IOneToOne<UserPrivate, User>;
}

const UserQueryModel = createQueryModel<User>()({});

export type UserStoreModel = IStoreModel<User, typeof UserQueryModel>;

let user!: UserStoreModel;
