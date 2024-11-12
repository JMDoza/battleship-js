function Ship(len, initialHits = 0) {
  if (typeof len !== "number" || isNaN(len)) {
    throw new Error("Length must be a valid number");
  }
  if (typeof initialHits !== "number" || isNaN(initialHits)) {
    throw new Error("initialHits must be a valid number");
  }

  const hits = initialHits;

  const length = () => len;
  const numOfHits = () => hits;
  const damage = () => Ship(len, hits + 1);
  const isSunk = () => hits >= len;
  return {
    length,
    numOfHits,
    damage,
    isSunk,
  };
}

export { Ship };
