const DEFAULT_CAMERA_X = 0;
const DEFAULT_CAMERA_Y = 0;

const DEFAULT_ZOOM = 1;

var scrollClicked = false;
var leftClicked = false;
var rightClicked = false;

var zoom = DEFAULT_ZOOM;
var screenTileSize = TILE_SIZE * zoom;
var maxLinesPos = MAX_LINES * screenTileSize;
const LINE_WIDTH_FACTOR = 0.8;

var cameraOffsetX = -1;
var cameraOffsetY = -1;

var cameraX = DEFAULT_CAMERA_X;
var cameraY = DEFAULT_CAMERA_Y;

const MAX_ZOOM = 1;
const MIN_ZOOM = 0.3;

var beginTileIndex = -1;
var endTileIndex = -1;

function startMove(mouseX, mouseY) {
    scrollClicked = true;
    cameraOffsetX = cameraX - mouseX;
    cameraOffsetY = cameraY - mouseY;
}

function resetMouse() {
    scrollClicked = leftClicked = rightClicked = false;

    cameraOffsetX = -1;
    cameraOffsetY = -1;
}

function moveCamera(mouseX, mouseY) {
    if(cameraOffsetX != -1 && cameraOffsetY != -1) {
        cameraX = mouseX + cameraOffsetX;
        cameraY = mouseY + cameraOffsetY;
        saveAll();
    }
}

function changeZoom(event) {
    var delta = event.deltaY;

    var mouseX = getMouseX(event);
    var mouseY = getMouseY(event);

    var startMouseX = (mouseX - cameraX) / zoom;
    var startMouseY = (mouseY - cameraY) / zoom;

    zoom += (delta < 0) ? 0.1 : -0.1;
    lineWidth = zoom / LINE_WIDTH_FACTOR;
    var offset = Math.sign(delta);
    
    var endMouseX = (mouseX - cameraX) / zoom;
    var endMouseY = (mouseY - cameraY) / zoom;

    var xDif = Math.abs(startMouseX - endMouseX);
    var yDif = Math.abs(startMouseY - endMouseY);

    if(zoom >= MAX_ZOOM) {
        zoom = MAX_ZOOM;
        return;
    }
    if(zoom <= MIN_ZOOM) {
        zoom = MIN_ZOOM;
        return;
    }

    cameraX += xDif * zoom * offset;
    cameraY += yDif * zoom * offset;

    screenTileSize = TILE_SIZE * zoom;
    maxLinesPos = MAX_LINES * screenTileSize;
    saveAll();
}