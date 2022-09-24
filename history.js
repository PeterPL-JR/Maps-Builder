const history = [];
var lastModifiedTiles = [];
var historyPosition = 0;

const EDIT_TILES = 0;
const EDIT_SPAWN = 1;
const EDIT_DIMENSION = 2;

function modifyTile(x, y, oldType, newType) {
    lastModifiedTiles.push({xPos: x, yPos: y, oldType, newType});
}

function modifySpawn() {
    putIntoHistory(EDIT_SPAWN, Array.from(spawnTiles));
}

function modifyMapDimension() {
    putIntoHistory(EDIT_DIMENSION, {width: mapWidth, height: mapHeight});
}

function putIntoHistory(action, data) {
    history.unshift({action, data});
    console.log(history);
}

const EMPTY_ARRAY = 0;
function putTilesIntoHistory() {
    if(lastModifiedTiles.length != EMPTY_ARRAY) {
        putIntoHistory(EDIT_TILES, lastModifiedTiles);
        lastModifiedTiles = [];
    }
}

function undo() {
    console.log("UNDO!");
}
function redo() {
    console.log("REDO!");
}