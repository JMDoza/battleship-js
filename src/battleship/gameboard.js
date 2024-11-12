function GameBoard(initialBoard) {
  const rows = 10;
  const cols = 10;
  const board = initialBoard
    ? initialBoard
    : Array.from({ length: rows }, () => Array(cols).fill(0));

  const place = (shipObject, row, col) => {
    if (!(row < 10 && row >= 0) || !(col < 10 && col >= 0)) {
      throw new Error("Coordinates must be a valid | within 10x10");
    }
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = shipObject;
    return GameBoard(newBoard);
  };

  const shipAt = (row, col) => board[row][col];

  return { place, shipAt };
}

export { GameBoard };
