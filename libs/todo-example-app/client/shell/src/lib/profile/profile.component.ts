import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserOrchestration } from '@orcha-todo-example-app/client/shared/data-access';
import { EntireProfile } from '@orcha-todo-example-app/shared/domain';

@Component({
  selector: 'orcha-todo-example-app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly profile$ = this._user.getProfile(EntireProfile);
  constructor(private readonly _user: UserOrchestration) {}
}
