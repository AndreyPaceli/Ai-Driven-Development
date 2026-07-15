export class ResultError extends Error {
  readonly errors: string[];

  constructor(error: string | string[]) {
    const errors = Array.isArray(error) ? error : [error];
    super(errors.join(', '));
    this.name = 'ResultError';
    this.errors = errors;
  }
}
