import { Result, UseCase } from '__SHARED_PACKAGE__'
import { __AGGREGATE_REPOSITORY_NAME__ } from '../provider'

export interface Delete__AGGREGATE_CLASS_NAME__Input {
  id: string
}

export class Delete__AGGREGATE_CLASS_NAME__
  implements UseCase<Delete__AGGREGATE_CLASS_NAME__Input, void>
{
  constructor(
    private readonly __AGGREGATE_VARIABLE_NAME__Repository: __AGGREGATE_REPOSITORY_NAME__,
  ) {}

  async execute(input: Delete__AGGREGATE_CLASS_NAME__Input): Promise<Result<void>> {
    return this.__AGGREGATE_VARIABLE_NAME__Repository.delete(input.id)
  }
}
