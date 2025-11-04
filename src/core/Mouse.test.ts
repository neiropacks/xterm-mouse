import { EventEmitter } from 'node:events';

import { expect, test } from 'bun:test';

import type { ReadableStreamWithEncoding } from '../types';

import { Mouse } from './Mouse';

function makeFakeTTYStream(): ReadableStreamWithEncoding {
  const fake = new EventEmitter() as ReadableStreamWithEncoding;
  fake.isTTY = true;
  fake.setRawMode = (_mode: boolean): ReadableStreamWithEncoding => fake;
  fake.setEncoding = (_encoding: BufferEncoding): ReadableStreamWithEncoding => fake;
  fake.resume = (): ReadableStreamWithEncoding => fake;
  fake.pause = (): ReadableStreamWithEncoding => fake;
  // biome-ignore lint/suspicious/noExplicitAny: biome bug
  fake.on = (_event: string, _listener: (...args: any[]) => void): ReadableStreamWithEncoding => fake;
  // biome-ignore lint/suspicious/noExplicitAny: biome bug
  fake.off = (_event: string, _listener: (...args: any[]) => void): ReadableStreamWithEncoding => fake;
  return fake;
}

test('Mouse should be instantiable', () => {
  const mouse = new Mouse();
  expect(mouse).toBeInstanceOf(Mouse);
});

test('Mouse enable/disable should work', () => {
  const mouse = new Mouse(makeFakeTTYStream());
  mouse.enable();
  expect(mouse.isEnabled()).toBe(true);
  mouse.disable();
  expect(mouse.isEnabled()).toBe(false);
});

test('Mouse should emit press event', (done) => {
  const emitter = new EventEmitter();
  const mouse = new Mouse(makeFakeTTYStream(), process.stdout, emitter);

  mouse.on('press', (event) => {
    expect(event.action).toBe('press');
    expect(event.button).toBe('left');
    done();
  });

  mouse.enable();
  // Simulate a mouse press event
  emitter.emit('press', { action: 'press', button: 'left' });
});
