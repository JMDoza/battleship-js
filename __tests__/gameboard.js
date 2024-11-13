import { GameBoard } from "../src/battleship/gameboard";
import { Ship } from "../src/battleship/ship";

describe("Gameboard Object", () => {
  let ship1;
  let ship2;
  let ship3;

  let gameboard;
  beforeEach(() => {
    gameboard = new GameBoard();
    ship1 = new Ship(1);
    ship2 = new Ship(1);
    ship3 = new Ship(3);
  });

  test("should throw an error at invalid coordinates and invalid object", () => {
    expect(() => gameboard.place(-1, 0, ship1)).toThrow(
      "Coordinates must be a valid | within 10x10"
    );
    expect(() => gameboard.place(0, 10, ship1)).toThrow(
      "Coordinates must be a valid | within 10x10"
    );
    expect(() => gameboard.place(0, 0, {})).toThrow(
      "Must be a valid Ship Object"
    );
  });

  test("should be able to place a ship at specific coordinates", () => {
    gameboard.place(0, 0, ship1);
    expect(gameboard.shipAt(0, 0)).toBe(ship1);
  });

  test("should be not able to place a ship at occupied coordinates", () => {
    gameboard.place(0, 0, ship1);

    expect(() => gameboard.place(0, 0, ship2)).toThrow(
      "Coordinates already occupied"
    );
  });

  test.todo("should not be able to place a ship next to a another ship");

  test("should not be able to place the same ship instance", () => {
    gameboard.place(0, 0, ship1);

    expect(() => gameboard.place(0, 5, ship1)).toThrow(
      "Ship already exists on board"
    );
  });

  describe("Longer ship placement", () => {
    const ship4 = new Ship(4);

    test("should be able to place a ship at specific coordinates vertically", () => {
      gameboard.place(0, 2, ship3);
      expect(gameboard.shipAt(0, 2)).toBe(ship3);
      expect(gameboard.shipAt(1, 2)).toBe(ship3);
      expect(gameboard.shipAt(1, 2)).toBe(ship3);
    });

    test("should be able to place a ship at specific coordinates Horizontally", () => {
      gameboard.place(0, 2, ship3, "horizontal");
      expect(gameboard.shipAt(0, 2)).toBe(ship3);
      expect(gameboard.shipAt(0, 3)).toBe(ship3);
      expect(gameboard.shipAt(0, 4)).toBe(ship3);
    });

    describe("Vertical Edge placement", () => {
      test.each([
        [9, 0, [7, 8, 9]], // Test case 1
        [8, 0, [7, 8, 9]], // Test case 2
        [7, 0, [7, 8, 9]], // Test case 3
      ])(
        "should be able to place a ship at edge without leaving grid at (%i, %i)",
        (row, col, expectedRows) => {
          gameboard.place(row, col, ship4, "vertical");
          expectedRows.forEach((expectedRow) => {
            expect(gameboard.shipAt(expectedRow, col)).toBe(ship4);
          });
        }
      );
    });

    describe("Horizontal Edge placement", () => {
      test.each([
        [0, 9, [7, 8, 9]], // Test case 1
        [0, 8, [7, 8, 9]], // Test case 2
        [0, 7, [7, 8, 9]], // Test case 3
      ])(
        "should be able to place a ship at edge without leaving grid at (%i, %i)",
        (row, col, expectedCols) => {
          gameboard.place(row, col, ship4, "horizontal");
          expectedCols.forEach((expectedCol) => {
            expect(gameboard.shipAt(row, expectedCol)).toBe(ship4);
          });
        }
      );
    });
  });

  describe("Attacking Ships", () => {
    test("should be able to attack a cell with a ship", () => {
      gameboard.place(0, 0, ship1);
      expect(gameboard.receiveAttack(0, 0)).toBeTruthy();
      expect(gameboard.getAttackHistory(0, 0)).toBeTruthy();
      expect(gameboard.shipAt(0, 0).hits).toBe(1);
    });

    test("should not be able to attack a cell that was already attacked", () => {
      gameboard.place(0, 0, ship3);
      gameboard.receiveAttack(0, 0);
      expect(gameboard.receiveAttack(0, 0)).toBeFalsy();
      expect(gameboard.getAttackHistory(0, 0)).toBeTruthy();
      expect(gameboard.shipAt(0, 0).hits).toBe(1);
    });

    test("should not be able to attack an out-of-bounds coordinates", () => {
      expect(() => gameboard.receiveAttack(-1, 0)).toThrow(
        "Coordinates must be a valid | within 10x10"
      );
    });

    test("should be able to attack each segment of a long ship and correctly update all occupied cells", () => {
      gameboard.place(0, 0, ship3);
      gameboard.receiveAttack(0, 0);
      expect(gameboard.shipAt(0, 0).hits).toBe(1);
      expect(gameboard.shipAt(1, 0).hits).toBe(1);
      expect(gameboard.shipAt(2, 0).hits).toBe(1);
    });
  });

  describe("Checking for Ships sunk", () => {
    let mockShip1;
    let mockShip2;
    let mockShip3;
    let mockShipsArray;

    beforeEach(() => {
      mockShip1 = { isSunk: jest.fn(() => true) };
      mockShip2 = { isSunk: jest.fn(() => true) };
      mockShip3 = { isSunk: jest.fn(() => false) };
    });

    afterEach(() => {
      mockShipsArray.mockRestore();
    });

    test("should be able to check if all existing ships have sunk", () => {
      mockShipsArray = jest
        .spyOn(gameboard, "shipsArray", "get")
        .mockReturnValue([mockShip1, mockShip2]);

      expect(gameboard.hasAllShipsSunk()).toBeTruthy();
    });

    test("should be able to check if all existing ships have not sunk", () => {
      mockShipsArray = jest
        .spyOn(gameboard, "shipsArray", "get")
        .mockReturnValue([mockShip1, mockShip3]);

      expect(gameboard.hasAllShipsSunk()).toBeFalsy();
      expect(mockShipsArray).toHaveBeenCalled();
      mockShipsArray.mockRestore();
    });
  });
});
