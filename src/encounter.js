var Encounter = (function () {
    var monsters;
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
    var tresholds = [
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
    var getMonsters = function (partyLevel) {
        return monsters.filter(function (obj) {
            return obj.challenge_rating <= partyLevel;
        });
    };
    var calcEncounter = function (monsterXP,dungeonDifficulty) {
        var allXP;
        var count;
        for (var i = multipliers.length - 1; i > -1; i--) {
            count = multipliers[i][0];
            allXP = monsterXP * count * multipliers[i][1];
            if (allXP <= difficulty[dungeonDifficulty]) {
                return { allXP: allXP, count: count };
            }
        }
        return { allXP: 0, count: 0 };
    };
    var getEncounter = function () {
        //get variables
        var pl = document.getElementById("partyLevel");
        var partyLevel = parseInt(pl.options[pl.selectedIndex].value);
        var ps = document.getElementById("partySize");
        var partySize = parseInt(ps.options[ps.selectedIndex].value);
        var dd = document.getElementById("dungeonDifficulty");
        var dungeonDifficulty = parseInt(dd.options[dd.selectedIndex].value);

        //set difficulty
        difficulty[0] = tresholds[partyLevel][0] * partySize;
        difficulty[1] = tresholds[partyLevel][1] * partySize;
        difficulty[2] = tresholds[partyLevel][2] * partySize;
        difficulty[3] = tresholds[partyLevel][3] * partySize;

        var result = getMonsters(partyLevel); //get monsters for party level
        var monster = Utils.getRandomInt(0, result.length); // get random monster
        var monsterXP = challengeRatingXP[challengeRating.indexOf(result[monster].challenge_rating)]; //get monster xp
        var encounter = calcEncounter(monsterXP,dungeonDifficulty);
        if (encounter.allXP !== 0) {
            return "Monster: " + encounter.count + "x " + result[monster].name + " (CR: " + result[monster].challenge_rating + ") " + encounter.allXP + " XP";
        } else {
            return "Monster: None";
        }
    };
    return {
        loadJSON: loadJSON,
        getEncounter: getEncounter
    }
})();
