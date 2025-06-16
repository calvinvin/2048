import { Game } from "./game.mjs";
import { View } from "./views.mjs";

export class GameController {
  constructor(gameContainerElement) {
    this.gameContainerElement = gameContainerElement;
    this.game = new Game();
    this.view = new View(this.gameContainerElement);
  }

  attachKeyboardControl() {
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      // if (!Object.keys(keyDownDirectionDict).includes(key)) return;
      if (this.game.gameOver) return;
      this.game.move(this.#pressedKeyToDirection(e));
      this.view.updateView(this.game.gameDataArray, this.game.gameRoundRecords);
      if (this.game.isEndGame(this.game.gameDataArray)) {
        this.game.gameOver = true;
        setTimeout(() => window.alert("End game!"), 500);
      }
    });
  }

  initialize() {
    this.__initializeHTMLElements();
    this.__initializeGameBoard();
  }
  #pressedKeyToDirection(e) {
    const keyDownDirectionDict = {
      arrowleft: "left",
      a: "left",
      j: "left",
      4: "left",
      arrowright: "right",
      d: "right",
      l: "right",
      6: "right",
      arrowup: "up",
      w: "up",
      i: "up",
      8: "up",
      arrowdown: "down",
      s: "down",
      k: "down",
      5: "down",
    };
    const key = e.key.toLowerCase();
    return keyDownDirectionDict[e.key.toLowerCase()];
  }
  __initializeGameBoard() {
    this.view.renderGameBoardCells();
    this.game.createNewGameDatum();
    this.game.createNewGameDatum();
    this.game.gameRoundRecords.push(this.game.gameDataArray);
    this.view.updateView(this.game.gameDataArray, this.game.gameRoundRecords);
  }

  __initializeHTMLElements() {
    const moveStepsDiv = document.createElement("p");
    const moveStepsSpan = document.createElement("span");
    moveStepsDiv.textContent = "目前移動次數：";
    moveStepsSpan.id = "game-move-steps";
    moveStepsDiv.appendChild(moveStepsSpan);
    const gameBoardContainer = document.createElement("div");
    gameBoardContainer.id = "game-board";
    const gameBoardCellsContainer = document.createElement("div");
    gameBoardCellsContainer.id = "game-board-cells-container";
    const gameBlockContainer = document.createElement("div");
    gameBlockContainer.id = "game-blocks-container";
    gameBoardContainer.appendChild(gameBoardCellsContainer);
    gameBoardContainer.appendChild(gameBlockContainer);
    const restartButton = document.createElement("button");
    restartButton.id = "game-restart-button";
    restartButton.textContent = "重新開始";
    restartButton.type = "button";
    restartButton.addEventListener("click", () => {
      this.restartGame();
    });
    this.gameContainerElement.appendChild(moveStepsDiv);
    this.gameContainerElement.appendChild(gameBoardContainer);
    this.gameContainerElement.appendChild(restartButton);
  }

  restartGame() {
    this.game.round++;
    this.game.gameRoundRecords = [];
    this.game.gameDataArray = [...Array(16)].map((_) => null);
    this.game.gameOver = false;
    this.game.gameDatumIdGenerator = this.game.gameDatumIdGeneratorFunction();
    this.view.updateView(this.game.gameDataArray, [null]);
    this.game.createNewGameDatum();
    this.game.createNewGameDatum();
    this.game.gameRoundRecords.push(this.game.gameDataArray);
    this.view.updateView(this.game.gameDataArray, this.game.gameRoundRecords);
  }

  attachSwipeControl() {
    const swipeThreshold = 25;
    const swipeDirectionRatioThreshold = 1.5;
    const listeningMove = handlePointerMove.bind(this);
    let initialX, initialY, endX, endY;
    let moved = false;
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp.bind(this));

    function handlePointerDown(e) {
      initialX = e.screenX;
      initialY = e.screenY;
      document.addEventListener("pointermove", listeningMove);
    }
    function handlePointerMove(e) {
      endX = e.screenX;
      endY = e.screenY;
      const swipeDirection = getSwipeDirection(initialX, initialY, endX, endY);
      if (swipeDirection && !moved) {
        this.game.move(swipeDirection);
        this.view.updateView(
          this.game.gameDataArray,
          this.game.gameRoundRecords
        );
        moved = true;
      }
    }
    function handlePointerUp(e) {
      document.removeEventListener("pointermove", listeningMove);
      moved = false;
    }

    function getSwipeDirection(initialX, initialY, endX, endY) {
      const diffX = endX - initialX;
      const diffY = endY - initialY;
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      if (![absDiffX, absDiffY].some((absDiff) => absDiff > swipeThreshold)) {
        return null;
      }
      if (absDiffX / absDiffY > swipeDirectionRatioThreshold) {
        return diffX > 0 ? "right" : "left";
      } else if (absDiffY / absDiffX > swipeDirectionRatioThreshold) {
        return diffY > 0 ? "down" : "up";
      } else {
        return null;
      }
    }
  }
}
