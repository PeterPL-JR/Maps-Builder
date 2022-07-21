var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE_SIZE = 96;

var control = false;

const MAX_LINES = 40;
var lineWidth = 0.3;
const LINE_COLOR = "white";

var tiles = [];
const images = [];

const tilesNames = [
    "grass", "wall", "floor", "stone"
];

function init() {
    loadAll();

    for(var tile of tilesNames) {
        images.push(createImage("tiles/" + tile + ".png"));
    }

    document.getElementById("container").oncontextmenu = function() {
        return false;
    }

    initMouse();
    initKeyboard();
    initInventory();
    
    render();
}

function initMouse() {
    canvas.onmousedown = function(event) {
        var mouseX = getMouseX(event);
        var mouseY = getMouseY(event);

        if(event.button == 0) putTile(mouseX, mouseY);
        else if(event.button == 1) startMove(mouseX, mouseY);
        else if(event.button == 2) removeTile(mouseX, mouseY);
    }
    canvas.onmouseup = function(event) {
        if(event.button == 1) {
            resetMouse();
        }
    }

    canvas.onmousemove = function(event) {
        if(scrollClicked) {
            moveCamera(getMouseX(event), getMouseY(event));
        }
    }
    canvas.onmouseleave = function() {
        resetMouse();
    }

    canvas.onwheel = function(event) {
        if(!control) {
            changeZoom(event);
        }
    }
}

function initKeyboard() {
    document.body.onkeydown = function(event) {
        var key = event.key.toUpperCase();
        if(key == "A") switchInventory(activeTile - 1);
        if(key == "D") switchInventory(activeTile + 1);

        if(!isNaN(key)) switchInventory(parseInt(key) - 1);
        if(event.key == "Control") control = true;
    }
    document.body.onkeyup = function(event) {
        if(event.key == "Control") control = false;
    }
}

function render() {
    requestAnimationFrame(render);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    renderLines();
    renderTiles();
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
        var tileX = tile.xPos * screenTileSize + cameraX;
        var tileY = tile.yPos * screenTileSize + cameraY;        
        ctx.drawImage(images[tile.type], tileX, tileY, screenTileSize, screenTileSize);
    }
}

function putTile(rawX, rawY) {
    var tileType = inventory[activeTile];
    if(tileType == null) return;
    
    var tile = tiles[findTileIndex(rawX, rawY)];
    if(tile) {
        tile.type = tileType;
    } else {
        var mouseX = (rawX - cameraX) / zoom;
        var mouseY = (rawY - cameraY) / zoom;

        if(mouseX < 0 || mouseY < 0) return;

        var moduloX = (mouseX) % TILE_SIZE;
        var moduloY = (mouseY) % TILE_SIZE;
        
        var tileX = (mouseX - moduloX) / TILE_SIZE;
        var tileY = (mouseY - moduloY) / TILE_SIZE;

        if(tileX < 0 || tileY < 0 || tileX >= MAX_LINES || tileY >= MAX_LINES) return;

        tiles.push({
            xPos: tileX,
            yPos: tileY,
            type: activeTile
        });
    }
    saveTilesObj();
}

function removeTile(rawX, rawY) {
    var index = findTileIndex(rawX, rawY);
    if(index != -1) {
        tiles.splice(index, 1);
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