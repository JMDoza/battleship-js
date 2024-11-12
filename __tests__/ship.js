import { Ship, isShip } from "../src/battleship/ship";

describe("Ship Object", () => {
  let ship;

  beforeEach(() => {
    ship = Ship(2);
  });

  test("should throw an error if length or initialHists is not a number", () => {
    expect(() => Ship("test")).toThrow("Length must be a valid number");
  });

  test("should return correct length", () => {
    expect(ship.length()).toEqual(2);
  });

  test("should return correct number of times hit", () => {
    ship.damage();
    expect(ship.numOfHits()).toEqual(1);
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
