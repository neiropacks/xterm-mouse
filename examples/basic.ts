import { Mouse } from '../src';

const mouse = new Mouse();

console.log("Enabling mouse tracking... Press 'q' to exit.");

mouse.on('press', (event) => {
  console.log('Press event:', JSON.stringify(event));
});

mouse.on('move', (event) => {
  console.log('Move event:', JSON.stringify(event));
});

mouse.on('release', (event) => {
  console.log('Release event:', JSON.stringify(event));
});

mouse.on('drag', (event) => {
  console.log('Drag event:', JSON.stringify(event));
});

mouse.on('wheel', (event) => {
  console.log('Wheel event:', JSON.stringify(event));
});

mouse.on('click', (event) => {
  console.log('Click event:', JSON.stringify(event));
});

mouse.enable();

process.stdin.on('data', (data) => {
  if (data.toString() === 'q') {
    mouse.disable();
    process.exit();
  }
});
