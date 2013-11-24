enchant();

var Game = function () { }

Game.isOpen = false;
Game.isSent = false;
Game.isMute = false;
Game.core = null;

Game.send = function (msg) {
    if (!Game.isSent) {
        send(msg);
        Game.isSent = true;
    }
}

Game.addLabel = function (text, x, y, font) {
    var label;

    if (!font)
        font = '14px "ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro","メイリオ",Meiryo,"ＭＳ Ｐゴシック",sans-serif';
    else
        font +=  '"ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro","メイリオ",Meiryo,"ＭＳ Ｐゴシック",sans-serif';
    label = new Label(text);
    label.x = x;
    label.y = y;
    label.font = font;
    Game.core.rootScene.addChild(label);

    return label;
}

Game.addSprite = function (image, frame, x, y, width, height, onTouch, opacity) {
    var sprite;

    sprite = new Sprite(width, height);
    sprite.image = Game.core.assets[image];
    sprite.frame = frame;
    sprite.x = x;
    sprite.y = y;
    sprite.opacity = opacity;
    if (onTouch) sprite.addEventListener('touchstart', onTouch);
    Game.core.rootScene.addChild(sprite);

    return sprite;
}

Game.onLoad = function () {
    Game.core = new Core(840, 520);
    Game.core.fps = 5;
    Game.core.preload(
        'view/bg.png', 'view/card.png', 'view/flag.png',
        'view/touch.png', 'view/btn.png', 'view/actv.png',
        'view/before.png'
    );
    Game.core.onload = function () {
        Game.isOpen = true;
        Game.send('t');
    }
    Game.core.start();
}

Game.onMessage = function (game) {
    if (!Game.isMute && game.sound !== '') sound(game.sound);
    Game.removeAll();
    Game.addBackGround();
    Game.addHeadline(game);
    Game.addField(game, 0);
    Game.addField(game, 1);
    Game.addWeather(game);
    Game.addflagList(game);
    Game.addHand(game, 0);
    Game.addHand(game, 1);
    Game.addTalon(game, 0);
    Game.addTalon(game, 1);
    Game.addTouch(game);
    Game.addTroopDeck(game);
    Game.addTacticsDeck(game);
    Game.addCommand(game);
    Game.addPlayer(game, 0);
    Game.addPlayer(game, 1);
    Game.addSound();
}

Game.removeAll = function () { 
    Game.isSent = false;
    while (Game.core.rootScene.childNodes.length > 0) Game.core.rootScene.removeChild(Game.core.rootScene.childNodes[0]);
}

Game.addBackGround = function () {
    Game.addSprite('view/bg.png', 0, 0, 0, 840, 520);
}

Game.addSound = function () {
    var frame;

    if (Game.isMute) {
        frame = 6;
    } else {
        frame = 5;
    }
    Game.addSprite('view/btn.png', frame, 760, 495, 80, 25, function () {
        Game.isMute = !Game.isMute;
        if (Game.isMute) {
            this.frame = 6;
        } else {
            this.frame = 5;
        }
    });
}

Game.addHeadline = function (game) {
    var text;

    if (game.state === State.Ready) {
        text = '募集中';
    } else {
        text = '対戦中';
    }
    Game.addLabel(text, 690, 5);
}

Game.addPlayer = function (game, playerIdx) {
    var y;

    if (game.state === State.Play && game.active === playerIdx) {
        y = 78 * playerIdx + 26;
        Game.addSprite('view/actv.png', 0, 707, y, 107, 21);
    }
    y = 78 * playerIdx + 29;
    Game.addLabel(game.playerList[playerIdx].uid, 711, y);
    y = 78 * playerIdx + 55;
    Game.addLabel('戦術カード: ' + game.playerList[playerIdx].count + '枚', 691, y);
}

