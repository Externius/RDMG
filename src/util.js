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

function getData(percentage, isMonster, dungeonLevel) {
    var json  = getJSON();
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
}

function getMonsters(json, dungeonLevel) {
    return json.monsters.filter(function( obj ) {
        return obj.XP < dungeonLevel * 100;
      });
}

function getJSON() {
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
}