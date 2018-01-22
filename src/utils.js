var Utils = (function () {
    var partyLevel;
    var partySize;
    var dungeonDifficulty;
    var monsterType;
    var treasureValue;
    var itemsRarity;
    var loadVariables = function () {
        var pL = document.getElementById("partyLevel");
        this.partyLevel = parseInt(pL.options[pL.selectedIndex].value);
        var pS = document.getElementById("partySize");
        this.partySize = parseInt(pS.options[pS.selectedIndex].value);
        var dD = document.getElementById("dungeonDifficulty");
        this.dungeonDifficulty = parseInt(dD.options[dD.selectedIndex].value);
        var mT = document.getElementById("monsterType");
        this.monsterType = mT.options[mT.selectedIndex].value;
        var tV = document.getElementById("treasureValue");
        this.treasureValue = parseFloat(tV.options[tV.selectedIndex].value);
        var iR = document.getElementById("itemsRarity");
        this.itemsRarity = parseInt(iR.options[iR.selectedIndex].value);
    };
    var downloadHTML = function (linkID) {
        var link = document.getElementById(linkID);
        link.hidden = false;
        link.style.display = "inline-block";
        var canvas = document.getElementById("mapArea");
        var table = document.getElementById("table_description");
        var tableClone = table.cloneNode(true);
        var doc = document.implementation.createHTMLDocument("DungeonMap");
        var img = document.createElement("img");
        var style = document.createElement('style');
        var head = doc.getElementsByTagName("head")[0];
        var css = "table, th, td {border-collapse: collapse;} " +
            "th, td {padding: 8px; text-align: left; border-bottom: 1px solid #ddd;}" +
            ".wrap { white-space: pre-wrap;}";
        img.src = canvas.toDataURL();
        doc.body.appendChild(img);
        doc.body.appendChild(tableClone);
        style.innerHTML = css;
        head.appendChild(style);
        link.href = "data:text/html;charset=UTF-8," + encodeURIComponent(doc.documentElement.outerHTML);
        link.download = "dungeonmap.html";
    };
    var donwloadCSV = function (linkID, csv, fileName) {
        var csvFile = new Blob([csv], { type: "text/csv" });
        var link = document.getElementById(linkID);
        link.hidden = false;
        link.style.display = "inline-block";
        link.download = fileName;
        link.href = window.URL.createObjectURL(csvFile);
    };
    var downloadDescription = function (linkID, fileName) {
        var csv = [];
        var description = document.getElementById("table_description");
        var rows = description.querySelectorAll("table tr");
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");
            for (var j = 0; j < cols.length; j++)
                row.push(cols[j].innerText);
            csv.push(row.join(","));
        }
        donwloadCSV(linkID, csv.join("\n"), fileName);
    };
    var downloadImg = function (linkID, canvas) {
        var link = document.getElementById(linkID);
        link.hidden = false;
        link.style.display = "inline-block";
        link.href = canvas.toDataURL();
        link.download = "dungeonmap.png";
    };
    var corridorOnchange = function (e) {
        if (e.value === "true") {
            document.getElementById("roomDensity").disabled = false;
            document.getElementById("trapPercent").disabled = false;
            document.getElementById("deadEnd").disabled = false;
        } else {
            document.getElementById("roomDensity").disabled = true;
            document.getElementById("trapPercent").disabled = true;
            document.getElementById("deadEnd").disabled = true;
        }
    };
    var getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };
    var getTreasurePercentage = function () {
        switch (this.dungeonDifficulty) {
            case 0:
                return getRandomInt(20, 71);
            case 1:
                return getRandomInt(30, 81);
            case 2:
                return getRandomInt(40, 91);
            case 3:
                return getRandomInt(50, 101);
            default:
                return 0;
        }
    };
    var getMonsterPercentage = function () {
        switch (this.dungeonDifficulty) {
            case 0:
                return getRandomInt(40, 81);
            case 1:
                return getRandomInt(50, 91);
            case 2:
                return getRandomInt(60, 101);
            case 3:
                return getRandomInt(70, 101);
            default:
                return 0;
        }
    };
    var manhattan = function (dx, dy) {
        return (dx + dy);
    };
    var getRoomName = function (x) {
        return "###ROOM" + x + "###";
    };
    var addTrapDescription = function (tiles, x, y, trapDescription) {
        trapDescription[trapDescription.length] = { name: Trap.getTrapName(trapDescription.length + 1), description: Trap.getCurrentTrap(false) };
        tiles[x][y].Count = trapDescription.length;
    };
    var addRoomDescription = function (tiles, x, y, roomDescription, doorList) {
        roomDescription[roomDescription.length] = { name: getRoomName(roomDescription.length + 1), treasure: Treasure.getTreasure(), monster: Encounter.getMonster(), door: Door.getDoorDescription(tiles, doorList) };
        tiles[x][y].Count = roomDescription.length;
    };
    var addNCRoomDescription = function (tiles, x, y, roomDescription, doors) {
        roomDescription[roomDescription.length] = { name: getRoomName(roomDescription.length + 1), treasure: Treasure.getTreasure(), monster: Encounter.getMonster(), door: doors };
        tiles[x][y].Count = roomDescription.length;
    };
    return {
        partyLevel: partyLevel,
        partySize: partySize,
        dungeonDifficulty: dungeonDifficulty,
        monsterType: monsterType,
        treasureValue: treasureValue,
        itemsRarity: itemsRarity,
        getTreasurePercentage: getTreasurePercentage,
        getMonsterPercentage: getMonsterPercentage,
        loadVariables: loadVariables,
        addRoomDescription: addRoomDescription,
        addTrapDescription: addTrapDescription,
        addNCRoomDescription: addNCRoomDescription,
        getRandomInt: getRandomInt,
        manhattan: manhattan,
        corridorOnchange: corridorOnchange,
        downloadImg: downloadImg,
        downloadDescription: downloadDescription,
        downloadHTML: downloadHTML
    }
})();