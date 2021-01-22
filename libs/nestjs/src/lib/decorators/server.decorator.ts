/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ORCHESTRA, ORCHESTRA_DTO, ORCHESTRA_FILES, ORCHESTRA_QUERY, ORCHESTRA_TOKEN } from '@orcha/common';
import { ValidationPipe } from '../pipes';

export function ServerOrchestration(name: string | number): ClassDecorator {
  return function (target: Function) {
    if (!name) throw new Error('No orchestration name provided for @ServerOrchestration');
    Controller(`${ORCHESTRA}/${name}`)(target);
  };
}

function transform(val: string) {
  try {
    return JSON.parse(val);
  } catch (error) {
    return undefined;
  }
}

export function ServerOperation(
  options: {
    /** File(s) to upload. Defaults to `singular`. */
    fileUpload?: 'singular' | 'multiple';
  } = { fileUpload: 'singular' }
): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    Body(ORCHESTRA_QUERY, { transform })(target, propertyKey, 0);
    Body(ORCHESTRA_TOKEN)(target, propertyKey, 1);
    Body(ORCHESTRA_DTO, { transform }, new ValidationPipe())(target, propertyKey, 2);

    if (options?.fileUpload === 'singular') {
      UploadedFile()(target, propertyKey, 3);
      UseInterceptors(FileInterceptor(ORCHESTRA_FILES))(target, propertyKey, descriptor);
    } else {
      UploadedFiles()(target, propertyKey, 3);
      UseInterceptors(FilesInterceptor(ORCHESTRA_FILES))(target, propertyKey, descriptor);
    }

    Post(propertyKey as string)(target, propertyKey, descriptor);
  };
}

export function ServerGateway(name: string): ClassDecorator {
  return function (target: Function) {
    WebSocketGateway({ namespace: name })(target);
  };
}

export function ServerSubscription(): MethodDecorator {
  return function <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    ConnectedSocket()(target, propertyKey, 0);
    // TODO
    // MessageBody(ORCHESTRA_QUERY)(target, propertyKey, 1);
    // MessageBody(ORCHESTRA_DTO, new ValidationPipe())(target, propertyKey, 2);
    // MessageBody(ORCHESTRA_TOKEN)(target, propertyKey, 3);
    MessageBody()(target, propertyKey, 1);
    MessageBody()(target, propertyKey, 2);
    MessageBody()(target, propertyKey, 3);

    const original = descriptor.value;
    if (original) {
      (descriptor as any).value = async function (...args: any[]) {
        try {
          return await (original as any).apply(this, args);
        } catch (error) {
          throw new WsException(error.message);
        }
      };
    }

    SubscribeMessage(propertyKey as string)(target, propertyKey, descriptor);
    return descriptor;
  };
}
