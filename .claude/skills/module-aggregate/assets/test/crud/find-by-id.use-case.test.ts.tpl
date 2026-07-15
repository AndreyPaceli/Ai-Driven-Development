import {
  __AGGREGATE_CLASS_NAME__,
  Find__AGGREGATE_CLASS_NAME__ById,
} from '../../src/__AGGREGATE_NAME__'
import { __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__ } from '../mock/in-memory-__AGGREGATE_NAME__.repository'

describe('Find__AGGREGATE_CLASS_NAME__ById', () => {
  test('should return the aggregate from the in-memory repository', async () => {
    const repository = new __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__()
    const useCase = new Find__AGGREGATE_CLASS_NAME__ById(repository)
    const entity = __AGGREGATE_CLASS_NAME__.create({
      id: '550e8400-e29b-41d4-a716-446655440003',
    })

    await repository.create(entity)

    const result = await useCase.execute({ id: entity.id })

    expect(result.isOk).toBe(true)
    expect(result.instance).toBe(entity)
  })
})
