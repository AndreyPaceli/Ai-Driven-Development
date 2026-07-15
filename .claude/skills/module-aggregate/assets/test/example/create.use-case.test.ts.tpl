import {
  __AGGREGATE_CLASS_NAME__,
  Create__AGGREGATE_CLASS_NAME__,
} from '../../src/__AGGREGATE_NAME__'
import { __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__ } from '../mock/in-memory-__AGGREGATE_NAME__.repository'

describe('Create__AGGREGATE_CLASS_NAME__', () => {
  test('should persist the aggregate in the in-memory repository', async () => {
    const repository = new __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__()
    const useCase = new Create__AGGREGATE_CLASS_NAME__(repository)
    const entity = __AGGREGATE_CLASS_NAME__.create({
      id: '550e8400-e29b-41d4-a716-446655440000',
    })

    const result = await useCase.execute({ entity })

    expect(result.isOk).toBe(true)

    const saved = await repository.findById(entity.id)

    expect(saved.isOk).toBe(true)
    expect(saved.instance).toBe(entity)
  })
})
