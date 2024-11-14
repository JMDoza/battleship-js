import { Player } from "../src/battleship/player";

describe("Player Object", () => {
  let player1;
  let player2;
  beforeEach(() => {
    player1 = new Player("Player", "real");
    player2 = new Player("Computer", "computer");
  });

  test("should throw an error if there is no name", () => {
    expect(() => new Player("", "real")).toThrow("Name cannot be empty.");
  });

  test("should throw an error if player type is not either real or computer", () => {
    expect(() => {
      new Player("Player", "test");
    }).toThrow("Not a valid player type ( real or computer )");
  });

  describe("Player Name methods", () => {
    test("should be able to create return correct name", () => {
      expect(player1.name).toBe("Player");
    });

    test("should be able to set new name", () => {
      player1.name = "Player 2";
      expect(player1.name).toBe("Player 2");
    });

    test("should not be able to set new name to nothing", () => {
      expect(() => {
        player1.name = "";
      }).toThrow("Name cannot be empty.");
    });
  });

  describe("Player Type methods", () => {
    test("should be able to create return correct player type", () => {
      expect(player1.playerType).toBe("real");
      expect(player2.playerType).toBe("computer");
    });

    test("should be able to set new player type", () => {
      player1.playerType = "computer";
      player2.playerType = "real";
      expect(player1.playerType).toBe("computer");
      expect(player2.playerType).toBe("real");
    });

    test("should not be able to set new player type anything other than real or player", () => {
      const errorMessage = "Not a valid player type ( real or computer )";
      expect(() => {
        player1.playerType = "";
      }).toThrow(errorMessage);

      expect(() => {
        player2.playerType = "test";
      }).toThrow(errorMessage);
    });
  });

  describe("Player Gameboard methods", () => {
    test("should initialize with no gameboard", () => {
      expect(player1.gameboard).toBeNull();
    });

    test("should not be able to set gameboard to an object not an instance of gameboard", () => {
      const mockInvalidGameBoard = {};
      expect(() => {
        player1.gameboard = mockInvalidGameBoard;
      }).toThrow("Not a valid gameboard");
    });

    test("should be able to set new gameboard", () => {
      const mockGameBoard = {};
      jest.spyOn(player1, "_validate").mockReturnValue(mockGameBoard);
      player1.gameboard = mockGameBoard;
      expect(player1.gameboard).toBe(mockGameBoard);
      jest.resetAllMocks();
    });
  });
});