import { Tag } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TodoTagEntity } from '../todo-tag/todo-tag.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class TagEntity implements Required<Tag> {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  name!: string;

  @Column()
  dateCreated!: Date;

  @Column()
  dateUpdated!: Date;

  @ManyToOne(() => UserEntity, (e) => e.tags)
  user!: UserEntity;

  @OneToMany(() => TodoTagEntity, (e) => e.tag)
  todoTags!: TodoTagEntity[];
}
