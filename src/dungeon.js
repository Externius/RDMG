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

function drawDungeonOneCanvas(canvasID, sizeID, roomDensityID, roomSizeID) {
    DOORS = [];
    var canvas = document.getElementById(canvasID);
    var dungeon = document.getElementById(sizeID);
    var room = document.getElementById(roomDensityID);
    var rooms = document.getElementById(roomSizeID);
    var dungeonSize = parseInt(dungeon.options[dungeon.selectedIndex].value);
    var roomCount = Math.round((dungeonSize / 100) * parseInt(room.options[room.selectedIndex].value));
    var roomSize = Math.round(((dungeonSize - Math.round((dungeonSize * 0.35))) / 100) * parseInt(rooms.options[rooms.selectedIndex].value));
    var sizeX = Math.round(canvas.clientWidth / dungeonSize); // set image X size
    var sizeY = Math.round(canvas.clientHeight / dungeonSize); // set image Y size
    var tiles = [];
    /**
     * Textures:
     *  -1 edge
     *  0 black
     *  1 corridor
     *  2 door (basically a corridor with a door)
     *  3 room
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
        black: 'images/black.png',
        door: 'images/door.png',
        room: 'images/room.png'
    };
    generateRoom(tiles, roomCount, roomSize);
    generateCorridors(tiles); // generate corridors between room doors
    loadImages(sources, function (images) {  // load images to tiles
        for (i = 1; i < tiles.length - 1; i++) {
            for (j = 1; j < tiles[i].length - 1; j++) {
                switch (tiles[i][j].Texture) {
                    case 0:
                        context.drawImage(images.black, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 1:
                        context.drawImage(images.corridor, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 2:
                        var degree = getDegree(tiles, i, j);
                        rotateImage(context, images.door, degree, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 3:
                        context.drawImage(images.room, tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    default:
                        break;
                }
            }
        }
    });
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
    var degree = 0; // default degree is 0 witch is the above tile is room
    if (tiles[i][j - 1].Texture === 3) { // left tile is room
        degree = -90;
    } else if (tiles[i][j + 1].Texture === 3) { // right tile is room
        degree = 90;
    } else if (tiles[i + 1][j].Texture === 3) { // below tile is room
        degree = 180;
    } 
    return degree;
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

function generateRoom(tiles, roomNumber, roomSize) {
    for (var roomCount = 0; roomCount < roomNumber; roomCount++) {
        var result = setTilesForRoom(tiles, roomSize);
        fillRoom(result.X, result.Y, roomSize, tiles);
    }
    return tiles;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function checkTileIsRoom(tiles, x, y, roomSize) {
    var maxX = x + roomSize;
    var maxY = y + roomSize;
    var roomIsOk = checkCorners(tiles, x, y, maxX, maxY);
    for (var i = x; i < maxX; i++) { // check room area
        if (tiles[i][y - 1].Texture === 3 || tiles[i][maxY + 1].Texture === 3) { // check vertical edges
            roomIsOk = false;
            return roomIsOk;
        }
        for (var j = y; j < maxY; j++) { // check horizontal edges + normal room tile
            if (tiles[x - 1][j].Texture === 3 || tiles[maxX + 1][j].Texture === 3 || tiles[i][j].Texture === 3) {
                roomIsOk = false;
                return roomIsOk;
            }
        }
    }
    return roomIsOk;
}

function checkCorners(tiles, x, y, maxX, maxY) {
    var roomIsOk = true;
    if (tiles[x - 1][y - 1].Texture === 3 || tiles[x][maxY + 1].Texture === 3 || tiles[maxX + 1][y - 1].Texture === 3 || tiles[maxX + 1][maxY + 1].Texture === 3) {
        roomIsOk = false;
        return roomIsOk;
    }
    return roomIsOk;
}

function setTilesForRoom(tiles, roomSize) {
    var roomIsOk;
    var x;
    var y;
    do {
        x = getRandomInt(2, (tiles.length - (1 + roomSize)));
        y = getRandomInt(2, (tiles.length - (1 + roomSize)));
        roomIsOk = checkTileIsRoom(tiles, x - 1, y - 1, roomSize + 1); // x&y-1 && roomsize +1 because i want min 2 tiles between rooms
    }
    while (!roomIsOk);
    var result = { X: x, Y: y };  
    return result;
}

function fillRoom(x, y, roomSize, tiles) { // x-y is the top left corner the room goes random right and left then fill between
    var right = getRandomInt(2, roomSize + 1); //to reach max roomsize need to add +1
    var down = getRandomInt(2, roomSize + 1);
    var doorCount = getRandomInt(1, 3);
    var doorx = getRandomInt(x, x + down);
    var doory = getRandomInt(y, y + right);
    for (var i = 0; i < down; i++) { // fill room texture
        for (var j = 0; j < right; j++) {
            tiles[x + i][y + j].Texture = 3;
        }
    }
    for (var d = 0; d < doorCount; d++) {
        addDoor(roomSize, tiles, doorx, doory);
    }
}

function addDoor(roomSize, tiles, doorx, doory) {
    for (var i = 0; i < roomSize; i++) { // if first random room texture not in the edges, go right
        if (tiles[doorx][doory + i - 1].Texture === 0) { // left
            setDoor(tiles, doorx, doory + i - 1);
            return;
        } else if (tiles[doorx][doory + i + 1].Texture === 0) { // right
            setDoor(tiles, doorx, doory + i + 1);
            return;
        } else if (tiles[doorx + 1][doory + i].Texture === 0) { // bottom
            setDoor(tiles, doorx + 1, doory + i);
            return;
        } else if (tiles[doorx - 1][doory + i].Texture === 0) { // top
            setDoor(tiles, doorx - 1, doory + i);
            return;
        }
    }
}

function setDoor(tiles, x, y) {
    if (tiles[x][y - 1].Texture !== 2 || (tiles[x][y - 1].Texture === 2 && tiles[x][y - 2].Texture === 3 && tiles[x][y + 1].Texture === 3)) { //check theres no door in the left because we always went to right
        tiles[x][y].Texture = 2;
        DOORS[DOORS.length] = { X: x, Y: y };
    }
}

function generateCorridors(tiles) {
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
        while (RESULT.length < 1 || openList.length < 1) {
            start = openList[0]; // get lowest F to repeat things (openList sorted)
            addToClosedList(closedList, tiles, start); // add to closed list this node
            removeFromOpen(openList, start); // remove from open list this node
            addToOpen(tiles, start, openList, closedList, end); // add open list the nearby nodes
        }
        setPath(tiles); // modify tiles Texture with the path
    }
}

function setPath(tiles) {
    for (var i = 0; i < RESULT.length; i++) {
        if (RESULT[i].Texture !== 2) { // do not change door Texture
            tiles[RESULT[i].I][RESULT[i].J].Texture = 1;
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
    if (openList.contains(tiles[x][y] && tiles[x][y].G > node.G + MOVEMENT)) {
        setParent(tiles, node, x, y);
    }
}

function manhattan(dx, dy) {
    return (dx + dy);
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
        if (tiles[x][y].H !== undefined && tiles[x][y].Texture !== 3 && !closedList.contains(tiles[x][y]) && !openList.contains(tiles[x][y])) { //check its not edge/room and not in openlist/closedlist
            setParent(tiles, node, x, y);
            openList[openList.length] = tiles[x][y];
        }
    }
}

function calcGValue(openList) {
    for (var i = 0; i < openList.length; i++) {
        openList[i].G = openList[i].Parent.G + MOVEMENT;
    }
}

function setParent(tiles, node, X, Y) {
    tiles[X][Y].Parent = node;
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