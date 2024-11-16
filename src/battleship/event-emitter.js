class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(
      (registeredListener) => registeredListener !== listener
    );
  }

  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach((listener) => listener(...args));
  }
}

const globalEventBus = new EventEmitter();

export { globalEventBus, EventEmitter };
