export function getRandomInt(maxNotIncludedInt) {
  return Math.floor(Math.random() * maxNotIncludedInt);
}

export function nullInArray(array) {
  return array.some((_) => _ === null);
}

export function getColumnAndRowIndexFromGameDataArrayIndex(index) {
  return [index % 4, Math.floor(index / 4)];
}

export function* gameDatumIdGeneratorFunction() {
  let gameDatumId = 1;
  while (true) {
    yield gameDatumId++;
  }
}

export function getElementByIdStringFromGameDatumId(gameDatumId) {
  return `game-block-element-${gameDatumId}`;
}

export function notMergedYet(gameDataArrayElement) {
  return (
    JSON.stringify({ ...gameDataArrayElement[0], id: undefined }) !==
    JSON.stringify({ ...gameDataArrayElement[1], id: undefined })
  );
}

export function gameBlockElementNotCreatedYet(gameDatum) {
  return !document.getElementById(
    getElementByIdStringFromGameDatumId(gameDatum.id)
  );
}

export function cssInlineStyle(gameDatum, arrayIndex) {
  const [columnIndex, rowIndex] =
    getColumnAndRowIndexFromGameDataArrayIndex(arrayIndex);
  return `--_columnIndex: ${columnIndex}; --_rowIndex: ${rowIndex}; background-color: ${HSLFromGameDatum(
    gameDatum
  )}; color: ${textColorFromGameDatum(gameDatum)};`;

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

export function endGame(gameDataArray) {
  return ["up", "right", "down", "left"].every(
    (direction) =>
      JSON.stringify(movedGameDataArray(gameDataArray, direction)) ===
      JSON.stringify(gameDataArray)
  );
}

export function movedGameDataArray(originalGameDataArray, direction) {
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
      if (Array.isArray(gameDataArrayElement)) {
        const gameDatum = gameDataArrayElement[0];
        return { ...gameDatum, value: gameDatum.value * 2 };
      } else {
        return gameDataArrayElement;
      }
    });
  }
}

export function GameBlock(gameDatum, arrayIndex) {
  if (gameDatum === null) return;
  const gameBlockElement = document.createElement("div");
  gameBlockElement.setAttribute("data-game-datum-id", gameDatum.id);
  gameBlockElement.setAttribute(
    "id",
    getElementByIdStringFromGameDatumId(gameDatum.id)
  );
  gameBlockElement.textContent = gameDatum.value;
  gameBlockElement.classList.add("game__block", "generated-block");
  gameBlockElement.style = cssInlineStyle(gameDatum, arrayIndex);
  return gameBlockElement;
}

export function createNewGameDatum(gameDataArray, gameDatumId) {
  if (!nullInArray(gameDataArray)) return gameDataArray;
  const nullIndexesOfGameDataArray = gameDataArray
    .map((gameDatum, index) => {
      if (gameDatum === null) {
        return index;
      } else {
        return null;
      }
    })
    .filter((_) => _ !== null);
  const randomedArrayIndex = getRandomInt(nullIndexesOfGameDataArray.length);
  const newGameDatumIndex = nullIndexesOfGameDataArray[randomedArrayIndex];
  const newGameDatumValue = Math.pow(2, getRandomInt(2) + 1);
  const [newGameDatumColumnIndex, newGameDatumRowIndex] =
    getColumnAndRowIndexFromGameDataArrayIndex(newGameDatumIndex);
  const newGameDatum = {
    value: newGameDatumValue,
    columnIndex: newGameDatumColumnIndex,
    rowIndex: newGameDatumRowIndex,
    id: gameDatumId,
  };
  const newGameDataArray = [...gameDataArray];
  newGameDataArray[newGameDatumIndex] = newGameDatum;
  return newGameDataArray;
}
