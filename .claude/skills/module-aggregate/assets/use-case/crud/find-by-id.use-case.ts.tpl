import { Result, UseCase } from '__SHARED_PACKAGE__'
import { __AGGREGATE_CLASS_NAME__ } from '../model'
import { __AGGREGATE_REPOSITORY_NAME__ } from '../provider'

export interface Find__AGGREGATE_CLASS_NAME__ByIdInput {
  id: string
}

export class Find__AGGREGATE_CLASS_NAME__ById
  implements UseCase<Find__AGGREGATE_CLASS_NAME__ByIdInput, __AGGREGATE_CLASS_NAME__>
{
  constructor(
    private readonly __AGGREGATE_VARIABLE_NAME__Repository: __AGGREGATE_REPOSITORY_NAME__,
  ) {}

  async execute(
    input: Find__AGGREGATE_CLASS_NAME__ByIdInput,
  ): Promise<Result<__AGGREGATE_CLASS_NAME__>> {
    return this.__AGGREGATE_VARIABLE_NAME__Repository.findById(input.id)
  }
}
