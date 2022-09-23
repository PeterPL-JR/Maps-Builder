var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE_SIZE = 96;

var control = false;
var fMode = false;
var fModeType = -1;

var zKey = false;
var spawnTiles = [];

const FILL_ADD_MODE = 0;
const FILL_REMOVE_MODE = 1;

const MAX_LINES = 40;
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
        drawRect(ctx, rectBounds.xBegin, rectBounds.yBegin, rectBounds.width, rectBounds.height, rectColour, 2);
    }

    if(inventoryMode || exportMode || importMode) {
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
        if(xPos < -1 || xPos > maxLinesPos) continue;
        drawLine(ctx, xScreenPos, cameraY - lineWidth, xScreenPos, maxLinesPos + cameraY - lineWidth, LINE_COLOUR, lineWidth);
    }
    var beginY = Math.floor(cameraY % screenTileSize);
    for(var y = 0; y < linesInHeight; y++) {
        var yScreenPos = beginY + y * screenTileSize;
        var yPos = yScreenPos - cameraY;
        if(yPos < -1 || yPos > maxLinesPos) continue;
        drawLine(ctx, cameraX + lineWidth, yScreenPos, maxLinesPos + cameraX - lineWidth, yScreenPos, LINE_COLOUR, lineWidth);
    }
    drawCentralLines();
}

function drawCentralLines() {
    var beginX = getScreenX(0);
    var beginY = getScreenY(0);

    var endX = getScreenX(MAX_LINES * TILE_SIZE);
    var endY = getScreenY(MAX_LINES * TILE_SIZE);

    var lineX = getScreenX(MAX_LINES * TILE_SIZE / 2);
    var lineY = getScreenY(MAX_LINES * TILE_SIZE / 2);

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
    var xBeginRaw = rectBounds.xBegin;
    var yBeginRaw = rectBounds.yBegin;

    var xEndRaw = rectBounds.width + xBeginRaw;
    var yEndRaw = rectBounds.height + yBeginRaw;

    var begin = getTilePos(xBeginRaw, yBeginRaw);
    var end = getTilePos(xEndRaw, yEndRaw);

    for(var x = begin.xPos; x < end.xPos; x++) {
        for(var y = begin.yPos; y < end.yPos; y++) {
            var index = findTileIndexByPos(x, y);
            if(fModeType == FILL_ADD_MODE) tiles[index].type = inventory[activeTile];
            else if(fModeType == FILL_REMOVE_MODE) tiles[index].type = -1;
        }
    }
    saveTilesObj();
}

function getPos(rawX, rawY) {
    var tileIndex = findTileIndex(rawX, rawY);
    var tile = tiles[tileIndex];

    if(spawnTiles.indexOf(tileIndex) == -1) spawnTiles.push(tileIndex);
    else {
        var indexInArray = spawnTiles.indexOf(tileIndex);
        spawnTiles.splice(indexInArray, 1);
    }
    saveSpawnTilesObj();
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

function findTileIndexByPos(xPos, yPos) {
    return tiles.findIndex(function(tile) {
        return tile.xPos == xPos && tile.yPos == yPos;
    });
}