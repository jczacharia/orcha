import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
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
import io, { Socket } from 'socket.io-client';
import { OrchaAuthTokenLocalStorage } from './auth-token.storage';

export const ORCHA_TOKEN_LOCAL_STORAGE_KEY = new InjectionToken<string>('ORCHA_TOKEN_LOCAL_STORAGE_KEY');

const ORCHA_API_URL = new InjectionToken<string>('ORCHA_API_URL');
const ORCHA_WS_URL = new InjectionToken<string>('ORCHA_WS_URL');
const ORCHA_TOKEN_RETRIEVER = new InjectionToken<() => string>('ORCHA_TOKEN_RETRIEVER');

export function __getAuthTokenFactory(storage: OrchaAuthTokenLocalStorage) {
  const getToken = () => storage.getToken();
  return getToken;
}

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
  static socket: Socket | null = null;

  /**
   * Initializes Orcha's core Angular functionalities.
   */
  static forRoot({
    apiUrl,
    wsUrl,
    authTokenLocalStorageKey,
  }: {
    /** The base URL of your Orcha server for HTTP requests. */
    apiUrl: string;
    /** The base URL of your Orcha server for Websocket requests. */
    wsUrl: string;
    /** Unique key name of where your auth token is stored in local storage. */
    authTokenLocalStorageKey: string;
  }): ModuleWithProviders<OrchaAngularRootModule> {
    return {
      ngModule: OrchaAngularRootModule,
      providers: [
        OrchaAuthTokenLocalStorage,
        {
          provide: ORCHA_API_URL,
          useValue: apiUrl,
        },
        {
          provide: ORCHA_WS_URL,
          useValue: wsUrl,
        },
        {
          provide: ORCHA_TOKEN_LOCAL_STORAGE_KEY,
          useValue: authTokenLocalStorageKey,
        },
        {
          provide: ORCHA_TOKEN_RETRIEVER,
          deps: [OrchaAuthTokenLocalStorage],
          useFactory: __getAuthTokenFactory,
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
  }: {
    orchestrations?: Type<IOrchestration>[];
    gateways?: Type<IGateway>[];
  }): ModuleWithProviders<OrchaAngularFeatureModule> {
    const ors: Provider[] =
      orchestrations?.map(
        (o): Provider => ({
          provide: o,
          useFactory: (injector: Injector) => OrchaModule.createOrchestration(injector, o),
          deps: [Injector],
        })
      ) ?? [];

    const gates =
      gateways?.map(
        (s): Provider => ({
          provide: s,
          useFactory: (injector: Injector) => OrchaModule.createGateway(injector, s),
          deps: [Injector],
        })
      ) ?? [];

    return {
      ngModule: OrchaAngularFeatureModule,
      providers: [...ors, ...gates],
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

    const apiUrl = injector.get(ORCHA_API_URL);
    const http = injector.get(HttpClient);
    for (const funcName of opsKeys) {
      const clientOperation = (query: unknown, dto: unknown, files?: File | File[]) => {
        const body = new FormData();
        const token = injector.get(ORCHA_TOKEN_RETRIEVER)();

        body.set(ORCHA_QUERY, JSON.stringify(query));
        body.set(ORCHA_DTO, JSON.stringify(dto));
        body.set(ORCHA_TOKEN, token);

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
    const wsUrl = injector.get(ORCHA_WS_URL);
    const gatewayName = gateway.prototype[__ORCHA_GATEWAY_NAME];
    const subscriptions = gateway.prototype[__ORCHA_SUBSCRIPTIONS];
    const subKeys = Object.keys(subscriptions);

    if (subKeys.length > 0) {
      const socket = io(`${wsUrl}/${gatewayName}`);

      socket.on('exception', (d: unknown) => {
        console.error(d);
      });

      socket.on('connect', () => {
        console.log('Orcha Websockets Connected.');
      });

      for (const funcName of subKeys) {
        const subject = new Subject<unknown>();

        socket.on(funcName, (d: unknown) => {
          console.log('got next');
          subject.next(d);
        });

        const clientSubscription = (query: Record<string, unknown>, props: unknown) => {
          const token = injector.get(ORCHA_TOKEN_RETRIEVER)();
          const body: ISubscription<unknown, any> = {
            [ORCHA_DTO]: props,
            [ORCHA_QUERY]: query,
            [ORCHA_TOKEN]: token,
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
