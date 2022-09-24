const _KEY_SWITCH_INV_LEFT = "A";
const _KEY_SWITCH_INV_RIGHT = "D";

const _KEY_FILLING_MODE = "F";
const _KEY_SPAWN_ADDING_MODE = "Z";

const _KEY_INV_MENU = "Q";
const _KEY_EXPORT_MENU = "E";
const _KEY_IMPORT_MENU = "I";
const _KEY_RESIZE_MENU = "R";

function keyDown(event) {
    if (inventoryMode || exportMode) return;

    var key = event.key.toUpperCase();
    if (importMode || key == " ") return;

    if (!resizeMode) {

        if (key == _KEY_SWITCH_INV_LEFT) switchInventoryItem(activeTile - 1);
        if (key == _KEY_SWITCH_INV_RIGHT) switchInventoryItem(activeTile + 1);
        if (key == _KEY_FILLING_MODE) fMode = true;
        if (key == _KEY_SPAWN_ADDING_MODE) zKey = true;

        if (!isNaN(key)) switchInventoryItem(parseInt(key) - 1);
        if (event.key == "Control") control = true;
    }
}

function keyUp(event) {
    if (inventoryMode || exportMode) return;

    var key = event.key.toUpperCase();
    if (key == _KEY_SPAWN_ADDING_MODE) zKey = false;

    if (event.key == "Control") control = false;
    if (event.key.toUpperCase() == _KEY_FILLING_MODE) {
        fMode = false;
        rectBounds = null;
    }
}

function keyDownDoc(event) {
    const key = event.key.toUpperCase();

    if (key == _KEY_INV_MENU && !exportMode && !importMode && !resizeMode) keyInventoryEvent();
    if (key == _KEY_RESIZE_MENU && !inventoryMode && !exportMode && !importMode) keyResizeEvent();
    if (key == _KEY_EXPORT_MENU && !inventoryMode && !importMode && !resizeMode) keyExportEvent();
    if (key == _KEY_IMPORT_MENU && !inventoryMode && !exportMode && !resizeMode) keyImportEvent();

    if (key == "ESCAPE" && (inventoryMode || exportMode || importMode || resizeMode)) escape();

    if (inventoryMode) title.innerHTML = INV_MODE_TEXT;
    if (exportMode) title.innerHTML = EXPORT_MODE_TEXT;
    if (importMode) title.innerHTML = IMPORT_MODE_TEXT;
    if (resizeMode) title.innerHTML = RESIZE_MODE_TEXT;

    if (!(inventoryMode || exportMode || importMode || resizeMode)) title.innerHTML = "";
}

function keyInventoryEvent() {
    inventoryMode = !inventoryMode;
    invStoreDiv.style.display = inventoryMode ? "inline-block" : "none";
}

function keyExportEvent() {
    exportMode = !exportMode;
    if (exportMode) {
        exportData(tiles);
    }
    exportDiv.style.display = exportMode ? "inline-block" : "none";
}

function keyImportEvent() {
    importMode = !importMode;
    importDiv.style.display = importMode ? "inline-block" : "none";
}

function keyResizeEvent() {
    resizeMode = !resizeMode;
    if (resizeMode) {
        widthInput.value = mapWidth;
        heightInput.value = mapHeight;
    }
    resizeDiv.style.display = resizeMode ? "inline-block" : "none";
}

function escape() {
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