import type { ButtonType, SGRMouseEvent, ESCMouseEvent, MouseEventAction } from '../types';

function decodeSGRButton(code: number): { button: ButtonType; action: MouseEventAction } {
  const buttonCode = code & 0b1111111; // Extract button and wheel info
  const motion = !!(code & 32);

  let button: ButtonType;
  switch (buttonCode) {
    case 0:
      button = 'left';
      break;
    case 1:
      button = 'middle';
      break;
    case 2:
      button = 'right';
      break;
    case 3:
      button = 'none';
      break;
    case 64:
      button = 'wheel-up';
      break;
    case 65:
      button = 'wheel-down';
      break;
    case 66:
      button = 'wheel-left';
      break;
    case 67:
      button = 'wheel-right';
      break;
    case 128:
      button = 'back';
      break;
    case 129:
      button = 'forward';
      break;
    default:
      button = 'unknown';
      break;
  }

  let action: MouseEventAction;
  if (motion) {
    action = button === 'none' ? 'move' : 'drag';
  } else if (button.startsWith('wheel-')) {
    action = 'wheel';
  } else {
    // For SGR, release is indicated by the 'm' terminator, not the button code
    action = 'press';
  }

  return { button, action };
}

function decodeESCButton(code: number): { button: ButtonType; action: MouseEventAction } {
  const motion = !!(code & 32);

  let button: ButtonType;
  if (code & 64) {
    // Wheel event
    button = (code & 1) === 0 ? 'wheel-up' : 'wheel-down';
  } else {
    // Button event
    switch (code & 3) {
      case 0:
        button = 'left';
        break;
      case 1:
        button = 'middle';
        break;
      case 2:
        button = 'right';
        break;
      case 3:
        button = 'none';
        break;
      default:
        button = 'unknown';
        break;
    }
  }

  let action: MouseEventAction;
  if (motion) {
    action = button === 'none' ? 'move' : 'drag';
  } else if ((code & 3) === 3) {
    action = 'release';
  } else {
    action = button.startsWith('wheel-') ? 'wheel' : 'press';
  }

  return { button, action };
}

function parseSGRMouseEvent(data: string, start: number): [SGRMouseEvent | null, number] {
  const endM = data.indexOf('M', start + 3);
  const endm = data.indexOf('m', start + 3);

  let end = -1;
  let isRelease = false;

  if (endM !== -1 && endm !== -1) {
    if (endM < endm) {
      end = endM;
    } else {
      end = endm;
      isRelease = true;
    }
  } else if (endM !== -1) {
    end = endM;
  } else if (endm !== -1) {
    end = endm;
    isRelease = true;
  } else {
    return [null, start + 1]; // No terminator found
  }

  const sequence = data.substring(start + 3, end);
  const parts = sequence.split(';');

  const bStr = parts[0];
  const xStr = parts[1];
  const yStr = parts[2];

  if (bStr === undefined || xStr === undefined || yStr === undefined) {
    return [null, end + 1];
  }

  const b = parseInt(bStr, 10);
  const x = parseInt(xStr, 10);
  const y = parseInt(yStr, 10);

  if (Number.isNaN(b) || Number.isNaN(x) || Number.isNaN(y)) {
    return [null, end + 1];
  }

  const { button, action } = decodeSGRButton(b);

  const event: SGRMouseEvent = {
    protocol: 'SGR',
    x,
    y,
    button,
    action: isRelease ? 'release' : action,
    shift: !!(b & 4),
    alt: !!(b & 8),
    ctrl: !!(b & 16),
    raw: b,
    data: sequence + (isRelease ? 'm' : 'M'),
  };

  return [event, end + 1];
}

function parseESCMouseEvent(data: string, start: number): [ESCMouseEvent | null, number] {
  if (start + 5 >= data.length) {
    return [null, data.length]; // Not enough data for a full ESC sequence
  }

  const cb = data.charCodeAt(start + 3) - 32;
  const cx = data.charCodeAt(start + 4) - 32;
  const cy = data.charCodeAt(start + 5) - 32;

  const { button, action } = decodeESCButton(cb);

  const event: ESCMouseEvent = {
    protocol: 'ESC',
    x: cx,
    y: cy,
    button,
    action,
    shift: !!(cb & 4),
    alt: !!(cb & 8),
    ctrl: !!(cb & 16),
    raw: cb,
    data: data.substring(start + 3, start + 6),
  };

  return [event, start + 6];
}

function* parseMouseEvents(data: string): Generator<SGRMouseEvent | ESCMouseEvent> {
  let i = 0;
  while (i < data.length) {
    const escIndex = data.indexOf('\x1b[', i);
    if (escIndex === -1) {
      break;
    }

    i = escIndex;
    let event: SGRMouseEvent | ESCMouseEvent | null = null;
    let nextIndex: number;

    if (data[i + 2] === '<') {
      // Potential SGR event
      [event, nextIndex] = parseSGRMouseEvent(data, i);
    } else if (data[i + 2] === 'M') {
      // Potential ESC event
      [event, nextIndex] = parseESCMouseEvent(data, i);
    } else {
      // Unrecognized escape sequence, skip it
      nextIndex = i + 1;
    }

    if (event) {
      yield event;
    }
    i = nextIndex;
  }
}

export { parseMouseEvents };
