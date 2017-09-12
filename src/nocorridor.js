var NoCorridor = (function () {
    var openDoorList = [];
    var allDoorList = [];
    var edgeTileList = [];
    var setDoor = function (tiles, x, y) {
        tiles[x][y].Texture = 7;
        openDoorList[openDoorList.length] = { X: x, Y: y };
        allDoorList[allDoorList.length] = { X: x, Y: y };
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
                if (tiles[i][j].Texture === 7) { // check nearby doors
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
    var fillRoom = function (tiles, x, y, down, right, roomDescription, dungeonLevel) {
        var doorCount = Utils.getRandomInt(2, 3);
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
        Utils.addDescription(tiles, x, y, roomDescription, dungeonLevel);
        for (var d = 0; d < doorCount; d++) {
            addDoor(tiles, x, y, down, right);
        }
    };
    var checkRoomPosition = function (tiles, x, y) {
        var result = { Up: false, Down: false, Left: false, Right: false };
        if (tiles[x][y - 1].Texture === 3) { // left
            result.Left = true;
        }
        if (tiles[x][y + 1].Texture === 3) { // right
            result.Right = true;
        }
        if (tiles[x + 1][y].Texture === 3) { // bottom
            result.Down = true;
        }
        if (tiles[x - 1][y].Texture === 3) { // top
            result.Up = true;
        }
        return result;
    };
    var removeFromDoors = function (door) {
        var index = openDoorList.indexOf(door)
        openDoorList.splice(index, 1);
    };
    var checkTile = function (tiles, x, y) { // check if it is a room_edge or door
        return tiles[x][y].Texture === 6 || tiles[x][y].Texture === 7 
    };
    var checkDungeonEdge = function (tiles, x, y) {
        return tiles[x][y].Texture === -1
    };
    var getCheckResult = function (x, y) {
        var count = 0;
        if (Math.abs(x) > y && Math.abs(x) > 2) {
            count = x++;
        } else if (y > Math.abs(x) && y > 2) {
            count = y--;
        }
        return count;
    };
    var checkVertical = function (tiles, x, y) {
        var tile;
        var edge;
        var up = x;
        var down = x;
        var upCount = 0;
        var downCount = 0;
        do {
            tile = checkTile(tiles, up, y);
            edge = checkDungeonEdge(tiles, up, y);
            up--;
            upCount--;
        }
        while (!tile && !edge)
        if (edge) {
            upCount++;
        }
        do {
            tile = checkTile(tiles, down, y);
            edge = checkDungeonEdge(tiles, down, y);
            down++;
            downCount++;
        }
        while (!tile && !edge)
        if (edge) {
            downCount--;
        }
        return getCheckResult(upCount, downCount);
    };
    var checkHorizontal = function (tiles, x, y) {
        var tile;
        var edge;
        var left = y;
        var right = y;
        var leftCount = 0;
        var rightCount = 0;
        do {
            tile = checkTile(tiles, x, left);
            edge = checkDungeonEdge(tiles, x, left);
            left--;
            leftCount--;
        }
        while (!tile && !edge)
        if (edge) {
            leftCount++;
        }
        do {
            tile = checkTile(tiles, x, right);
            edge = checkDungeonEdge(tiles, x, right);
            right++;
            rightCount++;
        }
        while (!tile && !edge)
        if (edge) {
            rightCount--;
        }
        return getCheckResult(leftCount, rightCount);
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
        return { down: down, right: right };
    };
    var checkPossible = function (tiles, vertical, horizontal, door) {
        if (vertical === 0 || horizontal === 0) { //its impossible to add room
            tiles[door.X][door.Y].Texture = 6; //change the door to a room_edge
            return false;
        }
        return true;
    };
    var fillHorizontal = function (tiles, x, y, right) {
        if (right < 0) { // left
            for (var i = right + 1; i < 1; i++) { // set room
                tiles[x][y + i].Texture = 3;
                tiles[x][y + i].RoomCount = " ";
            }
            tiles[x][y + 1].Texture = 6; // right edge
            tiles[x][y + right].Texture = 6; // left edge 
            edgeTileList[edgeTileList.length] = tiles[x][y + 1];
            edgeTileList[edgeTileList.length] = tiles[x][y + right];
        }
        else { // right
            for (i = 0; i < right; i++) { // set room
                tiles[x][y + i].Texture = 3;
                tiles[x][y + i].RoomCount = " ";
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
        if (tiles[x][y].Texture !== 7 && addToEdgeList) { // if its not a corridor_door
            tiles[x][y].Texture = 6;
            edgeTileList[edgeTileList.length] = tiles[x][y];
        }
        else if (tiles[x][y].Texture !== 7) {
            tiles[x][y].Texture = 6;
        }
    };
    var setVerticalEdge = function (tiles, x, y, right, down) {
        var addToEdgeList = !(right == 1 || right == -1);
        if (down < 0) { // up
            for (var i = down; i < 2; i++) { //right edge
                setRoomEdge(tiles, x + i, y + right, addToEdgeList);
            }
        }
        else { // bottom
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
        }
        else { // right
            for (i = -1; i < right + 1; i++) { 
                setRoomEdge(tiles, x + down, y + i, addToEdgeList);
            }
        }
    };
    var checkNearbyDoor = function (tiles,node) {
        var checkDoors = true;
        for (var i = node.I - 1; i < node.I + 2; i++) {
            for (var j = node.J - 1; j < node.J + 2; j++) {
                if (tiles[i][j].Texture === 7) { // check nearby doors
                    checkDoors = false;
                    break;
                }
            }
        }
        return checkDoors;
    };
    var fillDoor = function (tiles) {
        var doorCount = Utils.getRandomInt(2, 3);
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
                tiles[x + i][y].RoomCount = " ";
            }
            tiles[x + 1][y].Texture = 6; // bottom edge
            tiles[x + down][y].Texture = 6; // top edge 
            edgeTileList[edgeTileList.length] = tiles[x + 1][y];
            edgeTileList[edgeTileList.length] = tiles[x + down][y];
        }
        else { // down
            for (i = 0; i < down; i++) { // set room
                tiles[x + i][y].Texture = 3;
                tiles[x + i][y].RoomCount = " ";
            }
            tiles[x - 1][y].Texture = 6; // top edge
            tiles[x + down][y].Texture = 6; // bottom edge 
            edgeTileList[edgeTileList.length] = tiles[x - 1][y];
            edgeTileList[edgeTileList.length] = tiles[x + down][y];
        }
    };
    var fillLeftRight = function (tiles, x, y, down, right, roomDescription, dungeonLevel) {
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
        fillDoor(tiles);
        Utils.addDescription(tiles, x, y, roomDescription, dungeonLevel);
    };
    var fillUpDown = function (tiles, x, y, down, right, roomDescription, dungeonLevel) {
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
        fillDoor(tiles);
        Utils.addDescription(tiles, x, y, roomDescription, dungeonLevel);
    };
    var randomFillUpDown = function (tiles, x, y, roomSize, roomDescription, dungeonLevel, door) { // x-y is the door coordinates
        var vertical = checkVertical(tiles, x, y);
        var horizontal = checkHorizontal(tiles, x, y);
        if (checkPossible(tiles, vertical, horizontal, door)) {
            var result = getDownRight(vertical, horizontal, roomSize);
            var down = result.down;
            var right = result.right;
            fillUpDown(tiles, x, y, down, right, roomDescription, dungeonLevel);
        }
    };
    var randomFillLeftRight = function (tiles, x, y, roomSize, roomDescription, dungeonLevel, door) {
        var vertical = checkVertical(tiles, x, y);
        var horizontal = checkHorizontal(tiles, x, y);
        if (checkPossible(tiles, vertical, horizontal, door)) {
            var result = getDownRight(vertical, horizontal, roomSize);
            var down = result.down;
            var right = result.right;
            fillLeftRight(tiles, x, y , down, right, roomDescription, dungeonLevel);
        } 
    };
    var checkPos = function (position) {
        return position.Up && position.Down || position.Left && position.Right;
    };
    var cleanUpDoors = function (tiles) {
        for (var i = 0; i < allDoorList.length; i++) {
            var position = checkRoomPosition(tiles, allDoorList[i].X, allDoorList[i].Y);
            if (!checkPos(position)) {
                tiles[allDoorList[i].X][allDoorList[i].Y].Texture = 6; // set edge
            } else {
                tiles[allDoorList[i].X][allDoorList[i].Y].Texture = 7; // restore door
            }
        }
    };
    var fillRoomToDoor = function (tiles, roomSize, roomDescription, dungeonLevel) {
        while (openDoorList.length > 0) {
            var i = openDoorList.length - 1;
            var position = checkRoomPosition(tiles, openDoorList[i].X, openDoorList[i].Y);
            if (checkPos(position)) {
                removeFromDoors(openDoorList[i]);
                return;
            } else if (position.Up) {
                randomFillUpDown(tiles, openDoorList[i].X + 1, openDoorList[i].Y, roomSize, roomDescription, dungeonLevel, openDoorList[i]);
                removeFromDoors(openDoorList[i]);
            } else if (position.Down) {
                randomFillUpDown(tiles, openDoorList[i].X - 1, openDoorList[i].Y, roomSize, roomDescription, dungeonLevel, openDoorList[i]);
                removeFromDoors(openDoorList[i]);
            } else if (position.Right) {
                randomFillLeftRight(tiles, openDoorList[i].X, openDoorList[i].Y - 1, roomSize, roomDescription, dungeonLevel, openDoorList[i]);
                removeFromDoors(openDoorList[i]);
            } else if (position.Left) {
                randomFillLeftRight(tiles, openDoorList[i].X, openDoorList[i].Y + 1, roomSize, roomDescription, dungeonLevel, openDoorList[i]);
                removeFromDoors(openDoorList[i]);
            }
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
            var position = checkRoomPosition(tiles, x, y);
            entryIsOk = (tiles[x][y].Texture === 6 && !checkPos(position) && checkNearbyDoor(tiles, tiles[x][y]) && checkEdges(tiles, x, y));
        }
        while (!entryIsOk);
        tiles[x][y].Texture = 4;
    };
    var setRoom = function (tiles, roomSize, roomDescription, dungeonLevel) {
        openDoorList = [];
        allDoorList = [];
        var x = Utils.getRandomInt(5, (tiles.length - (roomSize + 5)));
        var y = Utils.getRandomInt(5, (tiles.length - (roomSize + 5)));
        var right = Utils.getRandomInt(2, roomSize + 1);
        var down = Utils.getRandomInt(2, roomSize + 1);
        fillRoom(tiles, x, y, down, right, roomDescription, dungeonLevel);
        fillRoomToDoor(tiles, roomSize, roomDescription, dungeonLevel);
        cleanUpDoors(tiles);
        addEntryPoint(tiles);
    };
    var generateRoom = function (tiles, roomSize, roomDescription, dungeonLevel) {
        setRoom(tiles, roomSize, roomDescription, dungeonLevel);
        return tiles;
    };
    return {
        generateRoom: generateRoom
    }
})();