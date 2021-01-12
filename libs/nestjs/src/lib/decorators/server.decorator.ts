/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { ORCHESTRA, ORCHESTRA_DTO, ORCHESTRA_QUERY, ORCHESTRA_TOKEN } from '@orchestra/common';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ValidationPipe } from '../pipes';

export function ServerOrchestration(name: string | number): ClassDecorator {
  return function (target: Function) {
    if (!name) throw new Error('No orchestration name provided for @ServerOrchestration');
    Controller(`${ORCHESTRA}/${name}`)(target);
  };
}

export function ServerOperation(): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    Body(ORCHESTRA_QUERY)(target, propertyKey, 0);
    Body(ORCHESTRA_DTO, new ValidationPipe())(target, propertyKey, 1);
    Body(ORCHESTRA_TOKEN)(target, propertyKey, 2);
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
