/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { KIRTAN, KIRTAN_TOKEN, KIRTAN_DTO, KIRTAN_QUERY } from '@kirtan/common';
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
    Controller(`${KIRTAN}/${name}`)(target);
  };
}

export function ServerOperation(): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    Body(KIRTAN_QUERY)(target, propertyKey, 0);
    Body(KIRTAN_DTO)(target, propertyKey, 1);
    Body(KIRTAN_TOKEN)(target, propertyKey, 2);
    Post(propertyKey as string)(target, propertyKey, descriptor);
  };
}

export function ServerGateway(): ClassDecorator {
  return function (target: Function) {
    WebSocketGateway()(target);
  };
}

export function ServerSubscription(): MethodDecorator {
  return function <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    ConnectedSocket()(target, propertyKey, 0);
    MessageBody(KIRTAN_QUERY)(target, propertyKey, 1);
    MessageBody(KIRTAN_DTO, new ValidationPipe())(target, propertyKey, 2);
    MessageBody(KIRTAN_TOKEN)(target, propertyKey, 3);

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
