import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';

@Component({
  selector: 'orcha-todo-example-app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnInit {
  constructor(private readonly app: AppFacade) {}

  ngOnInit(): void {}

  logout() {
    this.app.user.dispatchers.logout();
  }
}
