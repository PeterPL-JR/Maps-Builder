function exportData(tiles) {
    var newTiles = [];
    for(var i = 0; i < mapWidth; i++) {
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
    if(tilesArray.length * tilesArray[0].length > mapWidth * mapHeight) return;
    
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

function resizeButtonEvent() {
    resizeMode = false;
    resizeDiv.style.display = "none";
    title.innerHTML = "";
    
    var width = parseInt(widthInput.value);
    var height = parseInt(heightInput.value);
    
    if(!isNaN(width) && !isNaN(height) && width >= MIN_MAP_SIZE && width <= MAX_MAP_SIZE && height >= MIN_MAP_SIZE && height <= MAX_MAP_SIZE) {
        if(width < mapWidth || height < mapHeight) {
            var removedTiles = [];
        }
        modifyMapDimension({width: mapWidth, height: mapHeight}, {width, height}, removedTiles);
        resizeMap(width, height);
    }
}