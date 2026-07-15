import { Result, UseCase } from '__SHARED_PACKAGE__'
import { __AGGREGATE_CLASS_NAME__ } from '../model'
import { __AGGREGATE_REPOSITORY_NAME__ } from '../provider'

export interface Create__AGGREGATE_CLASS_NAME__Input {
  entity: __AGGREGATE_CLASS_NAME__
}

export class Create__AGGREGATE_CLASS_NAME__
  implements UseCase<Create__AGGREGATE_CLASS_NAME__Input, void>
{
  constructor(
    private readonly __AGGREGATE_VARIABLE_NAME__Repository: __AGGREGATE_REPOSITORY_NAME__,
  ) {}

  async execute(input: Create__AGGREGATE_CLASS_NAME__Input): Promise<Result<void>> {
    return this.__AGGREGATE_VARIABLE_NAME__Repository.create(input.entity)
  }
}
