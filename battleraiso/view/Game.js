enchant();

var Game = function () { }

Game.isOpen = false;
Game.canSend = true;
Game.core = null;

Game.send = function (message) {
    if (this.canSend) {
        send(message);
        this.canSend = false;
    }
}

Game.addLabel = function (text, x, y, font, color) {
    if (!font) {
        font = '14px "メイリオ",Meiryo';
    } else {
        font += ' ' + '"メイリオ",Meiryo';
    }

    var label = new Label(text);

    label.x = x;
    label.y = y;
    label.font = font;

    if (color || color === 0) { label.color = color; }

    this.core.rootScene.addChild(label);

    return label;
}

Game.addSprite = function (image, frame, x, y, width, height, onTouch, opacity) {
    var sprite = new Sprite(width, height);

    sprite.image = this.core.assets[image];
    sprite.frame = frame;
    sprite.x = x;
    sprite.y = y;

    if (onTouch) { sprite.addEventListener('touchstart', onTouch); }
    if (opacity || opacity === 0) { sprite.opacity = opacity; }

    this.core.rootScene.addChild(sprite);

    return sprite;
}

Game.onLoad = function () {
    this.core = new Core(800, 545);

    this.core.fps = 5;

    this.core.preload(
          'view/background.png'
        , 'view/button.png'
        , 'view/active.png'
        , 'view/priority.png'
        , 'view/card.png'
        , 'view/flag.png'
        , 'view/touch.png'
        , 'view/before.png'
    );

    this.core.onload = function () {
        Game.isOpen = true;
        Game.send('a');
    }

    this.core.start();
}

Game.onMessage = function (game) {
    if (game.sound !== '') { sound(game.sound); }

    this.canSend = true;
    this.removeAll();
    this.addSprite('view/background.png', 0, 0, 0, 800, 545);
    this.addHeadLine(game);
    this.addCommand(game);
    this.addHand(game, 0);
    this.addHand(game, 1);
    this.addTalon(game, 0);
    this.addTalon(game, 1);
    this.addWeather(game);
    this.addflagList(game);
    this.addField(game, 0);
    this.addField(game, 1);
    this.addTouch(game);
    this.addTroopDeck(game);
    this.addTacticsDeck(game);

    var i;
    for (i = 0; i < 2; i++) { this.addPlayer(game, i); }
}

Game.removeAll = function () {
    while (this.core.rootScene.childNodes.length > 0) {
        this.core.rootScene.removeChild(this.core.rootScene.childNodes[0]);
    }
}

Game.addHeadLine = function (game) {
    var text = '';
    
    if (game.state === State.READY) {
        text = '募集中';
    } else {
        switch (game.phase) {
            case Phase.MAIN:
            case Phase.COMMON:
            case Phase.FOG:
            case Phase.MUD:
            case Phase.SCOUT1:
            case Phase.REDEPLOY1:
            case Phase.DESERTER:
            case Phase.TRAITOR1:
                text = 'プレイ';
                break;
            case Phase.SCOUT2:
                text = '偵察(ドロー)';
                break;
            case Phase.SCOUT3:
                text = '偵察(捨て札)';
                break;
            case Phase.REDEPLOY2:
                text = '再配置';
                break;
            case Phase.TRAITOR2:
                text = '裏切り';
                break;
            case Phase.DRAW:
                text = 'ドロー';
                break;
        }
    }
    
    this.addLabel(text, 664, 6);
}

