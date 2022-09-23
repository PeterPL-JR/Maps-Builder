const PATH = "builder";
var exportMode = false;
var importMode = false;

var exportDiv;
var importDiv;
var title;
var importButton;

var tilesInputExport;
var positionsInputExport;

var tilesInputImport;
var positionsInputImport;

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
    spawnTiles = loadSpawnTilesObj();
    
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

function saveSpawnTilesObj() {
    save("spawn", JSON.stringify(spawnTiles));
}
function loadSpawnTilesObj() {
    return JSON.parse(load("spawn"));
}

function exportData(tiles) {
    var newTiles = [];
    for(var i = 0; i < MAX_LINES; i++) {
        newTiles[i] = [];
    }
    
    for(var tile of tiles) {
        newTiles[tile.yPos][tile.xPos] = tile.type;
    }

    var spawnPositions = [];
    for(var index of spawnTiles) {
        spawnPositions.push([
            tiles[index].xPos,
            tiles[index].yPos
        ]);
    }

    tilesInputExport.value = JSON.stringify(newTiles);
    positionsInputExport.value = (spawnPositions.length != 0) ? JSON.stringify(spawnPositions) : "";
}

function importData() {
    importMode = false;
    importDiv.style.display = "none";
    title.innerHTML = "";
    
    var tilesText = tilesInputImport.value;
    var positionsText = positionsInputImport.value;
    
    tilesInputImport.value = "";
    positionsInputImport.value = "";

    if(positionsText == "") positionsText = "[]";
    if(!isJSON(tilesText) || !isJSON(positionsText)) return; 

    var tilesArray = JSON.parse(tilesText);
    if(tilesArray.length * tilesArray[0].length > MAX_LINES * MAX_LINES) return;
    
    var bufferTiles = [];
    for(var y = 0; y < tilesArray.length; y++) {
        for(var x = 0; x < tilesArray[y].length; x++) {
            bufferTiles.push({
                xPos: x, yPos: y,
                type: tilesArray[y][x]
            });
        }
    }
    var positionsArrays = JSON.parse(positionsText);
    var bufferSpawnTiles = [];
    for(var array of positionsArrays) {
        var tileIndex = findTileIndexByPos(array[0], array[1]);
        bufferSpawnTiles.push(tileIndex);
    }

    tiles = bufferTiles;
    spawnTiles = bufferSpawnTiles;

    saveTilesObj();
    saveSpawnTilesObj();
}