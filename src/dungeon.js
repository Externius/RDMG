var Dungeon = (function () {
    var DOORS = [];
    var MOVEMENT = 10;
    var RESULT = [];
    var CORRIDORS = [];
    var TRAPCOUNT = 0;
    var ROOMS = [];
    var SOURCES = [
        'images/dark/marble.png',
        'images/dark/corridor.png',
        'images/dark/door.png',
        'images/dark/room.png',
        'images/dark/entry.png',
        'images/dark/trap.png',
        'images/dark/room_edge.png',
        'images/dark/nc_door.png',
        'images/dark/door_locked.png',
        'images/dark/door_trapped.png',
        'images/dark/nc_door_locked.png',
        'images/dark/nc_door_trapped.png',
        'images/light/marble.png',
        'images/light/room.png',
        'images/light/room_edge.png',
        'images/light/nc_door.png',
        'images/light/nc_door_locked.png',
        'images/light/nc_door_trapped.png',
        'images/white/marble.png',
        'images/white/room.png',
        'images/white/nc_door.png',
        'images/white/nc_door_locked.png',
        'images/white/nc_door_trapped.png'
    ];
    var IMAGEOBJECT = [];
    var THEMEINDEX = [];
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };
    Array.prototype.diff = function (a) {
        return this.filter(function (i) { return a.indexOf(i) < 0; });
    };
    var getFontSize = function (dungeonSize) {
        if (dungeonSize > 30) {
            return "9pt Calibri bold";
        }
        else {
            return "10pt Calibri bold";
        }
    };
    var createTrapTableNode = function (nodeText, isRoot) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        var text = document.createTextNode(nodeText);
        if (isRoot) {
            td.rowSpan = 2;
        }
        td.appendChild(text);
        tr.appendChild(td);
        return tr;
    };
    var createTableNode = function (nodeText, isRoot, parent) {
        var tr;
        if (parent === undefined) {
            tr = document.createElement('tr');
        } else {
            tr = parent;
        }
        var td = document.createElement('td');
        var text = document.createTextNode(nodeText);
        if (isRoot) {
            td.rowSpan = 3;
        }
        td.appendChild(text);
        tr.appendChild(td);
        return tr;
    };
    var addDescription = function (roomDescription, trapDescription) {
        var table = document.getElementById("table_description");
        table.innerHTML = "";
        for (var i = 0; i < roomDescription.length; i++) {
            var tr = createTableNode(roomDescription[i].name, true);
            table.appendChild(tr);
            tr = createTableNode(roomDescription[i].monster, false, tr);
            table.appendChild(tr);
            tr = createTableNode(roomDescription[i].treasure, false);
            table.appendChild(tr);
            tr = createTableNode(roomDescription[i].door, false);
            table.appendChild(tr);
        }
        for (i = 0; i < trapDescription.length; i++) {
            tr = createTrapTableNode(trapDescription[i].name, true);
            table.appendChild(tr);
            tr = createTrapTableNode(trapDescription[i].description, false);
            table.appendChild(tr);
        }
    };
    var preloadImages = function () {
        for (var i = 0; i < SOURCES.length; i++) {
            var j = IMAGEOBJECT.length;
            IMAGEOBJECT[j] = new Image();
            IMAGEOBJECT[j].src = SOURCES[i];
        }
    };
    var getDegree = function (tiles, i, j) {
        if (tiles[i][j - 1].Texture === 3) { // left tile is room
            return -90;
        } else if (tiles[i][j + 1].Texture === 3) { // right tile is room
            return 90;
        } else if (tiles[i + 1][j].Texture === 3) { // below tile is room
            return 180;
        }
        return 0; // above tile is room
    };
    var rotateImage = function (context, image, degree, x, y, width, height) {
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
    };
    var checkIsRoom = function (tiles, x, y) {
        return tiles[x][y].Texture === 3 || tiles[x][y].Texture === 6
    };
    var checkTileGoodForRoom = function (tiles, x, y, right, down) {
        var maxX = x + down + 2; // +2 because of the edges
        var maxY = y + right + 2;
        for (var i = x; i < maxX; i++) { // check the room area + boundaries
            for (var j = y; j < maxY; j++) {
                if (checkIsRoom(tiles, i, j)) {
                    return false;
                }
            }
        }
        return true;
    };
    var setDoor = function (tiles, x, y) {
        if (Utils.getRandomInt(0, 101) < 40) {
            tiles[x][y].Texture = 9;
        } else if (Utils.getRandomInt(0, 101) < 50) {
            tiles[x][y].Texture = 8;
        } else {
            tiles[x][y].Texture = 2;
        }
        DOORS[DOORS.length] = tiles[x][y];
    };
    var checkEnvironment = function (tiles, x, y) { // check nearby tiles for room edges
        if (tiles[x][y - 1].Texture === 6) { // left
            setDoor(tiles, x, y - 1);
            return true;
        } else if (tiles[x][y + 1].Texture === 6) { // right
            setDoor(tiles, x, y + 1);
            return true;
        } else if (tiles[x + 1][y].Texture === 6) { // bottom
            setDoor(tiles, x + 1, y);
            return true;
        } else if (tiles[x - 1][y].Texture === 6) { // top
            setDoor(tiles, x - 1, y);
            return true;
        }
        return false;
    };
    var checkDoor = function (tiles, x, y) {
        var checkDoors = true;
        for (var i = x - 1; i < x + 2; i++) {
            for (var j = y - 1; j < y + 2; j++) {
                if (tiles[i][j].Texture === 2 || tiles[i][j].Texture === 8 || tiles[i][j].Texture === 9) { // check nearby doors
                    checkDoors = false;
                    break;
                }
            }
        }
        return checkDoors && checkEnvironment(tiles, x, y);
    };
    var addDoor = function (tiles, x, y, down, right) {
        var doorIsOK;
        var doorX;
        var doorY;
        do {
            doorX = Utils.getRandomInt(x, x + down);
            doorY = Utils.getRandomInt(y, y + right);
            doorIsOK = checkDoor(tiles, doorX, doorY);
        }
        while (!doorIsOK);
    };
    var getDoorCount = function (down, right) {
        if (down < 4 || right < 4) {
            return Utils.getRandomInt(1, 3);
        } else {
            return Utils.getRandomInt(2, 5);
        }
    };
    var fillRoom = function (tiles, x, y, right, down, roomDescription) { // x-y is the top left corner
        for (var i = 0; i < down + 2; i++) { // fill with room_edge texture the bigger boundaries 
            for (var j = 0; j < right + 2; j++) {
                tiles[x + i - 1][y + j - 1].Texture = 6;
            }
        }
        for (i = 0; i < down; i++) { // fill room texture
            for (j = 0; j < right; j++) {
                tiles[x + i][y + j].Texture = 3;
                ROOMS[ROOMS.length] = tiles[x + i][y + j];
                tiles[x + i][y + j].Count = " ";
            }
        }
        var currentSize = DOORS.length;
        var doorCount = getDoorCount(down, right);
        for (var d = 0; d < doorCount; d++) {
            addDoor(tiles, x, y, down, right);
        }
        var newSize = DOORS.length;
        var currentDoors = DOORS.slice(currentSize, newSize);
        Utils.addRoomDescription(tiles, x, y, roomDescription, currentDoors);
    };
    var setTilesForRoom = function (tiles, roomSize) {
        var roomIsOk;
        var x;
        var y;
        var failSafeCount = tiles.length * tiles.length / 2;
        var right;
        var down;
        do {
            x = Utils.getRandomInt(3, (tiles.length - (roomSize + 2))); // 3 and +2, becuse of edge + room_edge 
            y = Utils.getRandomInt(3, (tiles.length - (roomSize + 2)));
            right = Utils.getRandomInt(2, roomSize + 1);
            down = Utils.getRandomInt(2, roomSize + 1);
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
    };
    var generateRoom = function (tiles, roomNumber, roomSize, roomDescription) {
        for (var roomCount = 0; roomCount < roomNumber; roomCount++) {
            var result = setTilesForRoom(tiles, roomSize);
            if (result.X !== 0) {
                fillRoom(tiles, result.X, result.Y, result.Right, result.Down, roomDescription);
            }
        }
        return tiles;
    };
    var addTrap = function (tiles, x, y, trapDescription) {
        tiles[x][y].Texture = 5; // add trap
        Utils.addTrapDescription(tiles, x, y, trapDescription);
    };
    var setPath = function (tiles) {
        for (var i = 0; i < RESULT.length; i++) {
            if (RESULT[i].Texture === 0) { // only change the marble texture
                tiles[RESULT[i].I][RESULT[i].J].Texture = 1;
                CORRIDORS[CORRIDORS.length] = tiles[RESULT[i].I][RESULT[i].J];
            }
        }
    };
    var getParents = function (node) {
        RESULT[RESULT.length] = node;
        while (node.Parent) {
            node = node.Parent;
            RESULT[RESULT.length] = node;
        }
    };
    var setParent = function (tiles, node, x, y) {
        tiles[x][y].Parent = node;
    };
    var checkEnd = function (tiles, node, x, y, end) {
        if (end.I === x && end.J === y) {
            setParent(tiles, node, x, y);
            getParents(node);
            return true;
        }
        return false;
    };
    var checkG = function (tiles, node, x, y, openList) {
        if (openList.contains(tiles[x][y]) && tiles[x][y].G > (node.G + MOVEMENT)) {
            setParent(tiles, node, x, y);
        }
    };
    var removeFromOpen = function (openList, node) {
        var index = openList.indexOf(node)
        openList.splice(index, 1);
    };
    var checkTileForOpenList = function (tiles, x, y) {
        return tiles[x][y].H !== undefined && tiles[x][y].Texture !== 3 && tiles[x][y].Texture !== 6 // check its not edge/room/room_edge
    };
    var addToOpenList = function (tiles, node, x, y, openList, closedList, end) {
        if (!checkEnd(tiles, node, x, y, end)) {
            checkG(tiles, node, x, y, openList); // check if it needs reparenting
            if (checkTileForOpenList(tiles, x, y) && !closedList.contains(tiles[x][y]) && !openList.contains(tiles[x][y])) { // checkTile + not in openlist/closedlist
                setParent(tiles, node, x, y);
                openList[openList.length] = tiles[x][y];
            }
        }
    };
    var calcGValue = function (openList) {
        for (var i = 0; i < openList.length; i++) {
            openList[i].G = openList[i].Parent.G + MOVEMENT;
        }
    };
    var calcFValue = function (openList) {
        for (var i = 0; i < openList.length; i++) {
            openList[i].F = openList[i].G + openList[i].H;
        }
        openList.sort(function (a, b) { // sort it because its easier to get next node
            return a.F - b.F;
        });
    };
    var addToOpen = function (tiles, node, openList, closedList, end) {
        addToOpenList(tiles, node, node.I, node.J - 1, openList, closedList, end); // left
        addToOpenList(tiles, node, node.I - 1, node.J, openList, closedList, end); // top
        addToOpenList(tiles, node, node.I + 1, node.J, openList, closedList, end); // bottom
        addToOpenList(tiles, node, node.I, node.J + 1, openList, closedList, end); // right
        calcGValue(openList); // calc G value Parent G + Movement
        calcFValue(openList); // calc F value (G + H)
    };
    var addToClosedList = function (closedList, tiles, node) {
        closedList[closedList.length] = tiles[node.I][node.J];
    };
    var addEntryPoint = function (tiles) {
        var entryIsOk;
        var x;
        var y;
        do {
            x = Utils.getRandomInt(1, tiles.length - 1);
            y = Utils.getRandomInt(1, tiles.length - 1);
            entryIsOk = tiles[x][y].Texture === 0;
        }
        while (!entryIsOk);
        tiles[x][y].Texture = 4;
        DOORS[DOORS.length] = tiles[x][y];
    };
    var generateCorridors = function (tiles) {
        MOVEMENT = 10;
        for (var d = 0; d < DOORS.length - 1; d++) { // -1 because the end point
            RESULT = [];
            var openList = [];
            var closedList = [];
            var start = DOORS[d]; // set door as the starting point
            var end = DOORS[d + 1]; // set the next door as the end point
            for (var i = 1; i < tiles.length - 1; i++) { // preconfig H value + restore default values
                for (var j = 1; j < tiles.length - 1; j++) {
                    tiles[i][j].H = Utils.manhattan(Math.abs(i - end.I), Math.abs(j - end.J));
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
            setPath(tiles); // modify tiles Texture with the path
        }
    };
    var checkTileForDeadEnd = function (tiles, x, y) {
        for (var i = x - 1; i < x + 2; i++) {
            for (var j = y - 1; j < y + 2; j++) {
                if (tiles[i][j].Texture !== 0) { // check if any other tile is there
                    return false;
                }
            }
        }
        return true;
    };
    var generateDeadEnds = function (tiles, roomCount) {
        var count = Math.ceil(roomCount / 2);
        var deadEndsCount = 0;
        var deadEnds = [];
        var maxAttempt = tiles.length * 2;
        var croppedDungeonTiles = [];
        for (var i = 2; i < tiles.length - 2; i++) {
            for (var j = 2; j < tiles[0].length - 2; j++) {
                croppedDungeonTiles[croppedDungeonTiles.length] = tiles[i][j];
            }
        }
        var summa = ROOMS.concat(DOORS, CORRIDORS);
        var dungeon = croppedDungeonTiles.diff(summa);
        do {
            var tile = dungeon[Utils.getRandomInt(0, dungeon.length)];
            if (checkTileForDeadEnd(tiles, tile.I, tile.J)) {
                tiles[tile.I][tile.J].Textures = 1;
                deadEnds[deadEnds.length] = tiles[tile.I][tile.J];
                deadEndsCount++;
            }
            maxAttempt--;
        }
        while (count != deadEndsCount && maxAttempt > 0);
        return deadEnds;
    };
    var addDeadEnds = function (tiles, roomCount) {
        var deadEnds = generateDeadEnds(tiles, roomCount);
        var firstDoor = DOORS[0]; // get  first door
        for (var i = 0; i < deadEnds.length; i++) {
            DOORS = []; // empty doors
            DOORS[DOORS.length] = firstDoor;
            DOORS[DOORS.length] = deadEnds[i];
            generateCorridors(tiles);
        }
    };
    var addRandomTrap = function (tiles, trapDescription) {
        var count = 0;
        while (TRAPCOUNT > count) {
            var x = Utils.getRandomInt(0, CORRIDORS.length);
            var i = CORRIDORS[x].I
            var j = CORRIDORS[x].J;
            if (tiles[i][j].Texture === 1) {
                addTrap(tiles, i, j, trapDescription);
                count++;
            }
        }
    };
    var setBase = function (corridorIndex, doorIndex, entryIndex, trapIndex, doorLockedIndex, doorTrappedIndex) {
        THEMEINDEX[1] = corridorIndex;
        THEMEINDEX[2] = doorIndex;
        THEMEINDEX[4] = entryIndex;
        THEMEINDEX[5] = trapIndex;
        THEMEINDEX[8] = doorLockedIndex;
        THEMEINDEX[9] = doorTrappedIndex;
    };
    var setTheme = function (marbleIndex, roomIndex, roomEdgeIndex, ncDoorIndex, ncDoorLockedIndex, ncDoorTrappedIndex) {
        THEMEINDEX[0] = marbleIndex;
        THEMEINDEX[3] = roomIndex;
        THEMEINDEX[6] = roomEdgeIndex;
        THEMEINDEX[7] = ncDoorIndex;
        THEMEINDEX[10] = ncDoorLockedIndex;
        THEMEINDEX[11] = ncDoorTrappedIndex;
    };
    var getTheme = function () {
        var theme = document.getElementById("theme");
        var themeID = parseInt(theme.options[theme.selectedIndex].value);
        THEMEINDEX = [];
        setBase(1, 2, 4, 5, 8, 9);
        switch (themeID) {
            case 0: // dark
                setTheme(0, 3, 6, 7, 10, 11);
                break;
            case 1: // light
                setTheme(12, 13, 14, 15, 16, 17);
                break;
            case 2: // minimal
                setTheme(18, 19, 18, 20, 21, 22);
                break;
            default:
                break;
        }
    };
    var drawMap = function (tiles, context, contextFont, hasCorridor) {
        for (var i = 1; i < tiles.length - 1; i++) {
            for (var j = 1; j < tiles[i].length - 1; j++) {
                switch (tiles[i][j].Texture) {
                    case 0: // marble
                        context.drawImage(IMAGEOBJECT[THEMEINDEX[0]], tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 1: // corridor
                        context.drawImage(IMAGEOBJECT[THEMEINDEX[1]], tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 2: // door
                        rotateImage(context, IMAGEOBJECT[THEMEINDEX[2]], getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 3: // room
                        context.drawImage(IMAGEOBJECT[THEMEINDEX[3]], tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        context.font = contextFont;
                        context.fillText(tiles[i][j].Count, tiles[i][j].X + Math.round(tiles[i][j].Width * 0.1), tiles[i][j].Y + Math.round(tiles[i][j].Height * 0.65));
                        break;
                    case 4: // entry
                        context.drawImage(IMAGEOBJECT[THEMEINDEX[4]], tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 5: // trap
                        context.drawImage(IMAGEOBJECT[THEMEINDEX[5]], tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        context.font = contextFont;
                        context.fillText(tiles[i][j].Count, tiles[i][j].X + Math.round(tiles[i][j].Width * 0.1), tiles[i][j].Y + Math.round(tiles[i][j].Height * 0.5));
                        break;
                    case 6: // room_edge
                        context.drawImage(hasCorridor ? IMAGEOBJECT[THEMEINDEX[0]] : IMAGEOBJECT[THEMEINDEX[6]], tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height);
                        break;
                    case 7: // nc_Door
                        rotateImage(context, IMAGEOBJECT[THEMEINDEX[7]], getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 8: // door_locked
                        rotateImage(context, IMAGEOBJECT[THEMEINDEX[8]], getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 9: // door_trapped
                        rotateImage(context, IMAGEOBJECT[THEMEINDEX[9]], getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 10: // nc_door_locked
                        rotateImage(context, IMAGEOBJECT[THEMEINDEX[10]], getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    case 11: // nc_door_trapped
                        rotateImage(context, IMAGEOBJECT[THEMEINDEX[11]], getDegree(tiles, i, j), tiles[i][j].X, tiles[i][j].Y, tiles[i][j].Width, tiles[i][j].Height)
                        break;
                    default:
                        break;
                }
            }
        }
    };
    var drawDungeonOneCanvas = function (canvasID, sizeID, roomDensityID, roomSizeID, trapID, corridorID, deadEndID) {
        DOORS = [];
        TRAPCOUNT = 0;
        CORRIDORS = [];
        ROOMS = [];
        var roomDescription = [];
        var trapDescription = [];
        var canvas = document.getElementById(canvasID);
        var dungeon = document.getElementById(sizeID);
        var room = document.getElementById(roomDensityID);
        var rooms = document.getElementById(roomSizeID);
        var traps = document.getElementById(trapID);
        var trapPercent = parseInt(traps.options[traps.selectedIndex].value);
        var corridor = document.getElementById(corridorID);
        var hasCorridor = (corridor.options[corridor.selectedIndex].value === "true");
        var deadEnd = document.getElementById(deadEndID);
        var hasDeadEnds = (deadEnd.options[deadEnd.selectedIndex].value === "true");
        var dungeonSize = parseInt(dungeon.options[dungeon.selectedIndex].value);
        var roomCount = Math.round((dungeonSize / 100) * parseInt(room.options[room.selectedIndex].value));
        var roomSize = Math.round(((dungeonSize - Math.round((dungeonSize * 0.35))) / 100) * parseInt(rooms.options[rooms.selectedIndex].value));
        var sizeX = Math.round(canvas.clientWidth / dungeonSize); // set image X size
        var sizeY = Math.round(canvas.clientHeight / dungeonSize); // set image Y size
        var tiles = [];
        var contextFont = getFontSize(dungeonSize);
        TRAPCOUNT = dungeonSize * trapPercent / 100;
        Utils.loadVariables();
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
         *  7 no corridor door
         *  8 door_locked
         *  9 door_trapped
         *  10 nc_door_locked
         *  11 nc_door_trapped
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
        if (hasCorridor) {
            generateRoom(tiles, roomCount, roomSize, roomDescription);
            addEntryPoint(tiles);
            generateCorridors(tiles); // generate corridors between room doors
            if (hasDeadEnds) {
                addDeadEnds(tiles, roomCount);
            }
            addRandomTrap(tiles, trapDescription);
        }
        else {
            NoCorridor.generate(tiles, roomSize, roomDescription);
        }
        addDescription(roomDescription, trapDescription);
        getTheme();
        drawMap(tiles, context, contextFont, hasCorridor);
        Utils.downloadImg("download_map", canvas);
        Utils.downloadDescription("download_description", "DungeonRooms.csv");
        Utils.downloadHTML("download_html");
    };
    return {
        drawDungeonOneCanvas: drawDungeonOneCanvas,
        preloadImages: preloadImages,
        removeFromOpen: removeFromOpen,
        addToClosedList: addToClosedList
    }
})();