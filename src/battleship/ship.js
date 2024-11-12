function Ship(len) {
  if (typeof len !== "number" || isNaN(len)) {
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
  };
}

export { Ship };
