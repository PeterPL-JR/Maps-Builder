const history = [];
var lastModifiedTiles = [];

const EDIT_TILES = 0;
const EDIT_SPAWN = 1;
const EDIT_DIMENSION = 2;

function modifyTile(x, y, oldType, newType) {
    lastModifiedTiles.push({action: EDIT_TILES, xPos: x, yPos: y, oldType, newType});
}

function modifySpawn() {
    console.log("MODIFY SPAWN", spawnTiles);
}

function modifyMapDimension() {
    console.log("RESIZE MAP", mapWidth, mapHeight);
}

const EMPTY_ARRAY = 0;
function putIntoHistory() {
    if(lastModifiedTiles.length != EMPTY_ARRAY) {
        console.log("PUT", lastModifiedTiles);
        lastModifiedTiles = [];
    }
}

function undo() {
    console.log("UNDO!");
}
function redo() {
    console.log("REDO!");
}