var inventory = [];
var tilesDivs = [];
var invDiv;

var activeTile = 0;
const INV_SIZE = 8;

function initInventory() {
    invDiv = document.getElementById("inventory");
    
    for(var i = 0; i < INV_SIZE; i++) {
        inventory[i] = null;
    }
    
    for(var i = 0; i < tilesNames.length; i++) {
        if(i >= inventory.length) break;
        inventory[i] = i;
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
        tileDiv.setAttribute("onmousedown", `switchInventory(${i})`);
        if(tileName) {
            tileDiv.innerHTML = `<img src='tiles/${tileName}.png'>`;
        }
        invDiv.appendChild(tileDiv);
    }
}

function switchInventory(index) {
    if(index < 0) return;
    if(index >= INV_SIZE) return;
    activeTile = index;
    saveAll();

    for(var div of tilesDivs) {
        div.className = "inventory-tile";
    }
    tilesDivs[activeTile].className = "inventory-tile active-tile";
}