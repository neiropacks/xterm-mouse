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

// New tests for uncovered cases
test('parseSGRMouseEvent should parse SGR middle button press', () => {
  // Arrange
  const input = '\x1b[<1;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('middle');
});

test('parseSGRMouseEvent should parse SGR right button press', () => {
  // Arrange
  const input = '\x1b[<2;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('right');
});

test('parseSGRMouseEvent should parse SGR wheel left', () => {
  // Arrange
  const input = '\x1b[<66;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('wheel-left');
});

test('parseSGRMouseEvent should parse SGR wheel right', () => {
  // Arrange
  const input = '\x1b[<67;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('wheel-right');
});

test('parseSGRMouseEvent should parse SGR back button press', () => {
  // Arrange
  const input = '\x1b[<128;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('back');
});

test('parseSGRMouseEvent should parse SGR forward button press', () => {
  // Arrange
  const input = '\x1b[<129;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('forward');
});

test('parseSGRMouseEvent should handle unknown SGR button', () => {
  // Arrange
  const input = '\x1b[<200;10;20M';

  // Act
  const events = [...parseSGRMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('unknown');
});

test('parseESCMouseEvent should parse ESC middle button press', () => {
  // Arrange
  const input = '\x1b[M!#4';

  // Act
  const events = [...parseESCMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('middle');
});

test('parseESCMouseEvent should parse ESC right button press', () => {
  // Arrange
  const input = '\x1b[M"#4';

  // Act
  const events = [...parseESCMouseEvents(input)];

  // Assert
  expect(events[0]?.button).toBe('right');
});

test('parseESCMouseEvent should handle unknown ESC wheel', () => {
  // Arrange
  const wheelUpInput = '\x1b[M`#4';
  const wheelDownInput = '\x1b[Ma#4';

  // Act
  const wheelUpEvents = [...parseESCMouseEvents(wheelUpInput)];
  const wheelDownEvents = [...parseESCMouseEvents(wheelDownInput)];

  // Assert
  expect(wheelUpEvents[0]?.button).toBe('wheel-up');
  expect(wheelDownEvents[0]?.button).toBe('wheel-down');
});

test('parseSGRMouseEvent should parse SGR press event', () => {
  // Arrange
  const input = SGR_PRESS_LEFT;

  // Act
  const events = [...parseSGRMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('SGR');
  expect(event?.action).toBe('press');
  expect(event?.button).toBe('left');
  expect(event?.x).toBe(10);
  expect(event?.y).toBe(20);
  expect(event?.shift).toBe(false);
  expect(event?.alt).toBe(false);
  expect(event?.ctrl).toBe(false);
});

test('parseSGRMouseEvent should parse SGR release event', () => {
  // Arrange
  const input = SGR_RELEASE;

  // Act
  const events = [...parseSGRMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('SGR');
  expect(event?.action).toBe('release');
  expect(event?.button).toBe('none');
  expect(event?.x).toBe(10);
  expect(event?.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR drag event', () => {
  // Arrange
  const input = SGR_DRAG_LEFT;

  // Act
  const events = [...parseSGRMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('SGR');
  expect(event?.action).toBe('drag');
  expect(event?.button).toBe('left');
  expect(event?.x).toBe(10);
  expect(event?.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR wheel up event', () => {
  // Arrange
  const input = SGR_WHEEL_UP;

  // Act
  const events = [...parseSGRMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('SGR');
  expect(event?.action).toBe('wheel');
  expect(event?.button).toBe('wheel-up');
  expect(event?.x).toBe(10);
  expect(event?.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR wheel down event', () => {
  // Arrange
  const input = SGR_WHEEL_DOWN;

  // Act
  const events = [...parseSGRMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('SGR');
  expect(event?.action).toBe('wheel');
  expect(event?.button).toBe('wheel-down');
  expect(event?.x).toBe(10);
  expect(event?.y).toBe(20);
});

test('parseSGRMouseEvent should parse SGR move event', () => {
  // Arrange
  const input = SGR_MOVE;

  // Act
  const events = [...parseSGRMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('SGR');
  expect(event?.action).toBe('move');
  expect(event?.button).toBe('none');
  expect(event?.x).toBe(10);
  expect(event?.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC press event', () => {
  // Arrange
  const input = ESC_PRESS_LEFT;

  // Act
  const events = [...parseESCMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('ESC');
  expect(event?.action).toBe('press');
  expect(event?.button).toBe('left');
  expect(event?.x).toBe(3);
  expect(event?.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC release event', () => {
  // Arrange
  const input = ESC_RELEASE;

  // Act
  const events = [...parseESCMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('ESC');
  expect(event?.action).toBe('release');
  expect(event?.button).toBe('none');
  expect(event?.x).toBe(3);
  expect(event?.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC drag event', () => {
  // Arrange
  const input = ESC_DRAG_LEFT;

  // Act
  const events = [...parseESCMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('ESC');
  expect(event?.action).toBe('drag');
  expect(event?.button).toBe('left');
  expect(event?.x).toBe(3);
  expect(event?.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC wheel up event', () => {
  // Arrange
  const input = ESC_WHEEL_UP;

  // Act
  const events = [...parseESCMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('ESC');
  expect(event?.action).toBe('wheel');
  expect(event?.button).toBe('wheel-up');
  expect(event?.x).toBe(3);
  expect(event?.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC wheel down event', () => {
  // Arrange
  const input = ESC_WHEEL_DOWN;

  // Act
  const events = [...parseESCMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('ESC');
  expect(event?.action).toBe('wheel');
  expect(event?.button).toBe('wheel-down');
  expect(event?.x).toBe(3);
  expect(event?.y).toBe(20);
});

test('parseESCMouseEvent should parse ESC move event', () => {
  // Arrange
  const input = ESC_MOVE;

  // Act
  const events = [...parseESCMouseEvents(input)];
  const event = events[0];

  // Assert
  expect(events.length).toBe(1);
  expect(event?.protocol).toBe('ESC');
  expect(event?.action).toBe('move');
  expect(event?.button).toBe('none');
  expect(event?.x).toBe(3);
  expect(event?.y).toBe(20);
});

test('parseMouseEvent should return an empty array for invalid input', () => {
  // Arrange
  const input = 'invalid string';

  // Act
  const events = [...parseMouseEvents(input)];

  // Assert
  expect(events).toEqual([]);
});

test('parseMouseEvent should parse SGR event', () => {
  // Arrange
  const input = SGR_PRESS_LEFT;

  // Act
  const events = [...parseMouseEvents(input)];

  // Assert
  expect(events.length).toBe(1);
  expect(events[0]?.protocol).toBe('SGR');
});

test('parseMouseEvent should parse ESC event', () => {
  // Arrange
  const input = ESC_PRESS_LEFT;

  // Act
  const events = [...parseMouseEvents(input)];

  // Assert
  expect(events.length).toBe(1);
  expect(events[0]?.protocol).toBe('ESC');
});
