import { Ship } from "../src/battleship";

describe("Ship Object", () => {
  let ship;

  test("should throw an error if length is not a number", () => {
    expect(() => Ship("test")).toThrow("Length must be a valid number");
  });

  test("should return correct length", () => {
    ship = Ship(2);
    expect(ship.length()).toEqual(2);
  });
});
