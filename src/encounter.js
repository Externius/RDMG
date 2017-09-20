var Encounter = (function () {
    var partyLevel;
    var partySize;
    var dungeonDifficulty;
    var monsters;
    var trapSeverity = [
        "Setback",
        "Dangerous",
        "Deadly"
    ];
    var trapSave = [
        10, 12, 16, 21
    ];
    var trapAttackBonus = [
        3, 6, 9, 13
    ];
    var trapDmgSeverity = [
        [1, 2, 4],
        [2, 4, 10],
        [4, 10, 18],
        [10, 18, 24]
    ];
    var trapKind = [
        "Collapsing Roof",
        "Falling Net",
        "Fire-Breathing Statue",
        "Spiked Pit",
        "Posion Darts",
        "Poison Needle",
        "Rolling Sphere",
        "Sphere of Annihilation"
    ];
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
    var loadVariables = function () {
        var pl = document.getElementById("partyLevel");
        partyLevel = parseInt(pl.options[pl.selectedIndex].value);
        var ps = document.getElementById("partySize");
        partySize = parseInt(ps.options[ps.selectedIndex].value);
        var dd = document.getElementById("dungeonDifficulty");
        dungeonDifficulty = parseInt(dd.options[dd.selectedIndex].value);
        //set difficulty
        difficulty[0] = thresholds[partyLevel][0] * partySize;
        difficulty[1] = thresholds[partyLevel][1] * partySize;
        difficulty[2] = thresholds[partyLevel][2] * partySize;
        difficulty[3] = thresholds[partyLevel][3] * partySize;
    };
    var getTrapAttackBonus = function (trapDanger) {
        var min = trapAttackBonus[trapDanger];
        var max = trapAttackBonus[trapDanger + 1];
        return Utils.getRandomInt(min, max);
    };
    var getTrapSaveDC = function (trapDanger) {
        var min = trapSave[trapDanger];
        var max = trapSave[trapDanger + 1];
        return Utils.getRandomInt(min, max);
    };
    var getTrapDamage = function (trapDanger) {
        if (partyLevel < 5) {
            return trapDmgSeverity[0][trapDanger];
        } else if (partyLevel < 11) {
            return trapDmgSeverity[1][trapDanger];
        }
        else if (partyLevel < 17) {
            return trapDmgSeverity[2][trapDanger];
        }
        else {
            return trapDmgSeverity[3][trapDanger];
        }
    };
    var getTrapName = function (count) {
        return "###TRAP" + count + "###";
    };
    var getTrapDanger = function () {
        switch (dungeonDifficulty) {
            case 0:
                return Utils.getRandomInt(0, 1);
            case 1:
            case 2:
                return Utils.getRandomInt(0, 2);
            case 3:
                return Utils.getRandomInt(0, 3);
            default:
                break;
        }
    };
    var getTrap = function () {
        var trapDanger = getTrapDanger(); // setback, dangerous, deadly 
        var dmg = getTrapDamage(trapDanger);
        var save = getTrapSaveDC(trapDanger);
        var attack = getTrapAttackBonus(trapDanger);
        var index = Utils.getRandomInt(0, trapKind.length); // get random trap index
        return trapKind[index] + " [" + trapSeverity[trapDanger] + "] (Damage " + dmg + "D10" + " Attack Bonus +" + attack + " DC " + save + ")";
    };
    var getMonsters = function (partyLevel) {
        return monsters.filter(function (obj) {
            return obj.challenge_rating <= partyLevel + 2;
        });
    };
    var calcEncounter = function (filteredMonsters, dungeonDifficulty) {
        var monsterCount = filteredMonsters.length;
        var monster = 0
        do {
            var currentMonster = Utils.getRandomInt(0, monsterCount); // get random monster
            var monsterXP = challengeRatingXP[challengeRating.indexOf(filteredMonsters[currentMonster].challenge_rating)]; //get monster xp
            var allXP;
            var count;
            for (var i = multipliers.length - 1; i > -1; i--) { // find how many monster fit the difficulty 
                count = multipliers[i][0];
                allXP = monsterXP * count * multipliers[i][1];
                if (allXP <= difficulty[dungeonDifficulty]) {
                    return { allXP: allXP, count: count, monster: filteredMonsters[currentMonster] };
                }
            }
            monster++;
        }
        while (monster < monsterCount);
        return { allXP: 0, count: 0 };
    };
    var getTreasure = function (percentage) {
        if (Math.floor(Math.random() * 100) > percentage) {
            return "Treasure: Empty";
        }
        var gp = 0;
        var sp = 0;
        var cp = 0;
        var ep = 0;
        var pp = 0;
        switch (dungeonDifficulty) {
            case 0:
                gp = Utils.getRandomInt(1, 10);
                sp = Utils.getRandomInt(0, 100);
                cp = Utils.getRandomInt(0, 1000);
                break;
            case 1:
                gp = Utils.getRandomInt(10, 100);
                sp = Utils.getRandomInt(1, 100);
                cp = Utils.getRandomInt(0, 100);
                ep = Utils.getRandomInt(0, 10);
                break;
            case 2:
                gp = Utils.getRandomInt(50, 1000);
                sp = Utils.getRandomInt(0, 100);
                ep = Utils.getRandomInt(1, 100);
                pp = Utils.getRandomInt(1, 10);
                break;
            case 3:
                gp = Utils.getRandomInt(100, 1000);
                sp = Utils.getRandomInt(0, 100);
                ep = Utils.getRandomInt(20, 100);
                pp = Utils.getRandomInt(10, 100);
                break;
            default:
                break;
        }
        return "Treasure: " + gp + " gp" +
            " " + sp + " sp" +
            " " + cp + " cp" +
            " " + ep + " ep" +
            " " + pp + " pp";
    };
    var getEncounter = function () {
        var filteredMonsters = getMonsters(partyLevel); //get monsters for party level
        var encounter = calcEncounter(filteredMonsters, dungeonDifficulty);
        if (encounter.allXP !== 0) {
            return "Monster: " + encounter.count + "x " + encounter.monster.name + " (CR: " + encounter.monster.challenge_rating + ") " + encounter.allXP + " XP";
        } else {
            return "Monster: None";
        }
    };
    var getMonster = function (percentage) {
        if (Math.floor(Math.random() * 100) > percentage) {
            return "Monster: None";
        }
        return getEncounter();
    };
    return {
        loadJSON: loadJSON,
        loadVariables: loadVariables,
        getMonster: getMonster,
        getTreasure: getTreasure,
        getTrap: getTrap,
        getTrapName: getTrapName
    }
})();
