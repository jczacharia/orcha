(globalThis as any).setImmediate = (cb: any) => setTimeout(cb(), 0);
