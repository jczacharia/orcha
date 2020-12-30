import { CommonModule } from '@angular/common';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken, Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import {
  IGateway,
  IOperation,
  IOrchestration,
  ISubscription,
  KIRTAN,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  __KIRTAN_SUBSCRIPTIONS,
  __KIRTAN_GATEWAY_NAME,
  __KIRTAN_OPERATIONS,
  __KIRTAN_ORCHESTRATION_NAME,
} from '@kirtan/common';
import 'reflect-metadata';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import * as io from 'socket.io-client';
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
    orchestrations,
    gateways,
    interceptors,
  }: {
    orchestrations?: Type<IOrchestration>[];
    gateways?: Type<IGateway>[];
    interceptors?: Type<KirtanInterceptor>[];
  }): ModuleWithProviders<KirtanAngularFeatureModule> {
    const ors: Provider[] =
      orchestrations?.map(
        (o): Provider => ({
          deps: [Injector],
          provide: o,
          useFactory: (injector: Injector) => KirtanAngularModule.createOrchestration(injector, o),
        })
      ) ?? [];

    const gates =
      gateways?.map(
        (s): Provider => ({
          deps: [Injector],
          provide: s,
          useFactory: (injector: Injector) => KirtanAngularModule.createGateway(injector, s),
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
      providers: [...ors, ...gates, ...inters],
    };
  }

  static createOrchestration(injector: Injector, orchestration: Type<IOrchestration>) {
    const name = orchestration.prototype[__KIRTAN_ORCHESTRATION_NAME];
    const operations = orchestration.prototype[__KIRTAN_OPERATIONS];
    const opsKeys = Object.keys(operations);

    if (!name) {
      throw new Error(
        `No name found for orchestration with orchestration names of "${opsKeys.join(
          ', '
        )}"\nDid you remember to add @ClientOrchestration(<name here>)?`
      );
    }

    const apiUrl = injector.get(KirtanApiUrl);
    const http = injector.get(HttpClient);
    for (const funcName of opsKeys) {
      const clientOperation = (query: object, props: object) => {
        const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
        return http.post<any>(`${apiUrl}/${KIRTAN}/${name}/${funcName}`, body).pipe(first());
      };
      operations[funcName] = clientOperation;
    }
    return operations;
  }

  static createGateway(injector: Injector, gateway: Type<IGateway>) {
    const apiUrl = injector.get(KirtanApiUrl);
    const gatewayName = gateway.prototype[__KIRTAN_GATEWAY_NAME];
    const subscriptions = gateway.prototype[__KIRTAN_SUBSCRIPTIONS];
    const subKeys = Object.keys(subscriptions);

    if (subKeys.length > 0) {
      const socket = io(`${apiUrl}/${gatewayName}`);

      socket.on('exception', (d: unknown) => {
        console.error(d);
      });

      socket.on('connect', () => {
        console.log('Kirtan Websockets Connected.');
      });

      for (const funcName of subKeys) {
        const subject = new Subject<any>();

        socket.on(funcName, (d: unknown) => {
          subject.next(d);
        });

        const clientSubscription = (query: object, props: object) => {
          const body: ISubscription<object, object> = {
            [KIRTAN_DTO]: props,
            [KIRTAN_QUERY]: query,
          };
          socket.emit(funcName, body);
          return subject.asObservable();
        };

        subscriptions[funcName] = clientSubscription;
      }
    }

    return subscriptions;
  }
}