Game.addCommand = function (game) {
    if (game.state === State.READY) {
        this.addReadyCommand(game);
    } else if(game.playerList[game.active].uid === uid) {
        switch (game.phase)
        {
            case Phase.MAIN:
                this.addLabel('旗獲得かプレイ', 682, 290);
                break;
            case Phase.COMMON:
                switch (game.playerList[game.active].hand[game.playing])
                {
                    case Tactics.ALEXANDER:
                    case Tactics.DARIUS:
                        this.addLabel('任意の色と数字', 682, 290);
                        this.addLabel('(但し、1枚まで)', 680, 305);
                        break;
                    case Tactics.COMPANION:
                        this.addLabel('任意の色の8', 690, 290);
                        break;
                    case Tactics.SHIELD:
                        this.addLabel('任意の色の1・2・3', 668, 290);
                        break;
                    default:
                        this.addLabel('旗獲得かプレイ', 682, 290);
                        break;
                }
                break;
            case Phase.FOG:
                this.addLabel('戦場を霧にする', 682, 290);
                this.addLabel('(霧は役無効)', 689, 305);
                break;
            case Phase.MUD:
                this.addLabel('戦場を沼にする', 682, 290);
                this.addLabel('(沼は4枚完成)', 684, 305);
                break;
            case Phase.SCOUT1:
                this.addLabel('カード3ドロー', 684, 290);
                this.addLabel('2トップデッキ', 684, 305);
                break;
            case Phase.REDEPLOY1:
                this.addLabel('カードの移動か除外', 666, 290);
                break;
            case Phase.DESERTER:
                this.addLabel('敵カードの除外', 682, 290);
                break;
            case Phase.TRAITOR1:
                this.addLabel('敵カードの奪取', 682, 290);
                break;
            case Phase.REDEPLOY2:
                this.addRedeploy2Command(game);
                break;
        }
    }
}

Game.addReadyCommand = function (game) {
    var canJoin = false;
    var canLeave = false;
    var canStart = false;

    var i;
    var len1 = game.playerList.length;
    for (i = 0; i < len1; i++) {
        if (game.playerList[i].uid === '') {
            canJoin = true;
        } else {
            if (game.playerList[i].uid === uid) { canLeave = true; }
        }
    }

    if (
           game.playerList[0].uid !== ''
        && game.playerList[1].uid !== ''
    ) {
        canStart = true;
    }

    if (canJoin) {
        this.addSprite('view/button.png', 0, 693, 280, 80, 25, function () {
            Game.send('b');
        });
    }

    if (canLeave) {
        this.addSprite('view/button.png', 1, 693, 310, 80, 25, function () {
            Game.send('c');
        });

        if (canStart) {
            this.addSprite('view/button.png', 2, 693, 340, 80, 25, function () {
                Game.send('d');
            });
        }
    }
}

Game.addRedeploy2Command = function (game, color) {
    if (game.playerList[game.active].uid === uid) {
        this.addLabel('カードの移動か除外', 666, 290);

        if (game.playerList[game.active].uid === uid) {
            this.addSprite('view/button.png', 4, 693, 340, 80, 25, function () {
                Game.send('m-1');
            });
        }
    }
}

Game.addPlayer = function (game, color) {
    if (game.state === State.PLAYING) {
        if (game.active === color) {
            this.addSprite('view/active.png', 0, 666, color * 78 + 29, 15, 15);
            this.addSprite('view/priority.png', 0, 686, color * 78 + 26, 112, 21);
        }
    }

    this.addLabel(game.playerList[color].uid, 686, color * 78 + 28);

    this.addLabel('戦術 ' + game.playerList[color].count + '枚', 676, color * 78 + 59, '28px');
}

