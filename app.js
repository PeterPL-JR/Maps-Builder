var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE_SIZE = 96;

const MIN_MAP_SIZE = 2;
const MAX_MAP_SIZE = 50;

var control = false;
var fMode = false;
var fModeType = -1;

var zKey = false;
var spawnTiles = [];

const FILL_ADD_MODE = 0;
const FILL_REMOVE_MODE = 1;

const DEFAULT_MAP_SIZE = 40;
var mapWidth = DEFAULT_MAP_SIZE;
var mapHeight = DEFAULT_MAP_SIZE;

var lineWidth = 0.3;
const LINE_COLOUR = "white";

var rectColour = null;
var rectBounds = null;

var tiles = [];
const images = [];

function render() {
    requestAnimationFrame(render);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    renderLines();
    renderTiles();
    
    for(var index of spawnTiles) {
        var pos = getTileScreenPos(tiles[index]);
        drawRect(ctx, pos.xPos, pos.yPos, screenTileSize, screenTileSize, "red", lineWidth * 2);
    }

    if(!(fMode && (leftClicked || rightClicked))) {
        resetFill();
    }

    if(rectBounds != null && rectColour != null) {
        const bounds = getFillBounds(rectBounds);
        const width = bounds.end.xPos - bounds.begin.xPos;
        const height = bounds.end.yPos - bounds.begin.yPos;

        drawText(ctx, rectBounds.xBegin + 10, rectBounds.yBegin - 10, `${width}x${height}`, rectColour, "30px Verdana");
        drawRect(ctx, rectBounds.xBegin, rectBounds.yBegin, rectBounds.width, rectBounds.height, rectColour, 2);
    }

    if(inventoryMode || exportMode || importMode || resizeMode) {
        ctx.fillStyle = "#12121277";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
}

function renderLines() {
    var linesInWidth = Math.ceil(WIDTH / screenTileSize) + 1;
    var linesInHeight = Math.ceil(HEIGHT / screenTileSize) + 1;

    var beginX = Math.floor(cameraX % screenTileSize);
    for(var x = 0; x < linesInWidth; x++) {
        var xScreenPos = beginX + x * screenTileSize;
        var xPos = xScreenPos - cameraX;
        if(xPos < -1 || xPos > maxLinesX) continue;
        drawLine(ctx, xScreenPos, cameraY - lineWidth, xScreenPos, maxLinesY + cameraY - lineWidth, LINE_COLOUR, lineWidth);
    }
    var beginY = Math.floor(cameraY % screenTileSize);
    for(var y = 0; y < linesInHeight; y++) {
        var yScreenPos = beginY + y * screenTileSize;
        var yPos = yScreenPos - cameraY;
        if(yPos < -1 || yPos > maxLinesY) continue;
        drawLine(ctx, cameraX + lineWidth, yScreenPos, maxLinesX + cameraX - lineWidth, yScreenPos, LINE_COLOUR, lineWidth);
    }
    drawCentralLines();
}

function drawCentralLines() {
    var beginX = getScreenX(0);
    var beginY = getScreenY(0);

    var endX = getScreenX(mapWidth * TILE_SIZE);
    var endY = getScreenY(mapHeight * TILE_SIZE);

    var lineX = getScreenX(mapWidth * TILE_SIZE / 2);
    var lineY = getScreenY(mapHeight * TILE_SIZE / 2);

    drawLine(ctx, lineX, beginY, lineX, endY, LINE_COLOUR, lineWidth * 2);
    drawLine(ctx, beginX, lineY, endX, lineY, LINE_COLOUR, lineWidth * 2);
}

function renderTiles() {
    for(var tile of tiles) {
        var pos = getTileScreenPos(tile);
        if(tile.type == -1) continue;
        ctx.drawImage(images[tile.type], pos.xPos, pos.yPos, screenTileSize, screenTileSize);
    }
}

function putTile(rawX, rawY) {
    var tileType = inventory[activeTile];
    if(tileType == null) return;
    
    var tile = tiles[findTileIndex(rawX, rawY)];
    if(tile) {
        tile.type = tileType;
    }
}

function removeTile(rawX, rawY) {
    var index = findTileIndex(rawX, rawY);
    if(index != -1) {
        tiles[index].type = -1;
    }
}

function startFill(mouseX, mouseY) {
    beginTileIndex = endTileIndex = findTileIndex(mouseX, mouseY);
}

function resetFill() {
    if(rectBounds != null) {
        fill();
    }
    beginTileIndex = endTileIndex = -1;
    rectColour = rectBounds = null;
    fModeType = -1;
}

function updateFill() {
    var beginTile = tiles[beginTileIndex];
    var endTile = tiles[endTileIndex];

    if(!beginTile || !endTile) return;

    var beginPos = getTileScreenPos(beginTile);
    var endPos = getTileScreenPos(endTile);

    var xBegin = beginPos.xPos;
    var yBegin = beginPos.yPos;

    var xEnd = endPos.xPos;
    var yEnd = endPos.yPos;

    if(xBegin > xEnd) {
        var buffer = xBegin;
        xBegin = xEnd;
        xEnd = buffer;
    }

    if(yBegin > yEnd) {
        var buffer = yBegin;
        yBegin = yEnd;
        yEnd = buffer;
    }

    rectColour = (fModeType == 0) ? "#00ff00" : "#ff0000";
    rectBounds = {
        xBegin: xBegin,
        yBegin: yBegin,
        
        width: xEnd + screenTileSize - xBegin,
        height: yEnd + screenTileSize - yBegin
    };
}

function fill() {
    const bounds = getFillBounds(rectBounds);

    for(var x = bounds.begin.xPos; x < bounds.end.xPos; x++) {
        for(var y = bounds.begin.yPos; y < bounds.end.yPos; y++) {
            var index = findTileIndexByPos(tiles, x, y);
            if(fModeType == FILL_ADD_MODE) tiles[index].type = inventory[activeTile];
            else if(fModeType == FILL_REMOVE_MODE) tiles[index].type = -1;
        }
    }
    saveTilesObj();
}

function getFillBounds(rectBounds) {
    var xBeginRaw = rectBounds.xBegin;
    var yBeginRaw = rectBounds.yBegin;

    var xEndRaw = rectBounds.width + xBeginRaw;
    var yEndRaw = rectBounds.height + yBeginRaw;

    var begin = getTilePos(xBeginRaw, yBeginRaw);
    var end = getTilePos(xEndRaw, yEndRaw);

    return {begin, end};
}

function getPos(rawX, rawY) {
    var tileIndex = findTileIndex(rawX, rawY);

    if(spawnTiles.indexOf(tileIndex) == -1) spawnTiles.push(tileIndex);
    else {
        var indexInArray = spawnTiles.indexOf(tileIndex);
        spawnTiles.splice(indexInArray, 1);
    }
    saveSpawnTilesObj();
}

function resizeMap(width, height) {
    var array = getEmptyTilesArray(width, height);
    for(var oldTile of tiles) {
        const x = oldTile.xPos;
        const y = oldTile.yPos;
        const type = oldTile.type;

        if(x >= width || y >= height) continue;
        findTileByPos(array, x, y).type = type;
    }
    
    mapWidth = width;
    mapHeight = height;
    tiles = array;

    changeMaxLinesPos();
    saveTilesObj();
    saveAll();
}

function findTileIndex(rawX, rawY) {
    var mouseX = (rawX - cameraX) / zoom;
    var mouseY = (rawY - cameraY) / zoom;
    
    return tiles.findIndex(function(tile) {
        var condX = mouseX > tile.xPos * TILE_SIZE && mouseX < tile.xPos * TILE_SIZE + TILE_SIZE;
        var condY = mouseY > tile.yPos * TILE_SIZE && mouseY < tile.yPos * TILE_SIZE + TILE_SIZE;
        return condX && condY;
    });
}

function findTileIndexByPos(tilesArray, xPos, yPos) {
    return tilesArray.findIndex(function(tile) {
        return tile.xPos == xPos && tile.yPos == yPos;
    });
}
function findTileByPos(tilesArray, xPos, yPos) {
    return tilesArray[findTileIndexByPos(tilesArray, xPos, yPos)];
}