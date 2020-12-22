import { KIRTAN, KIRTAN_DTO, KIRTAN_QUERY } from '@kirtan/common';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ValidationPipe } from '../pipes';

export function ServerOperations(name: string | number): ClassDecorator {
  return function (target: Function) {
    Controller(`${KIRTAN}/${name}`)(target);
  };
}

export function ServerOperation(): MethodDecorator {
  return function <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    Body(KIRTAN_QUERY)(target, propertyKey, 0);
    Body(KIRTAN_DTO)(target, propertyKey, 1);
    Post(propertyKey as string)(target, propertyKey, descriptor);
  };
}

export function ServerSubscriptions(): ClassDecorator {
  return function (target: Function) {
    WebSocketGateway()(target);
  };
}

export function ServerSubscription(): MethodDecorator {
  return function <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
    ConnectedSocket()(target, propertyKey, 0);
    MessageBody(KIRTAN_QUERY)(target, propertyKey, 1);
    MessageBody(KIRTAN_DTO, new ValidationPipe())(target, propertyKey, 2);

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
