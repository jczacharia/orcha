import { CommonModule } from '@angular/common';
import { HttpClient, HttpXhrBackend } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import {
  IOperation,
  IOperations,
  ISubscription,
  ISubscriptions,
  KIRTAN,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  __KIRTAN_OPERATIONS,
  __KIRTAN_SUBSCRIPTIONS,
} from '@kirtan/common';
import 'reflect-metadata';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { io } from 'socket.io-client';

@NgModule({
  imports: [CommonModule],
})
export class KirtanAngularModule {
  static forRoot({
    apiUrl,
    operations,
    subscriptions,
  }: {
    apiUrl: string;
    operations: IOperations[];
    subscriptions: ISubscriptions[];
  }): ModuleWithProviders<KirtanAngularModule> {
    const ops: Provider[] = operations.map((o) => ({
      provide: o,
      useValue: createOperations(apiUrl, o),
    }));

    const subs: Provider[] = subscriptions.map((s) => ({
      provide: s,
      useValue: createSubscriptions(apiUrl, s),
    }));

    return {
      ngModule: KirtanAngularModule,
      providers: [...ops, ...subs],
    };
  }
}

function createOperations(apiUrl: string, operations: IOperations) {
  const http = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
  const ops = (operations as any).prototype[__KIRTAN_OPERATIONS];
  for (const funcName of Object.keys(ops)) {
    const clientOperation = (query: object, props: object) => {
      const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
      return http
        .post<any>(`${apiUrl}/${KIRTAN}/${funcName}`, body)
        .pipe(tap((r) => console.log('Kirtan Response: ', r)));
    };
    ops[funcName] = clientOperation;
  }

  return ops;
}

function createSubscriptions(apiUrl: string, subscriptions: ISubscriptions) {
  const subs = (subscriptions as any).prototype[__KIRTAN_SUBSCRIPTIONS];
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
