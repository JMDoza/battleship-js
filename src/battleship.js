function Ship(len) {
  if (typeof len !== "number" || isNaN(len)) {
    throw new Error("Length must be a valid number");
  }

  let hits = 0;

  const length = () => {
    return len;
  };

  return {
    length,
  };
}

export { Ship };
