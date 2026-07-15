import { ValidationError } from '../base/validation-error';
import { Metadata } from '../base/metadata';
import { Result } from '../base';

export class Duration {
  static readonly ONE_MINUTE: number = 60;
  static readonly ONE_HOUR: number = 3600;
  static readonly ONE_DAY: number = 86400;

  constructor(
    readonly value: number,
    meta?: Metadata,
  ) {
    if (this.value < 0) {
      throw new ValidationError({
        code: 'duration.negative',
        meta: meta?.withValue(value).props,
      });
    }
  }

  static create(value: number, meta?: Metadata): Duration {
    const result = Duration.tryCreate(value, meta);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value: number, meta?: Metadata): Result<Duration> {
    return Result.try(() => new Duration(value, meta));
  }

  static zero() {
    return new Duration(0);
  }

  static inSeconds(seconds: number) {
    return new Duration(seconds);
  }

  static from(_: { d?: number; h?: number; m?: number; s?: number }) {
    return new Duration(
      (_.d ?? 0) * this.ONE_DAY + (_.h ?? 0) * this.ONE_HOUR + (_.m ?? 0) * this.ONE_MINUTE + (_.s ?? 0),
    );
  }

  get inSeconds() {
    return this.value;
  }

  get inMinutes() {
    return Math.floor(this.inSeconds / Duration.ONE_MINUTE);
  }

  get inHours() {
    return Math.floor(this.inSeconds / Duration.ONE_HOUR);
  }

  get inDays() {
    return Math.floor(this.inSeconds / Duration.ONE_DAY);
  }

  get toHMS() {
    const { h, m, s } = this._parts();
    return `${h}h ${m}m ${s}s`;
  }

  get toHM() {
    const { h, m } = this._parts();
    return `${h}h ${m}m`;
  }

  get hoursAndMinutes() {
    const { h, m } = this._parts();
    return {
      hours: h,
      minutes: m,
    };
  }

  get toMS() {
    const h = parseInt(this._parts(1).h);
    const m = parseInt(this._parts(1).m);
    const { s } = this._parts();
    const totalMinutes = `${h * 60 + m}`.padStart(2, '0');
    return `${totalMinutes}m ${s}s`;
  }

  add(duration: Duration) {
    return Duration.from({
      s: this.inSeconds + duration.inSeconds,
    });
  }

  private _parts(n = 2): { h: string; m: string; s: string } {
    let v = this.inSeconds;
    const h = v > 3600 ? Math.floor(v / 3600) : 0;
    const m = v - h * 3600 > 60 ? Math.floor((v - h * 3600) / 60) : 0;
    const s = v - h * 3600 - m * 60;
    return {
      h: `${h}`.padStart(n, '0'),
      m: `${m}`.padStart(n, '0'),
      s: `${s}`.padStart(n, '0'),
    };
  }
}
