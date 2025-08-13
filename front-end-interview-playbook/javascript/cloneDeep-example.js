const _ = require('lodash');

// Example: Deep cloning an object

console.log('--- cloneDeep Example ---');

const originalObject = {
  user: 'fred',
  details: {
    age: 40,
    hobbies: ['sailing', 'coding']
  }
};

// A shallow clone only copies the top-level properties. Nested objects and arrays are shared by reference.
const shallowClone = { ...originalObject };

// Deep clone using lodash
const deepClone = _.cloneDeep(originalObject);

// --- Test the clones ---

// 1. Are the top-level objects different?
console.log('originalObject === shallowClone:', originalObject === shallowClone);
console.log('originalObject === deepClone:', originalObject === deepClone);

// 2. Are the nested objects different?
console.log('\n--- Checking nested references ---');
console.log('originalObject.details === shallowClone.details:   ', originalObject.details === shallowClone.details, ' (Shared reference - BAD!)');
console.log('originalObject.details === deepClone.details:     ', originalObject.details === deepClone.details, ' (Separate reference - GOOD!)');
console.log('originalObject.details.hobbies === shallowClone.details.hobbies:', originalObject.details.hobbies === shallowClone.details.hobbies, ' (Shared reference - BAD!)');
console.log('originalObject.details.hobbies === deepClone.details.hobbies:  ', originalObject.details.hobbies === deepClone.details.hobbies, ' (Separate reference - GOOD!)');

// 3. Modify a nested property in the original object
originalObject.details.age = 41;
originalObject.details.hobbies.push('reading');

console.log('\n--- After modifying originalObject ---');
console.log('Original object:', JSON.stringify(originalObject, null, 2));
console.log('Shallow clone:', JSON.stringify(shallowClone, null, 2));
console.log('Deep clone:', JSON.stringify(deepClone, null, 2));

console.log('\nCloneDeep example finished.');