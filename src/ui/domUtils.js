function createElement(elementType, className = "", textContent = "", id = "") {
  const element = document.createElement(elementType);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  if (id) {
    element.id = id;
  }

  return element;
}

function appendChildren(parent, children) {
  children.forEach((child) => parent.appendChild(child));
}

function translateCol(col) {
  const numToAlphabet = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E",
    5: "F",
    6: "G",
    7: "H",
    8: "I",
    9: "J",
  };

  const letterToNum = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
  };

  if (!isNaN(col)) {
    return numToAlphabet[col];
  } else {
    return letterToNum[col];
  }
}

export { createElement, appendChildren, translateCol };
