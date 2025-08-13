const _ = require('lodash');

// --- Example 1: Default Throttle (leading and trailing calls enabled) ---

console.log('--- Throttle Example ---');

let scrollCount = 0;
const handleScroll = () => {
  scrollCount++;
  console.log(`Scroll event handled. Count: ${scrollCount}`);
};

// Create a throttled version of the scroll handler
// It will be called at most once every 1000ms (1 second).
// By default, _.throttle invokes on the "leading" edge (the very first call)
// and the "trailing" edge (one last time after the calls stop).
// This is often the desired behavior for UI updates.
const throttledHandleScroll = _.throttle(handleScroll, 1000);

// Simulate rapid scroll events
console.log('Simulating rapid scroll events for 3 seconds...');
const interval = setInterval(() => {
  throttledHandleScroll();
}, 100); // Firing an "event" every 100ms

// Stop simulating after 3 seconds
setTimeout(() => {
  clearInterval(interval);
  // We must wait for the final "trailing" call to fire before logging the result.
  setTimeout(() => {
    console.log(`\nFinal scroll count after 3 seconds: ${scrollCount}`);
    console.log('Default throttle example finished.');
    // Run the next example to show other options
    runSecondExample();
  }, 1100); // Wait a bit longer than the throttle time
}, 5000);


// --- Example 2: Throttle with leading edge disabled ---
function runSecondExample() {
  console.log('\n\n--- Throttle Example (leading: false) ---');
  let clickCount = 0; 
  const handleClick = () => {
    clickCount++;
    console.log(`Click handled. Count: ${clickCount}`);
  };

  // The function will NOT be called on the first event, only after the delay.
  const throttledHandleClick = _.throttle(handleClick, 1000, { 'leading': false });

  console.log('Simulating rapid clicks for 3 seconds...');
  const clickInterval = setInterval(() => {
    throttledHandleClick();
  }, 100);

  setTimeout(() => {
    clearInterval(clickInterval);
    console.log(`\nFinal click count after 3 seconds: ${clickCount}`);
    console.log('leading:false example finished.');
  }, 3100); // Wait slightly longer to capture the final trailing call
}