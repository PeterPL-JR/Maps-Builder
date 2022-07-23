var inventory = [];
var tilesDivs = [];
var invDiv;
var invStoreDiv;

var inventoryMode = false;
var activeTile = 0;
const INV_SIZE = 8;

const ITEMS_WIDTH = 6;
const ITEMS_HEIGHT = 4;

const tilesNames = [
    "grass", "floor", "wall", "stone_bricks",
    "water", "stone_floor", "sand", "sand_bricks",
    "flower1", "flower2", "carpet", "cactus"
];

function initInventory() {
    invDiv = document.getElementById("inventory");
    
    loadInventory();
    if(inventory == null) inventory = [];
    
    if(inventory.length == 0) {   
        for(var i = 0; i < INV_SIZE; i++) {
            inventory[i] = null;
        }
        for(var i = 0; i < tilesNames.length; i++) {
            if(i >= inventory.length) break;
            inventory[i] = i;
        }
    }
    createInventory();

    tilesDivs = document.querySelectorAll("#inventory .inventory-tile");
    tilesDivs[activeTile].className = "inventory-tile active-tile";
}
function createInventory() {
    invDiv.innerHTML = "";

    for(var i = 0; i < INV_SIZE; i++) {
        var tileName = tilesNames[inventory[i]];

        var tileDiv = document.createElement("div");
        tileDiv.className = "inventory-tile";
        tileDiv.setAttribute("onmousedown", `switchInventoryItem(${i})`);
        if(tileName) {
            tileDiv.innerHTML = `<img src='tiles/${tileName}.png'>`;
        }
        invDiv.appendChild(tileDiv);
    }
}
function switchInventoryItem(index) {
    if(index < 0) return;
    if(index >= INV_SIZE) return;
    activeTile = index;
    saveAll();

    for(var div of tilesDivs) {
        div.className = "inventory-tile";
    }
    tilesDivs[activeTile].className = "inventory-tile active-tile";
}

function initInventoryStore() {
    invStoreDiv = document.getElementById("inventory-store");

    for(var y = 0; y < ITEMS_HEIGHT; y++) {
        for(var x = 0; x < ITEMS_WIDTH; x++) {
            var tileIndex = x + y * ITEMS_WIDTH;

            var div = document.createElement("div");
            div.className = (tileIndex < tilesNames.length) ? "store-tile-active store-tile" : "store-tile";
            invStoreDiv.appendChild(div);

            if(tileIndex < tilesNames.length) {
                div.innerHTML = `<img src='tiles/${tilesNames[tileIndex]}.png'>`;
                div.setAttribute("onmousedown", `setInventoryItem(${tileIndex});`);
            }
        }
        var clear = document.createElement("div");
        clear.style.clear = "both";
        invStoreDiv.appendChild(clear);
    }
}

function setInventoryItem(tileIndex) {
    var found = inventory.indexOf(tileIndex);
    inventory[activeTile] = tileIndex;
    tilesDivs[activeTile].innerHTML = `<img src='tiles/${tilesNames[tileIndex]}.png'>`;
    
    if(found != -1) {
        inventory[found] = null;
        tilesDivs[found].innerHTML = "";
    }
    saveInventory();
}