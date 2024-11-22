import "./styles.css";
import { Player } from "./battleship/player";
import { GameBoard } from "./battleship/gameboard";
import { Ship } from "./battleship/ship";
import { GameManager } from "./battleship/game-manager";
import {
  EasyAIController,
  NormalAIController,
} from "./battleship/AIController";
import { UIHandler } from "./ui/uihandler";
import { globalEventBus as eventBus } from "./battleship/event-emitter";

eventBus.on("changeAI", changeAI);

let player1Board = new GameBoard();
let player2Board = new GameBoard();
let aiController = new EasyAIController();

const players = [
  new Player("Player 1", "real", player1Board),
  new Player("Player 2", "computer", player2Board, aiController),
];

const p1Ships = [
  new Ship(2),
  new Ship(3),
  new Ship(3),
  new Ship(4),
  new Ship(5),
];

const p2Ships = [
  new Ship(2),
  new Ship(3),
  new Ship(3),
  new Ship(4),
  new Ship(5),
];
const uihandler = new UIHandler();
const gameManager = new GameManager(players);
gameManager.setShips(0, p1Ships);
gameManager.setShips(1, p2Ships);
gameManager.initializeShips(0, p1Ships);

function changeAI(playerID, AI) {
  switch (AI) {
    case "Easy":
      gameManager.setPlayerAIController(playerID, new EasyAIController());
      break;

    case "Normal":
      gameManager.setPlayerAIController(playerID, new NormalAIController());
      break;

    default:
      break;
  }
}
