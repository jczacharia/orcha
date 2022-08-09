import { IExactQuery, IParseUndefined, IQuery, ISubscriptionResult, parseQuery } from '@orcha/common';
import { Socket } from 'socket.io';

interface Subscription<T, Q extends IQuery<T>, IdType> {
  channel: string;
  socket: Socket;
  listener: () => Promise<T[]>;
  query: IExactQuery<T, Q>;
  ids: IdType[];
}

export class GatewaysStorage<T extends { id: IdType }, IdType> {
  private readonly _sockets = new Map<string, Subscription<T, IQuery<T>, IdType>[]>();

  async provisionSubscription<Q extends IQuery<T>>(subscription: Omit<Subscription<T, Q, IdType>, 'ids'>) {
    let subscriptions = this._sockets.get(subscription.socket.id);
    const res = await subscription.listener();

    const newSub: Subscription<T, Q, IdType> = { ...subscription, ids: res.map((i) => i.id) };

    if (subscriptions) {
      // Replace client subscriptions that are on the same channel.
      subscriptions = subscriptions.filter((sub) => sub.channel !== subscription.channel);
      subscriptions.push(newSub);
      this._sockets.set(subscription.socket.id, subscriptions);
    } else {
      this._sockets.set(subscription.socket.id, [newSub]);
    }

    const response: ISubscriptionResult<T, Q, IdType> = {
      created: parseQuery(newSub.query, res),
      updated: [],
      deleted: [],
    };

    subscription.socket.emit(subscription.channel, response);
  }

  removeListener(socket: Socket) {
    return this._sockets.delete(socket.id);
  }

  /**
   * Only trigger subscribers who are watching Entities of ids.
   */
  async trigger(id: IdType | IdType[]) {
    const triggeredIds = Array.isArray(id) ? id : [id];
    const updates = Array.from(this._sockets.values())
      .map((socket) => socket.map((s) => this._filterOnlyUpdatedEntities(triggeredIds, s)))
      .flat();
    await Promise.all(updates);
  }

  private async _filterOnlyUpdatedEntities<Q extends IQuery<T>>(
    triggeredIds: IdType[],
    sub: Subscription<T, Q, IdType>
  ) {
    const currentDbQueryState = await sub.listener();
    const updatedIds = currentDbQueryState.map((r) => r.id);

    const response: ISubscriptionResult<T, Q, IdType> = {
      created: [],
      updated: [],
      deleted: triggeredIds.filter(
        (triggeredId) => !updatedIds.includes(triggeredId) && sub.ids.includes(triggeredId)
      ),
    };

    for (const item of currentDbQueryState) {
      if (!sub.ids.includes(item.id)) {
        response.created.push(parseQuery(sub.query, item) as IParseUndefined<T, Q>); // TODO `as`
      } else if (triggeredIds.includes(item.id)) {
        response.updated.push(parseQuery(sub.query, item) as IParseUndefined<T, Q>); // TODO `as`
      }
    }

    if (response.created.length > 0 || response.updated.length > 0 || response.deleted.length > 0) {
      this._emit(sub, response);
    }

    sub.ids = updatedIds;
  }

  private _emit<Q extends IQuery<T>>(
    sub: Subscription<T, Q, IdType>,
    response: ISubscriptionResult<T, Q, IdType>
  ) {
    sub.socket.emit(sub.channel, response);
  }
}
