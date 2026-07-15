import { Message } from './message';

export class ValidationError extends Error {
  readonly messages: Message[];
  readonly status: number;

  constructor(messages: Message | Message[], status: number = 400) {
    super(ValidationError.getCode(messages));
    this.messages = Array.isArray(messages) ? messages : [messages];
    this.status = status;
  }

  get codes(): string {
    return ValidationError.getCode(this.messages);
  }

  private static getCode(messages: Message | Message[]): string {
    const msgs = Array.isArray(messages) ? messages : [messages];

    if (msgs.length === 1) return msgs[0]?.code ?? 'validation-error';
    return msgs.map((msg) => msg.code).join(',');
  }
}
