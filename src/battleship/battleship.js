import { Player } from "../src/battleship/player";
import { GameBoard } from "../src/battleship/gameboard";
import { Ship } from "../src/battleship/ship";
import { GameManager } from "./game-manager";

const players = [
  new Player("Player 1", "real", 1),
  new Player("Player 2", "computer", 2),
];

const boards = [new GameBoard(1), new GameBoard(2)];

const p1Ships = [new Ship(2), new Ship(3), new Ship(4)];
const p2Ships = [new Ship(2), new Ship(3), new Ship(4)];

const p1Coordinates = [
  [1, 1, "vertical"],
  [4, 1, "horizontal"],
  [6, 6, "horizontal"],
];

const p2Coordinates = [
  [1, 1, "vertical"],
  [4, 1, "horizontal"],
  [6, 6, "horizontal"],
];

const gameManager = new GameManager(players, boards);
gameManager.startGame(players[0], {
  p1Ships,
  p1Coordinates,
  p2Ships,
  p2Coordinates,
});
