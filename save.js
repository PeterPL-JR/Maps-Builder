const PATH = "builder";
var saveMode = false;
var saveDiv;

var tilesInput;
var positionsInput;

function saveAll() {
    save("camera_x", cameraX);
    save("camera_y", cameraY);

    save("zoom", zoom);
    save("active_tile", activeTile);
}

function loadAll() {
    cameraX = parseFloat(load("camera_x"));
    cameraY = parseFloat(load("camera_y"));
    
    zoom = parseFloat(load("zoom"));
    activeTile = parseInt(load("active_tile"));
    
    tiles = loadTilesObj();
    
    cameraX = cameraX ? cameraX : DEFAULT_CAMERA_X;
    cameraY = cameraY ? cameraY : DEFAULT_CAMERA_Y;
    zoom = zoom ? zoom : DEFAULT_ZOOM;
    activeTile = activeTile ? activeTile : 0;

    screenTileSize = TILE_SIZE * zoom;
    maxLinesPos = MAX_LINES * screenTileSize;
    lineWidth = zoom / 2;
}

function save(item, value) {
    localStorage.setItem(`${PATH}_${item}`, value);
}
function load(item) {
    return localStorage.getItem(`${PATH}_${item}`);
}

function saveInventory() {
    var string = JSON.stringify(inventory);
    save("inventory", string);
}
function loadInventory() {
    var array = JSON.parse(load("inventory"));
    inventory = array;
}

function saveTilesObj() {
    var array = [];
    for(var tile of tiles) {
        array.push([
            tile.xPos,
            tile.yPos,
            tile.type
        ]);
    }
    save("tiles", JSON.stringify(array));
}

function loadTilesObj() {
    var array = JSON.parse(load("tiles"));
    var finalArray = [];

    if(array == null) return [];

    for(var tile of array) {
        finalArray.push({
            xPos: tile[0],
            yPos: tile[1],
            type: tile[2]
        });
    }
    return finalArray;
}

function convertTiles(tiles) {
    var newTiles = [];
    for(var i = 0; i < MAX_LINES; i++) {
        newTiles[i] = [];
    }
    
    for(var tile of tiles) {
        newTiles[tile.xPos][tile.yPos] = tile.type;
    }

    tilesInput.value = JSON.stringify(newTiles);
    positionsInput.value = "";
}