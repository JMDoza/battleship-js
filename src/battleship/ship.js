const SHIP_IDENTIFIER = Symbol("Ship");

function Ship(len) {
  if (typeof len !== "number" || isNaN(len) || len <= 0) {
    throw new Error("Length must be a valid number");
  }

  let hits = 0;

  const length = () => len;
  const numOfHits = () => hits;
  const damage = () => hits++;
  const isSunk = () => hits >= len;
  return {
    length,
    numOfHits,
    damage,
    isSunk,
    [SHIP_IDENTIFIER]: true,
  };
}

function isShip(object) {
  return object && object[SHIP_IDENTIFIER] === true;
}

export { Ship, isShip };