Game.addHand = function (game, index) {
    var targetPlayer = game.playerList[index];
    var opponentPlayer = game.playerList[index === 0 ? 1 : 0];

    var canPlayTroop = false;

    var i;
    var len1 = game.flagList.length;
    for (i = 0; !canPlayTroop && i < len1; i++) {
        if (
               game.flagList[i] === Index.NONE
            && targetPlayer.field[i].length < game.size[i]
        ) {
            canPlayTroop = true;
            break;
        }
    }

    var canPlayWeather = false;

    len1 = game.flagList.length;
    for (i = 0; !canPlayWeather && i < len1; i++) {
        if (game.flagList[i] === Index.NONE) {
            canPlayWeather = true;
            break;
        }
    }

    var canPlayRedeploy = false;

    for (i = 0; i < len1; i++) {
        if (
               game.flagList[i] === Index.NONE
            && targetPlayer.field[i].length > 0
        ) {
            canPlayRedeploy = true;
            break;
        }
    }

    var canPlayDeserter = false;

    for (i = 0; i < len1; i++) {
        if (
               game.flagList[i] === Index.NONE
            && opponentPlayer.field[i].length > 0
        ) {
            canPlayDeserter = true;
            break;
        }
    }

    var canPlayTraitor = false;

    var j;
    var len2;
    if (canPlayTroop) {
        for (i = 0; !canPlayTraitor && i < len1; i++) {
            if (game.flagList[i] === -1) {
                len2 = opponentPlayer.field[i].length;
                for (j = 0; j < len2; j++) {
                    if ((opponentPlayer.field[i][j] & 0xff00) !== 0x0600) {
                        canPlayTraitor = true;
                        break;
                    }
                }
            }
        }
    }

    var x, y, frame;

    len1 = targetPlayer.hand.length;
    for (i = 0; i < len1; i++) {
        x = i * 45 + 5;
        y = 470 * index + 5;

        if (game.active === index && game.playing === i) {
            if (index === 0) {
                y += 10;
            } else {
                y -= 10;
            }
        }

        if (
               game.state === State.READY
            || targetPlayer.uid === uid
            || (
                   game.active === index && game.playing === i
                && (game.phase === Phase.REDEPLOY2 || game.phase === Phase.TRAITOR2)
            )
        ) {
            frame = ((0xff00 & targetPlayer.hand[i]) >> 8) * 10 + (0x00ff & targetPlayer.hand[i]);
        } else {
            if ((0xff00 & targetPlayer.hand[i]) !== 0x0600) {
                frame = 70;
            } else {
                frame = 71;
            }
        }

        this.addSprite('view/card.png', frame, x, y, 65, 65, function () {
            var _i = i;

            if (
                   game.state === State.PLAYING
                && game.active === index
                && targetPlayer.uid === uid
            ) {
                if (
                       game.phase === Phase.MAIN
                    || game.phase === Phase.COMMON
                    || game.phase === Phase.FOG
                    || game.phase === Phase.MUD
                    || game.phase === Phase.SCOUT1
                    || game.phase === Phase.REDEPLOY1
                    || game.phase === Phase.DESERTER
                    || game.phase === Phase.TRAITOR1
                ) {
                    if ((targetPlayer.hand[i] & 0xff00) !== 0x0600) {
                        if (canPlayTroop) {
                            return function () {
                                Game.send('e' + _i);
                            };
                        }
                    } else if (targetPlayer.count <= opponentPlayer.count) {
                        switch (targetPlayer.hand[i])
                        {
                            case Tactics.ALEXANDER:
                            case Tactics.DARIUS:
                                if (canPlayTroop && targetPlayer.leader === 0) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                            case Tactics.COMPANION:
                            case Tactics.SHIELD:
                                if (canPlayTroop) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                            case Tactics.SCOUT:
                                if (game.troopDeck.length + game.tacticsDeck.length > 1) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                            case Tactics.FOG:
                            case Tactics.MUD:
                                if (canPlayWeather) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                            case Tactics.REDEPLOY:
                                if (canPlayRedeploy) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                            case Tactics.DESERTER:
                                if (canPlayDeserter) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                            case Tactics.TRAITOR:
                                if (canPlayTraitor) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                }
                                break;
                        }
                    }
                } else if (game.phase === Phase.SCOUT3) {
                    return function () {
                        Game.send('k' + _i);
                    };
                }
            }
        } ());
    }
}

