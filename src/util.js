function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function manhattan(dx, dy) {
    return (dx + dy);
}

function getRoomName(x) {
    return "###ROOM" + x + "###";
}

function getData(percentage,isMonster) {
    var json  = getJSON();
    if (Math.floor(Math.random() * 100) < percentage) {
        if (isMonster) {
            var m = getRandomInt(0, json.monsters.length);
            var count = getRandomInt(1, 4);
            return "Monster: " + count + "x " + json.monsters[m].name + " (" + json.monsters[m].XP * count + "xp)";    
        }
        else {
            var t = getRandomInt(0, json.treasures.length);
            var price = getRandomInt(10, 100);
            return "Treasure: " + price + " " + json.treasures[t].name;
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
}

function getJSON() {
    var data = '{"monsters":[' +
        '{"name":"Bugbear","challange":1,"size":"Medium","XP":200 },' +
        '{"name":"Ghoul","challange":1,"size":"Medium","XP":200 },' +
        '{"name":"Dire wolf","challange":1,"size":"Medium","XP":200 }' +
        '],' +
        '"treasures":[' +
        '{ "name":"Gold" },' +
        '{ "name":"Silver" },' +
        '{ "name":"Bronze" } ' +
        ']' +
        '}';
    return JSON.parse(data);
}