import { isGameBoard } from "./gameboard";
import { translateCol } from "../ui/domUtils";

class Player {
  constructor(name, playerType, gameboard, aiController = null) {
    this._name = this._validate(name, validName);
    this._playerType = this._validate(playerType, validPlayerType);
    this._gameboard = this._validate(gameboard, validGameBoard);
    this._aiController = aiController;
    this._attacksMade = {};
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    const oldName = this.name;
    this._name = this._validate(newName, validName);
  }

  get playerType() {
    return this._playerType;
  }

  set playerType(newType) {
    const oldType = this.playerType;
    this._playerType = this._validate(newType, validPlayerType);
  }

  get gameboard() {
    return this._gameboard;
  }

  set gameboard(newGameBoard) {
    this._gameboard = this._validate(newGameBoard, validGameBoard);
  }

  get aiController() {
    return this._aiController;
  }

  set aiController(controller) {
    this._aiController = controller;
  }

  get attacksMade() {
    return this._attacksMade;
  }

  setAttacksMade(row, col, result) {
    this._attacksMade[`${row},${translateCol(col)}`] = result;
  }

  placeShip(row, col, shipObject, orientation) {
    return this.gameboard.place(row, col, shipObject, orientation);
  }

  receiveAttack(row, col) {
    return this.gameboard.receiveAttack(row, col);
  }

  makeAttack(targetPlayerObject, row, col) {
    if (this.playerType === "computer") {
      const attack = this._aiController.takeAction(
        this.attacksMade,
        this.gameboard.rows,
        this.gameboard.cols
      );

      row = attack.row;
      col = attack.col;
    }

    const attackResult = targetPlayerObject.receiveAttack(row, col);
    this.setAttacksMade(row, col, attackResult);
    return { row, col, attackResult };
  }

  hasAllShipsSunk() {
    return this.gameboard.hasAllShipsSunk();
  }

  _validate(object, callback) {
    return callback(object);
  }
}

function validPlayerType(playerType) {
  if (!(playerType === "real" || playerType === "computer")) {
    throw new Error("Not a valid player type ( real or computer )");
  }
  return playerType;
}

function validName(name) {
  if (!name) {
    throw new Error("Name cannot be empty.");
  }
  return name;
}

function validGameBoard(object) {
  if (!isGameBoard(object)) {
    throw new Error("Not a valid gameboard");
  }
  return object;
}

export { Player };
