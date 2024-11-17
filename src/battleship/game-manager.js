import { globalEventBus as eventBus } from "./event-emitter";
import GameStates from "./gamestates";

class GameManager {
  constructor(players, boards) {
    this._players = players;
    this._gameboards = boards;
    this._turn = 0;
    this._currentPlayer = null;
    this._state = GameStates.INITIALIZATION;
  }

  get players() {
    return this._players;
  }

  get gameboards() {
    return this._gameboards;
  }

  get turn() {
    return this._turn;
  }

  set turn(turnNumber) {
    this._turn = turnNumber;
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  set currentPlayer(player) {
    this._currentPlayer = player;
  }

  get state() {
    return this._state;
  }

  setState(newState) {
    validStateTransition(newState);
    eventBus.emit(`stateChanged`, { oldState: this._state, newState });
    this._state = newState;
  }

  selectFirstPlayer(player) {
    this.currentPlayer = player;
  }

  getPlayerGameBoard(player) {
    return player.gameboard;
  }

  setPlayersGameBoard() {
    const boards = this.gameboards;

    eventBus.emit("setBoard:1", boards[0]);
    eventBus.emit("setBoard:2", boards[1]);
  }

  setPlayersType(playerId, type) {
    eventBus.emit(`setType:${playerId}`, type);
  }

  getPlayerCell(player, row, col) {
    return this.getPlayerGameBoard(player).shipAt(row, col);
  }

  // Taking advanatage of pubsub module to place ships for loose coupling
  initializeShips(p1Ships, p1Coordinates, p2Ships, p2Coordinates) {
    for (let i = 0; i < p1Ships.length; i++) {
      eventBus.emit(
        "placeShip:1",
        p1Coordinates[i][0],
        p1Coordinates[i][1],
        p1Ships[i],
        p1Coordinates[i][2]
      );
      eventBus.emit(
        "placeShip:2",
        p2Coordinates[i][0],
        p2Coordinates[i][1],
        p2Ships[i],
        p2Coordinates[i][2]
      );
    }
  }

  startGame(firstPlayer, { p1Ships, p1Coordinates, p2Ships, p2Coordinates }) {
    this.currentPlayer = firstPlayer;
    this.setPlayersGameBoard();
    this.initializeShips(p1Ships, p1Coordinates, p2Ships, p2Coordinates);
    this.setState(GameStates.IN_PROGRESS);
    this.turn++;
  }

  attack(player, row, col) {
    const playerID = player.playerID;
    eventBus.emit(`attack:${playerID}`, row, col);
  }

  switchTurn() {
    const currentPlayer = this.currentPlayer === this.players[0] ? 1 : 0;
    this.currentPlayer = this.players[currentPlayer];
    this.turn++;
  }

  playTurn(row, col) {
    if (this.state !== GameStates.IN_PROGRESS) {
      throw new Error("Game not in progress");
    }

    const playerAttacked = this.currentPlayer === this.players[0] ? 1 : 0;
    this.attack(this.players[playerAttacked], row, col);
    if (this.gameboards[playerAttacked].hasAllShipsSunk()) {
      this.setState(GameStates.GAME_OVER);
      return;
    }
    this.switchTurn();
  }
}

function validStateTransition(newState) {
  const validTransitions = {
    [GameStates.INITIALIZATION]: [GameStates.IN_PROGRESS],
    [GameStates.IN_PROGRESS]: [GameStates.GAME_OVER],
    [GameStates.GAME_OVER]: [GameStates.INITIALIZATION],
  };

  if (validTransitions[newState].includes(newState)) {
    throw new Error("Invalid state change");
  }
}

export { GameManager };