Game.addHand = function (game, playerIdx) {
    var x, y, frame, i, j, unIdx, canPlayTroop = false, canPlayWeather = false,
    canPlayRedeploy = false, canPlayDeserter = false, canPlayTraitor = false;

    if (playerIdx === 0) {
        unIdx = 1;
    } else {
        unIdx = 0;
    }
    for (i = 0; !canPlayTroop && i < game.flagList.length; i++) {
        if (
            game.flagList[i] === -1
            && game.playerList[playerIdx].field[i].length < game.size[i]
        ) {
            canPlayTroop = true;
            break;
        }
    }
    for (i = 0; !canPlayWeather && i < game.flagList.length; i++) {
        if (game.flagList[i] === -1) {
            canPlayWeather = true;
            break;
        }
    }
    for (i = 0; i < game.flagList.length; i++) {
        if (
            game.flagList[i] === -1
            && game.playerList[playerIdx].field[i].length > 0
        ) {
            canPlayRedeploy = true;
            break;
        }
    }
    for (i = 0; i < game.flagList.length; i++) {
        if (
            game.flagList[i] === -1
            && game.playerList[unIdx].field[i].length > 0
        ) {
            canPlayDeserter = true;
            break;
        }
    }
    if (canPlayTroop) {
        for (i = 0; !canPlayTraitor && i < game.flagList.length; i++) {
            if (game.flagList[i] === -1) {
                for (j in game.playerList[unIdx].field[i]) {
                    if ((game.playerList[unIdx].field[i][j] & 0xff00) !== 0x0600) {
                        canPlayTraitor = true;
                        break;
                    }
                }
            }
        }
    }
    for (i = 0; i < game.playerList[playerIdx].hand.length; i++) {
        x = i * 45 + 5;
        y = 451 * playerIdx + 2;
        if (game.active === playerIdx && game.play === i) {
            if (playerIdx === 0) {
                y += 10;
            } else {
                y -= 10;
            }
        }
        if (
            game.state === State.Ready
            || game.playerList[playerIdx].uid === uid
            || (
                game.active === playerIdx && game.play === i
                && (game.phase === Phase.Redeploy2 || game.phase === Phase.Traitor2)
            )
        ) {
            frame = ((0xff00 & game.playerList[playerIdx].hand[i]) >> 8) * 10 + (0x00ff & game.playerList[playerIdx].hand[i]);
        } else {
            if ((0xff00 & game.playerList[playerIdx].hand[i]) !== 0x0600) {
                frame = 70;
            } else {
                frame = 71;
            }
        }
        Game.addSprite('view/card.png', frame, x, y, 65, 65, function () {
            var _i = i;

            if (
                game.state === State.Play
                && game.active === playerIdx
                && game.playerList[playerIdx].uid === uid
            ) {
                if (
                    game.phase === Phase.Main
                    || game.phase === Phase.Common
                    || game.phase === Phase.Fog
                    || game.phase === Phase.Mud
                    || game.phase === Phase.Scout1
                    || game.phase === Phase.Redeploy1
                    || game.phase === Phase.Deserter
                    || game.phase === Phase.Traitor1
                ) {
                    if ((game.playerList[playerIdx].hand[i] & 0xff00) !== 0x0600) {
                        if (canPlayTroop) {
                            return function () {
                                Game.send('e' + _i);
                            };
                        }
                    } else if (game.playerList[playerIdx].count <= game.playerList[unIdx].count) {
                        if (
                            (
                                game.playerList[playerIdx].hand[i] === Tactics.Alexander
                                || game.playerList[playerIdx].hand[i] === Tactics.Darius
                            )
                            && game.playerList[playerIdx].leader === 0
                            || game.playerList[playerIdx].hand[i] === Tactics.Companion
                            || game.playerList[playerIdx].hand[i] === Tactics.Shield
                        ) {
                            if (canPlayTroop) {
                                return function () {
                                    Game.send('e' + _i);
                                };
                            }
                        } else if (game.playerList[playerIdx].hand[i] === Tactics.Scout) {
                            if (game.troopDeck.length + game.tacticsDeck.length > 1) {
                                return function () {
                                    Game.send('e' + _i);
                                };
                            }
                        } else if (
                            game.playerList[playerIdx].hand[i] === Tactics.Fog
                            || game.playerList[playerIdx].hand[i] === Tactics.Mud
                        ) {
                            if (canPlayWeather) {
                                return function () {
                                    Game.send('e' + _i);
                                };
                            }
                        } else if (game.playerList[playerIdx].hand[i] === Tactics.Redeploy) {
                            if (canPlayRedeploy) {
                                return function () {
                                    Game.send('e' + _i);
                                };
                            }
                        } else if (game.playerList[playerIdx].hand[i] === Tactics.Deserter) {
                            if (canPlayDeserter) {
                                return function () {
                                    Game.send('e' + _i);
                                };
                            }
                        } else if (game.playerList[playerIdx].hand[i] === Tactics.Traitor) {
                            if (canPlayTraitor) {
                                return function () {
                                    Game.send('e' + _i);
                                };
                            }
                        }
                    }
                } else if (game.phase === Phase.Scout3) {
                    return function () {
                        Game.send('k' + _i);
                    };
                }
            }
        } ());
    }
}

