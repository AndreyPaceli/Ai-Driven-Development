import { Text } from './text.vo';

export class Description extends Text {
  protected static override readonly TOO_SHORT: string = 'DESCRIPTION_TOO_SHORT';
  protected static override readonly TOO_LONG: string = 'DESCRIPTION_TOO_LONG';

  protected static override readonly DEFAULT_MIN_LENGTH = 20;
  protected static override readonly DEFAULT_MAX_LENGTH = 2000;
}
