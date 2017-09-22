var Treasure = (function () {
    var getTreasure = function () {
        if (Math.floor(Math.random() * 100) > Utils.getPercentage()) {
            return "Treasure: Empty";
        }
        var gp = 0;
        var sp = 0;
        var cp = 0;
        var ep = 0;
        var pp = 0;
        switch (Utils.dungeonDifficulty) {
            case 0:
                gp = Utils.getRandomInt(1, 4) * 6;
                sp = Utils.getRandomInt(1, 5) * 6;
                cp = Utils.getRandomInt(1, 6) * 6;
                break;
            case 1:
                gp = Utils.getRandomInt(1, 4) * 60;
                sp = Utils.getRandomInt(1, 7) * 60;
                cp = Utils.getRandomInt(1, 5) * 600;
                ep = Utils.getRandomInt(1, 3) * 60;
                break;
            case 2:
                gp = Utils.getRandomInt(1, 3) * 600;
                sp = Utils.getRandomInt(1, 5) * 600;
                ep = Utils.getRandomInt(1, 7) * 100;
                pp = Utils.getRandomInt(1, 3) * 60;
                break;
            case 3:
                gp = Utils.getRandomInt(1, 9) * 100;
                ep = Utils.getRandomInt(1, 3) * 6000;
                pp = Utils.getRandomInt(1, 3) * 600;
                break;
            default:
                break;
        }
        return "Treasure: " + gp + " gp," +
            " " + sp + " sp," +
            " " + cp + " cp," +
            " " + ep + " ep," +
            " " + pp + " pp";
    };
    return {
        getTreasure: getTreasure
    }
})();