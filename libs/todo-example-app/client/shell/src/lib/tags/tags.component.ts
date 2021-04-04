import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { StatefulComponent } from '@orcha-todo-example-app/client/shared/util';

interface State {
  tags: any;
  loaded: boolean;
}

@Component({
  selector: 'orcha-todo-example-app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsComponent extends StatefulComponent<State> implements OnInit {
  readonly tag = new FormControl('', (ac) => Validators.required(ac));

  constructor(private readonly app: AppFacade) {
    super({ tags: [], loaded: false });
  }

  ngOnInit(): void {
    // this.effect(() =>
    //   this.app.tag.selectors.tags$.pipe(
    //     tap(({ tags, loaded }) => {
    //       this.updateState({
    //         tags: tags.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()),
    //         loaded,
    //       });
    //     })
    //   )
    // );
  }

  // create() {
  //   this.app.tag.dispatchers.create(this.tag.value);
  // }

  // delete(tag: TagStoreModel) {
  //   this.app.tag.dispatchers.delete(tag);
  // }
}
