var Trap = (function () {
    var currentTrap;
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
    var trapKind = [ // name, save, spot, disable, diableCheck, attackMod
        ["Collapsing Roof", "Dexterity", 10, 15, "Dexterity", false],
        ["Falling Net", "Strength", 10, 15, "Dexterity", false],
        ["Fire-Breathing Statue", "Dexterity", 15, 13, "Dispel Magic", false],
        ["Spiked Pit", "Constitution", 15, 15, "Intelligence", false], //
        ["Locking Pit", "Strength", 10, 15, "Intelligence", false], //
        ["Poison Darts", "Constitution", 15, 15, "Intelligence", true], //
        ["Poison Needle", "Constitution", 15, 15, "Dexterity", false],
        ["Rolling Sphere", "Dexterity", 15, 15, " Intelligence", false]
    ];
    var trapDoorKind = [ // name, save, spot, disable, disableCheck, attackMod
        ["Fire trap", "Dexterity", "10", "15", "Intelligence", "false"],
        ["Lock Covered in Dragon Bile", "Constitution", "10", "15", "Intelligence", "false"],
        ["Hail of Needles", "Dexterity", "15", "13", "Dexterity", "false"],
        ["Stone Blocks from Ceiling", "Dexterity", "15", "15", "Intelligence", "true"], //
        ["Doorknob Smeared with Contact Poison", "Constitution", "15", "10", "Intelligence", "false"], //
        ["Poison Darts", "Constitution", "15", "15", "Intelligence", "true"], //
        ["Poison Needle", "Constitution", "15", "15", "Dexterity", "false"],
        ["Energy Drain", "Constitution", "15", "15", "Dispel Magic", "false"]
    ];
    var getTrapAttackBonus = function (trapDanger) {
        if (currentTrap[5]) {
            var min = trapAttackBonus[trapDanger];
            var max = trapAttackBonus[trapDanger + 1];
            return " (attack bonus +" + Utils.getRandomInt(min, max) + ").";
        }
        else {
            return ".";
        }
    };
    var getTrapSaveDC = function (trapDanger) {
        var min = trapSave[trapDanger];
        var max = trapSave[trapDanger + 1];
        return Utils.getRandomInt(min, max);
    };
    var getTrapDamage = function (trapDanger) {
        if (Utils.partyLevel < 5) {
            return trapDmgSeverity[0][trapDanger];
        } else if (Utils.partyLevel < 11) {
            return trapDmgSeverity[1][trapDanger];
        }
        else if (Utils.partyLevel < 17) {
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
        switch (Utils.dungeonDifficulty) {
            case 0:
                return Utils.getRandomInt(0, 1);
            case 1:
            case 2:
                return Utils.getRandomInt(0, 2);
            case 3:
                return Utils.getRandomInt(0, 3);
            default:
                return 0;
        }
    };
    var getCurrentTrap = function (door) {
        var trapDanger = getTrapDanger(); // setback, dangerous, deadly 
        if (door) { // get random currentTrap index
            currentTrap = trapDoorKind[Utils.getRandomInt(0, trapDoorKind.length)];
        } else {
            currentTrap = trapKind[Utils.getRandomInt(0, trapKind.length)];
        }
        return currentTrap[0] + " [" + trapSeverity[trapDanger] + "]: DC " + currentTrap[2] + " to spot, DC " + currentTrap[3] + " to disable (" + currentTrap[4] + "), DC " + getTrapSaveDC(trapDanger) + " " + currentTrap[1] + " save or take " + getTrapDamage(trapDanger) + "D10 damage" + getTrapAttackBonus(trapDanger);
    };
    return {
        getCurrentTrap: getCurrentTrap,
        getTrapName: getTrapName
    }
})();