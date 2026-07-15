import { Entity, EntityProps } from '__SHARED_PACKAGE__'

export interface __AGGREGATE_CLASS_NAME__Props extends EntityProps {}

export class __AGGREGATE_CLASS_NAME__ extends Entity<
  __AGGREGATE_CLASS_NAME__,
  __AGGREGATE_CLASS_NAME__Props
> {
  private constructor(props: __AGGREGATE_CLASS_NAME__Props) {
    super(props)
  }

  static create(props: __AGGREGATE_CLASS_NAME__Props): __AGGREGATE_CLASS_NAME__ {
    return new __AGGREGATE_CLASS_NAME__(props)
  }
}
