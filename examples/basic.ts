import { Mouse } from '../src';

const mouse = new Mouse();

console.log("Enabling mouse tracking... Press 'q' to exit.");

mouse.on('press', (event) => {
  console.log('Press event:', event);
});

mouse.on('move', (event) => {
  console.log('Move event:', event);
});

mouse.on('release', (event) => {
  console.log('Release event:', event);
});

mouse.enable();

process.stdin.on('data', (data) => {
  if (data.toString() === 'q') {
    mouse.disable();
    process.exit();
  }
});
