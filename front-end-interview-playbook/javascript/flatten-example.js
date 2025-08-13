const _ = require('lodash');

// Example: Flattening nested arrays

console.log('--- Flatten Example ---');

const nestedArray = [1, [2, [3, [4]], 5]];

// _.flatten flattens the array one level deep.
const flattened = _.flatten(nestedArray);
console.log('Original array:', JSON.stringify(nestedArray));
console.log('_.flatten(array):', flattened);

// _.flattenDeep recursively flattens the array.
const deepFlattened = _.flattenDeep(nestedArray);
console.log('_.flattenDeep(array):', deepFlattened);

console.log('\nFlatten example finished.');