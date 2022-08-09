import { Socket } from 'socket.io';
import { GatewaysStorage } from './subscription-storage';

describe('GatewaysStorage', () => {
  it('should trigger and respond correctly', async () => {
    const storage = new GatewaysStorage<{ id: string }, string>();
    storage['_sockets'].set('1', [
      {
        channel: 'c1',
        ids: ['updated'],
        listener: async () => [{ id: 'updated' }],
        query: { id: true },
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c2',
        ids: ['updated'],
        listener: async () => [{ id: 'updated' }, { id: 'created' }],
        query: { id: true },
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c3',
        ids: ['deleted'],
        listener: async () => [],
        query: { id: true },
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c4',
        ids: ['nothing'],
        listener: async () => [{ id: 'nothing' }],
        query: { id: true },
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c5',
        ids: ['nothing', 'updated', 'deleted'],
        listener: async () => [{ id: 'nothing' }, { id: 'updated' }, { id: 'created' }],
        query: { id: true },
        socket: { emit: jest.fn() } as unknown as Socket,
      },
    ]);
    await storage.trigger(['updated', 'created', 'deleted']);
    expect(storage['_sockets'].get('1')?.[0].socket.emit).toBeCalledWith('c1', {
      updated: [{ id: 'updated' }],
      created: [],
      deleted: [],
    });
    expect(storage['_sockets'].get('1')?.[0].ids).toEqual(['updated']);

    expect(storage['_sockets'].get('1')?.[1].socket.emit).toBeCalledWith('c2', {
      updated: [{ id: 'updated' }],
      created: [{ id: 'created' }],
      deleted: [],
    });
    expect(storage['_sockets'].get('1')?.[1].ids).toEqual(['updated', 'created']);

    expect(storage['_sockets'].get('1')?.[2].socket.emit).toBeCalledWith('c3', {
      updated: [],
      created: [],
      deleted: ['deleted'],
    });
    expect(storage['_sockets'].get('1')?.[2].ids).toEqual([]);

    expect(storage['_sockets'].get('1')?.[3].socket.emit).toBeCalledTimes(0);
    expect(storage['_sockets'].get('1')?.[3].ids).toEqual(['nothing']);

    expect(storage['_sockets'].get('1')?.[4].socket.emit).toBeCalledWith('c5', {
      updated: [{ id: 'updated' }],
      created: [{ id: 'created' }],
      deleted: ['deleted'],
    });
    expect(storage['_sockets'].get('1')?.[4].ids).toEqual(['nothing', 'updated', 'created']);
  });
});
