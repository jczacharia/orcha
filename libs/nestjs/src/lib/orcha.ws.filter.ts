import { ArgumentsHost, Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { OrchaSubscriptionError, subscriptionChannelErrorRoute } from '@orcha/common';
import { Socket } from 'socket.io';

@Catch()
export class OrchaSubscriptionErrorFilter implements WsExceptionFilter {
  channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  catch(exception: WsException, host: ArgumentsHost): void {
    const ctx = host.switchToWs();
    const socket: Socket = ctx.getClient();

    const errorChannel = subscriptionChannelErrorRoute(this.channel);

    const errorResponse: OrchaSubscriptionError = {
      timestamp: new Date().toISOString(),
      channel: errorChannel,
      message: exception.message,
    };

    console.error(errorChannel, errorResponse);

    socket.emit(errorChannel, errorResponse);
  }
}
