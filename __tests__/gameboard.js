import { GameBoard } from "../src/battleship/gameboard";
import { Ship } from "../src/battleship/ship";

describe("Gameboard Object", () => {
  const ship1 = Ship(1);
  let gameboard;
  let newGameboard;
  beforeEach(() => {
    gameboard = GameBoard();
    newGameboard = gameboard.place(ship1, 0, 0);
  });

  test("place should return new copy of Gameboard object", () => {
    const newGameboard = gameboard.place(ship1, 0, 0);
    expect(newGameboard).toBeDefined();
    expect(newGameboard).not.toBe(gameboard);
  });

  test("place should throw an error at invalid coordinates", () => {
    expect(() => gameboard.place(ship1, -1, 0)).toThrow(
      "Coordinates must be a valid | within 10x10"
    );
    expect(() => gameboard.place(ship1, 0, 10)).toThrow(
      "Coordinates must be a valid | within 10x10"
    );
  });

  test("place should be able to place ships at specific coordinates", () => {
    expect(newGameboard.shipAt(0, 0)).toBe(ship1);
  });
});
