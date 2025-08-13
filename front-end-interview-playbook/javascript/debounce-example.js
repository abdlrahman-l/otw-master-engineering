const _ = require('lodash');

// Example: Debouncing a search input handler

console.log('--- Debounce Example ---');

// A function that simulates a search API call
const search = (query) => {
  console.log(`Searching for: ${query}`);
};

// Create a debounced version of the search function
// It will only be called 500ms after the last time it was invoked.
const debouncedSearch = _.debounce(search, 500);

console.log('Simulating user typing "hello" quickly...');
debouncedSearch('h');
debouncedSearch('he');
debouncedSearch('hel');
debouncedSearch('hell');
debouncedSearch('hello');

// Only the last call ('hello') will trigger the search after 500ms.
// To see the output, you'll need to wait for the timeout.
setTimeout(() => console.log('Debounce example finished.'), 1000);