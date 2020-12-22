import { CommonModule } from '@angular/common';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken, Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import {
  IOperation,
  IOperations,
  ISubscription,
  ISubscriptions,
  KIRTAN,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  __KIRTAN_OPERATIONS,
  __KIRTAN_OPERATIONS_NAME,
  __KIRTAN_SUBSCRIPTIONS,
} from '@kirtan/common';
import 'reflect-metadata';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { createKirtanInterceptorFilter, KirtanInterceptor } from './kirtan.interceptor';

const KirtanApiUrl = new InjectionToken<string>('KirtanApiUrl');

@NgModule({})
export class KirtanAngularRootModule {}

@NgModule({})
export class KirtanAngularFeatureModule {
  // Forces Root module to be create before feature module.
  constructor(protected readonly root: KirtanAngularRootModule) {}
}

@NgModule({
  imports: [CommonModule],
})
export class KirtanAngularModule {
  static forRoot(apiUrl: string): ModuleWithProviders<KirtanAngularRootModule> {
    return {
      ngModule: KirtanAngularRootModule,
      providers: [
        {
          provide: KirtanApiUrl,
          useValue: apiUrl,
        },
      ],
    };
  }

  static forFeature({
    operations,
    subscriptions,
    interceptors,
  }: {
    operations?: Type<IOperations>[];
    subscriptions?: Type<ISubscriptions>[];
    interceptors?: Type<KirtanInterceptor>[];
  }): ModuleWithProviders<KirtanAngularFeatureModule> {
    const ops: Provider[] =
      operations?.map(
        (o): Provider => ({
          deps: [Injector],
          provide: o,
          useFactory: (injector: Injector) => KirtanAngularModule.createOperations(injector, o),
        })
      ) ?? [];

    const subs =
      subscriptions?.map(
        (s): Provider => ({
          deps: [Injector],
          provide: s,
          useFactory: (injector: Injector) => KirtanAngularModule.createSubscriptions(injector, s),
        })
      ) ?? [];

    const inters =
      interceptors?.map(
        (i): Provider => ({
          provide: HTTP_INTERCEPTORS,
          useClass: createKirtanInterceptorFilter(i),
          multi: true,
        })
      ) ?? [];

    return {
      ngModule: KirtanAngularFeatureModule,
      providers: [...ops, ...subs, ...inters],
    };
  }

  static createOperations(injector: Injector, operations: Type<IOperations>) {
    const name = operations.prototype[__KIRTAN_OPERATIONS_NAME];
    const ops = operations.prototype[__KIRTAN_OPERATIONS];
    const keys = Object.keys(ops);

    if (!name) {
      throw new Error(
        `No operations orchestration name found for operations with names of "${keys.join(
          ', '
        )}"\nDid you remember to add @ClientOperations(<name here>)?`
      );
    }

    const apiUrl = injector.get(KirtanApiUrl);
    const http = injector.get(HttpClient);
    for (const funcName of keys) {
      const clientOperation = (query: object, props: object) => {
        const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
        return http.post<any>(`${apiUrl}/${KIRTAN}/${name}/${funcName}`, body);
      };
      ops[funcName] = clientOperation;
    }
    return ops;
  }

  static createSubscriptions(injector: Injector, subscriptions: Type<ISubscriptions>) {
    const apiUrl = injector.get(KirtanApiUrl);
    const subs = subscriptions.prototype[__KIRTAN_SUBSCRIPTIONS];
    const subKeys = Object.keys(subs);

    if (subKeys.length > 0) {
      const socket = io(apiUrl);

      socket.on('exception', (d: unknown) => {
        console.error(d);
      });

      for (const funcName of subKeys) {
        const subject = new Subject<any>();

        socket.on(funcName, (d: unknown) => {
          subject.next(d);
        });

        // setTimeout(() => subject.error('dfe'), 5000);

        const clientSubscription = (query: object, props: object) => {
          const body: ISubscription<object, object> = {
            [KIRTAN_DTO]: props,
            [KIRTAN_QUERY]: query,
          };
          socket.emit(funcName, body);
          return subject.asObservable();
        };

        subs[funcName] = clientSubscription;
      }
    }

    return subs;
  }
}
