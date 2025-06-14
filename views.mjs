import {
  gameBlockElementNotCreatedYet,
  getElementByIdStringFromGameDatumId,
  cssInlineStyle,
  getColumnAndRowIndexFromGameDataArrayIndex,
  GameBlock,
} from "./utilityFunctions.mjs";

export function renderGameBoardCells() {
  const gameBoardCellElements = [...Array(16)].map((_) => {
    const gameBoardCellElement = document.createElement("div");
    gameBoardCellElement.classList.add("game__board-cell");
    return gameBoardCellElement;
  });
  document
    .getElementById("game-board-cells-container")
    .append(...gameBoardCellElements);
}

export function updateView(gameDataArray, gameRoundRecords) {
  document.getElementById("game-move-steps").textContent = `${
    gameRoundRecords.length - 1
  }`;
  gameDataArray.forEach((gameDataArrayElement, arrayIndex) => {
    if (gameDataArrayElement === null) return;
    if (Array.isArray(gameDataArrayElement)) {
      if (notMergedYet(gameDataArrayElement)) {
        gameDataArrayElement.forEach((gameDatum) =>
          renderOrUpdateGameBlockElementByGameDatum(gameDatum, arrayIndex)
        );
      } else {
      }
    } else {
      renderOrUpdateGameBlockElementByGameDatum(
        gameDataArrayElement,
        arrayIndex
      );
    }
  });
  clearRemovedGameBlockElements(gameDataArray);

  function renderOrUpdateGameBlockElementByGameDatum(gameDatum, arrayIndex) {
    if (gameBlockElementNotCreatedYet(gameDatum)) {
      renderGameBlockElementFromGameDatum(gameDatum, arrayIndex);
    } else {
      updateGameBlockElementByArrayIndex(gameDatum, arrayIndex);
    }
    function renderGameBlockElementFromGameDatum(gameDatum, arrayIndex) {
      document
        .getElementById("game-blocks-container")
        .appendChild(GameBlock(gameDatum, arrayIndex));
    }
    function updateGameBlockElementByArrayIndex(gameDatum, arrayIndex) {
      const [columnIndex, rowIndex] =
        getColumnAndRowIndexFromGameDataArrayIndex(arrayIndex);
      const gameBlockElement = document.getElementById(
        getElementByIdStringFromGameDatumId(gameDatum.id)
      );
      gameBlockElement.style = cssInlineStyle(gameDatum, arrayIndex);
      gameBlockElement.textContent = `${gameDatum.value}`;
    }
  }
  function clearRemovedGameBlockElements(gameDataArray) {
    const gameDataIds = gameDataArray.reduce(
      (accumulator, gameDataArrayElement) => {
        if (gameDataArrayElement === null) {
          return accumulator;
        } else if (Array.isArray(gameDataArrayElement)) {
          return [
            ...accumulator,
            ...gameDataArrayElement.map((gameDatum) => gameDatum.id),
          ];
        } else {
          return [...accumulator, gameDataArrayElement.id];
        }
      },
      []
    );
    const gameBlockElementIds = Array.from(
      document.querySelectorAll("div.game__block")
    ).map((gameBlockElement) =>
      Number(gameBlockElement.getAttribute("data-game-datum-id"))
    );
    const clearedGameDatumIds = gameBlockElementIds.filter(
      (gameBlockElementId) => !gameDataIds.includes(gameBlockElementId)
    );
    clearedGameDatumIds.forEach((clearedGameDatumId) =>
      document
        .getElementById(getElementByIdStringFromGameDatumId(clearedGameDatumId))
        .remove()
    );
  }
}
