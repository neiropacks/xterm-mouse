import { Mouse } from '../src';

const mouse = new Mouse();

const main = async (): Promise<void> => {
  console.log('Enable mouse events...');
  mouse.enable();

  console.log('Starting to stream all mouse events. Press any key to stop.');

  // Example of using the stream() method
  const streamPromise = (async (): Promise<void> => {
    for await (const { type, event } of mouse.stream()) {
      console.log(`Stream Event: type=${type}, event=${JSON.stringify(event)}`);
    }
  })();

  // Example of using the eventsOf() method for a specific event type
  const eventsOfPromise = (async (): Promise<void> => {
    for await (const event of mouse.eventsOf('press')) {
      console.log(`eventsOf('press') Event: ${JSON.stringify(event)}`);
    }
  })();

  // Keep the script running until a key is pressed.
  process.stdin.on('data', (data) => {
    if (data.toString() === 'q') {
      console.log('Disabling mouse events...');
      mouse.disable();
      process.exit(0);
    }
  });
};

main().catch(console.error);
