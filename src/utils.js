var Utils = (function () {
    var downloadHTML = function (linkID) {
        var link = document.getElementById(linkID);
        link.hidden = false;
        link.style.display = "inline-block";
        link.addEventListener("click", function () {
            var canvas = document.getElementById("mapArea");
            var table = document.getElementById("table_description");
            var cln = table.cloneNode(true);
            var doc = document.implementation.createHTMLDocument("DungeonMap");
            var img = document.createElement("img");
            img.src = canvas.toDataURL();
            doc.body.appendChild(img);
            doc.body.appendChild(cln);
            link.href = "data:text/html;charset=UTF-8," + encodeURIComponent(doc.documentElement.outerHTML);
            link.download = "dungeonmap.html";
        }, false);
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
        link.addEventListener("click", function () {
            link.href = canvas.toDataURL();
            link.download = "dungeonmap.png";
        }, false);
    };
    var corridorOnchange = function (e) {
        if (e.value === "1") {
            document.getElementById("roomDensity").disabled = false;
        } else {
            document.getElementById("roomDensity").disabled = true;
        }
    };
    var getMonsters = function (json, dungeonLevel) {
        return json.monsters.filter(function (obj) {
            return obj.XP < dungeonLevel * 100;
        });
    };
    var getJSON = function () {
        var data = '{"monsters":[' +
            '{"name":"Kobold","challange":"1/8","size":"Medium","XP":25 },' +
            '{"name":"Flying Snake","challange":"1/8","size":"Medium","XP":25 },' +
            '{"name":"Bugbear","challange":1,"size":"Medium","XP":200 },' +
            '{"name":"Ghoul","challange":1,"size":"Medium","XP":200 },' +
            '{"name":"Dire wolf","challange":1,"size":"Medium","XP":200 }' +
            '],' +
            '"treasures":[' +
            '{ "name":"gp" },' +
            '{ "name":"sp" },' +
            '{ "name":"cp" },' +
            '{ "name":"ep" },' +
            '{ "name":"pp" }' +
            ']' +
            '}';
        return JSON.parse(data);
    };
    var getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };
    var manhattan = function (dx, dy) {
        return (dx + dy);
    };
    var getRoomName = function (x) {
        return "###ROOM" + x + "###";
    };
    var getData = function (percentage, isMonster, dungeonLevel) {
        var json = getJSON();
        if (Math.floor(Math.random() * 100) < percentage) {
            if (isMonster) {
                var result = getMonsters(json, dungeonLevel);
                var m = getRandomInt(0, result.length);
                var count = getRandomInt(1, 4);
                return "Monster: " + count + "x " + result[m].name + " (" + result[m].XP * count + "xp)";
            }
            else {
                var gp = getRandomInt(0, 100);
                var sp = getRandomInt(0, 100);
                var cp = getRandomInt(0, 100);
                var ep = getRandomInt(0, 10);
                var pp = getRandomInt(0, 10);
                return "Treasure: " + gp + " " + json.treasures[0].name +
                    " " + sp + " " + json.treasures[1].name +
                    " " + cp + " " + json.treasures[2].name +
                    " " + ep + " " + json.treasures[3].name +
                    " " + pp + " " + json.treasures[4].name;
            }
        }
        else {
            if (isMonster) {
                return "Monster: None";
            }
            else {
                return "Treasure: Empty";
            }
        }
    };
    var addDescription = function (tiles, x, y, roomDescription, dungeonLevel) {
        roomDescription[roomDescription.length] = { Name: getRoomName(roomDescription.length + 1), Treasure: getData(40, false, dungeonLevel), Monster: getData(50, true, dungeonLevel) };
        tiles[x][y].RoomCount = roomDescription.length;
    };
    return {
        addDescription: addDescription,
        getRandomInt: getRandomInt,
        manhattan: manhattan,
        corridorOnchange: corridorOnchange,
        downloadImg: downloadImg,
        downloadDescription: downloadDescription,
        downloadHTML: downloadHTML
    }
})();