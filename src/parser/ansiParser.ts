import type { ButtonType, SGRMouseEvent, ESCMouseEvent, MouseEventAction } from '../types';

import { ANSI_RESPONSE_PATTERNS } from './constants';

function decodeButtonSGRBase(base: number): ButtonType {
  switch (base) {
    case 0:
      return 'left';
    case 1:
      return 'middle';
    case 2:
      return 'right';
    case 3:
      return 'none';
    case 64:
      return 'wheel-up';
    case 65:
      return 'wheel-down';
    case 66:
      return 'wheel-left';
    case 67:
      return 'wheel-right';
    case 128:
      return 'back';
    case 129:
      return 'forward';
    default:
      return 'unknown';
  }
}

function decodeButtonESCBase(base: number): ButtonType {
  // For wheel events, the button code is in the low bits, but the type is wheel
  if (base & 64) {
    if ((base & 1) === 0) {
      return 'wheel-up';
    }
    return 'wheel-down';
  }

  // For button press/release/move, the button is in the low two bits
  switch (base & 3) {
    case 0:
      return 'left';
    case 1:
      return 'middle';
    case 2:
      return 'right';
    case 3:
      // For release, or move without a button, the specific button is not indicated.
      return 'none';
  }
  return 'unknown';
}

function* parseSGRMouseEvents(str: string): Generator<SGRMouseEvent> {
  // SGR (1006)
  const events = str.matchAll(ANSI_RESPONSE_PATTERNS.sgrPattern);

  // run‑length deduplication algo
  let prevEvent: string = '';
  for (const m of events) {
    if (!m || m[0] === prevEvent || m[1] === undefined || m[2] === undefined || m[3] === undefined) {
      continue;
    }
    prevEvent = m[0];

    const b = parseInt(m[1], 10);
    const x = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    const type = m[4];

    const shift = !!(b & 4);
    const alt = !!(b & 8);
    const ctrl = !!(b & 16);
    const motion = !!(b & 32);

    const base = b & ~(4 | 8 | 16 | 32);
    const button = decodeButtonSGRBase(base);

    let action: MouseEventAction;
    if (motion) {
      action = button === 'none' ? 'move' : 'drag';
    } else if (type === 'm' || base === 3) {
      action = 'release';
    } else {
      action = button.startsWith('wheel-') ? 'wheel' : 'press';
    }

    yield {
      protocol: 'SGR',
      x,
      y,
      button,
      action,
      shift,
      alt,
      ctrl,
      raw: b,
      data: m[0].slice(3),
    };
  }
}

function* parseESCMouseEvents(str: string): Generator<ESCMouseEvent> {
  // ESC (1000/1002/1003) — old format
  const events = str.matchAll(ANSI_RESPONSE_PATTERNS.escPattern);

  // run‑length deduplication algo
  let prevEvent: string = '';
  for (const m of events) {
    if (!m || m[0] === prevEvent || m[1] === undefined || m[2] === undefined || m[3] === undefined) {
      continue;
    }
    prevEvent = m[0];

    const cb = m[1].charCodeAt(0) - 32;
    const cx = m[2].charCodeAt(0) - 32;
    const cy = m[3].charCodeAt(0) - 32;

    const shift = !!(cb & 4);
    const alt = !!(cb & 8);
    const ctrl = !!(cb & 16);
    const motion = !!(cb & 32);

    const button = decodeButtonESCBase(cb);

    let action: MouseEventAction;
    if (motion) {
      action = button === 'none' ? 'move' : 'drag';
    } else if ((cb & 3) === 3) {
      action = 'release';
    } else {
      action = button.startsWith('wheel-') ? 'wheel' : 'press';
    }

    yield {
      protocol: 'ESC',
      x: cx,
      y: cy,
      button,
      action,
      shift,
      alt,
      ctrl,
      raw: cb,
      data: m[0].slice(2),
    };
  }
}

function* parseMouseEvents(data: string): Generator<SGRMouseEvent | ESCMouseEvent> {
  const sgrGenerator = parseSGRMouseEvents(data);
  const sgrResult = sgrGenerator.next();

  if (!sgrResult.done) {
    yield sgrResult.value;
    yield* sgrGenerator;
    return;
  }

  yield* parseESCMouseEvents(data);
}

export { parseMouseEvents, parseSGRMouseEvents, parseESCMouseEvents };
