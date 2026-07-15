/// <reference types="jest" />
import { TestEntity } from '../data/test.entity';
import { Entity, type EntityProps } from '../../src/base/entity';

interface FallbackEntityProps extends EntityProps {
  name: string;
}

class FallbackEntity extends Entity<FallbackEntity, FallbackEntityProps> {
  constructor(props: FallbackEntityProps) {
    super(props);
  }

  get name() {
    return this.props.name;
  }
}

class ErrorOnCloneEntity extends Entity<ErrorOnCloneEntity, FallbackEntityProps> {
  constructor(props: FallbackEntityProps) {
    super(props);

    if (props.name === 'explode') {
      throw new Error('CLONE_CONSTRUCTOR_ERROR');
    }
  }
}

class UnknownErrorOnCloneEntity extends Entity<UnknownErrorOnCloneEntity, FallbackEntityProps> {
  constructor(props: FallbackEntityProps) {
    super(props);

    if (props.name === 'explode') {
      throw 'UNKNOWN_CLONE_ERROR';
    }
  }
}

describe('Entity', () => {
  describe('creation', () => {
    test('should create entity with provided id', () => {
      const providedId = '550e8400-e29b-41d4-a716-446655440000';
      const result = TestEntity.tryCreate({
        id: providedId,
        number: 42,
      });

      expect(result.isOk).toBe(true);
      expect(
        result.instance.equals(
          TestEntity.tryCreate({
            id: providedId,
            number: 999,
          }).instance,
        ),
      ).toBe(true);
    });

    test('should generate id when not provided', () => {
      const result = TestEntity.tryCreate({ number: 42 });

      expect(result.isOk).toBe(true);
    });

    test('should initialize default timestamps and deletedAt as null', () => {
      const entity = TestEntity.create({ number: 42 });

      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.deletedAt).toBeNull();
    });

    test('should keep provided timestamps and deletedAt', () => {
      const createdAt = new Date('2024-01-01T10:00:00.000Z');
      const updatedAt = new Date('2024-01-02T11:00:00.000Z');
      const deletedAt = new Date('2024-01-03T12:00:00.000Z');

      const entity = TestEntity.create({
        number: 42,
        createdAt,
        updatedAt,
        deletedAt,
      });

      expect(entity.createdAt).toBe(createdAt);
      expect(entity.updatedAt).toBe(updatedAt);
      expect(entity.deletedAt).toBe(deletedAt);
    });
  });

  describe('static create method', () => {
    test('should create instance', () => {
      const entity = TestEntity.create({ number: 42 });

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.number).toBe(42);
    });

    test('should throw when creating invalid instance', () => {
      expect(() => TestEntity.create({ number: -1 })).toThrow();
    });
  });

  describe('equality', () => {
    test('should say that instances are equal if they have the same id', () => {
      const providedId = '550e8400-e29b-41d4-a716-446655440000';
      const entity1 = TestEntity.tryCreate({
        id: providedId,
        number: 42,
      }).instance;
      const entity2 = TestEntity.tryCreate({
        id: providedId,
        number: 999,
      }).instance;

      expect(entity1.equals(entity2)).toBe(true);
    });

    test('should say that instances are different if they have different ids', () => {
      const entity1 = TestEntity.tryCreate({ number: 42 }).instance;
      const entity2 = TestEntity.tryCreate({ number: 42 }).instance;

      expect(entity1.notEquals(entity2)).toBe(true);
    });
  });

  describe('cloneWith', () => {
    test('should expose cloned props and top-level diff', () => {
      const originalEntity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440012',
        number: 1,
        obj: { nested: { a: 1 }, flat: 'before' },
      });

      const result = originalEntity.cloneProps({
        number: 2,
        obj: { nested: { b: 3 } },
      });

      expect(result.props).toEqual({
        id: originalEntity.id,
        number: 2,
        obj: {
          nested: { a: 1, b: 3 },
          flat: 'before',
        },
        createdAt: originalEntity.createdAt,
        updatedAt: originalEntity.updatedAt,
        deletedAt: null,
      });
      expect(result.diff).toEqual({
        number: {
          previous: 1,
          current: 2,
        },
        obj: {
          previous: { nested: { a: 1 }, flat: 'before' },
          current: { nested: { a: 1, b: 3 }, flat: 'before' },
        },
      });
    });

    test('should return empty diff when cloneProps has no effective changes', () => {
      const originalEntity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440013',
        number: 10,
        obj: { nested: true },
      });

      const result = originalEntity.cloneProps({
        obj: { nested: true },
      });

      expect(result.diff).toEqual({});
    });

    test('should clone the entity with new properties', () => {
      const originalEntity = TestEntity.tryCreate({
        number: 1,
        obj: { a: 1, b: 2 },
      }).instance;
      const result = originalEntity.cloneWith({
        number: 2,
        obj: { b: 3, c: 4 },
      });
      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity).not.toBe(originalEntity);
      expect(clonedEntity.number).toBe(2);
      expect(clonedEntity.obj).toEqual({ a: 1, b: 3, c: 4 });
      expect(originalEntity.number).toBe(1);
      expect(originalEntity.obj).toEqual({ a: 1, b: 2 });
    });

    test('should not modify the original entity when cloning', () => {
      const originalEntity = TestEntity.tryCreate({ number: 1 }).instance;
      originalEntity.cloneWith({ number: 2 });

      expect(originalEntity.number).toBe(1);
    });
    test('should fail when clone with invalid props', () => {
      const originalEntity = TestEntity.tryCreate({ number: 1 }).instance;
      const result = originalEntity.cloneWith({ number: -2 });

      expect(result.isFailure).toBe(true);
    });

    test('should perform deep merge for nested objects', () => {
      const originalEntity = TestEntity.tryCreate({
        number: 1,
        obj: { nested: { a: 1, b: 2 }, flat: 'test' },
      }).instance;
      const result = originalEntity.cloneWith({
        obj: { nested: { b: 3, c: 4 } },
      });

      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity.obj).toEqual({
        nested: { a: 1, b: 3, c: 4 },
        flat: 'test',
      });
      expect(originalEntity.obj).toEqual({
        nested: { a: 1, b: 2 },
        flat: 'test',
      });
    });

    test('should handle cloning with no overrides', () => {
      const originalEntity = TestEntity.tryCreate({
        number: 1,
        obj: { a: 1 },
      }).instance;
      const result = originalEntity.cloneWith({});
      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity).not.toBe(originalEntity);
      expect(clonedEntity.number).toBe(originalEntity.number);
      expect(clonedEntity.obj).toEqual(originalEntity.obj);
      expect(clonedEntity.id).toBe(originalEntity.id);
    });

    test('should keep unmodified attributes the same when cloning with partial override', () => {
      const originalId = '550e8400-e29b-41d4-a716-446655440001';
      const originalEntity = TestEntity.tryCreate({
        id: originalId,
        number: 10,
        obj: { prop: 'value' },
      }).instance;

      const result = originalEntity.cloneWith({ number: 20 });
      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity).not.toBe(originalEntity);
      expect(clonedEntity.number).toBe(20);
      expect(clonedEntity.id).toBe(originalId);
      expect(clonedEntity.obj).toEqual({ prop: 'value' });
    });

    test('should create nested object path when target key does not exist', () => {
      const originalEntity = TestEntity.create({
        number: 1,
      });

      const result = originalEntity.cloneWith({
        obj: { nested: { value: 10 } },
      });

      expect(result.isOk).toBe(true);
      expect(result.instance.obj).toEqual({ nested: { value: 10 } });
      expect(originalEntity.obj).toBeUndefined();
    });

    test('should clone using clone alias', () => {
      const originalEntity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440010',
        number: 10,
        obj: { nested: true },
      });

      const result = originalEntity.clone({ number: 99 });

      expect(result.isOk).toBe(true);
      expect(result.instance.number).toBe(99);
      expect(result.instance.id).toBe(originalEntity.id);
      expect(result.instance.obj).toEqual({ nested: true });
    });

    test('should handle undefined overrides by returning cloned entity', () => {
      const originalEntity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440011',
        number: 10,
        obj: { nested: true },
      });

      const result = originalEntity.cloneWith(undefined as any);

      expect(result.isOk).toBe(true);
      expect(result.instance).not.toBe(originalEntity);
      expect(result.instance.number).toBe(originalEntity.number);
      expect(result.instance.id).toBe(originalEntity.id);
      expect(result.instance.obj).toEqual(originalEntity.obj);
    });

    test('should clone entities without static tryCreate using constructor fallback', () => {
      const originalEntity = new FallbackEntity({
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'before',
      });

      const result = originalEntity.cloneWith({ name: 'after' });

      expect(result.isOk).toBe(true);
      expect(result.instance).toBeInstanceOf(FallbackEntity);
      expect(result.instance.id).toBe(originalEntity.id);
      expect(result.instance.name).toBe('after');
    });

    test('should return constructor error when fallback clone throws Error', () => {
      const originalEntity = new ErrorOnCloneEntity({
        id: '550e8400-e29b-41d4-a716-446655440021',
        name: 'safe',
      });

      const result = originalEntity.cloneWith({ name: 'explode' });

      expect(result.isFailure).toBe(true);
      expect(result.errors).toEqual(['CLONE_CONSTRUCTOR_ERROR']);
    });

    test('should return generic clone error when fallback clone throws unknown value', () => {
      const originalEntity = new UnknownErrorOnCloneEntity({
        id: '550e8400-e29b-41d4-a716-446655440022',
        name: 'safe',
      });

      const result = originalEntity.cloneWith({ name: 'explode' });

      expect(result.isFailure).toBe(true);
      expect(result.errors).toEqual(['ENTITY_CLONE_ERROR']);
    });
  });

  describe('array and date comparisons in diff', () => {
    test('should not include equal arrays in diff', () => {
      const entity = TestEntity.create({ number: 1, obj: [1, 2, 3] });
      const result = entity.cloneProps({});
      expect(result.diff.obj).toBeUndefined();
    });

    test('should detect element-level change in equal-length arrays', () => {
      const entity = TestEntity.create({ number: 1, obj: [1, 2, 3] });
      const result = entity.cloneProps({ obj: [1, 99, 3] });
      expect(result.diff.obj).toBeDefined();
    });

    test('should detect array length mismatch in diff', () => {
      const entity = TestEntity.create({ number: 1, obj: [1, 2, 3] });
      const result = entity.cloneProps({ obj: [1, 2] });
      expect(result.diff.obj).toBeDefined();
    });

    test('should detect type change from plain object to array in diff', () => {
      const entity = TestEntity.create({ number: 1, obj: { 0: 1, 1: 2 } });
      const result = entity.cloneProps({ obj: [1, 2] as any });
      expect(result.diff.obj).toBeDefined();
    });

    test('should not include obj in diff when it contains equal nested dates', () => {
      const date = new Date('2024-06-01T00:00:00.000Z');
      const entity = TestEntity.create({ number: 1, obj: { timestamp: date } });
      const result = entity.cloneProps({ number: 2 });
      expect(result.diff.obj).toBeUndefined();
    });

    test('should detect date change inside array in diff', () => {
      const d1 = new Date('2024-01-01T00:00:00.000Z');
      const d2 = new Date('2025-01-01T00:00:00.000Z');
      const entity = TestEntity.create({ number: 1, obj: [d1] });
      const result = entity.cloneProps({ obj: [d2] as any });
      expect(result.diff.obj).toBeDefined();
    });
  });

  describe('serialization', () => {
    test('should expose base props with toJSON', () => {
      const createdAt = new Date('2024-02-01T00:00:00.000Z');
      const updatedAt = new Date('2024-02-02T00:00:00.000Z');
      const entity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440000',
        number: 10,
        obj: { nested: true },
        createdAt,
        updatedAt,
      });

      expect(entity.toJSON()).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        number: 10,
        obj: { nested: true },
        createdAt,
        updatedAt,
        deletedAt: null,
      });
    });
  });
});
