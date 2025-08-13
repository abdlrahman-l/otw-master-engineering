console.log('--- EXECUTING LATEST curry-example.js ---');
const _ = require('lodash');

// Example: Currying a function

console.log('--- Curry Example ---');

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = _.curry(add);

// Call with all arguments
console.log('curriedAdd(1, 2, 3):', curriedAdd(1, 2, 3));

// Call with partial arguments
const add5 = curriedAdd(5);
console.log('add5(2)(3):', add5(2)(3));

const add5and2 = add5(2);
console.log('add5and2(10):', add5and2(10));

console.log('\n--- Practical Use Case: Creating Specialized Functions ---');

// A generic function to log messages with a certain level
function log(level, message) {
  console.log(`[${level}] - ${message}`);
}

// Create a curried version of the log function
const curriedLog = _.curry(log);

// Create more specific functions by partially applying the 'level' argument.
// This makes our code more readable and less repetitive.
const logError = curriedLog('ERROR');
const logWarning = curriedLog('WARNING');

console.log('Calling specialized log functions...');
logError('Database connection failed.');
logWarning('API response is slow.');
console.log('...specialized log functions called.');

console.log('\nCurry example finished.');