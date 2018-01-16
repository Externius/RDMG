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
    var trapKind = [ // name, save, spot, disable, diableCheck, attackMod, dmg type, special
        ["Collapsing Roof", "Dexterity", 10, 15, "Dexterity", false, "bludgeoning", null],
        ["Falling Net", "Strength", 10, 15, "Dexterity", false, null, "restrained."],
        ["Fire-Breathing Statue", "Dexterity", 15, 13, "Dispel Magic", false, "fire", null],
        ["Spiked Pit", "Constitution", 15, 15, "Intelligence", false, "piercing", null],
        ["Locking Pit", "Strength", 10, 15, "Intelligence", false, null, "locked."],
        ["Poison Darts", "Constitution", 15, 15, "Intelligence", true, "poison", null],
        ["Poison Needle", "Constitution", 15, 15, "Dexterity", false, "poison", null],
        ["Rolling Sphere", "Dexterity", 15, 15, " Intelligence", false, "bludgeoning", null]
    ];
    var trapDoorKind = [ // name, save, spot, disable, disableCheck, attackMod, dmg type, special
        ["Fire trap", "Dexterity", "10", "15", "Intelligence", "false", "fire", null],
        ["Lock Covered in Dragon Bile", "Constitution", "10", "15", "Intelligence", "false", "poison", null],
        ["Hail of Needles", "Dexterity", "15", "13", "Dexterity", "false", "piercing", null],
        ["Stone Blocks from Ceiling", "Dexterity", "15", "15", "Intelligence", "true", "bludgeoning", null],
        ["Doorknob Smeared with Contact Poison", "Constitution", "15", "10", "Intelligence", "false", "poison", null],
        ["Poison Darts", "Constitution", "15", "15", "Intelligence", "true", "poison", null],
        ["Poison Needle", "Constitution", "15", "15", "Dexterity", "false", "poison", null],
        ["Energy Drain", "Constitution", "15", "15", "Dispel Magic", "false", "necrotic", null]
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
        if (currentTrap[6] != null) { // check dmg type
            return currentTrap[0] + " [" + trapSeverity[trapDanger] + "]: DC " + currentTrap[2] + " to spot, DC " + currentTrap[3] + " to disable (" + currentTrap[4] + "), DC " + getTrapSaveDC(trapDanger) + " " + currentTrap[1] + " save or take " + getTrapDamage(trapDanger) + "D10 (" + currentTrap[6] + ") damage" + getTrapAttackBonus(trapDanger);
        } else {
            return currentTrap[0] + " [" + trapSeverity[trapDanger] + "]: DC " + currentTrap[2] + " to spot, DC " + currentTrap[3] + " to disable (" + currentTrap[4] + "), DC " + getTrapSaveDC(trapDanger) + " " + currentTrap[1] + " save or " + currentTrap[7];
        }
    };
    return {
        getCurrentTrap: getCurrentTrap,
        getTrapName: getTrapName
    }
})();