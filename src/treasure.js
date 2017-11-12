var Treasure = (function () {
    var treasureGP = [
        0, 300, 600, 900, 1200, 1600, 2000, 2600, 3400, 4500, 5800,
        7500, 9800, 13000, 17000, 22000, 28000, 36000, 47000, 61000, 80000
    ];
    var itemCount = [
        0, 4, 4, 5, 5, 7, 7, 8, 8, 8, 9,
        9, 9, 9, 9, 12, 12, 12, 15, 15, 15
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
                return Utils.getRandomInt(0, itemCount[Utils.partyLevel]);
            case 1:
                return Utils.getRandomInt(2, itemCount[Utils.partyLevel]);
            case 2:
                return Utils.getRandomInt(3, itemCount[Utils.partyLevel]);
            case 3:
                return Utils.getRandomInt(4, itemCount[Utils.partyLevel]);
            default:
                return 0;
        }
    };
    var calcTreasure = function (filteredTreasures) {
        var currentValue = 0;
        var itemCount = getItemsCount();
        var currentTreasure;
        var currentCount = 0;
        var maxAttempt = filteredTreasures.length * 2;
        var finalList = [];
        var sb = "";
        while (currentCount < itemCount && maxAttempt > 0) {
            currentTreasure = filteredTreasures[Utils.getRandomInt(0, filteredTreasures.length)]; // get random treasure
            if (currentValue + currentTreasure.cost < sumValue) { // if it's still affordable add to list
                currentValue += currentTreasure.cost;
                finalList[finalList.length] = currentTreasure;
                currentCount++;
            }
            maxAttempt--;
        }
        finalList.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        var items = [];
        var count = [];
        var prev;
        for (var i = 0; i < finalList.length; i++) { // get duplicated items count
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
        sb += Utils.getRandomInt(1, sumValue - currentValue); // get the remaining value randomly
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