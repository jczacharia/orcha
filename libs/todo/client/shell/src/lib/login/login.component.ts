import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppFacade } from '@orcha/todo/client/domain';
import { RxJSBaseClass } from '@orcha/todo/client/util';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'orcha-todo-example-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends RxJSBaseClass implements OnInit {
  readonly loginForm = new UntypedFormGroup({
    id: new UntypedFormControl('', (c) => Validators.required(c)),
    password: new UntypedFormControl('', (c) => Validators.required(c)),
  });

  error: string | null = null;

  constructor(
    private readonly _app: AppFacade,
    private readonly _router: Router,
    private readonly _change: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this._app.user.actionListeners.login.error.pipe(takeUntil(this.destroy$)).subscribe(({ error }) => {
      this.error = error.message;
      this._change.markForCheck();
    });
  }

  login() {
    const { id, password } = this.loginForm.value;
    this._app.user.dispatchers.login(id, password);
  }

  signUpPage() {
    this._router.navigate(['/sign-up']);
  }
}
