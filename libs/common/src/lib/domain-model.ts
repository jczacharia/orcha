export type IDomainModel<
  Props extends Record<string, unknown>,
  Relations extends Record<string, unknown>
> = Props & Relations;