Game.score = function (weather, formation) {
    var k, l;

    var sample = [];
    var leader = 0;
    var companion = 0;
    var shield = 0;

    var i;
    var len1 = formation.length;
    for (i = 0; i < len1; i++) {
        switch (formation[i]) {
            case Tactics.ALEXANDER:
            case Tactics.DARIUS:
                leader++;
                break;
            case Tactics.COMPANION:
                companion++;
                break;
            case Tactics.SHIELD:
                shield++;
                break;
            default:
                sample.push(formation[i]);
                break;
        }
    }

    var j;
    len1 = sample.length;
    for (i = 0; i < len1 - 1; i++) {
        for (j = i + 1; j < len1; j++) {
            if ((sample[i] & 0x00ff) < (sample[j] & 0x00ff)) {
                k = sample[i];
                sample[i] = sample[j];
                sample[j] = k;
            }
        }
    }

    var isFlush = false;
    var flush = 0;

    j = 0;
    for (i = 0; i < len1; i++) {
        flush += (sample[i] & 0x00ff);
        if ((sample[0] & 0xff00) === (sample[i] & 0xff00)) {
            j++;
        }
    }

    flush += leader * 9 + companion * 7 + shield * 2;

    if ((j + leader + companion + shield) === formation.length) {
        isFlush = true;
    }

    var isThree = false;
    var three = 0;

    j = 0;
    for (i = 0; i < len1; i++) {
        three += (sample[i] & 0x00ff);
        if ((sample[0] & 0x00ff) === (sample[i] & 0x00ff)) {
            j++;
        }
    }

    if ((j + leader) === formation.length) {
        three += (sample[0] & 0x00ff) * leader;
        isThree = true;
    } else if (len1 > 0) {
        if ((sample[0] & 0x00ff) === 7) {
            if ((j + leader + companion) === formation.length) {
                three += 7 * (leader + companion);
                isThree = true;
            }
        } else if ((sample[0] & 0x00ff) === 0 || (sample[0] & 0x00ff) === 1 || (sample[0] & 0x00ff) === 2) {
            if ((j + leader + shield) === formation.length) {
                three += (sample[0] & 0x00ff) * (leader + shield);
                isThree = true;
            }
        }
    }

    var isStraight = true;
    var straight = 0;

    if (len1 > 0) {
        k = (sample[0] & 0x00ff);
        l = (sample[len1 - 1] & 0x00ff);
        straight += k;
        j = k;
        i = 1;

        while (i < len1) {
            if (j - 1 === (sample[i] & 0x00ff)) {
                j = (sample[i] & 0x00ff);
                straight += j;
                i++;
            } else {
                if (companion > 0 && j === 8) {
                    companion--;
                    j -= 1;
                    straight += j;
                } else if (shield > 0 && (j === 3 || j === 2 || j === 1)) {
                    shield--;
                    j -= 1;
                    straight += j;
                } else if (leader > 0) {
                    leader--;
                    j -= 1;
                    straight += j;
                } else {
                    isStraight = false;
                    break;
                }
            }
        }

        if (isStraight && companion > 0) {
            if (k + 1 === 7) {
                k++;
                straight += k;
            } else if (k + 2 === 7 && leader >= 1) {
                leader--;
                k += 2;
                straight += k;
            } else if (k + 3 === 7 && leader >= 2) {
                leader -= 2;
                k += 3;
                straight += k;
            } else if (l - 1 === 7) {
                l--;
                straight += l;
            } else if (l - 2 === 7 && leader > 0) {
                leader--;
                l -= 2;
                straight += l;
            } else {
                isStraight = false;
            }
        }
        if (isStraight && shield > 0) {
            if (k + 1 === 1 || k + 1 === 2) {
                k++;
                straight += k;
            } else if (k + 2 === 2 && leader >= 1) {
                leader--;
                k += 2;
                straight += k;
            } else if (l - 1 === 0 || l - 1 === 1 || l - 1 === 2) {
                l--;
                straight += l;
            } else if (l - 2 === 2 && leader >= 1) {
                leader--;
                l -= 2;
                straight += l;
            } else if (l - 3 === 2 && leader >= 2) {
                leader -= 2;
                l -= 3;
                straight += l;
            } else {
                isStraight = false;
            }
        }

        while (isStraight && leader > 0) {
            if (k + 1 <= 9) {
                leader--;
                k++;
                straight += k;
            } else {
                leader--;
                l--;
                straight += l;
            }
        }
    } else {
        if (companion > 0 && shield > 0) {
            isStraight = false;
        } else {
            if (companion > 0) {
                if (formation.length === 3) {
                    straight = 24;
                } else {
                    straight = 30;
                }
            } else {
                if (formation.length === 3) {
                    straight = 9;
                } else {
                    straight = 14;
                }
            }
        }
    }

    if (!(weather === 1 || weather === 3)) {
        if (isFlush && isStraight) {
            return 400 + straight;
        } else if (isThree) {
            return 300 + three;
        } else if (isFlush) {
            return 200 + flush;
        } else if (isStraight) {
            return 100 + straight;
        }
    }

    return flush;
}

