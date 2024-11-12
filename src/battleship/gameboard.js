import { isShip } from "./ship";

function GameBoard(initialBoard) {
  const rows = 10;
  const cols = 10;
  const board = initialBoard
    ? initialBoard
    : Array.from({ length: rows }, () => Array(cols).fill(0));

  const getCell = (row, col) => board[row][col];
  const setCell = (row, col, value) => (board[row][col] = value);

  const shipAt = (row, col) => getCell(row, col);

  const place = (row, col, shipObject, orientation = "vertical") => {
    validCoordinates(row, col);
    validShip(shipObject);
    if (shipAt(row, col)) {
      throw new Error("Coordinates already occupied");
    }

    // ship always placed starting from the top piece
    const shipLength = shipObject.length();
    if (shipLength === 1) {
      setCell(row, col, shipObject);
      return;
    }
    // If the length of the ship passes the grid edges then the function will
    // adjust starting position to fit the ship within grid edges dependent on orientation
    const [startingRow, startingCol] =
      orientation === "vertical"
        ? [adjustStartingPosition(row, rows, shipLength), col]
        : [row, adjustStartingPosition(col, cols, shipLength)];

    // Depending on orientaion returns array that will allow row/col to be shifted
    // return values are either [1,0] or [0,1]
    const [rowShift, colShift] = getShifts(orientation);
    for (let i = 0; i < shipLength; i++) {
      setCell(
        startingRow + i * rowShift,
        startingCol + i * colShift,
        shipObject
      );
    }
  };

  const receiveAttack = (row, col) => {
    const target = getCell(row, col);

    if (target) {
      target.damage();
      return true;
    }

    return false;
  };

  return { place, shipAt, receiveAttack };
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
