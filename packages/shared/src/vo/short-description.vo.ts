import { Text } from './text.vo';

export class ShortDescription extends Text {
  protected static override readonly TOO_SHORT: string = 'SHORT_DESCRIPTION_TOO_SHORT';
  protected static override readonly TOO_LONG: string = 'SHORT_DESCRIPTION_TOO_LONG';

  protected static override readonly DEFAULT_MIN_LENGTH = 15;
  protected static override readonly DEFAULT_MAX_LENGTH = 80;
}
