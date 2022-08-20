import 'reflect-metadata';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { InjectionToken, Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import {
  IOrchestration,
  ORCHA,
  ORCHA_DTO,
  ORCHA_FILES,
  ORCHA_TOKEN,
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME,
} from '@orcha/common';
import { filter, map } from 'rxjs';
import { OrchaAuthTokenLocalStorage } from './auth-token.storage';
import { IClientOperation } from './client';

export const ORCHA_TOKEN_LOCAL_STORAGE_KEY = new InjectionToken<string>('ORCHA_TOKEN_LOCAL_STORAGE_KEY');

const ORCHA_API_URL = new InjectionToken<string>('ORCHA_API_URL');
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
export class OrchaAngularModule {
  /**
   * Initializes Orcha's core Angular functionalities.
   */
  static forRoot({
    apiUrl,
    authTokenLocalStorageKey,
  }: {
    /** The base URL of your Orcha server for HTTP requests. */
    apiUrl: string;
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
  }: {
    orchestrations?: Type<IOrchestration>[];
  }): ModuleWithProviders<OrchaAngularFeatureModule> {
    const ors: Provider[] =
      orchestrations?.map(
        (o): Provider => ({
          provide: o,
          useFactory: (injector: Injector) => OrchaAngularModule.createOrchestration(injector, o),
          deps: [Injector],
        })
      ) ?? [];

    return {
      ngModule: OrchaAngularFeatureModule,
      providers: ors,
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
      const clientOperation: IClientOperation<
        Record<string, unknown>,
        any,
        Record<string, unknown>,
        File[]
      > = (dto: Record<string, unknown>, files: File[]) => {
        const body = new FormData();

        const token = injector.get(ORCHA_TOKEN_RETRIEVER)();
        body.set(ORCHA_TOKEN, token);

        if (dto) {
          body.set(ORCHA_DTO, JSON.stringify(dto));
        }

        if (files) {
          files.forEach((file) => body.append(ORCHA_FILES, file, file.name));
        }

        const url = `${apiUrl}/${ORCHA}/${name}/${funcName}`;
        return (
          http
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .post<any>(url, body, { reportProgress: true, observe: 'events' })
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
            )
        );
      };
      operations[funcName] = clientOperation;
    }
    return operations;
  }
}
