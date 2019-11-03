var Encounter = (function () {
    var monsters;
    var filteredMonsters;
    var sumXP;
    var challengeRatingXP = [
        10,
        25,
        50,
        100,
        200,
        450,
        700,
        1100,
        1800,
        2300,
        2900,
        3900,
        5000,
        5900,
        7200,
        8400,
        10000,
        11500,
        13000,
        15000,
        18000,
        20000,
        22000,
        25000,
        33000,
        41000,
        50000,
        62000,
        75000,
        90000,
        105000,
        120000,
        135000,
        155000
    ];
    var multipliers = [
        [1, 1],
        [2, 1.5],
        [3, 2],
        [7, 2.5],
        [11, 3],
        [15, 4]
    ];
    var challengeRating = [
        "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5",
        "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
        "16", "17", "18", "19", "20", "21", "22", "23", "24", "25",
        "26", "27", "28", "29", "30"
    ];
    var difficulty = [
        0, 0, 0, 0
    ];
    var thresholds = [
        [0, 0, 0, 0],
        [25, 50, 75, 100],
        [50, 100, 150, 200],
        [75, 150, 225, 400],
        [125, 250, 375, 500],
        [250, 500, 750, 1100],
        [300, 600, 900, 1400],
        [350, 750, 1100, 1700],
        [450, 900, 1400, 2100],
        [550, 1100, 1600, 2400],
        [600, 1200, 1900, 2800],
        [800, 1600, 2400, 3600],
        [1000, 2000, 3000, 4500],
        [1100, 2200, 3400, 5100],
        [1250, 2500, 3800, 5700],
        [1400, 2800, 4300, 6400],
        [1600, 3200, 4800, 7200],
        [2000, 3900, 5900, 8800],
        [2100, 4200, 6300, 9500],
        [2400, 4900, 7300, 10900],
        [2800, 5700, 8500, 12700]
    ];
    var loadJSON = function () {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                monsters = JSON.parse(this.responseText);
            }
        };
        xobj.open("GET", "data/5e-SRD-Monsters.json", true);
        xobj.send();
    };
    var getMonsters = function () {
        if (Utils.monsterType[0] === "any") {
            return monsters.filter(function (obj) {
                return obj.challenge_rating <= Utils.partyLevel + 2 && obj.challenge_rating >= Math.floor(Utils.partyLevel / 4);
            });
        } else {
            return monsters.filter(function (obj) {
                return obj.challenge_rating <= Utils.partyLevel + 2 && obj.challenge_rating >= Math.floor(Utils.partyLevel / 4) && Utils.monsterType.includes(obj.type);
            });
        }
    };
    var removeMonster = function (monsterList, monster) {
        var index = monsterList.indexOf(monster);
        monsterList.splice(index, 1);
    };
    var getMonsterXP = function (monster) {
        return challengeRatingXP[challengeRating.indexOf(monster.challenge_rating)];
    };
    var addMonster = function (currentXP) {
        var monsterCount = filteredMonsters.length;
        var monster = 0;
        while (monster < monsterCount) {
            var currentMonster = filteredMonsters[Utils.getRandomInt(0, filteredMonsters.length)]; // get random monster
            removeMonster(filteredMonsters, currentMonster); // remove monster from the list 
            var monsterXP = getMonsterXP(currentMonster);
            var allXP;
            var count;
            for (var i = multipliers.length - 1; i > -1; i--) { // find how many monster fit for the current XP
                count = multipliers[i][0];
                allXP = monsterXP * count * multipliers[i][1];
                if (allXP <= currentXP && count > 1) {
                    return count + "x " + currentMonster.name + " (CR: " + currentMonster.challenge_rating + ") " + monsterXP * count + " XP";
                } else if (allXP <= currentXP) {
                    return currentMonster.name + " (CR: " + currentMonster.challenge_rating + ") " + monsterXP + " XP";
                }
            }
            monster++;
        }
        return "None";
    };
    var checkPossible = function () {
        for (var i = 0; i < filteredMonsters.length; i++) {
            if (sumXP > getMonsterXP(filteredMonsters[i])) {
                return true;
            }
        }
        return false;
    };
    var calcEncounter = function () {
        var result = "Monster: ";
        if (Math.floor(Math.random() * 100) > 50 || filteredMonsters.length === 1) {
            result += addMonster(sumXP);
        } else {
            var x = Utils.getRandomInt(2, Utils.dungeonDifficulty + 3);
            for (var i = 0; i < x; i++) {
                result += addMonster(sumXP / x);
                result += ", ";
            }
            result = result.slice(0, -2);
        }
        result = result.split(", None").join("");
        return result;
    };
    var init = function () {
        difficulty[0] = thresholds[Utils.partyLevel][0] * Utils.partySize;
        difficulty[1] = thresholds[Utils.partyLevel][1] * Utils.partySize;
        difficulty[2] = thresholds[Utils.partyLevel][2] * Utils.partySize;
        difficulty[3] = thresholds[Utils.partyLevel][3] * Utils.partySize;
        filteredMonsters = getMonsters(); // get monsters for party level
        sumXP = difficulty[Utils.dungeonDifficulty];
    };
    var getMonster = function () {
        if (Utils.monsterType[0] === "none") {
            return "Monster: None";
        }
        init();
        var checkResult = checkPossible();
        if (checkResult && Math.floor(Math.random() * 100) <= Utils.getMonsterPercentage()) {
            return calcEncounter();
        } else if (!checkResult) {
            return "Monster: No suitable monsters with this settings";
        } else {
            return "Monster: None";
        }
    };
    var getRoamingName = function (x) {
        return "ROAMING MONSTERS #" + x;
    };
    var getRoamingMonster = function () {
        init();
        if (checkPossible()) {
            return calcEncounter().substring(9); // remove "Monster: "
        } else {
            return "No suitable monsters with this settings";
        }
    };
    return {
        loadJSON: loadJSON,
        getMonster: getMonster,
        getRoamingMonster: getRoamingMonster,
        getRoamingName: getRoamingName
    };
})();