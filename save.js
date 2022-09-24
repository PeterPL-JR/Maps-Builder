const PATH = "builder";
var exportMode = false;
var importMode = false;
var resizeMode = false;

var exportDiv;
var importDiv;
var resizeDiv;

var title;
var importButton;
var resizeButton;

var tilesInputExport;
var positionsInputExport;

var tilesInputImport;
var positionsInputImport;

var widthInput;
var heightInput;

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
    
    const obj = loadTilesObj();
    tiles = obj.tiles;
    mapWidth = obj.width;
    mapHeight = obj.height;
    
    spawnTiles = loadSpawnTilesObj();
    
    cameraX = cameraX ? cameraX : DEFAULT_CAMERA_X;
    cameraY = cameraY ? cameraY : DEFAULT_CAMERA_Y;
    zoom = zoom ? zoom : DEFAULT_ZOOM;
    activeTile = activeTile ? activeTile : 0;

    screenTileSize = TILE_SIZE * zoom;
    maxLinesX = mapWidth * screenTileSize;
    maxLinesY = mapHeight * screenTileSize;
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
    save("map_width", mapWidth);
    save("map_height", mapHeight);
}
function loadTilesObj() {
    var width = parseInt(load("map_width"));
    var height = parseInt(load("map_height"));

    if(isNaN(width) || isNaN(height)) {
        width = DEFAULT_MAP_SIZE;
        height = DEFAULT_MAP_SIZE;
    }

    var array = JSON.parse(load("tiles"));
    var finalArray = [];

    if(array == null || array.length == 0) {
        return createEmptyArray();
    }

    for(var tile of array) {
        finalArray.push({
            xPos: tile[0],
            yPos: tile[1],
            type: tile[2]
        });
    }
    return {
        tiles: finalArray,
        width, height
    };
}
function createEmptyArray() {
    return {
        tiles: getEmptyTilesArray(DEFAULT_MAP_SIZE, DEFAULT_MAP_SIZE),
        width: DEFAULT_MAP_SIZE,
        height: DEFAULT_MAP_SIZE
    }
}

function saveSpawnTilesObj() {
    save("spawn", JSON.stringify(spawnTiles));
}
function loadSpawnTilesObj() {
    const loaded = JSON.parse(load("spawn")); 
    return loaded != null ? loaded : [];
}