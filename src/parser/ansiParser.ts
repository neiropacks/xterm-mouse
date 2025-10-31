import type { ButtonType, MouseEventAction, SGRMouseEvent, ESCMouseEvent } from '../types';

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
    if ((base & 1) === 1) {
      return 'wheel-down';
    }
    return 'unknown';
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

function parseSGRMouseEvent(str: string): SGRMouseEvent | null {
  // SGR (1006)
  const m = ANSI_RESPONSE_PATTERNS.sgrPattern.exec(str);
  if (!m || m[1] === undefined || m[2] === undefined || m[3] === undefined) {
    return null;
  }
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
    action = 'move';
  } else if (type === 'm') {
    action = 'release';
  } else {
    action = base === 3 ? 'release' : 'press';
  }

  return {
    protocol: 'SGR',
    x,
    y,
    button,
    action,
    shift,
    alt,
    ctrl,
    raw: b,
    data: str.slice(3, -1),
  };
}

function parseESCMouseEvent(str: string): ESCMouseEvent | null {
  // ESC (1000/1002/1003) — old format
  const m = ANSI_RESPONSE_PATTERNS.escPattern.exec(str);
  if (!m || m[1] === undefined || m[2] === undefined || m[3] === undefined) {
    return null;
  }

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
    action = 'move';
  } else if ((cb & 3) === 3) {
    action = 'release';
  } else {
    action = 'press';
  }

  return {
    protocol: 'ESC',
    x: cx,
    y: cy,
    button,
    action,
    shift,
    alt,
    ctrl,
    raw: cb,
    data: str.slice(2),
  };
}

function parseMouseEvent(data: string): SGRMouseEvent | ESCMouseEvent | null {
  const str = data.toString();

  const sgrEvent = parseSGRMouseEvent(str);
  if (sgrEvent) {
    return sgrEvent;
  }

  const escEvent = parseESCMouseEvent(str);
  if (escEvent) {
    return escEvent;
  }

  return null;
}

export { parseMouseEvent, parseSGRMouseEvent, parseESCMouseEvent };
