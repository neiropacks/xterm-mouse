import { expect, test } from 'bun:test';

import { parseMouseEvents, parseSGRMouseEvents, parseESCMouseEvents } from './ansiParser';

// Mock data for testing
const SGR_PRESS_LEFT = '\x1b[<0;10;20M';
const SGR_RELEASE = '\x1b[<3;10;20m';
const SGR_DRAG_LEFT = '\x1b[<32;10;20M'; // Button 0 + motion (32)
const SGR_WHEEL_UP = '\x1b[<64;10;20M';
const SGR_WHEEL_DOWN = '\x1b[<65;10;20M';
const SGR_MOVE = '\x1b[<35;10;20M'; // Button 3 + motion (32)

const ESC_PRESS_LEFT = '\x1b[M #4'; // button 0, x=3, y=20
const ESC_RELEASE = '\x1b[M##4'; // button 3, x=3, y=20
const ESC_DRAG_LEFT = '\x1b[M@#4'; // button 0 + motion, x=3, y=20
const ESC_WHEEL_UP = '\x1b[M`#4'; // button 64, x=3, y=20
const ESC_WHEEL_DOWN = '\x1b[Ma#4'; // button 65, x=3, y=20
const ESC_MOVE = '\x1b[MC#4'; // button 3 + motion, x=3, y=20

test('parseSGRMouseEvent should parse SGR press event', () => {
  const events = [...parseSGRMouseEvents(SGR_PRESS_LEFT)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('SGR');
  expect(event.action).toBe('press');
  expect(event.button).toBe('left');
  expect(event.x).toBe(10);
  expect(event.y).toBe(20);
  expect(event.shift).toBe(false);
  expect(event.alt).toBe(false);
  expect(event.ctrl).toBe(false);
});

test('parseSGRMouseEvent should parse SGR release event', () => {
  const events = [...parseSGRMouseEvents(SGR_RELEASE)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('SGR');
  expect(event.action).toBe('release');
  expect(event.button).toBe('none');
  expect(event.x).toBe(10);
  expect(event.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR drag event', () => {
  const events = [...parseSGRMouseEvents(SGR_DRAG_LEFT)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('SGR');
  expect(event.action).toBe('drag');
  expect(event.button).toBe('left');
  expect(event.x).toBe(10);
  expect(event.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR wheel up event', () => {
  const events = [...parseSGRMouseEvents(SGR_WHEEL_UP)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('SGR');
  expect(event.action).toBe('wheel');
  expect(event.button).toBe('wheel-up');
  expect(event.x).toBe(10);
  expect(event.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR wheel down event', () => {
  const events = [...parseSGRMouseEvents(SGR_WHEEL_DOWN)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('SGR');
  expect(event.action).toBe('wheel');
  expect(event.button).toBe('wheel-down');
  expect(event.x).toBe(10);
  expect(event.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR move event', () => {
  const events = [...parseSGRMouseEvents(SGR_MOVE)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('SGR');
  expect(event.action).toBe('move');
  expect(event.button).toBe('none');
  expect(event.x).toBe(10);
  expect(event.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC press event', () => {
  const events = [...parseESCMouseEvents(ESC_PRESS_LEFT)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('ESC');
  expect(event.action).toBe('press');
  expect(event.button).toBe('left');
  expect(event.x).toBe(3);
  expect(event.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC release event', () => {
  const events = [...parseESCMouseEvents(ESC_RELEASE)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('ESC');
  expect(event.action).toBe('release');
  expect(event.button).toBe('none');
  expect(event.x).toBe(3);
  expect(event.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC drag event', () => {
  const events = [...parseESCMouseEvents(ESC_DRAG_LEFT)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('ESC');
  expect(event.action).toBe('drag');
  expect(event.button).toBe('left');
  expect(event.x).toBe(3);
  expect(event.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC wheel up event', () => {
  const events = [...parseESCMouseEvents(ESC_WHEEL_UP)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('ESC');
  expect(event.action).toBe('wheel');
  expect(event.button).toBe('wheel-up');
  expect(event.x).toBe(3);
  expect(event.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC wheel down event', () => {
  const events = [...parseESCMouseEvents(ESC_WHEEL_DOWN)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('ESC');
  expect(event.action).toBe('wheel');
  expect(event.button).toBe('wheel-down');
  expect(event.x).toBe(3);
  expect(event.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC move event', () => {
  const events = [...parseESCMouseEvents(ESC_MOVE)];
  expect(events.length).toBe(1);
  const event = events[0];
  expect(event.protocol).toBe('ESC');
  expect(event.action).toBe('move');
  expect(event.button).toBe('none');
  expect(event.x).toBe(3);
  expect(event.y).toBe(20);
});

test('parseMouseEvent should return an empty array for invalid input', () => {
  const events = [...parseMouseEvents('invalid string')];
  expect(events).toEqual([]);
});

test('parseMouseEvent should parse SGR event', () => {
  const events = [...parseMouseEvents(SGR_PRESS_LEFT)];
  expect(events.length).toBe(1);
  expect(events[0].protocol).toBe('SGR');
});

test('parseMouseEvent should parse ESC event', () => {
  const events = [...parseMouseEvents(ESC_PRESS_LEFT)];
  expect(events.length).toBe(1);
  expect(events[0].protocol).toBe('ESC');
});
