function createImage(path) {
    var image = document.createElement("img");
    image.src = path;
    return image;
}

function getMouseX(event) {
    return event.clientX - canvas.offsetLeft;
}
function getMouseY(event) {
    return event.clientY - canvas.offsetTop;
}

function getTileScreenPos(tile) {
    var pos = {};
    pos.xPos = tile.xPos * screenTileSize + cameraX;
    pos.yPos = tile.yPos * screenTileSize + cameraY;
    return pos;
}

function getTilePos(screenX, screenY) {
    var pos = {};
    pos.xPos = Math.round((screenX - cameraX) / screenTileSize);
    pos.yPos = Math.round((screenY - cameraY) / screenTileSize);
    return pos;
}

function drawLine(ctx, startX, startY, endX, endY, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawRect(ctx, x, y, width, height, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
}