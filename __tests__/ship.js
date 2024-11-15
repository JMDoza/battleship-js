import { Ship, isShip } from "../src/battleship/ship";

describe("Ship Object", () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(2);
  });

  test("should throw an error if length is not a number", () => {
    expect(() => new Ship("test")).toThrow("Length must be a valid number");
  });

  test("should throw an error if length is not greater than 0", () => {
    expect(() => new Ship("0")).toThrow("Length must be a valid number");
    expect(() => new Ship("-1")).toThrow("Length must be a valid number");
  });

  test("should return correct length", () => {
    expect(ship.length).toEqual(2);
  });

  test("should return correct number of times hit", () => {
    ship.damage();
    expect(ship.hits).toEqual(1);
  });

  test("should return true/false whether ship has sunk", () => {
    ship.damage();
    expect(ship.isSunk()).toBeFalsy();
    ship.damage();
    expect(ship.isSunk()).toBeTruthy();
  });

  test("should be a Ship object", () => {
    expect(isShip(ship)).toBeTruthy();
  });
});
