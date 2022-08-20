import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppFacade } from '../../domain/app.facade';
import { RxJSBaseClass } from '../../util/rxjs-base-class';

@Component({
  selector: 'orcha-todo-example-app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent extends RxJSBaseClass {
  readonly signUpForm = new UntypedFormGroup({
    email: new UntypedFormControl('', (c) => Validators.required(c)),
    password: new UntypedFormControl('', (c) => Validators.required(c)),
  });

  constructor(private app: AppFacade, private router: Router) {
    super();
  }

  signUp() {
    const { email, password } = this.signUpForm.value;
    this.app.user.dispatchers.signUp({ email, password });
  }

  loginPage() {
    this.router.navigate(['/login']);
  }
}
