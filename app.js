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

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(images[tile.type], pos.xPos, pos.yPos, screenTileSize, screenTileSize);
    }
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