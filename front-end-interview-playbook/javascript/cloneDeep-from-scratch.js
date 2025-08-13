/**
 * A more robust deep clone function that handles circular references and common object types.
 * @param {*} source The value to clone.
 * @param {WeakMap} [memo=new WeakMap()] A map to store cloned objects to handle circular refs.
 * @returns {*} The cloned value.
 */
function robustCloneDeep(source, memo = new WeakMap()) {
  // Handle primitives, null, and functions
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // Handle circular references
  if (memo.has(source)) {
    return memo.get(source);
  }

  // Handle Date
  if (source instanceof Date) {
    const copy = new Date(source.getTime());
    memo.set(source, copy);
    return copy;
  }

  // Handle Array
  if (Array.isArray(source)) {
    const copy = [];
    memo.set(source, copy);
    for (let i = 0; i < source.length; i++) {
      copy[i] = robustCloneDeep(source[i], memo);
    }
    return copy;
  }

  // Handle Object
  const copy = {};
  memo.set(source, copy);
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      copy[key] = robustCloneDeep(source[key], memo);
    }
  }
  return copy;
}

console.log('\n\n--- Testing robustCloneDeep ---');
const circularObject = { name: 'A' };
circularObject.self = circularObject;

const robustCircularClone = robustCloneDeep(circularObject);

console.log('Successfully cloned a circular object!');
console.log('robustCircularClone.name:', robustCircularClone.name);
console.log('robustCircularClone.self === robustCircularClone:', robustCircularClone.self === robustCircularClone); // true! The circular structure is preserved.
