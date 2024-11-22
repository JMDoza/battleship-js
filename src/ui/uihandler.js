import { createElement, appendChildren } from "./domUtils";
import { translateCol } from "./domUtils";
import { globalEventBus } from "../battleship/event-emitter";

class UIHandler {
  constructor() {
    this.eventBus = globalEventBus;
    this.playerBoardElements = document.querySelectorAll(".player-gameboard");
    this.turnOverlay = createElement("div", "overlay");

    this.eventBus.on(`placedShip`, this.renderShip.bind(this));
    this.eventBus.on(`changedTurn`, this.handleSwitchTurns.bind(this));
    this.eventBus.on(`attackMade`, this.renderAttack.bind(this));
    this.eventBus.on(`gameover`, this.updateResultsUI.bind(this));

    this.setupBoards();
    this.initializeEventListeners();
  }

  setupPlayerBoard(playerID) {
    const boardFragment = document.createDocumentFragment();
    const fragArray = [];

    const corner1 = createElement("div", "corner");
    fragArray.push(corner1);
    for (let i = 0; i < 10; i++) {
      const label1 = createElement("div", "col-label", `${translateCol(i)}`);
      fragArray.push(label1);
    }

    for (let i = 0; i < 10; i++) {
      const label1 = createElement("div", "row-label", `${i}`);
      fragArray.push(label1);

      for (let j = 0; j < 10; j++) {
        const cell = createElement("div", "cell");
        addCellEventListener(playerID, cell);
        addDataSet(cell, i, j);
        addGridStyle(cell, i, j);
        fragArray.push(cell);
      }
    }
    appendChildren(boardFragment, fragArray);
    this.playerBoardElements[playerID].innerHTML = "";
    this.playerBoardElements[playerID].appendChild(boardFragment);
  }

  setupBoards() {
    this.setupPlayerBoard(0);
    this.setupPlayerBoard(1);
    this.playerBoardElements[1].appendChild(this.turnOverlay);
  }

  removeShipUIElements(playerID) {
    const shipElements =
      this.playerBoardElements[playerID].querySelectorAll(".ship");

    shipElements.forEach((element) => {
      element.remove();
    });
  }

  renderShip({ playerID, ship, row, col, orientation }) {
    const length = ship.length;

    const [rowshift, colshift] = orientation === "vertical" ? [1, 0] : [0, 1];
    const shipElement = createElement("div", "ship");
    shipElement.setAttribute(
      "style",
      `grid-row: ${row + 2} / ${row + 2 + length * rowshift}; grid-column: ${
        col + 2
      } / ${col + 2 + length * colshift}`
    );
    this.playerBoardElements[playerID].appendChild(shipElement);
  }

  renderAttack({ targetPlayerID, row, col, attackResult }) {
    const color = attackResult ? "red" : "blue";

    const shipElement = createElement("div", "action");
    shipElement.setAttribute(
      "style",
      `grid-row: ${row + 2} ; grid-column: ${
        col + 2
      } ; background-color: ${color};`
    );
    this.playerBoardElements[targetPlayerID].appendChild(shipElement);
  }

  handleSwitchTurns({ previousPlayer, nextPlayer }) {
    this.playerBoardElements[nextPlayer].appendChild(this.turnOverlay);
  }

  updateResultsUI(playerName) {
    const resultElement = document.getElementById("results");
    resultElement.textContent = `${playerName} Wins!`;
  }

  initializeEventListeners() {
    const randomizeButton = document.getElementById("randomize-button");
    const startButton = document.getElementById("start-button");
    const difficultyElement = document.getElementById("difficulty-dropdown");

    randomizeButton.addEventListener("click", (event) => {
      this.removeShipUIElements(0);

      this.eventBus.emit("randomizeShipsPressed", 0);
    });
    startButton.addEventListener("click", () => {
      this.eventBus.emit("startGame", 0, {});
      startButton.style.display = "none";
      randomizeButton.style.display = "none";
    });

    difficultyElement.addEventListener("change", () => {
      this.eventBus.emit("changeAI", 1, difficultyElement.value);
    });
  }
}

function addCellEventListener(playerID, cell) {
  cell.addEventListener("click", (event) => {
    const cellData = event.currentTarget.dataset;
    const row = parseInt(cellData.row);
    const col = parseInt(cellData.col);
    try {
      globalEventBus.emit("playTurn", playerID, row, col);
    } catch (error) {
      console.log(error);
    }
  });
}

function addDataSet(cell, row, col) {
  cell.dataset.row = row;
  cell.dataset.col = col;
}

function addGridStyle(cell, row, col) {
  cell.setAttribute("style", `grid-row: ${row + 2}; grid-column: ${col + 2}`);
}

export { UIHandler };
