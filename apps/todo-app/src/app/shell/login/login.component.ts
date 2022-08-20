import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppFacade } from '../../domain/app.facade';
import { RxJSBaseClass } from '../../util/rxjs-base-class';

@Component({
  selector: 'orcha-todo-example-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends RxJSBaseClass {
  readonly loginForm = new UntypedFormGroup({
    email: new UntypedFormControl('', (c) => Validators.required(c)),
    password: new UntypedFormControl('', (c) => Validators.required(c)),
  });

  error: string | null = null;

  constructor(private app: AppFacade, private router: Router, private change: ChangeDetectorRef) {
    super();
  }

  login() {
    const { email, password } = this.loginForm.value;
    this.app.user.dispatchers.login({ email, password });
  }

  signUpPage() {
    this.router.navigate(['/sign-up']);
  }
}
