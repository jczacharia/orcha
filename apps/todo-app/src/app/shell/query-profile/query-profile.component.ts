import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IParserSerialized, IQuery } from '@orcha/common';
import { EntireProfile, User } from '@todo-example-app-lib/shared';
import { take } from 'rxjs';
import { AppFacade } from '../../domain/app.facade';
import { UserController } from '../../domain/user/user.controller';

@Component({
  selector: 'orcha-todo-example-app-query-profile',
  templateUrl: './query-profile.component.html',
  styleUrls: ['./query-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryProfileComponent {
  res = {} as IParserSerialized<User, IQuery<User>>;

  queryCtrl = new FormControl(JSON.stringify(EntireProfile, undefined, 4), { nonNullable: true });

  constructor(private user: UserController, private app: AppFacade, private change: ChangeDetectorRef) {
    this.user.queryProfile(EntireProfile).subscribe((e) => {
      this.res = e.data;
      this.change.markForCheck();
    });
  }

  send() {
    const json = this.queryCtrl.value.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
    this.queryCtrl.setValue(JSON.stringify(JSON.parse(json), undefined, 4));
    this.user
      .queryProfile(JSON.parse(json))
      .pipe(take(1))
      .subscribe((e) => {
        this.res = e.data;
        this.change.markForCheck();
      });
  }
}
