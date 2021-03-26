import { IManyToMany } from "@orcha/common";
import { Todo } from "../todo";

export interface Tag {
  id: string;
  text: string;
  todos: IManyToMany<Tag, Todo>;
}