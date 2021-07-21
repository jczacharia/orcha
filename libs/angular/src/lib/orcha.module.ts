import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken, Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import {
  IGateway,
  IOrchestration,
  ISubscription,
  ORCHA,
  ORCHA_DTO,
  ORCHA_FILES,
  ORCHA_QUERY,
  ORCHA_TOKEN,
  __ORCHA_GATEWAY_NAME,
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME,
  __ORCHA_SUBSCRIPTIONS,
} from '@orcha/common';
import 'reflect-metadata';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as io from 'socket.io-client';
import { createOrchaInterceptorFilter, OrchaInterceptor } from './orcha.interceptor';

const OrchaApiUrl = new InjectionToken<string>('OrchaApiUrl');

@NgModule({})
export class OrchaAngularRootModule {}

@NgModule({})
export class OrchaAngularFeatureModule {
  // Forces Root module to be create before feature module.
  constructor(protected readonly root: OrchaAngularRootModule) {}
}

/**
 * Module that imports Orcha Angular functionalities.
 */
@NgModule({
  imports: [CommonModule],
})
export class OrchaModule {
  /**
   * Initializes Orcha's core Angular functionalities.
   * @param apiUrl The base URL of your Orca server.
   */
  static forRoot(apiUrl: string): ModuleWithProviders<OrchaAngularRootModule> {
    return {
      ngModule: OrchaAngularRootModule,
      providers: [
        {
          provide: OrchaApiUrl,
          useValue: apiUrl,
        },
      ],
    };
  }

  /**
   * Creates an Orcha feature by grouping relevant orchestrations, gateways, and interceptors.
   */
  static forFeature({
    orchestrations,
    gateways,
    interceptors,
  }: {
    orchestrations?: Type<IOrchestration>[];
    gateways?: Type<IGateway>[];
    interceptors?: Type<OrchaInterceptor>[];
  }): ModuleWithProviders<OrchaAngularFeatureModule> {
    const ors: Provider[] =
      orchestrations?.map(
        (o): Provider => ({
          deps: [Injector],
          provide: o,
          useFactory: (injector: Injector) => OrchaModule.createOrchestration(injector, o),
        })
      ) ?? [];

    const gates =
      gateways?.map(
        (s): Provider => ({
          deps: [Injector],
          provide: s,
          useFactory: (injector: Injector) => OrchaModule.createGateway(injector, s),
        })
      ) ?? [];

    const inters =
      interceptors?.map(
        (i): Provider => ({
          provide: HTTP_INTERCEPTORS,
          useClass: createOrchaInterceptorFilter(i),
          multi: true,
        })
      ) ?? [];

    return {
      ngModule: OrchaAngularFeatureModule,
      providers: [...ors, ...gates, ...inters],
    };
  }

  static createOrchestration(injector: Injector, orchestration: Type<IOrchestration>) {
    const name = orchestration.prototype[__ORCHA_ORCHESTRATION_NAME];
    const operations = orchestration.prototype[__ORCHA_OPERATIONS];
    const opsKeys = Object.keys(operations);

    if (!name) {
      throw new Error(
        `No name found for orchestration with orchestration names of "${opsKeys.join(
          ', '
        )}"\nDid you remember to add @ClientOrchestration(<name here>)?`
      );
    }

    const apiUrl = injector.get(OrchaApiUrl);
    const http = injector.get(HttpClient);
    for (const funcName of opsKeys) {
      const clientOperation = (query: unknown, dto: unknown, files?: File | File[]) => {
        const body = new FormData();

        body.set(ORCHA_QUERY, JSON.stringify(query));
        body.set(ORCHA_DTO, JSON.stringify(dto));

        if (Array.isArray(files)) {
          files.forEach((file) => body.append(ORCHA_FILES, file, file.name));
        } else if (files) {
          body.set(ORCHA_FILES, files, files.name);
        }

        return http
          .post<unknown>(`${apiUrl}/${ORCHA}/${name}/${funcName}`, body, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            filter((event) => {
              if (files) {
                return true;
              }
              return event.type === HttpEventType.Response;
            }),
            map((event) => {
              switch (event.type) {
                case HttpEventType.UploadProgress:
                  return { ...event, progress: Math.round((100 * event.loaded) / (event.total ?? 1)) };

                case HttpEventType.Response:
                  if (files) {
                    return event;
                  }
                  return event.body;
              }
            }),
            filter((e) => !!e)
          );
      };
      operations[funcName] = clientOperation;
    }
    return operations;
  }

  static createGateway(injector: Injector, gateway: Type<IGateway>) {
    const apiUrl = injector.get(OrchaApiUrl);
    const gatewayName = gateway.prototype[__ORCHA_GATEWAY_NAME];
    const subscriptions = gateway.prototype[__ORCHA_SUBSCRIPTIONS];
    const subKeys = Object.keys(subscriptions);

    if (subKeys.length > 0) {
      const socket = io(`${apiUrl}/${gatewayName}`);

      socket.on('exception', (d: unknown) => {
        console.error(d);
      });

      socket.on('connect', () => {
        console.log('Orcha Websockets Connected.');
      });

      for (const funcName of subKeys) {
        const subject = new Subject<unknown>();

        socket.on(funcName, (d: unknown) => {
          subject.next(d);
        });

        const clientSubscription = (query: Record<string, unknown>, props: unknown) => {
          const body: ISubscription<unknown, any> = {
            [ORCHA_DTO]: props,
            [ORCHA_QUERY]: query,
            [ORCHA_TOKEN]: '',
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
