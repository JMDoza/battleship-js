import { Ship } from "../src/battleship";

describe("Ship Object", () => {
  let ship;

  beforeEach(() => {
    ship = Ship(2);
  });

  test("should throw an error if length or initialHists is not a number", () => {
    expect(() => Ship("test")).toThrow("Length must be a valid number");
    expect(() => Ship(1, "test")).toThrow("initialHits must be a valid number");
  });

  test("length should return correct value", () => {
    expect(ship.length()).toEqual(2);
  });

  test("damage should return a new ship object", () => {
    const damagedShip = ship.damage();
    expect(damagedShip).toBeDefined();
    expect(damagedShip).not.toBe(ship);
  });

  test("numOfHits should return correct number of times hit", () => {
    const damagedShip = ship.damage().damage();
    expect(ship.numOfHits()).toEqual(0);
    expect(damagedShip.numOfHits()).toEqual(2);
  });

  test("isSunk should return true/false whether ship has sunk", () => {
    let damagedShip = ship.damage();
    expect(damagedShip.isSunk()).toBeFalsy();
    damagedShip = damagedShip.damage();
    expect(damagedShip.isSunk()).toBeTruthy();
  });
});
