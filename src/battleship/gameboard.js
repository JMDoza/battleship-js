import { isShip } from "./ship";
class GameBoard {
  constructor() {
    this._rows = 10;
    this._cols = 10;
    this._board = Array.from({ length: this._rows }, () =>
      Array(this._cols).fill(0)
    );
    this._shipsArray = [];
    this._attackHistory = {};
  }

  get rows() {
    return this._rows;
  }

  get cols() {
    return this._cols;
  }

  get board() {
    return this._board;
  }

  getCell(row, col) {
    return this.board[row][col];
  }

  setCell(row, col, value) {
    this.board[row][col] = value;
  }

  get shipsArray() {
    return this._shipsArray;
  }

  addToShipsArray(shipObject) {
    this.shipsArray.push(shipObject);
  }

  get attackHistory() {
    return this._attackHistory;
  }

  getAttackHistory(row, col) {
    return this.attackHistory[`${row},${col}`];
  }

  setAttackHistory(row, col, value) {
    this.attackHistory[`${row},${col}`] = value;
  }

  shipAt(row, col) {
    return this.getCell(row, col);
  }

  place(row, col, shipObject, orientation = "vertical") {
    validCoordinates(row, col);
    validShip(shipObject);
    doesShipExist(shipObject, this.shipsArray);
    if (this.shipAt(row, col)) {
      throw new Error("Coordinates already occupied");
    }

    this.addToShipsArray(shipObject);

    // ship always placed starting from the top piece
    const shipLength = shipObject.length;
    if (shipLength === 1) {
      this.setCell(row, col, shipObject);
      return;
    }

    // If the length of the ship passes the grid edges then the function will
    // adjust starting position to fit the ship within grid edges dependent on orientation
    const [startingRow, startingCol] =
      orientation === "vertical"
        ? [adjustStartingPosition(row, this.rows, shipLength), col]
        : [row, adjustStartingPosition(col, this.cols, shipLength)];

    // Depending on orientaion returns array that will allow row/col to be shifted
    // return values are either [1,0] or [0,1]
    const [rowShift, colShift] = getShifts(orientation);
    for (let i = 0; i < shipLength; i++) {
      this.setCell(
        startingRow + i * rowShift,
        startingCol + i * colShift,
        shipObject
      );
    }
  }

  receiveAttack(row, col) {
    validCoordinates(row, col);
    const attackStatus = this.getAttackHistory(row, col);
    if (attackStatus !== undefined) {
      return false;
    }

    // get target cell and apply damage if ship exists
    const target = this.getCell(row, col);
    if (target) {
      target.damage();
      this.setAttackHistory(row, col, true); // Mark attack as successful
      return true;
    } else {
      this.setAttackHistory(row, col, false); // Mark attack as missed
      return false;
    }
  }

  hasAllShipsSunk() {
    return !this.shipsArray.some((ship) => !ship.isSunk());
  }
}

function validCoordinates(row, col) {
  if (!(row < 10 && row >= 0) || !(col < 10 && col >= 0)) {
    throw new Error("Coordinates must be a valid | within 10x10");
  }
}

function validShip(object) {
  if (!isShip(object)) {
    throw new Error("Must be a valid Ship Object");
  }
}

function doesShipExist(shipObject, shipsArray) {
  return shipsArray.some((ship) => {
    if (ship === shipObject) throw new Error("Ship already exists on board");
  });
}

function adjustStartingPosition(position, boardLimit, objectLength) {
  if (position + objectLength >= boardLimit) {
    return boardLimit - objectLength;
  }
  return position;
}

function getShifts(orientation) {
  return orientation === "vertical" ? [1, 0] : [0, 1];
}

export { GameBoard };
