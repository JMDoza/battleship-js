import { Player } from "../src/battleship/player";
import { GameBoard } from "../src/battleship/gameboard";
import { Ship } from "../src/battleship/ship";
import { GameManager } from "../src/battleship/game-manager";
import GameStates from "../src/battleship/gamestates";
import { globalEventBus } from "../src/battleship/event-emitter";

describe("Game Manager Object", () => {
  let player1;
  let player2;
  let gameboard1;
  let gameboard2;
  let gameManager;
  let p1Ships;
  let p2Ships;
  let p1Coordinates;
  let p2Coordinates;

  beforeEach(() => {
    globalEventBus.reset();
    player1 = new Player("Player 1", "real", 1);
    player2 = new Player("Player 2", "computer", 2);
    gameboard1 = new GameBoard(1);
    gameboard2 = new GameBoard(2);
    gameManager = new GameManager([player1, player2], [gameboard1, gameboard2]);

    p1Ships = [new Ship(2), new Ship(3), new Ship(4)];
    p2Ships = [new Ship(2), new Ship(3), new Ship(4)];
    p1Coordinates = [
      [1, 1, "vertical"],
      [4, 1, "horizontal"],
      [6, 6, "horizontal"],
    ];
    p2Coordinates = [
      [1, 1, "vertical"],
      [4, 1, "horizontal"],
      [6, 6, "horizontal"],
    ];
  });

  test("should initialize with two players and two game boards", () => {
    expect(gameManager.players).toEqual([player1, player2]);
    expect(gameManager.gameboards).toEqual([gameboard1, gameboard2]);
  });

  test("should initialize with default state", () => {
    expect(gameManager.turn).toBe(0);
    expect(gameManager.currentPlayer).toBe(null);
  });

  test("should initialize ship locations", () => {
    gameManager.setPlayersGameBoard();
    gameManager.initializeShips(p1Ships, p1Coordinates, p2Ships, p2Coordinates);

    const players = gameManager.players;
    expect(gameManager.getPlayerCell(players[0], 1, 1)).toBe(p1Ships[0]);
    expect(gameManager.getPlayerCell(players[0], 4, 1)).toBe(p1Ships[1]);
    expect(gameManager.getPlayerCell(players[0], 6, 6)).toBe(p1Ships[2]);

    expect(gameManager.getPlayerCell(players[1], 1, 1)).toBe(p2Ships[0]);
    expect(gameManager.getPlayerCell(players[1], 4, 1)).toBe(p2Ships[1]);
    expect(gameManager.getPlayerCell(players[1], 6, 6)).toBe(p2Ships[2]);
  });

  describe("Gameplay Logic", () => {
    test("should select who takes first turn", () => {
      gameManager.selectFirstPlayer(player2);
      expect(gameManager.currentPlayer).toBe(player2);
    });

    test("should be able to start the game", () => {
      const mockInitializeShips = jest
        .spyOn(gameManager, "initializeShips")
        .mockReturnValue();

      gameManager.startGame(player1, {});

      expect(gameManager.turn).toBe(1);
      expect(gameManager.getPlayerGameBoard(player1)).toBe(gameboard1);
      expect(gameManager.getPlayerGameBoard(player2)).toBe(gameboard2);
      mockInitializeShips.mockRestore();
    });

    test("should switch turns", () => {
      const mockInitializeShips = jest
        .spyOn(gameManager, "initializeShips")
        .mockReturnValue();

      gameManager.startGame(player1, {});
      gameManager.switchTurn();
      expect(gameManager.turn).toBe(2);
      expect(gameManager.currentPlayer).toBe(player2);
      mockInitializeShips.mockRestore();
    });

    test("should be able to attack one another", () => {
      gameManager.startGame(player1, {
        p1Ships,
        p1Coordinates,
        p2Ships,
        p2Coordinates,
      });

      gameManager.attack(player1, 1, 1);
      gameManager.attack(player2, 1, 1);

      expect(gameManager.getPlayerCell(player1, 1, 1).hits).toBe(1);
      expect(gameManager.getPlayerCell(player2, 1, 1).hits).toBe(1);
    });

    test("should be able to play a turn", () => {
      gameManager.startGame(player2, {
        p1Ships,
        p1Coordinates,
        p2Ships,
        p2Coordinates,
      });

      gameManager.playTurn(1, 1);
      expect(gameManager.getPlayerCell(player1, 1, 1).hits).toBe(1);
      gameManager.playTurn(1, 1);
      expect(gameManager.getPlayerCell(player2, 1, 1).hits).toBe(1);
    });
  });

  describe("State Change Logic", () => {
    test("should begin with the INITIALIZATION state", () => {
      expect(gameManager.state).toBe(GameStates.INITIALIZATION);
    });

    test("should set state to IN_PROGRESS after starting game", () => {
      gameManager.startGame(player2, {
        p1Ships: [new Ship(1)],
        p1Coordinates,
        p2Ships: [new Ship(1)],
        p2Coordinates,
      });

      expect(gameManager.state).toBe(GameStates.IN_PROGRESS);
    });

    test("should set state to GAME_OVER after last ship has sunk", () => {
      gameManager.startGame(player2, {
        p1Ships: [new Ship(1)],
        p1Coordinates,
        p2Ships: [new Ship(1)],
        p2Coordinates,
      });

      gameManager.playTurn(1, 1);
      expect(gameManager.state).toBe(GameStates.GAME_OVER);
    });

    test("should not be able to play turn when game is not IN_PROGRESS", () => {
      expect(() => {
        gameManager.playTurn(1, 1);
      }).toThrow("Game not in progress");

      gameManager.startGame(player2, {
        p1Ships: [new Ship(1)],
        p1Coordinates,
        p2Ships: [new Ship(1)],
        p2Coordinates,
      });

      gameManager.playTurn(1, 1);
      
      expect(() => {
        gameManager.playTurn(1, 1);
      }).toThrow("Game not in progress");
    });
  });
});
