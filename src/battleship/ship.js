class Ship {
  constructor(length) {
    if (typeof length !== "number" || isNaN(length) || length <= 0) {
      throw new Error("Length must be a valid number");
    }

    this._length = length;
    this._hits = 0;
  }

  get length() {
    return this._length;
  }

  get hits() {
    return this._hits;
  }

  damage() {
    this._hits++;
  }

  isSunk() {
    return this._hits >= this._length;
  }
}

function isShip(object) {
  return object instanceof Ship;
}

export { Ship, isShip };