Game.maxScore = function (max, stock, weather, size, sample) {
    if (sample.length === size) {
        return Game.score(weather, sample);
    }

    var score;

    var i;
    var j;
    for (i = 0x0000; i < 0x0600; i += 0x0100) {
        for (j = 0x0009; j >= 0x0000; j -= 0x0001) {
            if (stock[((i >> 8) * 10 + j)] !== -1) {
                stock[((i >> 8) * 10 + j)] = -1;
                sample.push(i | j);
                score = Game.maxScore(max, stock, weather, size, sample);
                if (score > max) {
                    max = score;
                }
                stock[((i >> 8) * 10 + j)] = j;
                sample.splice(sample.length - 1, 1);
            }
        }
    }

    return max;
}

Game.maxScoreForNothing = function (game, weather, size) {
    var result = -1;

    var i;
    var j;
    var k;
    var l;
    var len1 = game.stock.length;
    if (weather === 1 || weather === 3) {
        k = l = 0;

        for (i = len1 - 1; l < size && i >= len1 - 10; i--) {
            for (j = i; l < size && j >= 0; j -= 10) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;
                }
            }
        }

        result = k;
    } else {
        for (i = len1 - 1; i >= 0; i -= 10) {
            k = l = 0;
            for (j = i; (i - j) < 10; j--) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;

                    if (l >= size) {
                        if (result < k) {
                            result = k;
                        }
                        break;
                    }
                } else {
                    k = l = 0;
                }
            }
        }

        if (result > -1) {
            return result + 400;
        }

        for (i = len1 - 1; i >= len1 - 10; i--) {
            k = l = 0;

            for (j = i; j >= 0; j -= 10) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;

                    if (l >= size) {
                        if (result < k) {
                            result = k;
                        }
                        break;
                    }
                }
            }
        }

        if (result > -1) {
            return result + 300;
        }

        for (i = len1 - 1; i >= 0; i -= 10) {
            k = l = 0;

            for (j = i; (i - j) < 10; j--) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;

                    if (l >= size) {
                        if (result < k) {
                            result = k;
                        }
                        break;
                    }
                } else {
                    k = 0;
                }
            }
        }

        if (result > -1) {
            return result + 200;
        }

        k = l = 0;

        for (i = len1 - 1; i >= len1 - 10; i--) {
            for (j = i; j >= 0; j -= 10) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;
                    break;
                }
            }

            if (j < 0) {
                k = l = 0;
            }

            if (l >= size) {
                result = k;
                break;
            }
        }

        if (result > -1) {
            return result + 100;
        }

        k = l = 0;

        for (i = len1 - 1; i >= len1 - 10; i--) {
            for (j = i; j >= 0; j -= 10) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;
                    break;
                }
            }

            if (l >= size) {
                if (result < k) {
                    result = k;
                }
                break;
            }
        }
    }

    return result;
}

