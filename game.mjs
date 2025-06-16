import { getColumnAndRowIndexFromGameDataArrayIndex } from "./utilityFunctions.mjs";

export class Game {
  constructor() {
    this.gameRoundRecords = [];
    this.gameDataArray = [...Array(16)].map((_) => null);
    this.gameOver = false;
    this.gameDatumIdGenerator = this.gameDatumIdGeneratorFunction();
    this.round = 1;
  }

  *gameDatumIdGeneratorFunction() {
    let gameDatumId = 1;
    while (true) {
      yield `round-${this.round}_${gameDatumId++}`;
    }
  }

  createNewGameDatum() {
    if (!this.__nullInArray(this.gameDataArray)) return;
    const nullIndexesOfGameDataArray = this.gameDataArray
      .map((gameDatum, index) => {
        if (gameDatum === null) {
          return index;
        } else {
          return null;
        }
      })
      .filter((_) => _ !== null);
    const randomedArrayIndex = this.__getRandomInt(
      nullIndexesOfGameDataArray.length
    );
    const newGameDatumIndex = nullIndexesOfGameDataArray[randomedArrayIndex];
    const newGameDatumValue = Math.pow(2, this.__getRandomInt(2) + 1);
    const newGameDatum = {
      value: newGameDatumValue,
      id: this.gameDatumIdGenerator.next().value,
      merged: false,
    };
    const newGameDataArray = [...this.gameDataArray];
    newGameDataArray[newGameDatumIndex] = newGameDatum;
    this.gameDataArray = newGameDataArray;
  }

  move(direction) {
    if (this.gameOver) return;
    if (!["left", "right", "up", "down"].includes(direction)) return;
    const originalGameDataArray = [...this.gameDataArray];
    this.gameDataArray = this.__movedGameDataArray(
      this.gameDataArray,
      direction
    );
    if (isMoved(this.gameDataArray, originalGameDataArray)) {
      this.createNewGameDatum();
      this.gameRoundRecords.push(this.gameDataArray);
    }
    function isMoved(newGameDataArray, originalGameDataArray) {
      return (
        JSON.stringify(newGameDataArray) !==
        JSON.stringify(originalGameDataArray)
      );
    }
  }

  isEndGame(gameDataArray) {
    return ["up", "right", "down", "left"].every(
      (direction) =>
        JSON.stringify(this.__movedGameDataArray(gameDataArray, direction)) ===
        JSON.stringify(gameDataArray)
    );
  }

  __getRandomInt(maxNotIncludedInt) {
    return Math.floor(Math.random() * maxNotIncludedInt);
  }

  __nullInArray(array) {
    return array.some((_) => _ === null);
  }

  __getElementByIdStringFromGameDatumId(gameDatumId) {
    return `game-block-element-${gameDatumId}`;
  }

  __movedGameDataArray(originalGameDataArray, direction) {
    const workingGameArrays = transformToWorkingGameArrays(
      originalGameDataArray,
      direction
    );
    const forwardedWorkingGameArrays =
      forwardWorkingGameArrays(workingGameArrays);
    const movedGameDataArray = transformToGameDataArray(
      forwardedWorkingGameArrays,
      direction
    );
    const mergedGameDataArray = mergeCombinedGameDatum(movedGameDataArray);
    return mergedGameDataArray;

    function transformToWorkingGameArrays(gameDataArray, direction) {
      let workingGameArrays;
      if (direction === "left" || direction === "right") {
        workingGameArrays = gameDataArray.reduce(
          (accumulator, gameDatum, index) => {
            const [columnIndex, rowIndex] =
              getColumnAndRowIndexFromGameDataArrayIndex(index);
            accumulator[rowIndex].push(gameDatum);
            return accumulator;
          },
          [[], [], [], []]
        );
        if (direction === "right") {
          workingGameArrays = workingGameArrays.map((_) => _.reverse());
        }
      }
      if (direction === "up" || direction === "down") {
        workingGameArrays = gameDataArray.reduce(
          (accumulator, gameDatum, index) => {
            const [columnIndex, rowIndex] =
              getColumnAndRowIndexFromGameDataArrayIndex(index);
            accumulator[columnIndex].push(gameDatum);
            return accumulator;
          },
          [[], [], [], []]
        );
        if (direction === "down") {
          workingGameArrays = workingGameArrays.map((_) => _.reverse());
        }
      }
      return workingGameArrays;
    }

    function forwardWorkingGameArrays(workingGameArrays) {
      return workingGameArrays.map((_) => moveWorkingGameArray(_));
    }

    function moveWorkingGameArray(workingGameArray) {
      return fillArrayWithNullsToLength4(
        filterNullsOutOfArray(
          combineGameDatumWithSameValueIntoSameArray(
            filterNullsOutOfArray(workingGameArray)
          )
        )
      );
      function filterNullsOutOfArray(array) {
        return array.filter((_) => _ !== null);
      }
      function combineGameDatumWithSameValueIntoSameArray(array) {
        return array.reduce((accumulator, currentGameBlock) => {
          if (accumulator.length === 0) return [currentGameBlock];
          if (accumulator.at(-1)?.value === currentGameBlock.value) {
            return [
              ...accumulator.slice(0, -1),
              [accumulator.at(-1), currentGameBlock],
              null,
            ];
          } else {
            return [...accumulator, currentGameBlock];
          }
        }, []);
      }
      function fillArrayWithNullsToLength4(array) {
        if (array.length >= 4) return array;
        return array.concat(Array(4 - array.length).fill(null));
      }
    }

    function transformToGameDataArray(forwardedWorkingGameArrays, direction) {
      let tempGameDataArray = Array(16);
      forwardedWorkingGameArrays.forEach(
        (forwardedWorkingGameArray, arrayLayer0Index) => {
          forwardedWorkingGameArray.forEach((gameDatum, arrayLayer1Index) => {
            let index;
            switch (direction) {
              case "left":
                index = arrayLayer1Index + arrayLayer0Index * 4;
                break;
              case "right":
                index = 3 - arrayLayer1Index + arrayLayer0Index * 4;
                break;
              case "up":
                index = arrayLayer0Index + arrayLayer1Index * 4;
                break;
              case "down":
                index = arrayLayer0Index + (3 - arrayLayer1Index) * 4;
                break;
            }
            tempGameDataArray[index] = gameDatum;
          });
        }
      );
      return tempGameDataArray;
    }

    function mergeCombinedGameDatum(gameDataArray) {
      return gameDataArray.map((gameDataArrayElement) => {
        if (gameDataArrayElement === null) {
          return null;
        } else if (Array.isArray(gameDataArrayElement)) {
          const gameDatum = gameDataArrayElement[1];
          return { ...gameDatum, value: gameDatum.value * 2, merged: true };
        } else {
          return { ...gameDataArrayElement, merged: false };
        }
      });
    }
  }
}
