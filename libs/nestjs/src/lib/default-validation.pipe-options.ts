import { BadRequestException, ValidationError, ValidationPipeOptions } from '@nestjs/common';

export const defaultValidationPipeOptions: ValidationPipeOptions = {
  transform: true,
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const errorStr = validationErrors
      .map((err) => {
        const errors: string[] = [];
        const recurse = ({ constraints, children }: ValidationError) => {
          if (constraints) {
            for (const constraint of Object.values(constraints)) {
              errors.push(constraint);
            }
          }
          if (!children) {
            return;
          }
          for (const child of children) {
            recurse(child);
          }
        };
        recurse(err);
        return errors;
      })
      .filter((v) => v.length > 0)
      .flat()
      .join(', ');
    return new BadRequestException(`Validation failed: ${errorStr}`);
  },
};