Game.addWeather = function (game) {
    var i, x;

    for (i = 0; i < game.weather.length; i++) {
        x = i * 75 + 5;
        if (game.weather[i] === 3 || game.weather[i] === 1) {
            Game.addSprite('view/flag.png', 1, x, 250, 65, 20);
        }
        if (game.weather[i] === 3 || game.weather[i] === 2) {
            Game.addSprite('view/flag.png', 2, x, 250, 65, 20);
        }
    }
}

Game.addflagList = function (game) {
    var i, x, y, unActive, activeScore, unActiveScore;

    if (game.active === 0) {
        unActive = 1;
    } else {
        unActive = 0;
    }
    for (i = 0; i < game.flagList.length; i++) {
        x = i * 75 + 5;
        if (game.flagList[i] === 0) {
            y = 69;
        } else if (game.flagList[i] === 1) {
            y = 431;
        } else {
            y = 250;
        }
        Game.addSprite('view/flag.png', 0, x, y, 65, 20, function () {
            var _i = i;

            if (
                game.state === State.Play
                && game.playerList[game.active].uid === uid
            ) {
                if (
                    game.phase === Phase.Main
                    && game.playerList[game.active].field[i].length === game.size[i]
                ) {
                    activeScore = Game.score(game.weather[i], game.playerList[game.active].field[i]);
                    if (game.playerList[unActive].field[i].length > 0) {
                        unActiveScore = Game.maxScore(-1, game.stock, game.weather[i], game.size[i], game.playerList[unActive].field[i]);
                    } else {
                        unActiveScore = Game.maxScoreForNothing(game, game.weather[i], game.size[i]);
                    }
                    if (activeScore >= unActiveScore) {
                        return function () {
                            Game.send('d' + _i);
                        };
                    }
                } else if (game.flagList[i] === -1) {
                    if (game.phase === Phase.Fog) {
                        return function () {
                            Game.send('g' + _i);
                        };
                    } else if(game.phase === Phase.Mud) {
                        return function () {
                            Game.send('h' + _i);
                        };
                    }
                }
            }
        } ());
    }
}

