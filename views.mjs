import { getColumnAndRowIndexFromGameDataArrayIndex } from "./utilityFunctions.mjs";

export class View {
  ANIMATION_MOVE_TIME = 150;
  constructor(gameContainerElement) {
    this.gameContainerElement = gameContainerElement;
  }

  renderGameBoardCells() {
    const gameBoardCellElements = [...Array(16)].map((_) => {
      const gameBoardCellElement = document.createElement("div");
      gameBoardCellElement.classList.add("game__board-cell");
      return gameBoardCellElement;
    });
    this.gameContainerElement
      .querySelector("#game-board-cells-container")
      .append(...gameBoardCellElements);
  }

  updateView(gameDataArray, gameRoundRecords) {
    this.gameContainerElement.querySelector(
      "#game-move-steps"
    ).textContent = `${gameRoundRecords.length - 1}`;
    gameDataArray.forEach((gameDataArrayElement, arrayIndex) => {
      if (gameDataArrayElement === null) return;
      if (Array.isArray(gameDataArrayElement)) {
        gameDataArrayElement.forEach((gameDatum) =>
          this.__renderOrUpdateGameBlockElementByGameDatum(
            gameDatum,
            arrayIndex
          )
        );
      } else {
        this.__renderOrUpdateGameBlockElementByGameDatum(
          gameDataArrayElement,
          arrayIndex
        );
      }
    });
    this.__clearRemovedGameBlockElements(gameDataArray);
  }

  __renderOrUpdateGameBlockElementByGameDatum(gameDatum, arrayIndex) {
    if (this.__gameBlockElementNotCreatedYet(gameDatum)) {
      this.__renderGameBlockElementFromGameDatum(gameDatum, arrayIndex);
    } else {
      this.__updateGameBlockElementByArrayIndex(gameDatum, arrayIndex);
    }
  }

  __renderGameBlockElementFromGameDatum(gameDatum, arrayIndex) {
    this.gameContainerElement
      .querySelector("#game-blocks-container")
      .appendChild(this.__GameBlock(gameDatum, arrayIndex));
  }

  __updateGameBlockElementByArrayIndex(gameDatum, arrayIndex) {
    const gameBlockElement = this.gameContainerElement.querySelector(
      `#${this.__getElementByIdStringFromGameDatumId(gameDatum.id)}`
    );
    gameBlockElement.classList.remove("generated-block");
    if (gameDatum.merged === true) {
      gameBlockElement.classList.add("merged-block");
    } else {
      gameBlockElement.classList.remove("merged-block");
    }
    gameBlockElement.style = this.__cssInlineStyle(gameDatum, arrayIndex);
    setTimeout(
      () => (gameBlockElement.textContent = `${gameDatum.value}`),
      this.ANIMATION_MOVE_TIME
    );
  }

  __clearRemovedGameBlockElements(gameDataArray) {
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
      this.gameContainerElement.querySelectorAll("div.game__block")
    ).map((gameBlockElement) =>
      String(gameBlockElement.getAttribute("data-game-datum-id"))
    );
    const clearedGameDatumIds = gameBlockElementIds.filter(
      (gameBlockElementId) => !gameDataIds.includes(gameBlockElementId)
    );
    clearedGameDatumIds.forEach((clearedGameDatumId) => {
      setTimeout(() => {
        const removingGameBlockElement =
          this.gameContainerElement.querySelector(
            `#${this.__getElementByIdStringFromGameDatumId(clearedGameDatumId)}`
          );
        if (removingGameBlockElement) removingGameBlockElement.remove();
      }, this.ANIMATION_MOVE_TIME);
    });
  }

  __gameBlockElementNotCreatedYet(gameDatum) {
    return !this.gameContainerElement.querySelector(
      `#${this.__getElementByIdStringFromGameDatumId(gameDatum.id)}`
    );
  }

  __cssInlineStyle(gameDatum, arrayIndex) {
    const [columnIndex, rowIndex] =
      getColumnAndRowIndexFromGameDataArrayIndex(arrayIndex);
    return `--_columnIndex: ${columnIndex}; --_rowIndex: ${rowIndex}; background-color: ${HSLFromGameDatum(
      gameDatum
    )}; color: ${textColorFromGameDatum(gameDatum)};${
      gameDatum.merged ? "z-index: 10" : ""
    }`;

    function HSLFromGameDatum(gameDatum) {
      const { value } = gameDatum;
      const log2 = Math.log2(value);
      const hslDict = {
        1: [48, 100, 80],
        2: [48, 100, 70],
        3: [48, 100, 60],
        4: [48, 100, 50],
        5: [38, 100, 60],
        6: [38, 100, 50],
        7: [28, 100, 50],
        8: [23, 100, 50],
        9: [18, 100, 50],
        10: [13, 100, 50],
        11: [8, 100, 50],
        12: [3, 100, 50],
        13: [0, 100, 50],
      };
      const [h, s, l] = hslDict[log2];
      const hslFromLog2 = `hsl(${h}, ${s}%, ${l}%)`;
      return hslFromLog2;
    }
    function textColorFromGameDatum(gameDatum) {
      const { value } = gameDatum;
      const log2 = Math.log2(value);
      return log2 <= 4 ? "var(--clr-yellow-100)" : "var(--clr-red-950)";
    }
  }

  __notMergedYet(gameDataArrayElement) {
    return (
      JSON.stringify({ ...gameDataArrayElement[0], id: undefined }) !==
      JSON.stringify({ ...gameDataArrayElement[1], id: undefined })
    );
  }

  __getElementByIdStringFromGameDatumId(gameDatumId) {
    return `game-block-element-${gameDatumId}`;
  }

  __GameBlock(gameDatum, arrayIndex) {
    if (gameDatum === null) return;
    const gameBlockElement = document.createElement("div");
    gameBlockElement.setAttribute("data-game-datum-id", gameDatum.id);
    gameBlockElement.setAttribute(
      "id",
      this.__getElementByIdStringFromGameDatumId(gameDatum.id)
    );
    gameBlockElement.textContent = gameDatum.value;
    gameBlockElement.classList.add("game__block", "generated-block");
    gameBlockElement.style = this.__cssInlineStyle(gameDatum, arrayIndex);
    return gameBlockElement;
  }
}
