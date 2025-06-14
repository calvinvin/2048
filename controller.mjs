import {
  getColumnAndRowIndexFromGameDataArrayIndex,
  nullInArray,
  getRandomInt,
  gameDatumIdGeneratorFunction,
  endGame,
  movedGameDataArray,
  createNewGameDatum,
} from "./utilityFunctions.mjs";
import * as View from "./views.mjs";

const gameRoundRecords = [];
let globalGameDataArray = [...Array(16)].map((_) => null);
let gameOver = false;

const gameDatumIdGenerator = gameDatumIdGeneratorFunction();

export function attachKeyboardControl() {
  window.addEventListener("keydown", (e) => {
    e.preventDefault();
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
    if (!Object.keys(keyDownDirectionDict).includes(key)) return;
    move(keyDownDirectionDict[e.key.toLowerCase()]);
  });
}

export function initializeGameBoard() {
  View.renderGameBoardCells();
  globalGameDataArray = createNewGameDatum(
    globalGameDataArray,
    gameDatumIdGenerator.next().value
  );
  gameRoundRecords.push(globalGameDataArray);
  View.updateView(globalGameDataArray, gameRoundRecords);
}

export function attachSwipeControl() {
  const swipeThreshold = 25;
  const swipeDirectionRatioThreshold = 1.5;
  let initialX, initialY, endX, endY, swipeToDirection;
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointerup", handlePointerUp);

  function handlePointerDown(e) {
    initialX = e.screenX;
    initialY = e.screenY;
  }

  function handlePointerUp(e) {
    endX = e.screenX;
    endY = e.screenY;
    const swipeDirection = getSwipeDirection(initialX, initialY, endX, endY);
    if (swipeDirection) move(swipeDirection);
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

function move(direction) {
  if (gameOver) return;
  const originalGameDataArray = [...globalGameDataArray];
  globalGameDataArray = movedGameDataArray(globalGameDataArray, direction);
  if (isMoved(globalGameDataArray, originalGameDataArray)) {
    globalGameDataArray = createNewGameDatum(
      globalGameDataArray,
      gameDatumIdGenerator.next().value
    );
    gameRoundRecords.push(globalGameDataArray);
  }
  View.updateView(globalGameDataArray, gameRoundRecords);
  if (endGame(globalGameDataArray)) {
    gameOver = true;
    setTimeout(() => window.alert("End game!"), 500);
  }

  function isMoved(newGameDataArray, globalGameDataArray) {
    return (
      JSON.stringify(newGameDataArray) !== JSON.stringify(globalGameDataArray)
    );
  }
}
