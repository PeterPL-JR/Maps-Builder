const history = [];
var lastModifiedTiles = [];
var historyPosition = 0;

const EDIT_TILES = 0;
const EDIT_SPAWN = 1;
const EDIT_DIMENSION = 2;

const UNDO = 0;
const REDO = 1;

function modifyTile(x, y, oldType, newType) {
    lastModifiedTiles.push({xPos: x, yPos: y, oldType, newType});
}
function modifySpawn(oldSpawn, newSpawn) {
    putIntoHistory(EDIT_SPAWN, {oldSpawn, newSpawn});
}
function modifyMapDimension(oldData, newData, removedTiles) {
    putIntoHistory(EDIT_DIMENSION, {oldData, newData, removedTiles});
}

const ZERO = 0;
function putIntoHistory(action, data) {
    if(historyPosition != ZERO) {
        for(var i = 0; i < historyPosition; i++) history.shift();
        historyPosition = 0;
    }
    history.unshift({action, data});
}

const EMPTY_ARRAY = 0;
function putTilesIntoHistory() {
    if(lastModifiedTiles.length != EMPTY_ARRAY) {
        putIntoHistory(EDIT_TILES, lastModifiedTiles);
        lastModifiedTiles = [];
    }
}

function setHistoryPoint(action) {
    if(history.length == 0) return;
    const point = history[historyPosition];
    
    if(point.action == EDIT_TILES) {
        for(var historyTile of point.data) {
            const tile = findTileByPos(tiles, historyTile.xPos, historyTile.yPos);
            if(!tile) continue;
            
            if(action == UNDO) tile.type = historyTile.oldType;
            if(action == REDO) tile.type = historyTile.newType;
        }
        saveTilesObj();
    }
    if(point.action == EDIT_SPAWN) {
        if(action == UNDO) spawnTiles = point.data.oldSpawn;
        if(action == REDO) spawnTiles = point.data.newSpawn;
        saveSpawnTilesObj();
    }
    if(point.action == EDIT_DIMENSION) {
        if(action == UNDO) var data = point.data.oldData;
        if(action == REDO) var data = point.data.newData;
        resizeMap(data.width, data.height);

        const removedTiles = point.data.removedTiles;
        if(removedTiles && removedTiles.length != 0) {
            for(var tile of removedTiles) {
                findTileByPos(tiles, tile.xPos, tile.yPos).type = tile.type;
            }
        }
    }
}

function undo() {
    setHistoryPoint(UNDO);
    if(historyPosition < history.length - 1) {
        historyPosition++;
    }
}
function redo() {
    setHistoryPoint(REDO);
    if(historyPosition > ZERO) {
        historyPosition--;
    }
}