import { Player } from "../src/battleship/player";
import { GameBoard } from "../src/battleship/gameboard";
import { Ship } from "../src/battleship/ship";
import { GameManager } from "../src/battleship/game-manager";
import { EasyAIController } from "../src/battleship/AIController";
import GameStates from "../src/battleship/gamestates";
import { globalEventBus } from "../src/battleship/event-emitter";

describe("Game Manager Object", () => {
  const player1ID = 0;
  const player2ID = 1;
  const aiController = new EasyAIController();
  let p1Ships;
  let p2Ships;
  let p1Coordinates;
  let p2Coordinates;
  let gameboard1;
  let gameboard2;
  let player1;
  let player2;
  let gameManager;

  beforeEach(() => {
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
    p1Ships = [new Ship(2), new Ship(3), new Ship(4)];
    p2Ships = [new Ship(2), new Ship(3), new Ship(4)];
    gameboard1 = new GameBoard();
    gameboard2 = new GameBoard();
    player1 = new Player("Player 1", "real", gameboard1);
    player2 = new Player("Player 2", "real", gameboard2);
    gameManager = new GameManager([player1, player2]);
  });

  test("should initialize with two players and two filled game boards", () => {
    expect(gameManager.players).toEqual([player1, player2]);
  });

  test("should initialize with default state", () => {
    expect(gameManager.turn).toBe(0);
    expect(gameManager.currentPlayer).toBe(gameManager.players[player1ID]);
    expect(gameManager.state).toBe(GameStates.INITIALIZATION);
  });

  test("should initialize ship locations", () => {
    gameManager.initializeShips(player1ID, p1Ships, p1Coordinates);
    gameManager.initializeShips(player2ID, p2Ships, p2Coordinates);

    expect(gameManager.getPlayerCell(player1ID, 1, 1)).toBe(p1Ships[0]);
    expect(gameManager.getPlayerCell(player2ID, 1, 1)).toBe(p2Ships[0]);
  });

  test("should initialize random ship locations", () => {
    gameManager.initializeShips(player1ID, p1Ships);
    gameManager.initializeShips(player2ID, p2Ships);

    expect(gameManager.getPlayerGameBoard(player1ID).shipsArray.length).toBe(3);
    expect(gameManager.getPlayerGameBoard(player2ID).shipsArray.length).toBe(3);
  });

  test("should throw error when initializaing without valid playerID", () => {
    expect(() => {
      gameManager.initializeShips("test", p1Ships, p1Coordinates);
    }).toThrow("Must have valid playerID");
  });

  test("should throw error when initializaing without valid ships", () => {
    expect(() => {
      gameManager.initializeShips(player1ID, [], p1Coordinates);
    }).toThrow("Must not be empty");
  });

  test("should throw error when initializaing without valid coordinates", () => {
    expect(() => {
      gameManager.initializeShips(player1ID, p1Ships, []);
    }).toThrow("Must not be empty");
  });

  describe("Gameplay Logic", () => {
    test("should set who the current player is", () => {
      gameManager.currentPlayer = player2;
      expect(gameManager.currentPlayer).toBe(player2);
    });

    test("should be able to start the game", () => {
      const mockInitializeShips = jest
        .spyOn(gameManager, "initializeShips")
        .mockReturnValue();

      gameManager.startGame(player2ID, p1Ships, {}, p2Ships, {});

      expect(gameManager.turn).toBe(1);
      expect(gameManager.state).toBe(GameStates.IN_PROGRESS);
      mockInitializeShips.mockRestore();
    });

    test("should switch turns", () => {
      const mockInitializeShips = jest
        .spyOn(gameManager, "initializeShips")
        .mockReturnValue();

      gameManager.startGame(player1ID, p1Ships, {}, p2Ships, {});
      gameManager.switchTurn(player2ID);
      expect(gameManager.turn).toBe(2);
      expect(gameManager.currentPlayer).toBe(player2);
      mockInitializeShips.mockRestore();
    });

    test("should be able to attack another player", () => {
      console.log("test");

      gameManager.startGame(player1ID, {
        p1Ships,
        p1Coordinates,
        p2Ships,
        p2Coordinates,
      });

      gameManager.makePlayerAttack(player1ID, player2ID, 1, 1);
      gameManager.makePlayerAttack(player2ID, player1ID, 1, 1);

      expect(gameManager.getPlayerCell(player1ID, 1, 1).hits).toBe(1);
    });

    test("should be able to play a turn", () => {
      gameManager.startGame(player2ID, {
        p1Ships,
        p1Coordinates,
        p2Ships,
        p2Coordinates,
      });

      gameManager.playTurn(player1ID, 1, 1);
      expect(gameManager.getPlayerCell(player1ID, 1, 1).hits).toBe(1);
      gameManager.playTurn(player2ID, 1, 1);
      expect(gameManager.getPlayerCell(player2ID, 1, 1).hits).toBe(1);
    });
  });

  describe("State Change Logic", () => {
    test("should begin with the INITIALIZATION state", () => {
      expect(gameManager.state).toBe(GameStates.INITIALIZATION);
    });

    test("should set state to IN_PROGRESS after starting game", () => {
      gameManager.startGame(player2ID, {
        p1Ships: [new Ship(1)],
        p1Coordinates,
        p2Ships: [new Ship(1)],
        p2Coordinates,
      });

      expect(gameManager.state).toBe(GameStates.IN_PROGRESS);
    });

    test("should set state to GAME_OVER after last ship has sunk", () => {
      gameManager.startGame(player2ID, {
        p1Ships: [new Ship(1)],
        p1Coordinates,
        p2Ships: [new Ship(1)],
        p2Coordinates,
      });

      gameManager.playTurn(player1ID, 1, 1);
      expect(gameManager.state).toBe(GameStates.GAME_OVER);
    });

    test("should not be able to play turn when game is not IN_PROGRESS", () => {
      expect(() => {
        gameManager.playTurn(1, 1);
      }).toThrow("Game not in progress");
    });
  });
});
