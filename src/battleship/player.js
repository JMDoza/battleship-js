import { isGameBoard } from "./gameboard";
import { globalEventBus } from "./event-emitter";

class Player {
  constructor(name, playerType, id) {
    this.id = id;
    this._name = this._validate(name, validName);
    this._playerType = this._validate(playerType, validPlayerType);
    this._gameboard = null;

    this.eventBus = globalEventBus;

    this.eventBus.on(`setName:${this.id}`, (newName) => {
      this.name = newName;
    });

    this.eventBus.on(`setType:${this.id}`, (newType) => {
      this.playerType = newType;
    });

    this.eventBus.on(`setBoard:${this.id}`, (board) => {
      this.gameboard = board;
    });
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    const oldName = this.name;
    this._name = this._validate(newName, validName);
    globalEventBus.emit("playerNameChanged", {
      oldName,
      newName,
      player: this,
    });
  }

  get playerType() {
    return this._playerType;
  }

  set playerType(newType) {
    const oldType = this.playerType;
    this._playerType = this._validate(newType, validPlayerType);
    globalEventBus.emit("playerTypeChanged", {
      oldType,
      newType,
      player: this,
    });
  }

  get playerID() {
    return this.id;
  }

  get gameboard() {
    return this._gameboard;
  }

  set gameboard(newGameBoard) {
    this._gameboard = this._validate(newGameBoard, validGameBoard);
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
