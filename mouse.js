const LEFT_BUTTON = 0;
const MIDDLE_BUTTON = 1;
const RIGHT_BUTTON = 2;

function mouseDown(event) {
    if (!canEdit()) return;

    var mouseX = getMouseX(event);
    var mouseY = getMouseY(event);

    if (event.button == LEFT_BUTTON) {
        leftClicked = true;
        if (fMode) startFill(mouseX, mouseY);
        else putTile(mouseX, mouseY);
    }
    else if (event.button == MIDDLE_BUTTON) {
        if (zKey) putSpawnTile(mouseX, mouseY);
        else startMove(mouseX, mouseY);
    }
    else if (event.button == RIGHT_BUTTON) {
        rightClicked = true;
        if (fMode) startFill(mouseX, mouseY);
        else removeTile(mouseX, mouseY);
    }
}

function mouseUp(event) {
    if (!canEdit()) return;
    saveTilesObj();

    if (event.button == LEFT_BUTTON) leftClicked = false;
    else if (event.button == MIDDLE_BUTTON) resetMouse();
    else if (event.button == RIGHT_BUTTON) rightClicked = false;

    if((!leftClicked || !rightClicked) && !fMode) putTilesIntoHistory();
}

function mouseMove(event) {
    if (!canEdit()) return;

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

function mouseLeave() {
    if (!canEdit()) return;
    resetMouse();
}

function mouseWheel(event) {
    if (!canEdit()) return;
    if (!control) {
        changeZoom(event);
    }
}