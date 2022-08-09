import 'reflect-metadata';
import 'jest-preset-angular/setup-jest';

(globalThis as any).setImmediate = (cb: any) => setTimeout(cb(), 0);
