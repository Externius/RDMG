var Door = (function () {
    var wCount;
    var sCount;
    var eCount;
    var nCount;
    var doorTypes = [
        "Crystal",
        "Wooden",
        "Stone",
        "Iron",
        "Steel",
        "Mithral",
        "Adamantine"
    ];
    var doorAC = [
        13, 15, 17, 19, 19, 21, 23
    ];
    var doorHP = [
        10, 10, 15, 15, 18, 18, 27
    ];
    var lockDifficulty = [
        5, 10, 15, 20, 25, 25, 30
    ];
    var getDoorDC = function () {
        switch (Utils.dungeonDifficulty) {
            case 0:
                return Utils.getRandomInt(0, 2);
            case 1:
                return Utils.getRandomInt(1, 4);
            case 2:
                return Utils.getRandomInt(1, 6);
            case 3:
                return Utils.getRandomInt(2, 7);
            default:
                return 0;
        }
    };
    var getState = function (texture, x) {
        switch (texture) {
            case 10:
            case 8:
                return " Locked Door (AC " + doorAC[x] + ", HP " + doorHP[x] + ", DC " + lockDifficulty[x] + " to unlock)";
            case 11:
            case 9:
                return " Trapped Door (AC " + doorAC[x] + ", HP " + doorHP[x] + ") " + Trap.getCurrentTrap(true);
            default:
                return " Open Door (AC " + doorAC[x] + ", HP " + doorHP[x] + ")";
        }
    };
    var getDoorText = function (texture, x) {
        if (RoomPosition.isUp()) {
            return "South Entry #" + sCount++ + ": " + doorTypes[x] + getState(texture, x) + "\n";
        } else if (RoomPosition.isDown()) {
            return "North Entry #" + nCount++ + ": " + doorTypes[x] + getState(texture, x) + "\n";
        } else if (RoomPosition.isRight()) {
            return "West Entry #" + wCount++ + ": " + doorTypes[x] + getState(texture, x) + "\n";
        } else {
            return "East Entry #" + eCount++ + ": " + doorTypes[x] + getState(texture, x) + "\n";
        }
    };
    var getDoorDescription = function (dungeon, doorList) {
        wCount = 1;
        sCount = 1;
        eCount = 1;
        nCount = 1;
        var result = "";
        for (var i = 0; i < doorList.length; i++) {
            RoomPosition.checkRoomPosition(dungeon, doorList[i].I, doorList[i].J);
            result += getDoorText(doorList[i].Texture, getDoorDC());
        }
        result = result.slice(0, -1);
        return result;
    };
    var getNCDoor = function (door) {
        var x = getDoorDC();
        return ": " + doorTypes[x] + getState(door.Texture, x) + "\n";
    };
    var checkNCDoor = function (dungeon, x, y) {
        return dungeon[x][y].Texture === 7 || dungeon[x][y].Texture === 10 || dungeon[x][y].Texture === 11;
    };
    var getNCDoorDescription = function (dungeon, closedList) {
        wCount = 1;
        sCount = 1;
        eCount = 1;
        nCount = 1;
        var result = "";
        for (var i = 0; i < closedList.length; i++) {
            if (checkNCDoor(dungeon, closedList[i].I, closedList[i].J -1)) {
                result += "West Entry #" + wCount++ + dungeon[closedList[i].I][closedList[i].J - 1].Count;
            } else if (checkNCDoor(dungeon, closedList[i].I, closedList[i].J + 1)) {
                result += "East Entry #" + eCount++ + dungeon[closedList[i].I][closedList[i].J + 1].Count;
            } else if (checkNCDoor(dungeon, closedList[i].I + 1, closedList[i].J)) {
                result += "South Entry #" + sCount++ + dungeon[closedList[i].I + 1][closedList[i].J].Count;
            } else if (checkNCDoor(dungeon, closedList[i].I - 1, closedList[i].J)) {
                result += "North Entry #" + nCount++ + dungeon[closedList[i].I - 1][closedList[i].J].Count;
            }
        }
        result = result.slice(0, -1);
        return result;
    };
    return {
        checkNCDoor: checkNCDoor,
        getNCDoor: getNCDoor,
        getNCDoorDescription: getNCDoorDescription,
        getDoorDescription: getDoorDescription
    }
})();