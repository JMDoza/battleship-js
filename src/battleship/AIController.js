import { translateCol } from "../ui/domUtils";
import { validCoordinates } from "./gameboard";

class EasyAIController {
  takeAction(playerMoveList, maxRows, maxCols) {
    const cellsToAttack = [];
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        const key = `${row},${translateCol(col)}`;
        if (playerMoveList[key] === undefined) {
          cellsToAttack.push({ row, col });
        }
      }
    }
    const attack =
      cellsToAttack[Math.floor(Math.random() * cellsToAttack.length)];
    return attack;
  }
}

class NormalAIController {
  takeAction(playerMoveList, maxRows, maxCols) {
    const cellsToAttack = [];
    const adjecentCellsToAttack = [];
    let attack;
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        const key = `${row},${translateCol(col)}`;
        if (playerMoveList[key] === undefined) {
          cellsToAttack.push({ row, col });
        }

        if (playerMoveList[key] === true) {
          adjecentCellsToAttack.push({ row, col });
        }
      }
    }

    if (adjecentCellsToAttack.length > 0) {
      const temp = adjecentCellsToAttack[0];
      const directions = [
        [-1, 0], // Up
        [1, 0], // Down
        [0, -1], // Left
        [0, 1], // Right
      ];
      console.log("CENTER CELL: ", temp);

      for (let i = 0; i < directions.length; i++) {
        try {
          const rowShift = temp.row + directions[i][0];
          const colShift = temp.col + directions[i][1];
          validCoordinates(rowShift, colShift);
          const key = `${rowShift},${translateCol(colShift)}`;

          if (playerMoveList[key] === undefined) {
            attack = { row: rowShift, col: colShift };
          }
        } catch (error) {}
      }
    }

    if (!attack) {
      attack = cellsToAttack[Math.floor(Math.random() * cellsToAttack.length)];
    }

    return attack;
  }
}

export { EasyAIController, NormalAIController };
