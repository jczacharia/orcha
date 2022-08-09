import { createMikroOrmRelationsArray } from './relations.transform';

describe('relations transformer', () => {
  it('1', () => {
    expect(
      createMikroOrmRelationsArray({
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
    ).toStrictEqual({
      populate: ['d', 'd.1', 'c', 'c.1', 'c.2', 'c.3'],
      fields: ['rootProp1', 'rootProp2', 'd.dProp1', 'c.1.c1Prop'],
    });
  });
  it('2', () => {
    expect(
      createMikroOrmRelationsArray({
        d: {},
        c: {
          1: {},
          2: {},
        },
      } as any)
    ).toStrictEqual(['d', 'c', 'c.1', 'c.2'].sort());
  });
});
