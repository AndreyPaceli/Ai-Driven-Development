export interface MetadataProps {
  module?: string | null;
  object?: string | null;
  attribute?: string | null;
  value?: any;
  id?: string | null;
}

export class Metadata {
  constructor(readonly props: MetadataProps) {}

  get module(): string | null | undefined {
    return this.props.module;
  }

  get object(): string | null | undefined {
    return this.props.object;
  }

  get attribute(): string | null | undefined {
    return this.props.attribute;
  }

  get value(): any {
    return this.props.value!;
  }

  get id(): string | null | undefined {
    return this.props.id;
  }

  withModule(module?: string | null): Metadata {
    return new Metadata({
      ...this.props,
      module,
    });
  }

  withObject(object?: string | null): Metadata {
    return new Metadata({
      ...this.props,
      object,
    });
  }

  withAttribute(attribute?: string | null): Metadata {
    return new Metadata({
      ...this.props,
      attribute,
    });
  }

  withValue(value?: any): Metadata {
    return new Metadata({
      ...this.props,
      value,
    });
  }

  withId(id?: string | null): Metadata {
    return new Metadata({
      ...this.props,
      id,
    });
  }

  to(attribute: string, value?: any): Metadata {
    return new Metadata({
      ...this.props,
      attribute,
      value: value ?? this.props.value,
    });
  }
}
