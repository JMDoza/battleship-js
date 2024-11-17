import { isShip } from "./ship";
import { globalEventBus } from "./event-emitter";
class GameBoard {
  constructor(id) {
    this.id = id;
    this._rows = 10;
    this._cols = 10;
    this._board = Array.from({ length: this._rows }, () =>
      Array(this._cols).fill(null)
    );
    this._shipsArray = [];
    this._attackHistory = {};
    this.eventBus = globalEventBus;

    this.eventBus.on(`placeShip:${this.id}`, this.place.bind(this));
    this.eventBus.on(`attack:${this.id}`, this.receiveAttack.bind(this));
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
    this._validate(validCoordinates, row, col);
    this._validate(validShip, shipObject);
    this._validate(doesShipExist, shipObject, this.shipsArray);

    // ship always placed starting from the top piece
    const shipLength = shipObject.length;

    // Depending on orientaion returns array that will allow row/col to be shifted
    // return values are either [1,0] or [0,1]
    const [rowShift, colShift] = getShifts(orientation);

    // If the length of the ship passes the grid edges then the function will
    // adjust starting position to fit the ship within grid edges dependent on orientation
    const [startingRow, startingCol] =
      orientation === "vertical"
        ? [adjustStartingPosition(row, this.rows, shipLength), col]
        : [row, adjustStartingPosition(col, this.cols, shipLength)];

    const directions = [
      [-1, 0], // Up
      [1, 0], // Down
      [0, -1], // Left
      [0, 1], // Right
      [-1, -1], // Up-Left
      [-1, 1], // Up-Right
      [1, -1], // Down-Left
      [1, 1], // Down-Right
    ];

    for (let i = 0; i < shipLength; i++) {
      const currentRow = startingRow + i * rowShift;
      const currentCol = startingCol + i * colShift;

      // If current row/col has a ship throw error
      this._validate(validShipPlacement, this, currentRow, currentCol);

      for (let j = 0; j < directions.length; j++) {
        const [dRow, dCol] = directions[j];
        const neighborRow = currentRow + dRow;
        const neighborCol = currentCol + dCol;

        try {
          this._validate(validCoordinates, neighborRow, neighborCol);
        } catch (error) {
          // console.error(error);
          continue;
        }

        // If neighboring row/col has a ship throw error
        this._validate(validShipPlacement, this, neighborRow, neighborCol);
      }
    }

    for (let i = 0; i < shipLength; i++) {
      this.setCell(
        startingRow + i * rowShift,
        startingCol + i * colShift,
        shipObject
      );
      this.addToShipsArray(shipObject);
    }
  }

  receiveAttack(row, col) {
    this._validate(validCoordinates, row, col);
    const attackStatus = this.getAttackHistory(row, col);
    if (attackStatus !== undefined) {
      throw new Error("Cell already Attacked");
      
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

  _validate(callback, ...args) {
    return callback(...args);
  }
}

function validCoordinates(row, col) {
  if (!(row < 10 && row >= 0) || !(col < 10 && col >= 0)) {
    throw new Error("Coordinates must be a valid | within 10x10");
  }
}

function validShipPlacement(boardInstance, row, col) {
  if (boardInstance.shipAt(row, col)) {
    // console.log("BOARD ID: " + boardInstance.id);
    // console.log("BOARD ROW AND COL: " + row + " " + col);

    // console.log(boardInstance.board);

    throw new Error("Ship within vicinity of another ship");
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

function isGameBoard(object) {
  return object instanceof GameBoard;
}

export { GameBoard, isGameBoard };
