import { GameBoard } from "../src/battleship/gameboard";
import { Ship } from "../src/battleship/ship";

describe("Gameboard Object", () => {
  let ship1;
  let ship2;

  let gameboard;
  beforeEach(() => {
    gameboard = GameBoard();
    ship1 = Ship(1);
    ship2 = Ship(1);
  });

  test("should throw an error at invalid coordinates", () => {
    expect(() => gameboard.place(-1, 0, ship1)).toThrow(
      "Coordinates must be a valid | within 10x10"
    );
    expect(() => gameboard.place(0, 10, ship1)).toThrow(
      "Coordinates must be a valid | within 10x10"
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

  describe("Longer ship placement", () => {
    const ship3 = Ship(2);
    const ship4 = Ship(3);

    test("should be able to place a ship at specific coordinates vertically", () => {
      gameboard.place(0, 2, ship3);
      expect(gameboard.shipAt(0, 2)).toBe(ship3);
      expect(gameboard.shipAt(1, 2)).toBe(ship3);
    });

    test("should be able to place a ship at specific coordinates Horizontally", () => {
      gameboard.place(0, 2, ship4, "horizontal");
      expect(gameboard.shipAt(0, 2)).toBe(ship4);
      expect(gameboard.shipAt(0, 3)).toBe(ship4);
      expect(gameboard.shipAt(0, 4)).toBe(ship4);
    });

    describe("Vertical Edge placement", () => {
      test("should be able to place a ship at edge without leaving grid part 1", () => {
        gameboard.place(9, 0, ship4);
        expect(gameboard.shipAt(7, 0)).toBe(ship4);
        expect(gameboard.shipAt(8, 0)).toBe(ship4);
        expect(gameboard.shipAt(9, 0)).toBe(ship4);
      });

      test("should be able to place a ship at edge without leaving grid part 2", () => {
        gameboard.place(8, 0, ship4);
        expect(gameboard.shipAt(7, 0)).toBe(ship4);
        expect(gameboard.shipAt(8, 0)).toBe(ship4);
        expect(gameboard.shipAt(9, 0)).toBe(ship4);
      });

      test("should be able to place a ship at edge without leaving grid part 3", () => {
        gameboard.place(7, 0, ship4);
        expect(gameboard.shipAt(7, 0)).toBe(ship4);
        expect(gameboard.shipAt(8, 0)).toBe(ship4);
        expect(gameboard.shipAt(9, 0)).toBe(ship4);
      });
    });

    describe("Horizontal Edge placement", () => {
      test("should be able to place a ship at edge without leaving grid part 1", () => {
        gameboard.place(0, 9, ship4, "horizontal");
        expect(gameboard.shipAt(0, 7)).toBe(ship4);
        expect(gameboard.shipAt(0, 8)).toBe(ship4);
        expect(gameboard.shipAt(0, 9)).toBe(ship4);
      });

      test("should be able to place a ship at edge without leaving grid part 2", () => {
        gameboard.place(0, 8, ship4, "horizontal");
        expect(gameboard.shipAt(0, 7)).toBe(ship4);
        expect(gameboard.shipAt(0, 8)).toBe(ship4);
        expect(gameboard.shipAt(0, 9)).toBe(ship4);
      });

      test("should be able to place a ship at edge without leaving grid part 3", () => {
        gameboard.place(0, 8, ship4, "horizontal");
        expect(gameboard.shipAt(0, 7)).toBe(ship4);
        expect(gameboard.shipAt(0, 8)).toBe(ship4);
        expect(gameboard.shipAt(0, 9)).toBe(ship4);
      });
    });
  });

  describe("Attacking Ships", () => {
    test("should be able to attack a ship", () => {
      gameboard.place(0, 0, ship1);
      expect(gameboard.receiveAttack(0, 0)).toBeTruthy();
      expect(gameboard.getAttackHistory(0, 0)).toBeTruthy();
      expect(gameboard.shipAt(0, 0).numOfHits()).toBe(1);
    });

    test("should not be able to attack a ship at the same coordinates", () => {
      const ship3 = Ship(3);
      gameboard.place(0, 0, ship3);
      gameboard.receiveAttack(0, 0);
      expect(gameboard.receiveAttack(0, 0)).toBeFalsy();
      expect(gameboard.getAttackHistory(0, 0)).toBeTruthy();
      expect(gameboard.shipAt(0, 0).numOfHits()).toBe(1);
    });

    test("should be able to attack a long ship and all update all occupied cells", () => {
      const ship3 = Ship(3);
      gameboard.place(0, 0, ship3);
      gameboard.receiveAttack(0, 0);
      expect(gameboard.shipAt(0, 0).numOfHits()).toBe(1);
      expect(gameboard.shipAt(1, 0).numOfHits()).toBe(1);
      expect(gameboard.shipAt(2, 0).numOfHits()).toBe(1);
      gameboard.receiveAttack(1, 0);
      expect(gameboard.shipAt(0, 0).numOfHits()).toBe(2);
      expect(gameboard.shipAt(1, 0).numOfHits()).toBe(2);
      expect(gameboard.shipAt(2, 0).numOfHits()).toBe(2);
    });
  });

  test("should be able to check if all existing ships have sunk", () => {
    gameboard.place(0, 0, ship1);
    gameboard.place(1, 0, ship2);
    gameboard.receiveAttack(0, 0);
    gameboard.receiveAttack(1, 0);
    expect(gameboard.hasAllShipsSunk()).toBeTruthy();
  });

  test("should be able to check if all existing ships have not sunk", () => {
    gameboard.place(0, 0, ship1);
    gameboard.place(1, 0, ship2);
    gameboard.receiveAttack(0, 0);
    expect(gameboard.hasAllShipsSunk()).toBeFalsy();
  });
});
