var RoomPosition = (function () {
    var up;
    var down;
    var left;
    var right;
    var checkRoomPosition = function (dungeon, x, y) {
        up = false;
        down = false;
        left = false;
        right = false;
        if (dungeon[x][y - 1].Texture === 3) { // left
            left = true;
        }
        if (dungeon[x][y + 1].Texture === 3) { // right
            right = true;
        }
        if (dungeon[x + 1][y].Texture === 3) { // bottom
            down = true;
        }
        if (dungeon[x - 1][y].Texture === 3) { // top
            up = true;
        }
    };
    var isUp = function () {
        return up;
    };
    var isDown = function () {
        return down;
    };
    var isLeft = function () {
        return left;
    };
    var isRight = function () {
        return right;
    };
    return {
        checkRoomPosition: checkRoomPosition,
        isUp: isUp,
        isDown: isDown,
        isLeft: isLeft,
        isRight: isRight
    };
})();