Game.addTouch = function (game) {
    var i, x, y, sprite;

    if (
        game.state === State.Play
        && game.playerList[game.active].uid === uid
    ) {
        if (game.phase === Phase.Common || game.phase === Phase.Traitor2) {
            for (i = 0; i < game.flagList.length; i++) {
                x = i * 75 + 5;
                y = game.active * 182 + 89;
                if (
                    game.flagList[i] === -1
                    && game.playerList[game.active].field[i].length < game.size[i]
                ) {
                    Game.addSprite('view/touch.png', 0, x, y, 65, 160, function () {
                        var _i = i;

                        if (game.phase === Phase.Common) {
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
        } else if (game.phase === Phase.Redeploy2) {
            for (i = 0; i < game.flagList.length; i++) {
                x = i * 75 + 5;
                y = game.active * 182 + 89;
                if (
                    game.flagList[i] === -1
                    && game.target.y !== i
                    && game.playerList[game.active].field[i].length < game.size[i]
                ) {
                    Game.addSprite('view/touch.png', 0, x, y, 65, 160, function () {
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

Game.addField = function (game, playerIdx) {
    var i, j, x, y, frame;

    for (i = 0; i < game.playerList[playerIdx].field.length; i++) {
        for (j = 0; j < game.playerList[playerIdx].field[i].length; j++) {
            if (
                game.before.idx === playerIdx
                && game.before.y === i
                && game.before.x === j
            ) {
                x = i * 75 + 2;
                if (playerIdx === 0) {
                    y = 181 - j * 31;
                } else {
                    y = j * 31 + 268;
                }
                Game.addSprite('view/before.png', 0, x, y, 71, 71);
            }
            x = i * 75 + 5;
            if (playerIdx === 0) {
                y = 184 - j * 31;
            } else {
                y = j * 31 + 271;
            }
            frame = ((0xff00 & game.playerList[playerIdx].field[i][j]) >> 8) * 10
                    + (0x00ff & game.playerList[playerIdx].field[i][j]);

            Game.addSprite('view/card.png', frame, x, y, 65, 65, function () {
                if (
                    game.state === State.Play
                    && game.playerList[game.active].uid === uid
                    && game.flagList[i] === -1
                ) {
                    var _i = i, _j = j;

                    if (game.active === playerIdx && game.phase === Phase.Redeploy1) {
                        return function () {
                            Game.send('l' + _i + ' ' + _j);
                        };
                    } else if (game.active !== playerIdx) {
                        if (game.phase === Phase.Deserter) {
                            return function () {
                                Game.send('n' + _i + ' ' + _j);
                            };
                        } else if (
                            game.phase === Phase.Traitor1
                            && (game.playerList[playerIdx].field[i][j] & 0xff00) !== 0x0600
                        ) {
                            return function () {
                                Game.send('o' + _i + ' ' + _j);
                            };
                        }
                    }
                }
            } ());

            if (
                game.state === State.Play
                && game.target.y === i
                && game.target.x === j
            ) {
                x = i * 75 + 5;
                if (
                    (
                        game.active === playerIdx
                        && game.phase === Phase.Redeploy2
                    ) || (
                        game.active !== playerIdx
                        && game.phase === Phase.Traitor2
                    )
                ) {
                    if (playerIdx === 0) {
                        y = 184 - j * 31;
                    } else {
                        y = j * 31 + 271;
                    }
                    Game.addSprite('view/card.png', 72, x, y, 65, 65, null, 0.7);
                }
            }
        }
    }
}

Game.addTroopDeck = function (game) {
    Game.addSprite('view/card.png', 70, 695, 425, 65, 65, function () {
        if (
            game.state === State.Play
            && game.playerList[game.active].uid === uid
            && game.troopDeck.length > 0
        ) {
            if (game.phase === Phase.Draw) {
                return function () {
                    Game.send('q');
                };
            } else if (game.phase === Phase.Scout1 || game.phase === Phase.Scout2) {
                return function () {
                    Game.send('i');
                };
            }
        }
    } ());
    Game.addLabel(game.troopDeck.length + '枚', 700, 430);
}

Game.addTacticsDeck = function (game) {
    Game.addSprite('view/card.png', 71, 765, 425, 65, 65, function () {
        if (
            game.state === State.Play
            && game.playerList[game.active].uid === uid
            && game.tacticsDeck.length > 0
        ) {
            if (game.phase === Phase.Draw) {
                return function () {
                    Game.send('r');
                };
            } else if (game.phase === Phase.Scout1 || game.phase === Phase.Scout2) {
                return function () {
                    Game.send('j');
                };
            }
        }
    } ());
    Game.addLabel(game.tacticsDeck.length + '枚', 770, 430);
}

Game.addTalon = function (game, playerIdx) {
    var i, x, y, frame;

    for (i = 0; i < game.playerList[playerIdx].talon.length; i++) {
        x = i * 45 + 432;
        y = playerIdx * 451 + 2;
        frame = ((0xff00 & game.playerList[playerIdx].talon[i]) >> 8) * 10
                + (0x00ff & game.playerList[playerIdx].talon[i]);
        Game.addSprite('view/card.png', frame, x, y, 65, 65);
    }
}

Game.addCommand = function (game) {
    var unActive, canPlayTroop = false, haveTroop = false;

    if (game.state === State.Ready) {
        if (game.playerList[0].uid === '' || game.playerList[1].uid === '') {
            Game.addSprite('view/btn.png', 0, 725, 265, 80, 25, function () {
                Game.send('a');
            });
        } else if (game.playerList[0].uid === uid || game.playerList[1].uid === uid) {
            Game.addSprite('view/btn.png', 2, 725, 265, 80, 25, function () {
                Game.send('c');
            });
        }
        if (game.playerList[0].uid === uid || game.playerList[1].uid === uid) {
            Game.addSprite('view/btn.png', 1, 725, 305, 80, 25, function () {
                Game.send('b');
            });
        }
    } else if (game.playerList[game.active].uid === uid) {
        if (game.phase === Phase.Main) {
            Game.addLabel('旗の獲得か、カードを<br>プレイして下さい。', 690, 193);
            for (i in game.flagList) {
                if (game.flagList[i] === -1 && game.playerList[game.active].field[i].length < game.size[i]) {
                    canPlayTroop = true;
                    break;
                }
            }
            for (i in game.playerList[game.active].hand) {
                if ((game.playerList[game.active].hand[i] & 0xff00) !== 0x0600) {
                    haveTroop = true;
                    break;
                }
            }
            if (!canPlayTroop || !haveTroop) {
                Game.addSprite('view/btn.png', 3, 705, 300, 80, 25, function () {
                    Game.send('s');
                });
            }
        } else if (game.phase === Phase.Common) {
            Game.addLabel('戦場へカードを出せま<br>す。', 690, 193);
        } else if (game.phase === Phase.Fog) {
            Game.addLabel('戦場を霧にできます。', 690, 193);
        } else if (game.phase === Phase.Mud) {
            Game.addLabel('戦場を沼にできます。', 690, 193);
        } else if (game.phase === Phase.Scout1 || game.phase === Phase.Scout2) {
            Game.addLabel('偵察により山札からカ<br>ードを引けます。', 690, 193);
        } else if (game.phase === Phase.Scout3) {
            Game.addLabel('山札の上にカードを戻<br>せます。', 690, 193);
        } else if (game.phase === Phase.Redeploy1) {
            Game.addLabel('再配置するカードを選<br>べます。', 690, 193);
        } else if (game.phase === Phase.Redeploy2) {
            if (game.playerList[game.active].uid === uid) {
                Game.addLabel('カードを移動か、除外<br>できます。', 690, 193);
                if (game.playerList[game.active].uid === uid) {
                    Game.addSprite('view/btn.png', 4, 690, 385, 80, 25, function () {
                        Game.send('m-1');
                    });
                }
            }
        } else if (game.phase === Phase.Deserter) {
            Game.addLabel('カードを除外できます。', 690, 193);
        } else if (game.phase === Phase.Traitor1) {
            Game.addLabel('裏切らせる部隊カード<br>を選べます。', 690, 193);
        } else if (game.phase === Phase.Traitor2) {
            Game.addLabel('部隊カードを移動でき<br>ます。', 690, 193);
        } else if (game.phase === Phase.Draw) {
            Game.addLabel('山札からカードを引け<br>ます。', 690, 193);
        }
    }
}

Game.maxScoreForNothing = function (game, weather, size) {
    var result, i, j, k, l;

    result = -1;
    if (weather === 1 || weather === 3) {
        k = l = 0;
        for (i = game.stock.length - 1; l < size && i >= game.stock.length - 10; i--) {
            for (j = i; l < size && j >= 0; j -= 10) {
                if (game.stock[j] !== -1) {
                    k += game.stock[j];
                    l++;
                }
            }
        }
        result = k;
    } else {
        for (i = game.stock.length - 1; i >= 0; i -= 10) {
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
        for (i = game.stock.length - 1; i >= game.stock.length - 10; i--) {
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
        for (i = game.stock.length - 1; i >= 0; i -= 10) {
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
        for (i = game.stock.length - 1; i >= game.stock.length - 10; i--) {
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
        for (i = game.stock.length - 1; i >= game.stock.length - 10; i--) {
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

Game.maxScore = function (max, stock, weather, size, sample) {
    var score, i, j;

    if (sample.length === size) {
        return Game.score(weather, sample);
    }
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

Game.score = function (weather, formation) {
    var sample = [], i, j, k, l, isFlush, isStraight, isThree,
    flush, straight, three, leader = 0, companion = 0, shield = 0;

    for (i = 0; i < formation.length; i++) {
        switch (formation[i]) {
            case Tactics.Alexander:
            case Tactics.Darius:
                leader++;
                break;
            case Tactics.Companion:
                companion++;
                break;
            case Tactics.Shield:
                shield++;
                break;
            default:
                sample.push(formation[i]);
                break;
        }
    }
    for (i = 0; i < sample.length - 1; i++) {
        for (j = i + 1; j < sample.length; j++) {
            if ((sample[i] & 0x00ff) < (sample[j] & 0x00ff)) {
                k = sample[i];
                sample[i] = sample[j];
                sample[j] = k;
            }
        }
    }
    isFlush = false;
    flush = 0;
    j = 0;
    for (i = 0; i < sample.length; i++) {
        flush += (sample[i] & 0x00ff);
        if ((sample[0] & 0xff00) === (sample[i] & 0xff00)) {
            j++;
        }
    }
    flush += leader * 9 + companion * 7 + shield * 2;
    if ((j + leader + companion + shield) === formation.length) {
        isFlush = true;
    }
    isThree = false;
    three = 0;
    j = 0;
    for (i = 0; i < sample.length; i++) {
        three += (sample[i] & 0x00ff);
        if ((sample[0] & 0x00ff) === (sample[i] & 0x00ff)) {
            j++;
        }
    }
    if ((j + leader) === formation.length) {
        three += (sample[0] & 0x00ff) * leader;
        isThree = true;
    } else if (sample.length > 0) {
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
    isStraight = true;
    straight = 0;
    if (sample.length > 0) {
        k = (sample[0] & 0x00ff);
        l = (sample[sample.length - 1] & 0x00ff);
        straight += k;
        j = k;
        i = 1;
        while (i < sample.length) {
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
                companion--;
                k++;
                straight += k;
            } else if (k + 2 === 7 && leader >= 1) {
                companion--;
                leader--;
                k += 2;
                straight += k;
            } else if (k + 3 === 7 && leader >= 2) {
                companion--;
                leader -= 2;
                k += 3;
                straight += k;
            } else if (l - 1 === 7) {
                companion--;
                l--;
                straight += l;
            } else if (l - 2 === 7 && leader > 0) {
                companion--;
                leader--;
                l -= 2;
                straight += l;
            } else {
                isStraight = false;
            }
        }
        if (isStraight && shield > 0) {
            if (k + 1 === 1 || k + 1 === 2) {
                shield--;
                k++;
                straight += k;
            } else if (k + 2 === 2 && leader >= 1) {
                shield--;
                leader--;
                k += 2;
                straight += k;
            } else if (l - 1 === 0 || l - 1 === 1 || l - 1 === 2) {
                shield--;
                l--;
                straight += l;
            } else if (l - 2 === 2 && leader >= 1) {
                shield--;
                leader--;
                l -= 2;
                straight += l;
            } else if (l - 3 === 2 && leader >= 2) {
                shield--;
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