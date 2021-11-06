import { Socket } from 'socket.io';
import { GatewaysStorage } from './subscription-storage';

describe('GatewaysStorage', () => {
  it('should trigger on update', async () => {
    const storage = new GatewaysStorage<{ id: string }, string>();
    storage['_sockets'].set('1', [
      {
        channel: 'c1',
        idsListeningTo: ['e1'],
        listener: async () => [{ id: 'e1' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c2',
        idsListeningTo: ['e1', 'e2'],
        listener: async () => [{ id: 'e1' }, { id: 'e2' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c3',
        idsListeningTo: ['e3'],
        listener: async () => [{ id: 'e3' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
    ]);
    await storage.trigger(['e1', 'e2']);
    expect(storage['_sockets'].get('1')?.[0].socket.emit).toBeCalledTimes(1);
    expect(storage['_sockets'].get('1')?.[0].idsListeningTo).toEqual(['e1']);

    expect(storage['_sockets'].get('1')?.[1].socket.emit).toBeCalledTimes(1);
    expect(storage['_sockets'].get('1')?.[1].idsListeningTo).toEqual(['e1', 'e2']);

    expect(storage['_sockets'].get('1')?.[2].socket.emit).toBeCalledTimes(0);
    expect(storage['_sockets'].get('1')?.[2].idsListeningTo).toEqual(['e3']);
  });
  it('should trigger on delete', async () => {
    const storage = new GatewaysStorage<{ id: string }, string>();
    storage['_sockets'].set('1', [
      {
        channel: 'c1',
        idsListeningTo: ['e1'],
        listener: async () => [],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c2',
        idsListeningTo: ['e1', 'e2'],
        listener: async () => [{ id: 'e2' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c2',
        idsListeningTo: ['e3'],
        listener: async () => [{ id: 'e3' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
    ]);
    await storage.trigger(['e1']);
    expect(storage['_sockets'].get('1')?.[0].socket.emit).toBeCalledTimes(1);
    expect(storage['_sockets'].get('1')?.[0].idsListeningTo).toEqual([]);

    expect(storage['_sockets'].get('1')?.[1].socket.emit).toBeCalledTimes(1);
    expect(storage['_sockets'].get('1')?.[1].idsListeningTo).toEqual(['e2']);

    expect(storage['_sockets'].get('1')?.[2].socket.emit).toBeCalledTimes(0);
    expect(storage['_sockets'].get('1')?.[2].idsListeningTo).toEqual(['e3']);
  });
  it('should trigger on create', async () => {
    const storage = new GatewaysStorage<{ id: string }, string>();
    storage['_sockets'].set('1', [
      {
        channel: 'c',
        idsListeningTo: ['e1'],
        listener: async () => [{ id: 'e1' }, { id: 'e3' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
      {
        channel: 'c',
        idsListeningTo: ['e1', 'e2'],
        listener: async () => [{ id: 'e1' }, { id: 'e2' }],
        query: {},
        socket: { emit: jest.fn() } as unknown as Socket,
      },
    ]);
    await storage.trigger(['e3']);
    expect(storage['_sockets'].get('1')?.[0].socket.emit).toBeCalledTimes(1);
    expect(storage['_sockets'].get('1')?.[0].idsListeningTo).toEqual(['e1', 'e3']);

    expect(storage['_sockets'].get('1')?.[1].socket.emit).toBeCalledTimes(0);
    expect(storage['_sockets'].get('1')?.[1].idsListeningTo).toEqual(['e1', 'e2']);
  });
});
