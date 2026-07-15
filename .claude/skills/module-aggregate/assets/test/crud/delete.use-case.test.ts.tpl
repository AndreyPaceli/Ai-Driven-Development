import {
  __AGGREGATE_CLASS_NAME__,
  Delete__AGGREGATE_CLASS_NAME__,
} from '../../src/__AGGREGATE_NAME__'
import { __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__ } from '../mock/in-memory-__AGGREGATE_NAME__.repository'

describe('Delete__AGGREGATE_CLASS_NAME__', () => {
  test('should remove the aggregate from the in-memory repository', async () => {
    const repository = new __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__()
    const useCase = new Delete__AGGREGATE_CLASS_NAME__(repository)
    const entity = __AGGREGATE_CLASS_NAME__.create({
      id: '550e8400-e29b-41d4-a716-446655440002',
    })

    await repository.create(entity)

    const result = await useCase.execute({ id: entity.id })

    expect(result.isOk).toBe(true)

    const saved = await repository.findById(entity.id)

    expect(saved.isFailure).toBe(true)
    expect(saved.errors).toContain('ENTITY_NOT_FOUND')
  })
})
