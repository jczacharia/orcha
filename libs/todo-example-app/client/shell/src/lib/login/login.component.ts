import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { RxJSBaseClass } from '@orcha-todo-example-app/client/shared/util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'orcha-todo-example-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends RxJSBaseClass implements OnInit {
  readonly loginForm = new FormGroup({
    id: new FormControl('', (c) => Validators.required(c)),
    password: new FormControl('', (c) => Validators.required(c)),
  });

  error: string | null = null;

  constructor(
    private readonly app: AppFacade,
    private readonly router: Router,
    private readonly _change: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.app.user.actionListeners.login.error.pipe(takeUntil(this.destroy$)).subscribe(({ error }) => {
      this.error = error.message;
      this._change.markForCheck();
    });
  }

  login() {
    const { id, password } = this.loginForm.value;
    this.app.user.dispatchers.login(id, password);
  }

  signUpPage() {
    this.router.navigate(['/sign-up']);
  }
}
