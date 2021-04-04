import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { AppFacade, TagStoreModel, TodoStoreModel } from '@orcha-todo-example-app/client/shared/data-access';
import { StatefulComponent } from '@orcha-todo-example-app/client/shared/util';
import { tap } from 'rxjs/operators';

interface State {
  todos: TodoStoreModel[];
  tags: TagStoreModel[];
  loaded: boolean;
}

@Component({
  selector: 'orcha-todo-example-app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent extends StatefulComponent<State> implements OnInit {
  readonly todo = new FormControl('', (ac) => Validators.required(ac));

  constructor(private readonly app: AppFacade) {
    super({ todos: [], loaded: false, tags: [] });
  }

  ngOnInit(): void {
    this.effect(() =>
      this.app.todo.selectors.todos$.pipe(
        tap(({ todos, loaded }) => {
          this.updateState({
            todos: todos.sort(
              (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
            ),
            loaded,
          });
        })
      )
    );

    this.effect(() =>
      this.app.tag.selectors.tags$.pipe(
        tap(({ tags, loaded }) => {
          this.updateState({
            tags: tags.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()),
            loaded,
          });
        })
      )
    );
  }

  create() {
    this.app.todo.dispatchers.create(this.todo.value);
  }

  delete(todo: TodoStoreModel) {
    this.app.todo.dispatchers.delete(todo);
  }

  toggle(todo: TodoStoreModel) {
    this.app.todo.dispatchers.update({ todoId: todo.id, done: !todo.done });
  }

  tag(todo: TodoStoreModel, tagName: string) {
    this.app.todo.dispatchers.tag(todo, tagName);
  }

  untag(todoTagId: string) {
    this.app.todo.dispatchers.untag(todoTagId);
  }
}
