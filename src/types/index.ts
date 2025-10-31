export type ButtonType =
  | 'left'
  | 'middle'
  | 'right'
  | 'none'
  | 'wheel-up'
  | 'wheel-down'
  | 'wheel-left'
  | 'wheel-right'
  | 'back'
  | 'forward'
  | 'unknown';

export type MouseEventAction = 'move' | 'release' | 'press';

export type MouseEventBase = {
  x: number;
  y: number;
  button: ButtonType;
  action: MouseEventAction;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  raw: number;
  data: string;
};

export type SGRMouseEvent = MouseEventBase & {
  protocol: 'SGR';
};

export type ESCMouseEvent = MouseEventBase & {
  protocol: 'ESC';
};

export type MouseEvent = SGRMouseEvent | ESCMouseEvent;