Game.addflagList = function (game) {
    var activePlayer = game.playerList[game.active];
    var inactivePlayer = game.playerList[game.active === 0 ? 1 : 0];

    var x, y, activeScore, inactiveScore;

    var i;
    var len1 = game.flagList.length;
    for (i = 0; i < len1; i++) {
        x = i * 73 + 7;

        if (game.flagList[i] === 0) {
            y = 84;
        } else if (game.flagList[i] === 1) {
            y = 441;
        } else {
            y = 263;
        }

        this.addSprite('view/flag.png', 0, x, y, 65, 20, function () {
            var _i = i;

            if (
                   game.state === State.PLAYING
                && activePlayer.uid === uid
            ) {
                if (
                    (
                           game.phase === Phase.MAIN
                        || game.phase === Phase.COMMON
                        || game.phase === Phase.FOG
                        || game.phase === Phase.MUD
                        || game.phase === Phase.SCOUT1
                        || game.phase === Phase.REDEPLOY1
                        || game.phase === Phase.DESERTER
                        || game.phase === Phase.TRAITOR1
                    ) && activePlayer.field[i].length === game.size[i]
                ) {
                    activeScore = Game.score(game.weather[i], activePlayer.field[i]);

                    if (inactivePlayer.field[i].length > 0) {
                        inactiveScore = Game.maxScore(-1, game.stock, game.weather[i], game.size[i], inactivePlayer.field[i]);
                    } else {
                        inactiveScore = Game.maxScoreForNothing(game, game.weather[i], game.size[i]);
                    }

                    if (activeScore >= inactiveScore) {
                        return function () {
                            Game.send('d' + _i);
                        };
                    }
                } else if (game.flagList[i] === -1) {
                    if (game.phase === Phase.FOG) {
                        return function () {
                            Game.send('g' + _i);
                        };
                    } else if(game.phase === Phase.MUD) {
                        return function () {
                            Game.send('h' + _i);
                        };
                    }
                }
            }
        } ());
    }
}

Game.addWeather = function (game) {
    var x;

    var i;
    var len1 = game.weather.length;
    for (i = 0; i < len1; i++) {
        x = i * 73 + 7;

        if (game.weather[i] === 3 || game.weather[i] === 1) {
            this.addSprite('view/flag.png', 1, x, 263, 65, 20);
        }
        if (game.weather[i] === 3 || game.weather[i] === 2) {
            this.addSprite('view/flag.png', 2, x, 263, 65, 20);
        }
    }
}

Game.addField = function (game, index) {
    var x;
    var y;
    var frame;

    var i;
    var j;
    var len1 = game.playerList[index].field.length;
    var len2;
    for (i = 0; i < len1; i++) {
        len2 = game.playerList[index].field[i].length;
        for (j = 0; j < len2; j++) {
            if (
                   game.before.idx === index
                && game.before.y === i
                && game.before.x === j
            ) {
                x = i * 73 + 4;

                if (index === 0) {
                    y = 194 - j * 30;
                } else {
                    y = j * 30 + 281;
                }

                this.addSprite('view/before.png', 0, x, y, 70, 71);
            }

            x = i * 73 + 7;

            if (index === 0) {
                y = 197 - j * 30;
            } else {
                y = j * 30 + 284;
            }

            frame = ((0xff00 & game.playerList[index].field[i][j]) >> 8) * 10 + (0x00ff & game.playerList[index].field[i][j]);

            this.addSprite('view/card.png', frame, x, y, 65, 65, function () {
                if (
                       game.state === State.PLAYING
                    && game.playerList[game.active].uid === uid
                    && game.flagList[i] === -1
                ) {
                    var _i = i;
                    var _j = j;

                    if (game.active === index && game.phase === Phase.REDEPLOY1) {
                        return function () {
                            Game.send('l' + _i + ' ' + _j);
                        };
                    } else if (game.active !== index) {
                        if (game.phase === Phase.DESERTER) {
                            return function () {
                                Game.send('n' + _i + ' ' + _j);
                            };
                        } else if (
                               game.phase === Phase.TRAITOR1
                            && (game.playerList[index].field[i][j] & 0xff00) !== 0x0600
                        ) {
                            return function () {
                                Game.send('o' + _i + ' ' + _j);
                            };
                        }
                    }
                }
            } ());

            if (
                   game.state === State.PLAYING
                && game.target.y === i
                && game.target.x === j
            ) {
                x = i * 73 + 7;

                if (
                    (
                           game.active === index
                        && game.phase === Phase.REDEPLOY2
                    ) || (
                           game.active !== index
                        && game.phase === Phase.TRAITOR2
                    )
                ) {
                    if (index === 0) {
                        y = 197 - j * 30;
                    } else {
                        y = j * 30 + 284;
                    }

                    this.addSprite('view/card.png', 72, x, y, 65, 65, null, 0.7);
                }
            }
        }
    }
}

