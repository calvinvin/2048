import { GameController } from "./controller.mjs";

const gameContainerElement = document.getElementById("game");
const gameController = new GameController(gameContainerElement);

gameController.initialize();
gameController.attachKeyboardControl();
gameController.attachSwipeControl();
