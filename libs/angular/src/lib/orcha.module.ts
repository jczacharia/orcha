import 'reflect-metadata';

import { CommonModule } from '@angular/common';
import { Injector, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { IController, ORCHA, OrchaMetadata, OrchaOperationType } from '@orcha/common';
import { OrchaAuthTokenLocalStorage } from './auth-token.storage';
import {
  createOperationEventSubscriber,
  createOperationFileDownload,
  createOperationFilesUpload,
  createOperationFileUpload,
  createOperationPaginate,
  createOperationQuery,
  createOperationSimple,
} from './operation-types';
import { ORCHA_API_URL, ORCHA_TOKEN_LOCAL_STORAGE_KEY, ORCHA_TOKEN_RETRIEVER } from './tokens';

export function authTokenFactory(storage: OrchaAuthTokenLocalStorage) {
  const getToken = () => storage.getToken() || '';
  return getToken;
}

@NgModule({})
export class OrchaRootModule {}

@NgModule({})
export class OrchaFeatureModule {
  // Forces Root module to be create before feature module.
  constructor(protected readonly root: OrchaRootModule) {}
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
   */
  static forRoot({
    apiUrl,
    authTokenLocalStorageKey,
  }: {
    /** The base URL of your Orcha server for HTTP requests. */
    apiUrl: string;
    /** Unique key name of where your auth token is stored in local storage. */
    authTokenLocalStorageKey: string;
  }): ModuleWithProviders<OrchaRootModule> {
    return {
      ngModule: OrchaRootModule,
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
          useFactory: authTokenFactory,
        },
      ],
    };
  }

  /**
   * Creates an Orcha feature by grouping relevant controllers.
   */
  static forFeature(options: { controllers?: Type<IController>[] }): ModuleWithProviders<OrchaFeatureModule> {
    const controllers =
      options.controllers?.map(
        (controller): Provider => ({
          provide: controller,
          deps: [Injector],
          useFactory: (injector: Injector) => OrchaModule.createController(controller, injector),
        })
      ) ?? [];

    return {
      ngModule: OrchaFeatureModule,
      providers: controllers,
    };
  }

  static createController(controller: Type<IController>, injector: Injector) {
    const controllerName = controller.prototype[OrchaMetadata.CONTROLLER_NAME];
    const controllerMethods = controller.prototype[OrchaMetadata.CONTROLLER_METHODS];
    const controllerMethodEntries = Object.entries(controllerMethods) as [string, OrchaOperationType][];

    if (!controllerName) {
      throw new Error(
        `No name found for controller with controller names of "${controllerMethodEntries.join(
          ', '
        )}"\nDid you remember to add @ClientController(<controller name here>)?`
      );
    }

    const apiUrl = injector.get(ORCHA_API_URL);

    for (const [methodName, type] of controllerMethodEntries) {
      const url = `${apiUrl}/${ORCHA}/${controllerName}/${methodName}`;

      switch (type) {
        case 'simple':
          controllerMethods[methodName] = createOperationSimple(url, injector);
          break;

        case 'file-upload':
          controllerMethods[methodName] = createOperationFileUpload(url, injector);
          break;

        case 'files-upload':
          controllerMethods[methodName] = createOperationFilesUpload(url, injector);
          break;

        case 'paginate':
          controllerMethods[methodName] = createOperationPaginate(url, injector);
          break;

        case 'event':
          controllerMethods[methodName] = createOperationEventSubscriber(url, injector);
          break;

        case 'query':
          controllerMethods[methodName] = createOperationQuery(url, injector);
          break;

        case 'file-download':
          controllerMethods[methodName] = createOperationFileDownload(url, injector);
          break;
      }
    }

    return controllerMethods;
  }
}
