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
    var getData = function (percentage, isMonster) {
        if (Math.floor(Math.random() * 100) < percentage) {
            return Encounter.getData(isMonster);
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
    var addDescription = function (tiles, x, y, roomDescription) {
        roomDescription[roomDescription.length] = { Name: getRoomName(roomDescription.length + 1), Treasure: getData(40, false), Monster: getData(50, true) };
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