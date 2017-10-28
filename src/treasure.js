var Treasure = (function () {
    var treasureGP = [
        0, 300, 600, 900, 1200, 1600, 2000, 2600, 3400, 4500, 5800,
        7500, 9800, 13000, 17000, 22000, 28000, 36000, 47000, 61000, 80000
    ];
    var sumValue;
    var treasures;
    var loadJSON = function () {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                treasures = JSON.parse(this.responseText);
            }
        };
        xobj.open("GET", "data/treasures.json", true);
        xobj.send();
    };
    var getFiltered = function () {
        if (Utils.monsterType === "any") {
            return treasures.filter(function (obj) {
                return obj.rarity <= Utils.itemsRarity && obj.cost < sumValue;
            });
        }
        else {
            return treasures.filter(function (obj) {
                return obj.rarity <= Utils.itemsRarity && obj.cost < sumValue && obj.types.some(type => type === Utils.monsterType);
            });
        }
    };
    var getAllCost = function () {
        sumValue = treasureGP[Utils.partyLevel] * Utils.treasureValue;
    };
    var getItemsCount = function () {
        switch (Utils.dungeonDifficulty) {
            case 0:
                return Utils.getRandomInt(0, 6);
            case 1:
                return Utils.getRandomInt(2, 11);
            case 2:
                return Utils.getRandomInt(4, 16);
            case 3:
                return Utils.getRandomInt(6, 21);
            default:
                return 0;
        }
    };
    var calcTreasure = function (filteredTreasures) {
        var currentValue = 0;
        var itemCount = getItemsCount();
        var currentTreasure;
        var finalList = [];
        var sb = "";
        for (var i = 0; i < itemCount; i++) {
            currentTreasure = filteredTreasures[Utils.getRandomInt(0, filteredTreasures.length)]; // get random treasure
            if (currentValue + currentTreasure.cost < sumValue) { // if it's still affordable add to list
                currentValue += currentTreasure.cost;
                finalList[finalList.length] = currentTreasure;
            }
        }
        finalList.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        var items = [];
        var count = [];
        var prev;
        for (i = 0; i < finalList.length; i++) { // get duplicated items count
            if (finalList[i] !== prev) {
                items.push(finalList[i]);
                count.push(1);
            } else {
                count[count.length - 1]++;
            }
            prev = finalList[i];
        }
        for (i = 0; i < items.length; i++) { // add items name + count to the return string
            if (count[i] > 1) {
                sb += count[i];
                sb += "x ";
            }
            sb += items[i].name;
            sb += ", ";
        }
        sb += (sumValue - currentValue); // get the remaining value
        sb += " gp";
        return sb;
    };
    var getTreasure = function () {
        if (Math.floor(Math.random() * 100) > Utils.getPercentage()) {
            return "Treasures: Empty";
        }
        getAllCost();
        var filteredTreasures = getFiltered();
        return "Treasures: " + calcTreasure(filteredTreasures);
    };
    return {
        getTreasure: getTreasure,
        loadJSON: loadJSON
    }
})();