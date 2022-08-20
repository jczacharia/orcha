import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ActionReducer, StoreModule, USER_PROVIDED_META_REDUCERS } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { OrchaAngularModule } from '@orcha/angular';
import { OrchaOperationError } from '@orcha/common';
import { environment } from '@todo-example-app-lib/shared';
import { AppComponent } from './app.component';
import { DomainModule } from './domain/domain.module';

const ngrxDebugFactory = <T>() => {
  return (reducer: ActionReducer<T>): ActionReducer<T> => {
    return (state, action) => {
      const result = reducer(state, action);
      if (action.type.includes('@ngrx/')) {
        return result;
      }
      console.groupCollapsed(action.type);
      console.log('prev state', state);
      console.log('action', action);
      console.log('next state', result);
      console.groupEnd();
      return result;
    };
  };
};

const ngrxErrorFactory = <T>() => {
  return (reducer: ActionReducer<T>): ActionReducer<T> => {
    return (state, action) => {
      const result = reducer(state, action);
      if (action.type.includes('Error')) {
        alert(`${action.type.split(']')[1]}: ${(action as any).error.error.message}`);
      }
      return result;
    };
  };
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    DomainModule,
    OrchaAngularModule.forRoot({
      apiUrl: environment.apiUrl,
      wsUrl: environment.wsUrl,
      authTokenLocalStorageKey: 'todo-app',
    }),
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () => import('./shell/shell.module').then((m) => m.ShellModule),
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
    environment.production ? [] : StoreDevtoolsModule.instrument({ name: 'orcha-todo' }),
    EffectsModule.forRoot([]),
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: USER_PROVIDED_META_REDUCERS,
      useFactory: () => [ngrxErrorFactory(), ...(environment.production ? [] : [ngrxDebugFactory()])],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
