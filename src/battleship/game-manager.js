import { globalEventBus as eventBus } from "./event-emitter";
import GameStates from "./gamestates";

class GameManager {
  constructor(players) {
    this._players = players;
    this._ships = [];
    this._shipStartingCoordinates = [[], []];
    this._currentPlayer = players[0];
    this._turn = 0;
    this._state = GameStates.INITIALIZATION;

    eventBus.on(
      `randomizeShipsPressed`,
      this.randomizeShipPlacements.bind(this)
    );

    eventBus.on(`startGame`, this.startGame.bind(this));
    eventBus.on(`playTurn`, this.playTurn.bind(this));
    eventBus.on(`moveShip`, this.moveShip.bind(this));
  }

  get players() {
    return this._players;
  }

  get ships() {
    return this._ships;
  }

  setShips(playerID, ships) {
    this._ships[playerID] = ships;
  }

  get shipStartingCoordinates() {
    return this._shipStartingCoordinates;
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  set currentPlayer(player) {
    this._currentPlayer = player;
  }

  get turn() {
    return this._turn;
  }

  set turn(turnNumber) {
    this._turn = turnNumber;
  }

  get state() {
    return this._state;
  }

  setState(newState) {
    this._validate(validStateTransition, newState);
    eventBus.emit(`stateChanged`, { oldState: this._state, newState });
    this._state = newState;
  }

  setPlayerAIController(playerID, controller) {
    this.players[playerID].aiController = controller;
  }

  getPlayerGameBoard(playerID) {
    return this.players[playerID].gameboard;
  }

  setPlayerGameBoard(playerID, newGameBoard) {
    this.players[playerID].gameboard = newGameBoard;
  }

  setPlayersType(playerID, newType) {
    this.players[playerID].playerType = newType;
  }

  getPlayerCell(playerID, row, col) {
    return this.getPlayerGameBoard(playerID).getCell(row, col);
  }

  // Taking advanatage of pubsub module to place ships for loose coupling
  initializeShips(playerID, ships, coordinates) {
    this._validate(validPlayerID, this, playerID);
    this._validate(validateNotEmpty, ships);

    if (coordinates) {
      this._validate(validateNotEmpty, coordinates);
      for (let i = 0; i < ships.length; i++) {
        const [row, col, orientation] = coordinates[i];

        const [startingRow, startingCol] = this.players[playerID].placeShip(
          row,
          col,
          ships[i],
          orientation
        );

        this._shipStartingCoordinates[playerID][i] = [
          startingRow,
          startingCol,
          orientation,
        ];

        console.log(i);

        eventBus.emit("placedShip", {
          playerID,
          startingRow,
          startingCol,
          orientation,
          ship: ships[i],
          shipID: i,
        });
      }
    } else {
      const generatedCoordinates =
        this.getPlayerGameBoard(playerID).generateRandomCoordinates(ships);

      this._shipStartingCoordinates[playerID] = generatedCoordinates;

      if (this.players[playerID].playerType === "real") {
        for (let i = 0; i < generatedCoordinates.length; i++) {
          const [row, col, orientation] = generatedCoordinates[i];
          eventBus.emit("placedShip", {
            playerID,
            row,
            col,
            orientation,
            ship: ships[i],
            shipID: i,
          });
        }
      }

      return generatedCoordinates;
    }
  }

  randomizeShipPlacements(playerID) {
    this.initializeShips(playerID, this.ships[playerID]);
  }

  startGame(firstPlayerID, { p1Ships, p1Coordinates, p2Ships, p2Coordinates }) {
    this.currentPlayer = this._players[firstPlayerID];
    if (p1Ships && p1Ships.length > 0) {
      this.initializeShips(0, p1Ships, p1Coordinates);
    }

    if (!(p2Ships && p2Ships.length > 0)) {
      p2Ships = this.ships[1];
    }

    this.initializeShips(1, p2Ships, p2Coordinates);
    this.setState(GameStates.IN_PROGRESS);

    this.switchTurn(firstPlayerID);
    console.log(this.shipStartingCoordinates);
  }

  makePlayerAttack(currentPlayerID, targetPlayerID, row, col) {
    const currentPlayer = this.players[currentPlayerID];
    const targetPlayer = this.players[targetPlayerID];
    return currentPlayer.makeAttack(targetPlayer, row, col);
  }

  switchTurn(nextPlayerID) {
    const previousPlayerID = this.players.findIndex(
      (player) => player === this.currentPlayer
    );

    const previousPlayer = this.currentPlayer;
    const nextPlayer = this.players[nextPlayerID];
    this.currentPlayer = nextPlayer;
    this.turn++;

    eventBus.emit("changedTurn", {
      previousPlayer: previousPlayerID,
      nextPlayer: nextPlayerID,
    });

    console.log(
      `Turn switched from ${previousPlayer.name} to ${nextPlayer.name}`
    );

    if (nextPlayer.playerType === "computer") {
      eventBus.emit("playTurn", previousPlayerID, 0, 0);
    }
  }

  playTurn(targetPlayerID, row, col) {
    if (this.state !== GameStates.IN_PROGRESS) {
      throw new Error("Game not in progress");
    }

    if (this.currentPlayer === this.players[targetPlayerID]) {
      throw new Error("Wrong gameboard!");
    }

    const currentPlayerID = this.players.findIndex(
      (player) => player === this.currentPlayer
    );

    targetPlayerID = this.currentPlayer === this.players[0] ? 1 : 0;

    const results = this.makePlayerAttack(
      currentPlayerID,
      targetPlayerID,
      row,
      col
    );

    row = results.row;
    col = results.col;

    eventBus.emit("attackMade", {
      targetPlayerID,
      row,
      col,
      attackResult: results.attackResult,
    });

    if (this.players[targetPlayerID].hasAllShipsSunk()) {
      this.setState(GameStates.GAME_OVER);
      eventBus.emit("gameover", this.players[currentPlayerID].name);
      return;
    }

    this.switchTurn(targetPlayerID);
  }

  moveShip({ originalStyle, playerID, shipID, row, col, orientation }) {
    const gameboard = this.getPlayerGameBoard(playerID);
    const originalCoordinates = this.shipStartingCoordinates[playerID][shipID];

    gameboard.removeShipFromBoard(shipID, originalCoordinates);

    try {
      const [startingRow, startingCol] = gameboard.place(
        parseInt(row),
        parseInt(col),
        this.ships[playerID][shipID],
        orientation
      );

      eventBus.emit("succeededMove", { row: startingRow, col: startingCol });

      this._shipStartingCoordinates[playerID][shipID] = [
        startingRow,
        startingCol,
        orientation,
      ];
    } catch (error) {
      console.log(error);
      gameboard.place(
        originalCoordinates[0],
        originalCoordinates[1],
        this.ships[playerID][shipID],
        originalCoordinates[2]
      );
      eventBus.emit("failedMove", originalStyle);
    }
  }

  _validate(callback, ...args) {
    return callback(...args);
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

function validPlayerID(GMInstance, playerID) {
  if (!(GMInstance.players.length - 1 >= playerID)) {
    throw new Error("Must have valid playerID");
  }
}

function validateNotEmpty(array) {
  if (array.length === 0) {
    throw new Error("Must not be empty");
  }
}

export { GameManager };