Game.addTouch = function (game) {
    var x;
    var y;
    var i;
    var len1 = game.flagList.length;

    if (
           game.state === State.PLAYING
        && game.playerList[game.active].uid === uid
    ) {
        if (game.phase === Phase.COMMON || game.phase === Phase.TRAITOR2) {
            for (i = 0; i < len1; i++) {
                x = i * 73 + 7;
                y = game.active * 174 + 106;

                if (
                       game.flagList[i] === Index.NONE
                    && game.playerList[game.active].field[i].length < game.size[i]
                ) {
                    this.addSprite('view/touch.png', 0, x, y, 65, 160, function () {
                        var _i = i;

                        if (game.phase === Phase.COMMON) {
                            return function () {
                                Game.send('f' + _i);
                            };
                        } else {
                            return function () {
                                Game.send('p' + _i);
                            };
                        }
                    } ());
                }
            }
        } else if (game.phase === Phase.REDEPLOY2) {
            for (i = 0; i < len1; i++) {
                x = i * 73 + 7;
                y = game.active * 174 + 106;

                if (
                       game.flagList[i] === Index.NONE
                    && game.target.y !== i
                    && game.playerList[game.active].field[i].length < game.size[i]
                ) {
                    this.addSprite('view/touch.png', 0, x, y, 65, 160, function () {
                        var _i = i;

                        return function () {
                            Game.send('m' + _i);
                        };
                    } ());
                }
            }
        }
    }
}

Game.addTroopDeck = function (game) {
    this.addSprite('view/card.png', 70, 664, 476, 65, 65, function () {
        if (
               game.state === State.PLAYING
            && game.playerList[game.active].uid === uid
            && game.troopDeck.length > 0
        ) {
            if (game.phase === Phase.DRAW) {
                return function () {
                    Game.send('q');
                };
            } else if (game.phase === Phase.SCOUT1 || game.phase === Phase.SCOUT2) {
                return function () {
                    Game.send('i');
                };
            }
        }
    } ());

    Game.addLabel(game.troopDeck.length + '枚', 669, 481);
}

Game.addTacticsDeck = function (game) {
    this.addSprite('view/card.png', 71, 731, 476, 65, 65, function () {
        if (
               game.state === State.PLAYING
            && game.playerList[game.active].uid === uid
            && game.tacticsDeck.length > 0
        ) {
            if (game.phase === Phase.DRAW) {
                return function () {
                    Game.send('r');
                };
            } else if (game.phase === Phase.SCOUT1 || game.phase === Phase.SCOUT2) {
                return function () {
                    Game.send('j');
                };
            }
        }
    } ());

    Game.addLabel(game.tacticsDeck.length + '枚', 736, 481);
}

Game.addTalon = function (game, index) {
    var x;
    var y;
    var frame;

    var i;
    var len1 = game.playerList[index].talon.length;
    for (i = 0; i < len1; i++) {
        x = i * 40 + 432;
        y = index * 470 + 5;

        frame = ((0xff00 & game.playerList[index].talon[i]) >> 8) * 10 + (0x00ff & game.playerList[index].talon[i]);

        this.addSprite('view/card.png', frame, x, y, 65, 65);
    }
}