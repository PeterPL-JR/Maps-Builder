var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE_SIZE = 96;

var control = false;
var fMode = false;
var fModeType = -1;

const FILL_ADD_MODE = 0;
const FILL_REMOVE_MODE = 1;

const MAX_LINES = 40;
var lineWidth = 0.3;
const LINE_COLOR = "white";

var rectColor = null;
var rectBounds = null;

var tiles = [];
const images = [];

function init() {
    loadAll();
    if(tiles.length != MAX_LINES * MAX_LINES) {
        for(var x = 0; x < MAX_LINES; x++) {
            for(var y = 0; y < MAX_LINES; y++) {
                tiles.push({
                    xPos: x,
                    yPos: y,
                    type: -1
                });
            }
        }
    }

    for(var tile of tilesNames) {
        images.push(createImage("tiles/" + tile + ".png"));
    }

    document.onkeydown = function(event) {
        if(event.key.toUpperCase() == "E") {
            inventoryMode = !inventoryMode;
            invStoreDiv.style.display = inventoryMode ? "inline-block" : "none";
        }
        if(event.key == "Escape" && inventoryMode) {
            inventoryMode = false;
            invStoreDiv.style.display = "none";
        }
    }
    document.getElementById("container").oncontextmenu = function() {
        return false;
    }

    initMouse();
    initKeyboard();

    initInventory();
    initInventoryStore();

    render();
}

function initMouse() {
    canvas.onmousedown = function(event) {
        if(inventoryMode) return;

        var mouseX = getMouseX(event);
        var mouseY = getMouseY(event);

        if(event.button == 0) {
            leftClicked = true;
            if(fMode) startFill(mouseX, mouseY);
            else putTile(mouseX, mouseY);
        }
        else if(event.button == 1) {
            startMove(mouseX, mouseY);
        } 
        else if(event.button == 2) {
            rightClicked = true;
            if(fMode) startFill(mouseX, mouseY);
            else removeTile(mouseX, mouseY);
        } 
    }
    canvas.onmouseup = function(event) {
        if(inventoryMode) return;
        saveTilesObj();

        if(event.button == 0) leftClicked = false;
        else if(event.button == 1) resetMouse();
        else if(event.button == 2) rightClicked = false;
    }

    canvas.onmousemove = function(event) {
        if(inventoryMode) return;

        var mouseX = getMouseX(event);
        var mouseY = getMouseY(event);

        if(fMode && leftClicked) {
            endTileIndex = findTileIndex(mouseX, mouseY);
            fModeType = FILL_ADD_MODE;
            updateFill();
            
        } else if(fMode && rightClicked) {
            endTileIndex = findTileIndex(mouseX, mouseY);
            fModeType = FILL_REMOVE_MODE;
            updateFill();

        } else {
            if(leftClicked) putTile(mouseX, mouseY);
            if(scrollClicked) moveCamera(mouseX, mouseY);
            if(rightClicked) removeTile(mouseX, mouseY);
        }
    }
    canvas.onmouseleave = function() {
        if(inventoryMode) return;
        resetMouse();
    }

    canvas.onwheel = function(event) {
        if(inventoryMode) return;
        if(!control) {
            changeZoom(event);
        }
    }
}

function initKeyboard() {
    document.body.onkeydown = function(event) {
        if(inventoryMode) return;

        var key = event.key.toUpperCase();
        if(key == "A") switchInventoryItem(activeTile - 1);
        if(key == "D") switchInventoryItem(activeTile + 1);
        if(key == "F") fMode = true;
        
        if(!isNaN(key)) switchInventoryItem(parseInt(key) - 1);
        if(event.key == "Control") control = true;
    }
    document.body.onkeyup = function(event) {
        if(inventoryMode) return;

        if(event.key == "Control") control = false;
        if(event.key.toUpperCase() == "F") {
            fMode = false;
            rectBounds = null;
        }
    }
}

function render() {
    requestAnimationFrame(render);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    renderLines();
    renderTiles();

    if(!(fMode && (leftClicked || rightClicked))) {
        resetFill();
    }

    if(rectBounds != null && rectColor != null) {
        drawRect(ctx, rectBounds.xBegin, rectBounds.yBegin, rectBounds.width, rectBounds.height, rectColor, 2);
    }

    if(inventoryMode) {
        ctx.fillStyle = "#121212bb";
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
        drawLine(ctx, xScreenPos, cameraY - lineWidth, xScreenPos, maxLinesPos + cameraY - lineWidth, LINE_COLOR, lineWidth);
    }
    var beginY = Math.floor(cameraY % screenTileSize);
    for(var y = 0; y < linesInHeight; y++) {
        var yScreenPos = beginY + y * screenTileSize;
        var yPos = yScreenPos - cameraY;
        if(yPos < -1 || yPos > maxLinesPos) continue;
        drawLine(ctx, cameraX + lineWidth, yScreenPos, maxLinesPos + cameraX - lineWidth, yScreenPos, LINE_COLOR, lineWidth);
    }
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
    tile.type = tileType
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
    rectColor = rectBounds = null;
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

    rectColor = (fModeType == 0) ? "#00ff00" : "#ff0000";
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
            var index = tiles.findIndex(function(tile) {
                return tile.xPos == x && tile.yPos == y;
            });
            if(fModeType == FILL_ADD_MODE) tiles[index].type = inventory[activeTile];
            else if(fModeType == FILL_REMOVE_MODE) tiles[index].type = -1;
        }
    }
    saveTilesObj();
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