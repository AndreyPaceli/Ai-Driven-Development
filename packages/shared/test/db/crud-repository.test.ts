import { CrudRepository, Entity, EntityProps, Result } from '../../src';

interface TestProps extends EntityProps {
  name: string;
}

class TestEntity extends Entity<TestEntity, TestProps> {
  get name(): string {
    return this.props.name;
  }

  static create(props: TestProps): TestEntity {
    return new TestEntity(props);
  }
}

class InMemoryRepo implements CrudRepository<TestEntity> {
  private readonly items: TestEntity[] = [];

  async create(entity: TestEntity): Promise<Result<void>> {
    this.items.push(entity);
    return Result.ok();
  }

  async update(entity: TestEntity): Promise<Result<void>> {
    const index = this.items.findIndex((item) => item.id.equals(entity.id));

    if (index === -1) return Result.fail('NOT_FOUND');

    this.items[index] = entity;
    return Result.ok();
  }

  async findById(id: string): Promise<Result<TestEntity>> {
    const item = this.items.find((current) => current.id.value === id);

    if (!item) return Result.fail('NOT_FOUND');

    return Result.ok(item);
  }

  async delete(id: string): Promise<Result<void>> {
    const index = this.items.findIndex((item) => item.id.value === id);

    if (index === -1) return Result.fail('NOT_FOUND');

    this.items.splice(index, 1);
    return Result.ok();
  }
}

describe('CrudRepository', () => {
  test('should create, find, and delete', async () => {
    const repo = new InMemoryRepo();
    const entity = TestEntity.create({ name: 'test' });

    expect((await repo.create(entity)).isOk).toBe(true);
    expect((await repo.findById(entity.id.value)).instance.name).toBe('test');
    expect((await repo.delete(entity.id.value)).isOk).toBe(true);
  });
});
