import { EventEmitter } from 'node:events';

import { ANSI_CODES } from '../parser/constants';
import { parseMouseEvent } from '../parser/ansiParser';
import type { MouseEvent, MouseEventAction, ReadableStreamWithEncoding } from '../types';

class Mouse {
  private enabled = false;
  private previousEncoding: BufferEncoding | null = null;
  private previousRawMode: boolean | null = null;

  constructor(
    private inputStream: ReadableStreamWithEncoding = process.stdin,
    private outputStream: NodeJS.WriteStream = process.stdout,
    private emitter: EventEmitter = new EventEmitter(),
  ) {}

  private handleEvent = (data: Buffer): void => {
    try {
      const event = parseMouseEvent(data.toString());
      if (!event) {
        return;
      }
      this.emitter.emit(event.action, event);
    } catch (err) {
      this.emitter.emit('error', err);
    }
  };

  public enable = (): void => {
    if (this.enabled) {
      return;
    }

    if (!this.inputStream.isTTY) {
      throw new Error('Mouse events require a TTY input stream');
    }

    try {
      this.previousRawMode = this.inputStream.isRaw ?? false;
      this.previousEncoding = this.inputStream.readableEncoding || null;

      this.enabled = true;

      this.outputStream.write(
        ANSI_CODES.mouseButton.on + ANSI_CODES.mouseDrag.on + ANSI_CODES.mouseMotion.on + ANSI_CODES.mouseSGR.on,
      );

      this.inputStream.setRawMode(true);
      this.inputStream.setEncoding('utf8');
      this.inputStream.resume();
      this.inputStream.on('data', this.handleEvent);
    } catch (err) {
      this.enabled = false;
      throw new Error(`Failed to enable mouse: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  public disable = (): void => {
    if (!this.enabled) {
      return;
    }

    try {
      this.inputStream.off('data', this.handleEvent);
      this.inputStream.pause();

      if (this.previousRawMode !== null) {
        this.inputStream.setRawMode(this.previousRawMode);
      }

      if (this.previousEncoding !== null) {
        this.inputStream.setEncoding(this.previousEncoding);
      }

      this.outputStream.write(
        ANSI_CODES.mouseSGR.off + ANSI_CODES.mouseMotion.off + ANSI_CODES.mouseDrag.off + ANSI_CODES.mouseButton.off,
      );
    } catch (err) {
      this.emitter.emit('error', err);
    } finally {
      this.enabled = false;
      this.previousRawMode = null;
      this.previousEncoding = null;
    }
  };

  public on = (event: MouseEventAction | 'error', listener: (event: MouseEvent) => void): EventEmitter => {
    return this.emitter.on(event, listener);
  };

  public off = (event: MouseEventAction | 'error', listener: (event: MouseEvent) => void): EventEmitter => {
    return this.emitter.off(event, listener);
  };

  public async *eventsOf(
    type: MouseEventAction,
    { latestOnly = false, maxQueue = 100 }: { latestOnly?: boolean; maxQueue?: number } = {},
  ): AsyncGenerator<MouseEvent> {
    const queue: MouseEvent[] = [];
    let latest: MouseEvent | null = null;
    let resolveNext: ((value: MouseEvent) => void) | null = null;
    let rejectNext: ((err: Error) => void) | null = null;

    const handler = (ev: MouseEvent): void => {
      if (resolveNext) {
        resolveNext(ev);
        resolveNext = null;
        rejectNext = null;
      } else if (latestOnly) {
        latest = ev;
      } else {
        if (queue.length >= maxQueue) queue.shift();
        queue.push(ev);
      }
    };

    const errorHandler = (err: Error): void => {
      if (rejectNext) {
        rejectNext(err);
        resolveNext = null;
        rejectNext = null;
      }
    };

    this.emitter.on(type, handler);
    this.emitter.on('error', errorHandler);

    try {
      while (true) {
        if (queue.length > 0) {
          const event = queue.shift();
          if (event) {
            yield event;
          }
        } else if (latest !== null) {
          const ev = latest;
          latest = null;
          yield ev;
        } else {
          yield await new Promise<MouseEvent>((resolve, reject) => {
            resolveNext = resolve;
            rejectNext = reject;
          });
        }
      }
    } finally {
      this.emitter.off(type, handler);
      this.emitter.off('error', errorHandler);
    }
  }

  public async *stream({
    latestOnly = false,
    maxQueue = 100,
  }: {
    latestOnly?: boolean;
    maxQueue?: number;
  } = {}): AsyncGenerator<{ type: MouseEventAction; event: MouseEvent }> {
    const queue: { type: MouseEventAction; event: MouseEvent }[] = [];
    let latest: { type: MouseEventAction; event: MouseEvent } | null = null;
    let resolveNext: ((value: { type: MouseEventAction; event: MouseEvent }) => void) | null = null;
    let rejectNext: ((err: Error) => void) | null = null;

    const handlers = new Map<MouseEventAction, (ev: MouseEvent) => void>();
    const allEvents: MouseEventAction[] = ['press', 'release', 'drag', 'wheel', 'move'];

    allEvents.forEach((type) => {
      const handler = (ev: MouseEvent): void => {
        const wrapped = { type, event: ev };

        if (resolveNext) {
          resolveNext(wrapped);
          resolveNext = null;
          rejectNext = null;
        } else if (latestOnly) {
          latest = wrapped;
        } else {
          if (queue.length >= maxQueue) queue.shift();
          queue.push(wrapped);
        }
      };

      handlers.set(type, handler);
      this.emitter.on(type, handler);
    });

    const errorHandler = (err: Error): void => {
      if (rejectNext) {
        rejectNext(err);
        resolveNext = null;
        rejectNext = null;
      }
    };
    this.emitter.on('error', errorHandler);

    try {
      while (true) {
        if (queue.length > 0) {
          const event = queue.shift();
          if (event) {
            yield event;
          }
        } else if (latest !== null) {
          const ev = latest;
          latest = null;
          yield ev;
        } else {
          yield await new Promise<{ type: MouseEventAction; event: MouseEvent }>((resolve, reject) => {
            resolveNext = resolve;
            rejectNext = reject;
          });
        }
      }
    } finally {
      allEvents.forEach((type) => {
        const handler = handlers.get(type);
        if (handler) {
          this.emitter.off(type, handler);
        }
      });
      this.emitter.off('error', errorHandler);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public destroy(): void {
    this.disable();
    this.emitter.removeAllListeners();
  }
}

export { Mouse };
