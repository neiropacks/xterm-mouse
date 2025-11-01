import { EventEmitter } from 'node:events';

import { ANSI_CODES } from '../parser/constants';
import { parseMouseEvent } from '../parser/ansiParser';
import type { MouseEvent, MouseEventType } from '../types';

class Mouse {
  constructor(
    private inputStream: NodeJS.ReadStream = process.stdin,
    private outputStream: NodeJS.WriteStream = process.stdout,
    private emitter: EventEmitter = new EventEmitter(),
  ) {}

  private handleEvent = (data: Buffer): void => {
    const event = parseMouseEvent(data.toString());
    if (event) {
      if (event.action === 'release' && event.button === 'none') {
        this.emitter.emit('hover', event);
      } else if (event.action === 'release' && event.button !== 'none') {
        this.emitter.emit('release', event);
      } else if (event.button.startsWith('wheel-') && event.action === 'press') {
        this.emitter.emit('wheel', event);
      } else {
        this.emitter.emit(event.action, event);
      }
    }
  };

  public enable = (): void => {
    this.outputStream.write(
      ANSI_CODES.mouseButton.on + ANSI_CODES.mouseDrag.on + ANSI_CODES.mouseMotion.on + ANSI_CODES.mouseSGR.on,
    );
    this.inputStream.setRawMode(true);
    this.inputStream.setEncoding('utf8');
    this.inputStream.resume();
    this.inputStream.on('data', this.handleEvent);
  };

  public disable = (): void => {
    this.inputStream.off('data', this.handleEvent);
    this.inputStream.pause();
    this.inputStream.setRawMode(false);
    this.outputStream.write(
      ANSI_CODES.mouseSGR.off + ANSI_CODES.mouseMotion.off + ANSI_CODES.mouseDrag.off + ANSI_CODES.mouseButton.off,
    );
  };

  public on = (event: MouseEventType, listener: (event: MouseEvent) => void): EventEmitter => {
    return this.emitter.on(event, listener);
  };

  public off = (event: MouseEventType, listener: (event: MouseEvent) => void): EventEmitter => {
    return this.emitter.off(event, listener);
  };
}

export { Mouse };
