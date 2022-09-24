const INV_MODE_TEXT = "Tiles";
const EXPORT_MODE_TEXT = "Export";
const IMPORT_MODE_TEXT = "Import";
const RESIZE_MODE_TEXT = "Map Size";

function init() {
    loadAll();

    for(var tile of tilesObjects) {
        images[tile.index] = createImage("tiles/" + tile.tile + ".png");
        tilesNames[tile.index] = tile.tile;
    }
    document.getElementById("container").oncontextmenu = function () {
        return false;
    }
    
    loadDivs();
    loadInputsAndButtons();

    initMouse();
    initKeyboard();

    initInventory();
    initInventoryStore();

    render();
}

function loadDivs() {
    exportDiv = document.getElementById("export-div");
    importDiv = document.getElementById("import-div");
    resizeDiv = document.getElementById("resize-div");
    title = document.getElementById("title");
}
function loadInputsAndButtons() {
    tilesInputExport = document.querySelector("#export-div #tiles-input");
    positionsInputExport = document.querySelector("#export-div #positions-input");
    
    tilesInputImport = document.querySelector("#import-div #tiles-input");
    positionsInputImport = document.querySelector("#import-div #positions-input");
    
    importButton = importDiv.querySelector("button");
    importButton.onclick = importData;
    
    resizeButton = resizeDiv.querySelector("button");
    resizeButton.onclick = resizeButtonEvent;

    widthInput = resizeDiv.querySelector("#width-input");
    heightInput = resizeDiv.querySelector("#height-input");
}

function initMouse() {
    canvas.onmousedown = function (event) {
        mouseDown(event);
    }
    canvas.onmouseup = function (event) {
        mouseUp(event);
    }
    canvas.onmousemove = function (event) {
        mouseMove(event);
    }
    canvas.onmouseleave = function () {
        mouseLeave();
    }
    canvas.onwheel = function (event) {
        mouseWheel(event);
    }
}

function initKeyboard() {
    document.body.onkeydown = function (event) {
        keyDown(event);
    }
    document.body.onkeyup = function (event) {
        keyUp(event);
    }
    document.onkeydown = function (event) {
        keyDownDoc(event);
    }
}

function getEmptyTilesArray(width, height) {
    const array = [];

    for(var x = 0; x < width; x++) {
        for(var y = 0; y < height; y++) {
            array.push({
                xPos: x,
                yPos: y,
                type: -1
            });
        }
    }
    return array;
}