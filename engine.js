function putTile(rawX, rawY) {
    var tileType = inventory[activeTile];
    if(tileType == null) return;
    
    var tile = tiles[findTileIndex(rawX, rawY)];
    if(tile) {
        tile.type = tileType;
    }
    // put into history
}

function removeTile(rawX, rawY) {
    var index = findTileIndex(rawX, rawY);
    if(index != -1) {
        tiles[index].type = -1;
    }
    // put into history
}

function startFill(mouseX, mouseY) {
    beginTileIndex = endTileIndex = findTileIndex(mouseX, mouseY);
}

function resetFill() {
    if(rectBounds != null) {
        fill();
    }
    beginTileIndex = endTileIndex = -1;
    rectColour = rectBounds = null;
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

    rectColour = (fModeType == 0) ? "#00ff00" : "#ff0000";
    rectBounds = {
        xBegin: xBegin,
        yBegin: yBegin,
        
        width: xEnd + screenTileSize - xBegin,
        height: yEnd + screenTileSize - yBegin
    };
}

function fill() {
    const bounds = getFillBounds(rectBounds);

    for(var x = bounds.begin.xPos; x < bounds.end.xPos; x++) {
        for(var y = bounds.begin.yPos; y < bounds.end.yPos; y++) {
            var index = findTileIndexByPos(tiles, x, y);
            if(fModeType == FILL_ADD_MODE) tiles[index].type = inventory[activeTile];
            else if(fModeType == FILL_REMOVE_MODE) tiles[index].type = -1;
        }
    }
    saveTilesObj();
    // put into history
}

function getFillBounds(rectBounds) {
    var xBeginRaw = rectBounds.xBegin;
    var yBeginRaw = rectBounds.yBegin;

    var xEndRaw = rectBounds.width + xBeginRaw;
    var yEndRaw = rectBounds.height + yBeginRaw;

    var begin = getTilePos(xBeginRaw, yBeginRaw);
    var end = getTilePos(xEndRaw, yEndRaw);

    return {begin, end};
}

function resizeMap(width, height) {
    var array = getEmptyTilesArray(width, height);
    for(var oldTile of tiles) {
        const x = oldTile.xPos;
        const y = oldTile.yPos;
        const type = oldTile.type;

        if(x >= width || y >= height) continue;
        findTileByPos(array, x, y).type = type;
    }
    
    mapWidth = width;
    mapHeight = height;
    tiles = array;

    changeMaxLinesPos();
    saveTilesObj();
    saveAll();
}