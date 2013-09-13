var Player = function () { }

Player.clear = function (player) {
    player.uid = '';
    player.score = 0;
    player.bonus = 0;
    player.secondSettlement = -1;
    player.burst = 0;
    player.isPlayedCard = false;
    player.harbor = [false, false, false, false, false, false];
    player.road = 0;
    player.settlement = 0;
    player.city = 0;
    player.resource = [0, 0, 0, 0, 0];
    player.sleepCard = [0, 0, 0, 0, 0];
    player.wakeCard = [0, 0, 0, 0, 0];
    player.deadCard = [0, 0, 0, 0, 0];
}

Player.start = function (player) {
    var i;

    player.score = 0;
    player.bonus = 0;
    player.secondSettlement = -1;
    player.burst = 0;
    player.isPlayedCard = false;
    player.harbor = [false, false, false, false, false, false];
    player.road = 15;
    player.settlement = 5;
    player.city = 4;
    for (i = 0; i < player.resource.length; i++) player.resource[i] = 0;
    for (i = 0; i < 5; i++) {
        player.sleepCard[i] = 0;
        player.wakeCard[i] = 0;
        player.deadCard[i] = 0;
    }
}

module.exports = Player;