import { createMikroOrmPopulateArray } from './populate-transform';

describe('populate transformer', () => {
  it('1', () => {
    expect(
      createMikroOrmPopulateArray({
        rootProp1: true,
        rootProp2: true,
        d: {
          dProp1: true,
          1: {},
        },
        c: {
          1: {
            c1Prop: true,
          },
          2: {},
          3: {},
        },
      } as any)
    ).toStrictEqual(['d', 'd.1', 'c', 'c.1', 'c.2', 'c.3']);
  });
  it('2', () => {
    expect(
      createMikroOrmPopulateArray({
        d: {},
        c: {
          1: {},
          2: {},
        },
      } as any)
    ).toStrictEqual(['d', 'c', 'c.1', 'c.2']);
  });
});
