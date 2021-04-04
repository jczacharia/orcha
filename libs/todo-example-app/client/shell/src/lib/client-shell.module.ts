import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from './app-shell/app-shell.component';
import { AppGuard } from './app.guard';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { TagsComponent } from './tags/tags.component';
import { TodosComponent } from './todos/todos.component';

@NgModule({
  declarations: [
    AppShellComponent,
    LoginComponent,
    SignUpComponent,
    TodosComponent,
    TagsComponent,
    ProfileComponent,
  ],
  providers: [AppGuard],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    RouterModule.forChild([
      {
        path: '',
        component: AppShellComponent,
        canActivate: [AppGuard],
        children: [
          {
            path: 'todos',
            component: TodosComponent,
          },
          {
            path: 'tags',
            component: TagsComponent,
          },
          {
            path: 'profile',
            component: ProfileComponent,
          },
          { path: '**', pathMatch: 'full', redirectTo: 'todos' },
        ],
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
      },
    ]),
  ],
})
export class ClientShellModule {}
