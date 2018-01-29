var NoCorridor = (function () {
    var openDoorList = [];
    var edgeTileList = [];
    var roomStart = [];
    var DOORS = [];
    var setDoor = function (tiles, x, y) {
        if (Utils.getRandomInt(0, 101) < 40) {
            tiles[x][y].Texture = 11;
        } else if (Utils.getRandomInt(0, 101) < 50) {
            tiles[x][y].Texture = 10;
        } else {
            tiles[x][y].Texture = 7;
        }
        openDoorList[openDoorList.length] = tiles[x][y];
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
        for (var i = x - 1; i < x + 2; i++) {
            for (var j = y - 1; j < y + 2; j++) {
                if (Door.checkNCDoor(tiles, i, j)) { // check nearby doors
                    return false;
                }
            }
        }
        return checkEnvironment(tiles, x, y);
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
        if (Math.abs(down) < 4 || Math.abs(right) < 4) {
            return 2;
        } else {
            return Utils.getRandomInt(3, 5);
        }
    };
    var fillRoom = function (tiles, x, y, down, right) {
        for (var i = 0; i < down + 2; i++) { // fill with room_edge texture the bigger boundaries 
            for (var j = 0; j < right + 2; j++) {
                tiles[x + i - 1][y + j - 1].Texture = 6;
            }
        }
        for (i = 0; i < down; i++) { // fill room texture
            for (j = 0; j < right; j++) {
                tiles[x + i][y + j].Texture = 3;
                tiles[x + i][y + j].Count = " ";
            }
        }
        var doorCount = getDoorCount(down, right);
        for (var d = 0; d < doorCount; d++) {
            addDoor(tiles, x, y, down, right);
        }
    };
    var removeFromDoors = function (door) {
        var index = openDoorList.indexOf(door)
        openDoorList.splice(index, 1);
    };
    var checkTile = function (tiles, x, y) { // check if it is a room_edge or door
        return tiles[x][y].Texture === 6 || Door.checkNCDoor(tiles, x, y)
    };
    var checkDungeonTilesEdge = function (tiles, x, y) {
        return tiles[x][y].Texture === -1
    };
    var checkUp = function (tiles, x, y) {
        var tile;
        var edge;
        var temp = x;
        var count = 0;
        do {
            tile = checkTile(tiles, temp, y);
            edge = checkDungeonTilesEdge(tiles, temp, y);
            temp--;
            count--;
        }
        while (!tile && !edge);
        if (edge) {
            count++;
        }
        return count;
    };
    var checkDown = function (tiles, x, y) {
        var tile;
        var edge;
        var temp = x;
        var count = 0;
        do {
            tile = checkTile(tiles, temp, y);
            edge = checkDungeonTilesEdge(tiles, temp, y);
            temp++;
            count++;
        }
        while (!tile && !edge);
        if (edge) {
            count--;
        }
        return count;
    };
    var checkLeft = function (tiles, x, y) {
        var tile;
        var edge;
        var temp = y;
        var count = 0;
        do {
            tile = checkTile(tiles, x, temp);
            edge = checkDungeonTilesEdge(tiles, x, temp);
            temp--;
            count--;
        }
        while (!tile && !edge);
        if (edge) {
            count++;
        }
        return count;
    };
    var checkRight = function (tiles, x, y) {
        var tile;
        var edge;
        var temp = y;
        var count = 0;
        do {
            tile = checkTile(tiles, x, temp);
            edge = checkDungeonTilesEdge(tiles, x, temp);
            temp++;
            count++;
        }
        while (!tile && !edge);
        if (edge) {
            count--;
        }
        return count;
    };
    var checkHorizontalOneWay = function (tiles, x, y, right) {
        var count;
        if (right < 0) { // left
            count = checkLeft(tiles, x, y);
        } else {
            count = checkRight(tiles, x, y);
        }
        if (Math.abs(count) > 2) {
            return count;
        }
        return 0;
    };
    var checkVerticalOneWay = function (tiles, x, y, down) {
        var count;
        if (down < 0) { // up
            count = checkUp(tiles, x, y);
        } else {
            count = checkDown(tiles, x, y);
        }
        if (Math.abs(count) > 2) {
            return count;
        }
        return 0;
    };
    var getCheckResult = function (x, y) {
        if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 2) {
            return x;
        }
        if (Math.abs(y) > Math.abs(x) && Math.abs(y) > 2) {
            return y;
        }
        return 0;
    };
    var checkVertical = function (tiles, x, y) {
        return getCheckResult(checkUp(tiles, x, y), checkDown(tiles, x, y));
    };
    var checkHorizontal = function (tiles, x, y) {
        return getCheckResult(checkLeft(tiles, x, y), checkRight(tiles, x, y));
    };
    var getDownRight = function (vertical, horizontal, roomSize) {
        var down = Utils.getRandomInt(2, (Math.abs(vertical)) > roomSize ? roomSize : Math.abs(vertical));
        var right = Utils.getRandomInt(2, (Math.abs(horizontal)) > roomSize ? roomSize : Math.abs(horizontal));
        if (vertical < 0) {
            down = -down;
        }
        if (horizontal < 0) {
            right = -right;
        }
        return {
            down: down,
            right: right
        };
    };
    var checkPossible = function (tiles, vertical, horizontal, door) {
        if (vertical === 0 || horizontal === 0) { // its impossible to add room
            tiles[door.I][door.J].Texture = 6; // change the door to a room_edge
            return false;
        }
        return true;
    };
    var fillHorizontal = function (tiles, x, y, right) {
        if (right < 0) { // left
            for (var i = right + 1; i < 1; i++) { // set room
                tiles[x][y + i].Texture = 3;
                tiles[x][y + i].Count = " ";
            }
            tiles[x][y + 1].Texture = 6; // right edge
            tiles[x][y + right].Texture = 6; // left edge 
            edgeTileList[edgeTileList.length] = tiles[x][y + 1];
            edgeTileList[edgeTileList.length] = tiles[x][y + right];
        } else { // right
            for (i = 0; i < right; i++) { // set room
                tiles[x][y + i].Texture = 3;
                tiles[x][y + i].Count = " ";
            }
            tiles[x][y - 1].Texture = 6; // left edge
            tiles[x][y + right].Texture = 6; // right edge 
            edgeTileList[edgeTileList.length] = tiles[x][y - 1];
            edgeTileList[edgeTileList.length] = tiles[x][y + right];
        }
    };
    var checkRooms = function (tiles, x, y) {
        return tiles[x][y - 1].Texture !== 3 && tiles[x][y + 1].Texture !== 3 && tiles[x + 1][y].Texture !== 3 && tiles[x - 1][y].Texture !== 3;
    };
    var cleanEdgeTileList = function (tiles) {
        var toDelete = [];
        var x;
        var y;
        var index;
        for (var i = 0; i < edgeTileList.length; i++) {
            x = edgeTileList[i].I;
            y = edgeTileList[i].J;
            if (checkRooms(tiles, x, y)) { // if its on the edge
                toDelete[toDelete.length] = edgeTileList[i];
            }
        }
        for (i = 0; i < toDelete.length; i++) {
            index = edgeTileList.indexOf(toDelete[i]);
            edgeTileList.splice(index, 1);
        }
    };
    var setRoomEdge = function (tiles, x, y, addToEdgeList) {
        if (!Door.checkNCDoor(tiles, x, y) && addToEdgeList) { // if its not a corridor_door
            tiles[x][y].Texture = 6;
            edgeTileList[edgeTileList.length] = tiles[x][y];
        } else if (!Door.checkNCDoor(tiles, x, y)) {
            tiles[x][y].Texture = 6;
        }
    };
    var setVerticalEdge = function (tiles, x, y, right, down) {
        var addToEdgeList = !(right === 1 || right === -1);
        if (down < 0) { // up
            for (var i = down; i < 2; i++) { //right edge
                setRoomEdge(tiles, x + i, y + right, addToEdgeList);
            }
        } else { // bottom
            for (i = -1; i < down + 1; i++) { //left edge
                setRoomEdge(tiles, x + i, y + right, addToEdgeList);
            }
        }
    };
    var setHorizontalEdge = function (tiles, x, y, right, down) {
        var addToEdgeList = !(down === 1 || down === -1);
        if (right < 0) { // left
            for (var i = right; i < 2; i++) {
                setRoomEdge(tiles, x + down, y + i, addToEdgeList);
            }
        } else { // right
            for (i = -1; i < right + 1; i++) {
                setRoomEdge(tiles, x + down, y + i, addToEdgeList);
            }
        }
    };
    var checkNearbyDoor = function (tiles, node) {
        for (var i = node.I - 1; i < node.I + 2; i++) {
            for (var j = node.J - 1; j < node.J + 2; j++) {
                if (Door.checkNCDoor(tiles, i, j)) { // check nearby doors
                    return false;
                }
            }
        }
        return true;
    };
    var fillDoor = function (tiles, down, right) {
        var doorCount = getDoorCount(down, right);
        cleanEdgeTileList(tiles);
        var maxTryNumber = edgeTileList.length;
        do {
            var random = Utils.getRandomInt(0, edgeTileList.length);
            if (checkNearbyDoor(tiles, edgeTileList[random])) {
                setDoor(tiles, edgeTileList[random].I, edgeTileList[random].J);
                doorCount--;
            }
            maxTryNumber--;
        }
        while (doorCount > 0 && maxTryNumber > 0)
    };
    var fillVertical = function (tiles, x, y, down) {
        if (down < 0) { // up
            for (var i = down + 1; i < 1; i++) { // set room
                tiles[x + i][y].Texture = 3;
                tiles[x + i][y].Count = " ";
            }
            tiles[x + 1][y].Texture = 6; // bottom edge
            tiles[x + down][y].Texture = 6; // top edge 
            edgeTileList[edgeTileList.length] = tiles[x + 1][y];
            edgeTileList[edgeTileList.length] = tiles[x + down][y];
        } else { // down
            for (i = 0; i < down; i++) { // set room
                tiles[x + i][y].Texture = 3;
                tiles[x + i][y].Count = " ";
            }
            tiles[x - 1][y].Texture = 6; // top edge
            tiles[x + down][y].Texture = 6; // bottom edge 
            edgeTileList[edgeTileList.length] = tiles[x - 1][y];
            edgeTileList[edgeTileList.length] = tiles[x + down][y];
        }
    };
    var fillLeftRight = function (tiles, x, y, down, right) {
        edgeTileList = [];
        if (right < 0) {
            for (var i = right + 1; i < 1; i++) {
                fillVertical(tiles, x, y + i, down);
            }
        } else {
            for (i = 0; i < right; i++) {
                fillVertical(tiles, x, y + i, down);
            }
        }
        setVerticalEdge(tiles, x, y, right, down);
        setVerticalEdge(tiles, x, y, right < 0 ? 1 : -1, down);
        fillDoor(tiles, down, right);
        roomStart[roomStart.length] = tiles[x][y];
    };
    var fillUpDown = function (tiles, x, y, down, right) {
        edgeTileList = [];
        if (down < 0) {
            for (var i = down + 1; i < 1; i++) {
                fillHorizontal(tiles, x + i, y, right);
            }
        } else {
            for (i = 0; i < down; i++) {
                fillHorizontal(tiles, x + i, y, right);
            }
        }
        setHorizontalEdge(tiles, x, y, right, down);
        setHorizontalEdge(tiles, x, y, right, down < 0 ? 1 : -1);
        fillDoor(tiles, down, right);
        roomStart[roomStart.length] = tiles[x][y];
    };
    var checkPossibleEnd = function (tiles, vertical, horizontal, door, down, right) {
        if (vertical < 0 !== down < 0 || horizontal < 0 !== right < 0 || Math.abs(vertical) < Math.abs(down) || Math.abs(horizontal) < Math.abs(right)) { // it would overlap with another room
            tiles[door.I][door.J].Texture = 6; // change the door to a room_edge
            return false;
        }
        return true;
    };
    var checkArea = function (tiles, x, y, roomSize, door) {
        var vertical = checkVertical(tiles, x, y);
        var horizontal = checkHorizontal(tiles, x, y);
        if (checkPossible(tiles, vertical, horizontal, door)) {
            var result = getDownRight(vertical, horizontal, roomSize);
            var down = result.down;
            var right = result.right;
            vertical = checkVerticalOneWay(tiles, x, y + right, down); // check horizontal end vertically
            horizontal = checkHorizontalOneWay(tiles, x + down, y, right); // check vertical end horizontally
            if (checkPossibleEnd(tiles, vertical, horizontal, door, down, right)) {
                return {
                    down: down,
                    right: right
                };
            }
        }
        return {
            down: 0,
            right: 0
        };
    };
    var randomFillUpDown = function (tiles, x, y, roomSize, door) { // x-y is the tile next to the neighbour coordinates
        var result = checkArea(tiles, x, y, roomSize, door);
        if (result.down !== 0 && result.right !== 0) {
            fillUpDown(tiles, x, y, result.down, result.right);
        }
    };
    var randomFillLeftRight = function (tiles, x, y, roomSize, door) { // x-y is the tile next to the neighbour coordinates
        var result = checkArea(tiles, x, y, roomSize, door);
        if (result.down !== 0 && result.right !== 0) {
            fillLeftRight(tiles, x, y, result.down, result.right);
        }
    };
    var checkPos = function () { // returns true if the door not connecting rooms already
        return !(RoomPosition.isUp() && RoomPosition.isDown() || RoomPosition.isLeft() && RoomPosition.isRight());
    };
    var fillRoomToDoor = function (tiles, roomSize) {
        while (openDoorList.length > 0) {
            var i = openDoorList.length - 1;
            RoomPosition.checkRoomPosition(tiles, openDoorList[i].I, openDoorList[i].J);
            if (checkPos()) {
                if (RoomPosition.isUp()) {
                    randomFillUpDown(tiles, openDoorList[i].I + 1, openDoorList[i].J, roomSize, openDoorList[i]);
                } else if (RoomPosition.isDown()) {
                    randomFillUpDown(tiles, openDoorList[i].I - 1, openDoorList[i].J, roomSize, openDoorList[i]);
                } else if (RoomPosition.isRight()) {
                    randomFillLeftRight(tiles, openDoorList[i].I, openDoorList[i].J - 1, roomSize, openDoorList[i]);
                } else if (RoomPosition.isLeft()) {
                    randomFillLeftRight(tiles, openDoorList[i].I, openDoorList[i].J + 1, roomSize, openDoorList[i]);
                }
            }
            removeFromDoors(openDoorList[i]);
        }
    };
    var checkEdges = function (tiles, x, y) {
        return tiles[x][y - 1].Texture === 3 || tiles[x][y + 1].Texture === 3 || tiles[x + 1][y].Texture === 3 || tiles[x - 1][y].Texture === 3;
    };
    var addEntryPoint = function (tiles) {
        var entryIsOk;
        var x;
        var y;
        do {
            x = Utils.getRandomInt(1, tiles.length - 1);
            y = Utils.getRandomInt(1, tiles.length - 1);
            RoomPosition.checkRoomPosition(tiles, x, y);
            entryIsOk = (tiles[x][y].Texture === 6 && checkPos() && checkNearbyDoor(tiles, tiles[x][y]) && checkEdges(tiles, x, y));
        }
        while (!entryIsOk);
        tiles[x][y].Texture = 4;
    };
    var addFirstRoom = function (tiles, roomSize) {
        openDoorList = [];
        var x = Utils.getRandomInt(5, (tiles.length - (roomSize + 4)));
        var y = Utils.getRandomInt(5, (tiles.length - (roomSize + 4)));
        var right = Utils.getRandomInt(2, roomSize + 1);
        var down = Utils.getRandomInt(2, roomSize + 1);
        fillRoom(tiles, x, y, down, right);
        roomStart[roomStart.length] = tiles[x][y];
    };
    var setDoorsDescriptions = function () {
        for (var i = 0; i < DOORS.length; i++) {
            DOORS[i].Count = Door.getNCDoor(DOORS[i]);
        }
    };
    var checkTileForOpenList = function (tiles, x, y) {
        return tiles[x][y].Texture === 3
    };
    var addToOpenList = function (tiles, x, y, openList, closedList) {
        if (checkTileForOpenList(tiles, x, y) && !closedList.contains(tiles[x][y]) && !openList.contains(tiles[x][y])) { // checkTile + not in openlist/closedlist
            openList[openList.length] = tiles[x][y];
        }
    };
    var addToOpen = function (tiles, node, openList, closedList) {
        addToOpenList(tiles, node.I, node.J - 1, openList, closedList); // left
        addToOpenList(tiles, node.I - 1, node.J, openList, closedList); // top
        addToOpenList(tiles, node.I + 1, node.J, openList, closedList); // bottom
        addToOpenList(tiles, node.I, node.J + 1, openList, closedList); // right
    };
    var cleanDoorList = function () {
        var toDelete = [];
        var index;
        for (var i = 0; i < DOORS.length; i++) {
            if (DOORS[i].Texture === 6) {
                toDelete[toDelete.length] = DOORS[i];
            }
        }
        for (i = 0; i < toDelete.length; i++) {
            index = DOORS.indexOf(toDelete[i]);
            DOORS.splice(index, 1);
        }
    };
    var addDescription = function (tiles, roomDescription) {
        cleanDoorList();
        setDoorsDescriptions();
        for (var i = 0; i < roomStart.length; i++) {
            var openList = [];
            var closedList = [];
            var start = roomStart[i];
            Dungeon.addToClosedList(closedList, tiles, start); // add start point to closed list
            addToOpen(tiles, start, openList, closedList); // add the nearby nodes to openList
            while (openList.length > 0) {
                start = openList[0]; // get next room
                Dungeon.addToClosedList(closedList, tiles, start); // add to closed list this node
                Dungeon.removeFromOpen(openList, start); // remove from open list this node
                addToOpen(tiles, start, openList, closedList); // add open list the nearby nodes
            }
            Utils.addNCRoomDescription(tiles, roomStart[i].I, roomStart[i].J, roomDescription, Door.getNCDoorDescription(tiles, closedList));
        }
    };
    var generate = function (tiles, roomSize, roomDescription) {
        roomStart = [];
        addFirstRoom(tiles, roomSize);
        fillRoomToDoor(tiles, roomSize);
        addEntryPoint(tiles);
        addDescription(tiles, roomDescription);
    };
    return {
        generate: generate
    }
})();