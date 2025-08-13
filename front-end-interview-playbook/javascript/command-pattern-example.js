console.log('--- Command Pattern Example ---');

/**
 * The Receiver: It knows how to perform the actual operations.
 * It has no knowledge of the commands or the invoker.
 */
class Calculator {
  constructor() {
    this.value = 0;
  }

  add(amount) {
    this.value += amount;
    console.log(`Added ${amount}. Current value: ${this.value}`);
  }

  subtract(amount) {
    this.value -= amount;
    console.log(`Subtracted ${amount}. Current value: ${this.value}`);
  }
}

/**
 * The Command: An interface for all commands.
 * Each command will encapsulate a request to the receiver.
 */
class CalculatorCommand {
  constructor(calculator, amount) {
    this.calculator = calculator;
    this.amount = amount;
  }

  execute() {
    throw new Error('This method must be overridden!');
  }

  undo() {
    throw new Error('This method must be overridden!');
  }
}

// Concrete Command for Addition
class AddCommand extends CalculatorCommand {
  execute() {
    this.calculator.add(this.amount);
  }
  undo() {
    this.calculator.subtract(this.amount); // The opposite action
  }
}

// Concrete Command for Subtraction
class SubtractCommand extends CalculatorCommand {
  execute() {
    this.calculator.subtract(this.amount);
  }
  undo() {
    this.calculator.add(this.amount); // The opposite action
  }
}

/**
 * A Concrete Command that holds other commands.
 * This demonstrates how commands can be composed.
 */
class MacroCommand {
  constructor(commands) {
    this.commands = commands;
  }

  execute() {
    this.commands.forEach(command => command.execute());
  }

  undo() {
    // Important: Undo in the reverse order of execution.
    [...this.commands].reverse().forEach(command => command.undo());
  }
}

/**
 * The Invoker: It holds commands and asks them to execute.
 * It doesn't know what the commands do, only that they can be executed and undone.
 */
class CalculatorInvoker {
  constructor() {
    this.history = [];
  }

  executeCommand(command) {
    command.execute();
    this.history.push(command);
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      console.log('--- Undoing last command ---');
      command.undo();
    }
  }
}

// --- Client: Setting up and using the pattern ---
const invoker = new CalculatorInvoker();
const calculator = new Calculator();

invoker.executeCommand(new AddCommand(calculator, 10));      // Value: 10
invoker.executeCommand(new AddCommand(calculator, 5));       // Value: 15
invoker.executeCommand(new SubtractCommand(calculator, 7));  // Value: 8

invoker.undo(); // Undoes the subtraction of 7. Value: 15
invoker.undo(); // Undoes the addition of 5. Value: 10

console.log('\n--- Using a Macro Command ---');
// A macro command that adds 20 and then subtracts 3
const doBigOperation = new MacroCommand([
  new AddCommand(calculator, 20),
  new SubtractCommand(calculator, 3)
]);

invoker.executeCommand(doBigOperation); // Value is now 10 + 20 - 3 = 27

invoker.undo(); // Undoes the entire macro. Value should return to 10.