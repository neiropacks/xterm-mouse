import { EventEmitter } from 'node:events';

import { expect, test } from 'bun:test';

import { Mouse } from './Mouse';

test('Mouse should be instantiable', () => {
  const mouse = new Mouse();
  expect(mouse).toBeInstanceOf(Mouse);
});

test('Mouse enable/disable should work', () => {
  const mouse = new Mouse();
  mouse.enable();
  expect(mouse.isEnabled()).toBe(true);
  mouse.disable();
  expect(mouse.isEnabled()).toBe(false);
});

test('Mouse should emit press event', (done) => {
  const emitter = new EventEmitter();
  const mouse = new Mouse(process.stdin, process.stdout, emitter);

  mouse.on('press', (event) => {
    expect(event.action).toBe('press');
    expect(event.button).toBe('left');
    done();
  });

  mouse.enable();
  // Simulate a mouse press event
  emitter.emit('press', { action: 'press', button: 'left' });
});
