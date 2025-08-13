console.log('--- Factory Pattern Example ---');

/**
 * These are the "Concrete Products" that our factory will create.
 * They don't need to share a base class in JavaScript, but they often
 * share a similar interface (e.g., they all have a `say` method).
 */
class Employee {
  constructor(name) {
    this.name = name;
    this.type = 'Employee';
  }

  say() {
    console.log(`Hi, I am employee ${this.name}.`);
  }
}

class Shopper {
  constructor(name) {
    this.name = name;
    this.money = 100;
    this.type = 'Shopper';
  }

  say() {
    console.log(`I am shopper ${this.name} and I have $${this.money}.`);
  }
}

/**
 * This is the "Creator" or "Factory". Its job is to create objects
 * based on the type requested.
 */
class UserFactory {
  create(name, type) {
    if (type === 'employee') return new Employee(name);
    if (type === 'shopper') return new Shopper(name);
  }
}

// --- Client: Setting up and using the pattern ---
const factory = new UserFactory();
const users = [];

users.push(factory.create('John Doe', 'employee'));
users.push(factory.create('Jane Smith', 'shopper'));

users.forEach(user => user.say());

console.log('\n--- More Extensible Factory Pattern ---');

/**
 * This factory allows new types to be registered without modifying the factory class.
 * This is more scalable and adheres to the Open/Closed Principle.
 */
class RegisteredUserFactory {
  constructor() {
    this.types = {};
  }

  register(type, cls) {
    this.types[type] = cls;
  }

  create(name, type) {
    const UserClass = this.types[type];
    if (!UserClass) {
      console.warn(`Warning: User type "${type}" is not registered.`);
      return null;
    }
    return new UserClass(name);
  }
}

const registeredFactory = new RegisteredUserFactory();
registeredFactory.register('employee', Employee);
registeredFactory.register('shopper', Shopper);

const user1 = registeredFactory.create('Mike Ross', 'employee');
user1.say();

console.log('\n--- Factory Function (ala Eric Elliott) ---');

/**
 * Ini adalah "Factory Function".
 * Hanya sebuah fungsi biasa yang mengembalikan objek. Tidak ada `class` atau `new`.
 * Ini sesuai dengan artikel yang Anda bagikan.
 */
const createUser = ({ name, type, money = 0 }) => {
  return {
    name,
    type,
    say() {
      if (type === 'employee') {
        console.log(`Hi, I am employee ${this.name}.`);
      } else {
        console.log(`I am shopper ${this.name} and I have $${money}.`);
      }
    }
  };
};

const user2 = createUser({ name: 'Harvey Specter', type: 'employee' });
user2.say();

console.log('\n--- Real-World Use Case for Factory Function: Game Character ---');

/**
 * This factory creates player objects. It uses closures to create private state
 * (`health`) that can only be modified through the returned methods.
 * This prevents cheating, like `player.health = 9999`.
 */
const createPlayer = (name) => {
  // Private state, not accessible from the outside
  let health = 100;

  // The returned object is the public API
  return {
    name,
    takeDamage(amount) {
      health -= amount;
      if (health < 0) health = 0;
      console.log(`${name} took ${amount} damage. Health is now ${health}.`);
    },
    // A "getter" to safely expose the private state
    getHealth() {
      return health;
    },
  };
};

const player1 = createPlayer('Gandalf');
player1.takeDamage(15);

// Attempt to modify health directly (this will not work as intended)
player1.health = 500;
console.log(`Attempted to set health directly: player1.health is now ${player1.health}`);
console.log(`Actual health (via getter): ${player1.getHealth()}`);
