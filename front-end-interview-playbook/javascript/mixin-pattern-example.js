console.log('--- Mixin Pattern Example ---');

/**
 * Ini adalah "Mixin".
 * Sebuah objek biasa yang berisi sekumpulan method (kemampuan).
 * Perhatikan penggunaan `this`. Mixin ini berasumsi bahwa objek yang
 * menggunakannya akan memiliki properti `name`.
 */
const canBark = {
  bark() {
    console.log(`Woof! My name is ${this.name}.`);
  }
};

const canWagTail = {
  wag() {
    console.log(`${this.name} is wagging its tail!`);
  }
};

const canFly = {
  fly() {
    console.log(`${this.name} is flying through the sky!`);
  }
};

/**
 * Ini adalah kelas dasar kita. Awalnya, ia hanya punya constructor.
 */
class Dog {
  constructor(name) {
    this.name = name;
  }
}

/**
 * Di sinilah keajaibannya terjadi. Kita menggunakan `Object.assign`
 * untuk menyalin semua method dari mixin ke `Dog.prototype`.
 * Sekarang, semua instance dari Dog akan memiliki kemampuan ini.
 */
Object.assign(Dog.prototype, canBark, canWagTail);

// Mari kita buat anjing super yang juga bisa terbang!
class SuperDog extends Dog {}
Object.assign(SuperDog.prototype, canFly);


// --- Client: Menggunakan objek yang sudah "dicampur" ---
const pet1 = new Dog('Buddy');
pet1.bark(); // Output: Woof! My name is Buddy.
pet1.wag();  // Output: Buddy is wagging its tail!

const superPet = new SuperDog('Rocky');
superPet.bark(); // Kemampuan dari Dog
superPet.wag();  // Kemampuan dari Dog
superPet.fly();  // Kemampuan tambahan dari mixin canFly