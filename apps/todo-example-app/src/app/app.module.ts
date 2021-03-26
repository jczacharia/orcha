import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ActionReducer, StoreModule, USER_PROVIDED_META_REDUCERS } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ClientSharedDataAccessModule } from '@orcha-todo-example-app/client/shared/data-access';
import { environment } from '@orcha-todo-example-app/shared/domain';
import { OrchaAngularModule } from '@orcha/angular';
import { AppComponent } from './app.component';

const ngrxDebugFactory = <T>() => {
  return (reducer: ActionReducer<T>): ActionReducer<T> => {
    return (state, action) => {
      const result = reducer(state, action);
      console.groupCollapsed(action.type);
      console.log('prev state', state);
      console.log('action', action);
      console.log('next state', result);
      console.groupEnd();
      return result;
    };
  };
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ClientSharedDataAccessModule,
    OrchaAngularModule.forRoot(environment.apiUrl),
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () => import('@orcha-todo-example-app/client/shell').then((m) => m.ClientShellModule),
      },
    ]),
    StoreModule.forRoot([], {
      runtimeChecks: environment.production
        ? {}
        : {
            strictStateImmutability: true,
            strictActionImmutability: true,
            strictStateSerializability: false, // to pass functions
            strictActionSerializability: false, // to pass error Objects
            strictActionWithinNgZone: true,
            strictActionTypeUniqueness: true,
          },
    }),
    StoreDevtoolsModule.instrument({
      name: 'orcha-todo-example-app',
      // In a production build you would want to disable the Store Devtools.
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([]),
  ],
  providers: [
    environment.production
      ? []
      : {
          provide: USER_PROVIDED_META_REDUCERS,
          useFactory: () => [ngrxDebugFactory()],
        },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
