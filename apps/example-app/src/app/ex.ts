import {
  createStoreModelFromQuery,
  IManyToMany,
  IManyToOne,
  IOneToMany,
  IOneToOne,
  IStoreModel,
} from '@kirtan/common';

export interface Todo {
  id: string;
  title: string;
  content: string;
  dateCreated: Date;
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
  name: string;
  todos: IOneToMany<User, Todo>;
  privateProfile?: IOneToOne<User, UserPrivate>;
}

export interface UserPrivate {
  id: string;
  birthday: Date;
  publicProfile: IOneToOne<UserPrivate, User>;
}

const UserQueryModel = createStoreModelFromQuery<User>()({
  id: true,
  privateProfile: {
    birthday: true,
  },
});

export type UserStoreModel = IStoreModel<User, typeof UserQueryModel>;
