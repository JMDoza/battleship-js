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
    if (shipAt(row, col)) {
      throw new Error("Coordinates already occupied");
    } else if (!isShip(shipObject)) {
      throw new Error("Must be a valid Ship Object");
    }

    // ship always placed starting from the top piece
    const shipLength = shipObject.length();
    if (shipLength > 1 && orientation === "vertical") {
      if (row + shipLength >= rows) {
        for (let i = 0; i < shipLength; i++) {
          setCell(rows - 1 - i, col, shipObject);
        }
      } else {
        for (let i = 0; i < shipLength; i++) {
          setCell(row + i, col, shipObject);
        }
      }
    } else if (shipLength > 1 && orientation === "horizontal") {
      if (col + shipLength >= cols) {
        for (let i = 0; i < shipLength; i++) {
          setCell(row, cols - 1 - i, shipObject);
        }
      } else {
        for (let i = 0; i < shipLength; i++) {
          setCell(row, col + i, shipObject);
        }
      }
    } else {
      setCell(row, col, shipObject);
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

export { GameBoard };
