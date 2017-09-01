var DOORS = [];
var MOVEMENT = 10;
var RESULT = [];
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function drawDungeonOneCanvas(canvasID, sizeID, roomDensityID, roomSizeID, trapID, dungenLevelID) {
    DOORS = [];
    var roomDescription = [];
    var canvas = document.getElementById(canvasID);
    var dungeon = document.getElementById(sizeID);
    var room = document.getElementById(roomDensityID);
    var rooms = document.getElementById(roomSizeID);
    var traps = document.getElementById(trapID);
    var trapPercent = parseInt(traps.options[traps.selectedIndex].value);
    var dungeonLvl = document.getElementById(dungenLevelID);
    var dungeonLevel = parseInt(dungeonLvl.options[dungeonLvl.selectedIndex].value);
    var dungeonSize = parseInt(dungeon.options[dungeon.selectedIndex].value);
    var roomCount = Math.round((dungeonSize / 100) * parseInt(room.options[room.selectedIndex].value));
    var roomSize = Math.round(((dungeonSize - Math.round((dungeonSize * 0.35))) / 100) * parseInt(rooms.options[rooms.selectedIndex].value));
    var sizeX = Math.round(canvas.clientWidth / dungeonSize); // set image X size
    var sizeY = Math.round(canvas.clientHeight / dungeonSize); // set image Y size
    var tiles = [];
    var contextFont = getFontSize(dungeonSize);
    /**
     * Textures:
     *  -1 edge
     *  0 marble
     *  1 corridor
     *  2 door (basically a corridor with a door)
     *  3 room
     *  4 entry
     *  5 trap
     *  6 room_edge
     */
    dungeonSize += 2; // + 2 because of edges
    for (var i = 0; i < dungeonSize; i++) { // declare base array 
        tiles[i] = [];
        for (var j = 0; j < dungeonSize; j++) {
            tiles[i][j] = { X: j * sizeX, Y: i * sizeY, Width: sizeX, Height: sizeY, Texture: -1 };
        }
    }
    for (i = 1; i < dungeonSize - 1; i++) { // set drawingarea
        for (j = 1; j < dungeonSize - 1; j++) {
            tiles[i][j] = { X: (j - 1) * sizeX, Y: (i - 1) * sizeY, Width: sizeX, Height: sizeY, Texture: 0, H: null, G: 0, Parent: null, F: null, I: i, J: j }; //-1 because we dont use the edges
        }
    }
    var context = canvas.getContext("2d"); // get canvas context
    context.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
    var sources = { // image source
        corridor: 'images/corridor.png',
        marble: 'images/marble.png',
        door: 'images/door.png',
        room: 'images/room.png',
        entry: 'images/entry.png',
        trap: 'images/trap.png',
        room_edge: 'images/marble.png'
    };
    generateRoom(tiles, roomCount, roomSize, roomDescription, dungeonLevel);
    addEntryPoint(tiles);
    generateCorridors(tiles, trapPercent); // generate corridors between room doors
    loadImages(sources, function (images) {  // load images to tiles
        for (i = 1; i < tiles.length - 1; i++) {
            for (j = 1; j < tiles[i].length - 1; j++) {
                switch (tiles[i][j].Texture) {
                    case 0:
                        context.drawImage(images.marble, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 1:
                        context.drawImage(images.corridor, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 2:
                        rotateImage(context, images.door, getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 3:
                        context.drawImage(images.room, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        context.font = contextFont;
                        context.fillText(tiles[i][j].RoomCount, tiles[i][j].X + Math.round(tiles[i][j].Width * 0.1), tiles[i][j].Y + Math.round(tiles[i][j].Height * 0.65));
                        break;
                    case 4:
                        context.drawImage(images.entry, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 5:
                        context.drawImage(images.trap, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 6:
                        context.drawImage(images.room_edge, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    default:
                        break;
                }
            }
        }
    });
    addDescription(roomDescription);
}

function getFontSize(dungeonSize) {
    if (dungeonSize > 30) {
        return "9pt Calibri bold";
    }
    else {
        return "10pt Calibri bold";
    }
}

function addDescription(roomDescription) {
    var table = document.getElementById("description");
    table.innerHTML = "";
    for (var i = 0; i < roomDescription.length; i++) { 
        var tr = createTableNode(roomDescription[i].Name, true);
        table.appendChild(tr);
        tr = createTableNode(roomDescription[i].Monster, false, tr);
        table.appendChild(tr);
        tr = createTableNode(roomDescription[i].Treasure, false);
        table.appendChild(tr);
    }
}

function createTableNode(nodeText, isRoot, parent) {
    var tr;
    if (parent === undefined) {
        tr = document.createElement('tr');   
    } else {
        tr = parent;
    }
    var td = document.createElement('td');
    var text = document.createTextNode(nodeText); 
    if (isRoot) {
        td.rowSpan = 2;
        td.className = "room";
    }
    td.appendChild(text);
    tr.appendChild(td);
    return tr;
}

function loadImages(sources, callback) {
    var images = [];
    var loadedImages = 0;
    var numImages = 0;
    var src;
    var i = 0;
    while (sources[i]) {
        numImages++;
        i++;
    }
    for (src in sources) {
        images[src] = new Image();
        images[src].onload = function () {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

function getDegree(tiles, i, j) {
    if (tiles[i][j - 1].Texture === 3) { // left tile is room
        return -90;
    } else if (tiles[i][j + 1].Texture === 3) { // right tile is room
        return 90;
    } else if (tiles[i + 1][j].Texture === 3) { // below tile is room
        return 180;
    } 
    return 0; // above tile is room
}

function rotateImage(context, image, degree, x, y, width, height) {
    if (degree === 90) { // rotate right
        context.translate(x, y);
        context.rotate(degree * Math.PI / 180);
        context.drawImage(image, 0, -height, width, height);
        context.rotate(-degree * Math.PI / 180);
        context.translate(-x, -y);
    } else if (degree === -90) { // rotate left
        context.translate(x, y);
        context.rotate(degree * Math.PI / 180);
        context.drawImage(image, -width, 0, width, height);
        context.rotate(-degree * Math.PI / 180);
        context.translate(-x, -y);
    } else if (degree === 180) { // rotate down
        context.translate(x, y);
        context.rotate(degree * Math.PI / 180);
        context.drawImage(image, -width, -height, width, height);
        context.rotate(-degree * Math.PI / 180);
        context.translate(-x, -y);
    } else { // do not rotate
        context.drawImage(image, x, y, width, height);
    }
}

function generateRoom(tiles, roomNumber, roomSize, roomDescription, dungeonLevel) {
    for (var roomCount = 0; roomCount < roomNumber; roomCount++) {
        var result = setTilesForRoom(tiles, roomSize);
        if (result.X !== 0) {
            fillRoom(tiles, result.X, result.Y, result.Right, result.Down, roomDescription, dungeonLevel);
        }
    }
    return tiles;
}

function checkTileGoodForRoom(tiles, x, y, right, down) {
    var maxX = x + down + 2; // +2 because of the edges
    var maxY = y + right + 2;
    for (var i = x; i < maxX; i++) { // check the room area + boundaries
        for (var j = y; j < maxY ; j++) { 
            if (checkIsRoom(tiles, i, j)) {
                return false;
            }
        }
    }
    return true;
}

function checkIsRoom(tiles,x,y) {
    return tiles[x][y].Texture === 3 || tiles[x][y].Texture === 6
}

function setTilesForRoom(tiles, roomSize) {
    var roomIsOk;
    var x;
    var y;
    var failSafeCount = tiles.length * tiles.length / 2;
    var right;
    var down;
    do {
        x = getRandomInt(3, (tiles.length - (roomSize + 2))); // 3 and +2, becuse of edge + room_edge 
        y = getRandomInt(3, (tiles.length - (roomSize + 2)));
        right = getRandomInt(2, roomSize + 1);
        down = getRandomInt(2, roomSize + 1);
        roomIsOk = checkTileGoodForRoom(tiles, x - 2, y - 2, right + 2, down + 2); // x&y-2 && roomsize +2 because i want min 2 tiles between rooms + room edges
        failSafeCount--;
    }
    while (!roomIsOk && failSafeCount > 0);
    if (failSafeCount > 0) {
        return { X: x, Y: y, Right: right, Down: down };
    }
    else {
        return { X: 0, Y: 0 }; // it can never be 0 if its a good coordinate
    }
}

function fillRoom(tiles, x, y, right, down, roomDescription, dungeonLevel) { // x-y is the top left corner
    var doorCount = getRandomInt(1, 3);
    for (var i = 0; i < down + 2; i++) { // fill with room_edge texture the bigger boundaries 
        for (var j = 0; j < right + 2; j++) {
            tiles[x + i - 1][y + j - 1].Texture = 6;
        }
    }
    for (i = 0; i < down; i++) { // fill room texture
        for (j = 0; j < right; j++) {
            tiles[x + i][y + j].Texture = 3;
            tiles[x + i][y + j].RoomCount = " ";
        }
    }
    roomDescription[roomDescription.length] = { Name: getRoomName(roomDescription.length + 1), Treasure: getData(40, false, dungeonLevel), Monster: getData(50, true, dungeonLevel) };
    tiles[x][y].RoomCount = roomDescription.length;
    for (var d = 0; d < doorCount; d++) {
        addDoor(tiles, x, y, down, right);
    }
}

function addDoor(tiles, x, y, down, right) {
    var doorIsOK;
    var doorX;
    var doorY;
    do {
        doorX = getRandomInt(x, x + down);
        doorY = getRandomInt(y, y + right);
        doorIsOK = checkDoor(tiles, doorX, doorY);
    }
    while (!doorIsOK);
}

function checkDoor(tiles, x, y) {
    var checkDoors = true;
    for (var i = x - 1; i < x + 2; i++){
        for (var j = y - 1; j < y + 2; j++){
            if (tiles[i][j].Texture === 2) { // check nearby doors
                checkDoors = false;
                break;
            }
        }
    }
    return checkDoors && checkEnvironment(tiles, x, y);
}

function checkEnvironment(tiles, x, y) { // check nearby tiles for room edges
    if (tiles[x][y - 1].Texture === 6) { // left
        setDoor(tiles, x, y - 1);
        return true;
    } else if (tiles[x][y + 1].Texture === 6) { // right
        setDoor(tiles, x, y + 1);
        return true;
    } else if (tiles[x + 1][y].Texture === 6) { // bottom
        setDoor(tiles, x + 1, y);
        return true;
    } else if (tiles[x - 1][y + 1].Texture === 6) { // top
        setDoor(tiles, x - 1, y);
        return true;
    }
    return false;
}

function setDoor(tiles, x, y) {
    tiles[x][y].Texture = 2;
    DOORS[DOORS.length] = { X: x, Y: y };
}

function generateCorridors(tiles, trapPercent) {
    MOVEMENT = 10;
    for (var d = 0; d < DOORS.length - 1; d++) { // -1 because the end point
        RESULT = [];
        var openList = [];
        var closedList = [];
        var start = tiles[DOORS[d].X][DOORS[d].Y]; // set door as the starting point
        var end = tiles[DOORS[d + 1].X][DOORS[d + 1].Y]; // set the next door as the end point
        for (var i = 1; i < tiles.length - 1; i++) { // preconfig H value + restore default values
            for (var j = 1; j < tiles.length - 1; j++) {
                tiles[i][j].H = manhattan(Math.abs(i - end.I), Math.abs(j - end.J));
                tiles[i][j].G = 0;
                tiles[i][j].Parent = null;
                tiles[i][j].F = null;
            }
        }   
        addToClosedList(closedList, tiles, start); // add start point to closed list
        addToOpen(tiles, start, openList, closedList, end); // add the nearby nodes to openList
        while (RESULT.length < 1 && openList.length > 0) {
            start = openList[0]; // get lowest F to repeat things (openList sorted)
            addToClosedList(closedList, tiles, start); // add to closed list this node
            removeFromOpen(openList, start); // remove from open list this node
            addToOpen(tiles, start, openList, closedList, end); // add open list the nearby nodes
        }
        setPath(tiles, trapPercent); // modify tiles Texture with the path
    }
}

function setPath(tiles, trapPercent) {
    for (var i = 0; i < RESULT.length; i++) {
        if (RESULT[i].Texture !== 2 && RESULT[i].Texture !== 4 && RESULT[i].Texture !== 5) { // do not change door or entry or trap Texture
            if (Math.floor(Math.random() * 100) < trapPercent) {
                tiles[RESULT[i].I][RESULT[i].J].Texture = 5;
            }
            else {
                tiles[RESULT[i].I][RESULT[i].J].Texture = 1;
            }

        }
    }
}

function checkEnd(tiles, node, x, y, end) {
    if (end.I === x && end.J === y) {
        setParent(tiles, node, x, y);
        getParents(node);
        return true;
    }
    return false;
}

function getParents(node) {
    RESULT[RESULT.length] = node;
    while (node.Parent) {
        node = node.Parent;
        RESULT[RESULT.length] = node;
    }
}

function checkG(tiles, node, x, y, openList) {
    if (openList.contains(tiles[x][y]) && tiles[x][y].G > (node.G + MOVEMENT)) {
        setParent(tiles, node, x, y);
    }
}

function removeFromOpen(openList, node) {
    var index = openList.indexOf(node)
    openList.splice(index, 1);
}

function addToOpen(tiles, node, openList, closedList, end) {
    addToOpenList(tiles, node, node.I, node.J - 1, openList, closedList, end); // left
    addToOpenList(tiles, node, node.I - 1, node.J, openList, closedList, end); // top
    addToOpenList(tiles, node, node.I + 1, node.J, openList, closedList, end); // bottom
    addToOpenList(tiles, node, node.I, node.J + 1, openList, closedList, end); // right
    calcGValue(openList); // calc G value Parent G + Movement
    calcFValue(openList); // calc F value (G + H)
}

function addToOpenList(tiles, node, x, y, openList, closedList, end) {
    if (!checkEnd(tiles, node, x, y, end)) {
        checkG(tiles, node, x, y, openList); // check if it needs reparenting
        if (checkTileForOpenList(tiles,x,y) && !closedList.contains(tiles[x][y]) && !openList.contains(tiles[x][y])) { // checkTile + not in openlist/closedlist
            setParent(tiles, node, x, y);
            openList[openList.length] = tiles[x][y];
        }
    }
}

function checkTileForOpenList(tiles,x,y){
    return tiles[x][y].H !== undefined && tiles[x][y].Texture !== 3 && tiles[x][y].Texture !== 6 // check its not edge/room/room_edge
}

function calcGValue(openList) {
    for (var i = 0; i < openList.length; i++) {
        openList[i].G = openList[i].Parent.G + MOVEMENT;
    }
}

function setParent(tiles, node, x, y) {
    tiles[x][y].Parent = node;
}

function calcFValue(openList) {
    for (var i = 0; i < openList.length; i++) {
        openList[i].F = openList[i].G + openList[i].H;
    }
    openList.sort(function (a, b) { // sort it because its easier to get next node
        return a.F - b.F;
    });
}

function addToClosedList(closedList, tiles, node) {
    closedList[closedList.length] = tiles[node.I][node.J];
}

function addEntryPoint(tiles) {
    var entryIsOk;
    var x;
    var y;
    do {
        x = getRandomInt(1, tiles.length - 1);
        y = getRandomInt(1, tiles.length - 1);
        entryIsOk = (tiles[x][y].Texture !== 2 && tiles[x][y].Texture !== 3); // not door or room tile
    }
    while (!entryIsOk);
    tiles[x][y].Texture = 4;
    DOORS[DOORS.length] = { X: x, Y: y };
}