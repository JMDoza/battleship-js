import { isShip } from "./ship";
import { translateCol } from "../ui/domUtils";

class GameBoard {
  constructor() {
    this._rows = 10;
    this._cols = 10;
    this._board = Array.from({ length: this._rows }, () =>
      Array(this._cols).fill(null)
    );
    this._shipsArray = [];
    this._attacksReceived = {};
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

  removeFromShipsArray(shipObject) {
    let array = this.shipsArray;
    for (let i = 0; i < array.length; i++) {
      if (array[i] === shipObject) {
        array.splice(i, 1);
      }
    }
  }

  get attacksReceived() {
    return this._attacksReceived;
  }

  getAttacksReceived(row, col) {
    return this.attacksReceived[`${row},${translateCol(col)}`];
  }

  setAttacksReceived(row, col, value) {
    this.attacksReceived[`${row},${translateCol(col)}`] = value;
  }

  place(row, col, shipObject, orientation = "vertical") {
    this._validate(validCoordinates, row, col);
    this._validate(validShip, shipObject);

    // ship always placed starting from the top piece

    // If the length of the ship passes the grid edges then the function will
    // adjust starting position to fit the ship within grid edges dependent on orientation
    const [startingRow, startingCol] =
      orientation === "vertical"
        ? [adjustStartingPosition(row, this.rows, shipObject.length), col]
        : [row, adjustStartingPosition(col, this.cols, shipObject.length)];

    this.canPlaceShip(startingRow, startingCol, shipObject, orientation);

    this.placeShipOnBoard(startingRow, startingCol, shipObject, orientation);

    return [startingRow, startingCol];
  }

  canPlaceShip(startingRow, startingCol, shipObject, orientation) {
    const [rowShift, colShift] = getShifts(orientation);
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

    const shipLength = shipObject.length;
    const directionsLength = directions.length;

    for (let i = 0; i < shipLength; i++) {
      const currentRow = startingRow + i * rowShift;
      const currentCol = startingCol + i * colShift;

      // If current row/col has a ship throw error
      this._validate(validShipPlacement, this, currentRow, currentCol);

      for (let j = 0; j < directionsLength; j++) {
        const [dRow, dCol] = directions[j];
        const neighborRow = currentRow + dRow;
        const neighborCol = currentCol + dCol;

        try {
          this._validate(validCoordinates, neighborRow, neighborCol);
        } catch (error) {
          continue;
        }

        // If neighboring row/col has a ship throw error
        this._validate(validShipPlacement, this, neighborRow, neighborCol);
      }
    }
  }

  placeShipOnBoard(startingRow, startingCol, shipObject, orientation) {
    const [rowShift, colShift] = getShifts(orientation);
    const length = shipObject.length;
    for (let i = 0; i < length; i++) {
      this.setCell(
        startingRow + i * rowShift,
        startingCol + i * colShift,
        shipObject
      );
    }
    try {
      this._validate(doesShipExist, shipObject, this.shipsArray);
      this.addToShipsArray(shipObject);
    } catch {}
  }

  removeShipFromBoard(shipID, shipCoordinates) {
    const [rowShift, colShift] = getShifts(shipCoordinates[2]);
    const length = this.shipsArray[shipID].length;
    for (let i = 0; i < length; i++) {
      this.setCell(
        shipCoordinates[0] + i * rowShift,
        shipCoordinates[1] + i * colShift,
        null
      );
    }
  }

  generateRandomCoordinates(ships) {
    this.reset();
    const temp = [];
    for (let i = 0; i < ships.length; i++) {
      let placed = false;
      while (!placed) {
        try {
          const orientation = Math.floor(Math.random() * 2)
            ? "vertical"
            : "horizontal";

          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);

          const [startingRow, startingCol] = this.place(
            row,
            col,
            ships[i],
            orientation
          );

          placed = true;
          temp.push([startingRow, startingCol, orientation]);
        } catch (error) {}
      }
    }
    return temp;
  }

  receiveAttack(row, col) {
    this._validate(validCoordinates, row, col);
    const attackStatus = this.getAttacksReceived(row, col);

    if (attackStatus !== undefined) {
      throw new Error("Cell already Attacked");
    }

    // get target cell and apply damage if ship exists
    const target = this.getCell(row, col);
    if (target) {
      target.damage();
      this.setAttacksReceived(row, col, true); // Mark attack as successful
      return true;
    } else {
      this.setAttacksReceived(row, col, false); // Mark attack as missed
      return false;
    }
  }

  hasAllShipsSunk() {
    return !this.shipsArray.some((ship) => !ship.isSunk());
  }

  reset() {
    this._board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(null)
    );
    this._shipsArray = [];
    this._attacksReceived = {};
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
  if (boardInstance.getCell(row, col)) {
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
  // Depending on orientaion returns array that will allow row/col to be shifted
  // return values are either [1,0] or [0,1]
  return orientation === "vertical" ? [1, 0] : [0, 1];
}

function isGameBoard(object) {
  return object instanceof GameBoard;
}

export { GameBoard, isGameBoard, validCoordinates };
