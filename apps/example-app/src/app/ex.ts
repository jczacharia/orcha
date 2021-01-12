import {
  createStoreModelFromQuery,
  IManyToMany,
  IManyToOne,
  IOneToMany,
  IOneToOne,
  IProps,
  IStoreModel,
  IUpdateEntity,
} from '@orchestra/common';

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

const UserQueryModel = createStoreModelFromQuery<Todo[]>()({
  tags: {
    id: true,
  },
});

export type UserStoreModel = IStoreModel<User, typeof UserQueryModel>;
