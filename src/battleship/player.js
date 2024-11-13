import { isGameBoard } from "./gameboard";
class Player {
  constructor(name, playerType) {
    this._name = this._validate(name, validName);
    this._playerType = this._validate(playerType, validPlayerType);
    this._gameboard = null;
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = this._validate(newName, validName);
  }

  get playerType() {
    return this._playerType;
  }

  set playerType(type) {
    this._playerType = this._validate(type, validPlayerType);
  }

  get gameboard() {
    return this._gameboard;
  }

  set gameboard(object) {
    this._gameboard = this._validate(object, validGameBoard);
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
