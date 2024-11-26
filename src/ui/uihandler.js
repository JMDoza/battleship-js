import { createElement, appendChildren } from "./domUtils";
import { translateCol } from "./domUtils";
import { globalEventBus as eventBus } from "../battleship/event-emitter";

class UIHandler {
  constructor() {
    this.eventBus = eventBus;
    this.playerBoardElements = document.querySelectorAll(".player-gameboard");
    this.turnOverlay = createElement("div", "overlay");
    this.currentDraggable = null;
    this.draggableStyle = null;

    this.eventBus.on(`placedShip`, this.renderShip.bind(this));
    this.eventBus.on(`succeededMove`, this.reRenderShip.bind(this));
    this.eventBus.on(
      `failedMove`,
      this.updateCurrentDraggableElement.bind(this)
    );
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
        addCellEventListener(this, playerID, cell);
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

  renderShip({ playerID, shipID, ship, row, col, orientation }) {
    const length = ship.length;

    const [rowshift, colshift] = orientation === "vertical" ? [1, 0] : [0, 1];
    const shipElement = createElement("div", "ship");
    shipElement.dataset.length = length;
    shipElement.dataset.orientation = orientation;
    shipElement.dataset.row = row;
    shipElement.dataset.col = col;
    shipElement.dataset.shipId = shipID;
    shipElement.setAttribute(
      "style",
      `grid-row: ${row + 2} / ${row + 2 + length * rowshift}; grid-column: ${
        col + 2
      } / ${col + 2 + length * colshift}`
    );

    makeDraggable(this, shipElement);

    this.playerBoardElements[playerID].appendChild(shipElement);
  }

  reRenderShip({ row, col }) {
    const shipData = this.currentDraggable.dataset;
    length = parseInt(shipData.length);

    const [rowshift, colshift] =
      shipData.orientation === "vertical" ? [1, 0] : [0, 1];

    this.currentDraggable.style.gridRow = `${row + 2} / ${
      row + 2 + length * rowshift
    }`;
    this.currentDraggable.style.gridColumn = `${col + 2} / ${
      col + 2 + length * colshift
    }`;
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

  updateCurrentDraggableElement(style) {
    this.currentDraggable.setAttribute("style", style);
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

function makeDraggable(instance, draggableElement) {
  draggableElement.addEventListener("mousedown", (event) => {
    event.preventDefault();

    instance.draggableStyle = draggableElement.getAttribute("style");

    draggableElement.style.pointerEvents = "none";
    draggableElement.style.zIndex = "900";
    instance.currentDraggable = draggableElement;

    const handleMouseUp = () => {
      mouseUp(instance, handleMouseUp);
    };

    document.addEventListener("mouseup", handleMouseUp);
  });
}

function mouseUp(instance, handleMouseUp) {
  const element = instance.currentDraggable;

  element.style.pointerEvents = "auto";
  element.style.zIndex = "auto";

  const shipData = element.dataset;

  eventBus.emit("moveShip", {
    originalStyle: instance.draggableStyle,
    playerID: 0,
    shipID: shipData.shipId,
    row: shipData.row,
    col: shipData.col,
    orientation: shipData.orientation,
    length: shipData.length,
  });
  instance.currentDraggable = null;
  document.removeEventListener("mouseup", handleMouseUp);
}

function addCellEventListener(instance, playerID, cell) {
  cell.addEventListener("click", (event) => {
    const cellData = event.currentTarget.dataset;
    const row = parseInt(cellData.row);
    const col = parseInt(cellData.col);
    try {
      eventBus.emit("playTurn", playerID, row, col);
    } catch (error) {
      console.log(error);
      // console.log(cell);
    }
  });

  cell.addEventListener("mouseover", (event) => {
    const cellData = event.currentTarget.dataset;
    const row = parseInt(cellData.row);
    const col = parseInt(cellData.col);
    const draggableElement = instance.currentDraggable;

    if (draggableElement) {
      const length = draggableElement.dataset.length;
      draggableElement.dataset.row = row;
      draggableElement.dataset.col = col;
      const [rowshift, colshift] =
        draggableElement.dataset.orientation === "vertical" ? [1, 0] : [0, 1];
      draggableElement.style.gridRow = `${row + 2} / ${
        row + 2 + length * rowshift
      }`;
      draggableElement.style.gridColumn = `${col + 2} / ${
        col + 2 + length * colshift
      }`;
    }
    // console.log({ row, col });
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
