export const ORCHA = 'orcha' as const;
export const ORCHA_ID = 'id' as const;

export enum OrchaProps {
  DTO = 'dto',
  TOKEN = 'token',
  QUERY = 'query',
  OPTIONS = 'options',
  FILE = 'file',
  FILES = 'files',
  PAGINATE = 'paginate',
}

export enum OrchaMetadata {
  CONTROLLER_NAME = 'controller-name',
  CONTROLLER_METHODS = 'controller-methods',
  OPERATION_TYPE_KEY = 'type',
}

export type OrchaOperationType =
  | 'simple'
  | 'paginate'
  | 'query'
  | 'file-upload'
  | 'files-upload'
  | 'event'
  | 'file-download';
