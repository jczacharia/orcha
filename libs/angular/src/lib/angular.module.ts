import { CommonModule } from '@angular/common';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken, Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import {
  IGateway,
  IOperation,
  IOrchestration,
  ISubscription,
  ORCHESTRA,
  ORCHESTRA_DTO,
  ORCHESTRA_QUERY,
  __ORCHESTRA_SUBSCRIPTIONS,
  __ORCHESTRA_GATEWAY_NAME,
  __ORCHESTRA_OPERATIONS,
  __ORCHESTRA_ORCHESTRATION_NAME,
} from '@orchestra/common';
import 'reflect-metadata';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import * as io from 'socket.io-client';
import { createOrchestraInterceptorFilter, OrchestraInterceptor } from './orchestra.interceptor';

const OrchestraApiUrl = new InjectionToken<string>('OrchestraApiUrl');

@NgModule({})
export class OrchestraAngularRootModule {}

@NgModule({})
export class OrchestraAngularFeatureModule {
  // Forces Root module to be create before feature module.
  constructor(protected readonly root: OrchestraAngularRootModule) {}
}

@NgModule({
  imports: [CommonModule],
})
export class OrchestraAngularModule {
  static forRoot(apiUrl: string): ModuleWithProviders<OrchestraAngularRootModule> {
    return {
      ngModule: OrchestraAngularRootModule,
      providers: [
        {
          provide: OrchestraApiUrl,
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
    interceptors?: Type<OrchestraInterceptor>[];
  }): ModuleWithProviders<OrchestraAngularFeatureModule> {
    const ors: Provider[] =
      orchestrations?.map(
        (o): Provider => ({
          deps: [Injector],
          provide: o,
          useFactory: (injector: Injector) => OrchestraAngularModule.createOrchestration(injector, o),
        })
      ) ?? [];

    const gates =
      gateways?.map(
        (s): Provider => ({
          deps: [Injector],
          provide: s,
          useFactory: (injector: Injector) => OrchestraAngularModule.createGateway(injector, s),
        })
      ) ?? [];

    const inters =
      interceptors?.map(
        (i): Provider => ({
          provide: HTTP_INTERCEPTORS,
          useClass: createOrchestraInterceptorFilter(i),
          multi: true,
        })
      ) ?? [];

    return {
      ngModule: OrchestraAngularFeatureModule,
      providers: [...ors, ...gates, ...inters],
    };
  }

  static createOrchestration(injector: Injector, orchestration: Type<IOrchestration>) {
    const name = orchestration.prototype[__ORCHESTRA_ORCHESTRATION_NAME];
    const operations = orchestration.prototype[__ORCHESTRA_OPERATIONS];
    const opsKeys = Object.keys(operations);

    if (!name) {
      throw new Error(
        `No name found for orchestration with orchestration names of "${opsKeys.join(
          ', '
        )}"\nDid you remember to add @ClientOrchestration(<name here>)?`
      );
    }

    const apiUrl = injector.get(OrchestraApiUrl);
    const http = injector.get(HttpClient);
    for (const funcName of opsKeys) {
      const clientOperation = (query: object, props: object) => {
        const body: IOperation<object, object> = { [ORCHESTRA_DTO]: props, [ORCHESTRA_QUERY]: query };
        return http.post<any>(`${apiUrl}/${ORCHESTRA}/${name}/${funcName}`, body).pipe(first());
      };
      operations[funcName] = clientOperation;
    }
    return operations;
  }

  static createGateway(injector: Injector, gateway: Type<IGateway>) {
    const apiUrl = injector.get(OrchestraApiUrl);
    const gatewayName = gateway.prototype[__ORCHESTRA_GATEWAY_NAME];
    const subscriptions = gateway.prototype[__ORCHESTRA_SUBSCRIPTIONS];
    const subKeys = Object.keys(subscriptions);

    if (subKeys.length > 0) {
      const socket = io(`${apiUrl}/${gatewayName}`);

      socket.on('exception', (d: unknown) => {
        console.error(d);
      });

      socket.on('connect', () => {
        console.log('Orchestra Websockets Connected.');
      });

      for (const funcName of subKeys) {
        const subject = new Subject<any>();

        socket.on(funcName, (d: unknown) => {
          subject.next(d);
        });

        const clientSubscription = (query: object, props: object) => {
          const body: ISubscription<object, object> = {
            [ORCHESTRA_DTO]: props,
            [ORCHESTRA_QUERY]: query,
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
