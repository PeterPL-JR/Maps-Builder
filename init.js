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
    exportDiv = document.getElementById("export-div");
    importDiv = document.getElementById("import-div");
    resizeDiv = document.getElementById("resize-div");
    
    tilesInputExport = document.querySelector("#export-div #tiles-input");
    positionsInputExport = document.querySelector("#export-div #positions-input");
    
    tilesInputImport = document.querySelector("#import-div #tiles-input");
    positionsInputImport = document.querySelector("#import-div #positions-input");
    
    title = document.getElementById("title");
    
    importButton = importDiv.querySelector("button");
    importButton.onclick = importData;
    
    resizeButton = resizeDiv.querySelector("button");
    resizeButton.onclick = resizeButtonEvent;

    widthInput = resizeDiv.querySelector("#width-input");
    heightInput = resizeDiv.querySelector("#height-input");

    initMouse();
    initKeyboard();

    initInventory();
    initInventoryStore();

    render();
}

function initMouse() {
    canvas.onmousedown = function (event) {
        if (inventoryMode || exportMode) return;

        var mouseX = getMouseX(event);
        var mouseY = getMouseY(event);

        if (event.button == 0) {
            leftClicked = true;
            if (fMode) startFill(mouseX, mouseY);
            else putTile(mouseX, mouseY);
        }
        else if (event.button == 1) {
            if(zKey) getPos(mouseX, mouseY);
            else startMove(mouseX, mouseY);
        }
        else if (event.button == 2) {
            rightClicked = true;
            if (fMode) startFill(mouseX, mouseY);
            else removeTile(mouseX, mouseY);
        }
    }
    canvas.onmouseup = function (event) {
        if (inventoryMode || exportMode) return;
        saveTilesObj();

        if (event.button == 0) leftClicked = false;
        else if (event.button == 1) resetMouse();
        else if (event.button == 2) rightClicked = false;
    }

    canvas.onmousemove = function (event) {
        if (inventoryMode || exportMode) return;

        var mouseX = getMouseX(event);
        var mouseY = getMouseY(event);

        if (fMode && leftClicked) {
            endTileIndex = findTileIndex(mouseX, mouseY);
            fModeType = FILL_ADD_MODE;
            updateFill();

        } else if (fMode && rightClicked) {
            endTileIndex = findTileIndex(mouseX, mouseY);
            fModeType = FILL_REMOVE_MODE;
            updateFill();

        } else {
            if (leftClicked) putTile(mouseX, mouseY);
            if (scrollClicked) moveCamera(mouseX, mouseY);
            if (rightClicked) removeTile(mouseX, mouseY);
        }
    }
    canvas.onmouseleave = function () {
        if (inventoryMode || exportMode) return;
        resetMouse();
    }

    canvas.onwheel = function (event) {
        if (inventoryMode || exportMode) return;
        if (!control) {
            changeZoom(event);
        }
    }
}

function initKeyboard() {
    document.body.onkeydown = function (event) {
        if (inventoryMode || exportMode) return;

        var key = event.key.toUpperCase();
        if (importMode || key == " ") return;

        if(!resizeMode) {

            if (key == "A") switchInventoryItem(activeTile - 1);
            if (key == "D") switchInventoryItem(activeTile + 1);
            if (key == "F") fMode = true;
            if (key == "Z") zKey = true;
            
            if (!isNaN(key)) switchInventoryItem(parseInt(key) - 1);
            if (event.key == "Control") control = true;
        }
    }
    document.body.onkeyup = function (event) {
        if (inventoryMode || exportMode) return;
        
        var key = event.key.toUpperCase();
        if (key == "Z") zKey = false;
        
        if (event.key == "Control") control = false;
        if (event.key.toUpperCase() == "F") {
            fMode = false;
            rectBounds = null;
        }
    }

    document.onkeydown = function (event) {
        const key = event.key.toUpperCase();

        if (key == "Q" && !exportMode && !importMode && !resizeMode) {
            inventoryMode = !inventoryMode;
            invStoreDiv.style.display = inventoryMode ? "inline-block" : "none";
        }
        if (key == "E" && !inventoryMode && !importMode && !resizeMode) {
            exportMode = !exportMode;
            if (exportMode) {
                exportData(tiles);
            }
            exportDiv.style.display = exportMode ? "inline-block" : "none";
        }
        if (key == "I" && !inventoryMode && !exportMode && !resizeMode) {
            importMode = !importMode;
            importDiv.style.display = importMode ? "inline-block" : "none";
        }
        if (key == "R" && !inventoryMode && !exportMode && !importMode) {
            resizeMode = !resizeMode;
            if(resizeMode) {
                widthInput.value = mapWidth;
                heightInput.value = mapHeight;
            }
            resizeDiv.style.display = resizeMode ? "inline-block" : "none";
        }
        if (key == "ESCAPE" && (inventoryMode || exportMode || importMode || resizeMode)) {
            inventoryMode = false;
            exportMode = false;
            importMode = false;
            resizeMode = false;

            invStoreDiv.style.display = "none";
            exportDiv.style.display = "none";
            importDiv.style.display = "none";
            resizeDiv.style.display = "none"
            
            title.innerHTML = "";
        }

        if (inventoryMode) title.innerHTML = INV_MODE_TEXT;
        if (exportMode) title.innerHTML = EXPORT_MODE_TEXT;
        if (importMode) title.innerHTML = IMPORT_MODE_TEXT;
        if (resizeMode) title.innerHTML = RESIZE_MODE_TEXT;

        if (!(inventoryMode || exportMode || importMode || resizeMode)) title.innerHTML = "";
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