import {
  __AGGREGATE_CLASS_NAME__,
  Update__AGGREGATE_CLASS_NAME__,
} from '../../src/__AGGREGATE_NAME__'
import { __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__ } from '../mock/in-memory-__AGGREGATE_NAME__.repository'

describe('Update__AGGREGATE_CLASS_NAME__', () => {
  test('should replace the stored aggregate in the in-memory repository', async () => {
    const repository = new __AGGREGATE_IN_MEMORY_REPOSITORY_NAME__()
    const useCase = new Update__AGGREGATE_CLASS_NAME__(repository)
    const originalEntity = __AGGREGATE_CLASS_NAME__.create({
      id: '550e8400-e29b-41d4-a716-446655440001',
    })
    const updatedEntity = __AGGREGATE_CLASS_NAME__.create({
      id: '550e8400-e29b-41d4-a716-446655440001',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await repository.create(originalEntity)

    const result = await useCase.execute({ entity: updatedEntity })

    expect(result.isOk).toBe(true)

    const saved = await repository.findById(updatedEntity.id)

    expect(saved.isOk).toBe(true)
    expect(saved.instance).toBe(updatedEntity)
    expect(saved.instance).not.toBe(originalEntity)
  })
})
