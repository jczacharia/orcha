import { IQueryModel } from '@orcha/common';
import { QueryValidationPipe } from './query-validation.pipe';

describe('QueryValidationPipe', () => {
  it('should allow same', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
    };
    expect(pipe.transform(queryFromClient)).toBeTruthy();
  });
  it('should not allow if not same value', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: 3,
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: true,
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra for undefined type', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: undefined,
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra for null type', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: null,
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra for {} type', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: {},
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra for false type', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: false,
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra for number type', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: 3,
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });
  it('should not allow extra for string type', () => {
    const validationQuery = {
      id: true,
    };
    const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
    const queryFromClient = {
      id: true,
      other: '',
    };
    expect(() => pipe.transform(queryFromClient)).toThrow();
  });

  describe('recurse', () => {
    it('should allow extra for recursion', () => {
      const validationQuery = {
        id: true,
        user: {
          name: true,
        },
      };
      const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
      const queryFromClient = {
        id: true,
        user: {
          name: true,
        },
      };
      expect(pipe.transform(queryFromClient)).toBeTruthy();
    });
    it('should not allow extra for non empty object type', () => {
      const validationQuery = {
        id: true,
        user: {
          name: true,
        },
      };
      const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
      const queryFromClient = {
        id: true,
        user: {
          name: true,
          age: true,
        },
      };
      expect(() => pipe.transform(queryFromClient)).toThrow();
    });
    it('should not allow if not same type', () => {
      const validationQuery = {
        id: true,
        user: {
          name: true,
        },
      };
      const pipe = new QueryValidationPipe(validationQuery as IQueryModel);
      const queryFromClient = {
        id: true,
        user: {
          name: 3,
        },
      };
      expect(() => pipe.transform(queryFromClient)).toThrow();
    });
  });
});
