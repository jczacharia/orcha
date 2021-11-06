/* eslint-disable @typescript-eslint/no-explicit-any */
import { IExactQuery, IPagination, parseQuery } from '@orcha/common';
import { Socket } from 'socket.io';

type ListenerResult<Entity> = Entity | Entity[] | IPagination<Entity>;

interface Subscription<Entity, IdType> {
  channel: string;
  socket: Socket;
  listener: () => Promise<ListenerResult<Entity>>;
  query: IExactQuery<Entity, unknown>;
  idsListeningTo: IdType[];
}

export class GatewaysStorage<Entity extends { id: IdType }, IdType> {
  private readonly _sockets = new Map<string, Subscription<Entity, IdType>[]>();

  async provisionSubscription(subscription: Omit<Subscription<Entity, IdType>, 'idsListeningTo'>) {
    const res = await subscription.listener();
    const ids: IdType[] = this._getIds(res);
    const newSub: Subscription<Entity, IdType> = { ...subscription, idsListeningTo: ids };
    return this._addSubscription(newSub, res);
  }

  removeListener(socket: Socket) {
    return this._sockets.delete(socket.id);
  }

  /**
   * Only trigger subscribers who are watching Entities of ids.
   */
  async trigger(id: IdType | IdType[]) {
    const triggeredIds = Array.isArray(id) ? id : [id];
    for (const socket of this._sockets.values()) {
      for (const subscription of socket) {
        const currentDbQueryState = await subscription.listener();
        const updatedIds = this._getIds(currentDbQueryState);

        const wasDeletedOrAdded = subscription.idsListeningTo.length !== updatedIds.length;
        if (wasDeletedOrAdded) {
          subscription.socket.emit(subscription.channel, parseQuery(subscription.query, currentDbQueryState));
          // Update new ids to listen to. (Used to tell if entities have been added or deleted.)
          subscription.idsListeningTo = updatedIds;
          continue;
        }

        const wasUpdated = triggeredIds.some((t) => updatedIds.includes(t));
        if (wasUpdated) {
          subscription.socket.emit(subscription.channel, parseQuery(subscription.query, currentDbQueryState));
        }
      }
    }
  }

  private async _addSubscription(newSub: Subscription<Entity, IdType>, result: ListenerResult<Entity>) {
    let subscriptions = this._sockets.get(newSub.socket.id);
    if (subscriptions) {
      // Replace client subscriptions that are on the same channel.
      subscriptions = subscriptions.filter((sub) => sub.channel !== newSub.channel);
      subscriptions.push(newSub);
      this._sockets.set(newSub.socket.id, subscriptions);
    } else {
      this._sockets.set(newSub.socket.id, [newSub]);
    }
    newSub.socket.emit(newSub.channel, parseQuery(newSub.query, result));
  }

  private _getIds(res: Entity | Entity[] | IPagination<Entity>) {
    const ids: IdType[] = [];
    if ('items' in res && 'meta' in res) {
      ids.push(...res.items.map((i) => i.id));
    } else if (Array.isArray(res)) {
      ids.push(...res.map((i) => i.id));
    } else {
      ids.push(res.id);
    }
    return ids;
  }
}
