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
        'view/bg.png', 'view/build.png', 'view/job.png'
        ,'view/btn.png', 'view/actv.png', 'view/king.png'
    );
    Game.core.onload = function () {
        Game.isOpen = true;
        Game.send('a');
    }
    Game.core.start();
}

Game.onMessage = function (game) {
    var i;

    if (!Game.isMute && game.sound !== '') sound(game.sound);
    Game.removeAll();
    Game.addBackGround();
    Game.addHeadLine(game);
    Game.addCommand(game);
    for (i = 0; i < 5; i++) Game.addPlayer(game, i);
    Game.addSound(game);
}

Game.removeAll = function () {
    Game.isSent = false;
    while (Game.core.rootScene.childNodes.length > 0) Game.core.rootScene.removeChild(Game.core.rootScene.childNodes[0]);
}

Game.addBackGround = function () {
    Game.addSprite('view/bg.png', 0, 0, 0, 840, 520);
}

Game.addHeadLine = function (game) {
    var text = '';

    if (game.state === State.Ready) {
        text = '募集中';
    } else {
        switch (game.phase) {
            case Phase.Draft:
                text = '対戦中 - ドラフト';
                break;
            case Phase.Main:
                text = '対戦中 - メイン';
                break;
            case Phase.DrawCard:
                text = '対戦中 - 収入(カード)';
                break;
            case Phase.Build:
                text = '対戦中 - 建築';
                break;
            case Phase.Kill:
                text = '対戦中 - 暗殺';
                break;
            case Phase.Steal:
                text = '対戦中 - 盗む';
                break;
            case Phase.Trade:
                text = '対戦中 - 交換(人)';
                break;
            case Phase.Replace:
                text = '対戦中 - 交換(山札)';
                break;
            case Phase.Destroy:
                text = '対戦中 - 破壊';
                break;
            case Phase.Cemetery:
                text = '対戦中 - 墓地 [' + game.playerList[game.cemeteryOwner].uid + '(' + Game.color(game.cemeteryOwner) + ')]';
                break;
            case Phase.Laboratory:
                text = '対戦中 - 研究所';
                break;
        }
    }

    Game.addLabel(text, 425, 352);
}

Game.addCommand = function (game) {
    var i, j, k, x, y, canJoin, canLeave, canStart, canBuild, canDestroy;

    if (game.state === State.Ready) {
        canJoin = canLeave = canStart = false;
        for (i = j = 0; i < game.playerList.length; i++) {
            if (game.playerList[i].uid === '') {
                canJoin = true;
            } else {
                j++;
                if (game.playerList[i].uid === uid) canLeave = true;
            }
        }
        if (i === j) canStart = true;
        if (canJoin) {
            Game.addSprite('view/btn.png', 0, 540, 425, 80, 25, function () {
                Game.send('b');
            });
        } else if (canStart) {
            Game.addSprite('view/btn.png', 2, 540, 425, 80, 25, function () {
                Game.send('d');
            });
        }
        if (canLeave) {
            Game.addSprite('view/btn.png', 1, 650, 425, 80, 25, function () {
                Game.send('c');
            });
        }
    } else {
        switch (game.phase) {
            case Phase.Draft:
                if (game.playerList[game.active].uid === uid) Game.addLabel('役割を選んで下さい。', 425, 380);
                for (i = j = 0; i < game.job.length; i++) {
                    if (game.job[i] === -1) {
                        if (game.playerList[game.active].uid === uid) {
                            Game.addSprite('view/job.png', i, j * 55 + 425, 410, 50, 70, function () {
                                var _i = i;

                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        } else {
                            Game.addSprite('view/job.png', 8, j * 55 + 425, 410, 50, 70);
                        }
                        j++;
                    }
                }
                break;
            case Phase.Main:
                if (game.playerList[game.active].uid === uid) {
                    i = 0;
                    if (game.canDrawCard) {
                        if (
                            (
                                game.obsOwner === game.active
                                && game.isFirst
                                && game.deck.length >= 3
                            ) || (
                                (
                                    game.obsOwner !== game.active
                                    || !game.isFirst
                                ) && game.deck.length >= 2
                            )
                        ) {   
                            Game.addSprite('view/btn.png', 3, 425, 385, 80, 25, function () {
                                send('f');
                            });
                            i++;
                        }
                    }
                    if (game.canGet2Coin) {
                        Game.addSprite('view/btn.png', 4, (i * 85) + 425, 385, 80, 25, function () {
                            send('h');
                        });
                        i++;
                    }
                    canBuild = false;
                    for (j = 0; j < game.playerList[game.active].hand.length; j++) {
                        if (((game.playerList[game.active].hand[j] & 0x0f00) >> 8) <= game.playerList[game.active].coin) {
                            canBuild = true;
                            break;
                        }
                    }
                    if (canBuild && game.buildCount > 0) {
                        Game.addSprite('view/btn.png', 5, (i * 85) + 425, 385, 80, 25, function () {
                            send('i');
                        });
                        i++;
                    }
                    if (game.canKill) {
                        Game.addSprite('view/btn.png', 7, (i * 85) + 425, 385, 80, 25, function () {
                            send('l');
                        });
                        i++;
                    }
                    if (game.canSteal) {
                        Game.addSprite('view/btn.png', 15, (i * 85) + 425, 385, 80, 25, function () {
                            send('n');
                        });
                        i++;
                    }
                    if (game.canTrade) {
                        Game.addSprite('view/btn.png', 16, (i * 85) + 425, 385, 80, 25, function () {
                            send('p');
                        });
                        i++;
                    }
                    if (
                        game.canReplace
                        && game.playerList[game.active].hand.length > 0
                        && game.deck.length > 0
                    ) {
                        Game.addSprite('view/btn.png', 17, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                            send('r');
                        });
                        i++;
                    }

                    if (game.canYellowCoin) {
                        for (j = 0; j < game.playerList[game.active].build.length; j++) {
                            if (
                                (game.playerList[game.active].build[j] & 0xf000) === Color.Yellow
                                || game.playerList[game.active].build[j] === Card.MagicSchool
                            ) {
                                Game.addSprite('view/btn.png', 24, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                                    send('u');
                                });
                                i++;
                                break;
                            }
                        }
                    }
                    if (game.canBlueCoin) {
                        for (j = 0; j < game.playerList[game.active].build.length; j++) {
                            if (
                                (game.playerList[game.active].build[j] & 0xf000) === Color.Blue
                                || game.playerList[game.active].build[j] === Card.MagicSchool
                            ) {
                                Game.addSprite('view/btn.png', 25, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                                    send('v');
                                });
                                i++;
                                break;
                            }
                        }
                    }
                    if (game.canGet1Coin) {
                        Game.addSprite('view/btn.png', 26, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                            send('w');
                        });
                        i++;
                    }
                    if (game.canGreenCoin) {
                        for (j = 0; j < game.playerList[game.active].build.length; j++) {
                            if (
                                (game.playerList[game.active].build[j] & 0xf000) === Color.Green
                                || game.playerList[game.active].build[j] === Card.MagicSchool
                            ) {
                                Game.addSprite('view/btn.png', 27, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                                    send('x');
                                });
                                i++;
                                break;
                            }
                        }
                    }
                    if (
                        game.canDraw2Cards
                        && game.deck.length >= 2
                    ) {
                        Game.addSprite('view/btn.png', 28, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                            send('y');
                        });
                        i++;
                    }
                    canDestroy = false;
                    for (j = 0; !canDestroy && j < game.playerList.length; j++) {
                        if (
                            j !== game.active
                            && (
                                game.playerList[j].job !== Job.Evangelist
                                || !game.playerList[j].isOpen
                            ) && game.playerList[j].build.length < 8
                        ) {
                            for (k = 0; !canDestroy && k < game.playerList[j].build.length; k++) {
                                if (
                                    game.playerList[j].build[k] !== Card.Lookout
                                    && ((game.playerList[j].build[k] & 0x0f00) >> 8) <= game.playerList[game.active].coin + 1
                                ) {
                                    canDestroy = true;
                                }
                            }
                        }
                    }
                    if (
                        canDestroy
                        && game.canDestroy
                    ) {
                        Game.addSprite('view/btn.png', 29, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                            send('z');
                        });
                        i++;
                    }
                    if (game.canRedCoin) {
                        for (j = 0; j < game.playerList[game.active].build.length; j++) {
                            if (
                                (game.playerList[game.active].build[j] & 0xf000) === Color.Red
                                || game.playerList[game.active].build[j] === Card.MagicSchool
                            ) {
                                Game.addSprite('view/btn.png', 30, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                                    send('B');
                                });
                                i++;
                                break;
                            }
                        }
                    }
                    if (
                        game.canLabo
                        && game.playerList[game.active].hand.length >= 1
                    ) {
                        Game.addSprite('view/btn.png', 33, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                            send('E');
                        });
                        i++;
                    }
                    if (
                        game.canSmith
                        && game.playerList[game.active].coin >= 3
                        && game.deck.length >= 2
                    ) {
                        Game.addSprite('view/btn.png', 32, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                            send('G');
                        });
                        i++;
                    }
                    Game.addSprite('view/btn.png', 6, (i % 4) * 85 + 425, Math.floor(i / 4) * 30 + 385, 80, 25, function () {
                        send('k');
                    });
                    i++;
                }
                break;
            case Phase.DrawCard:
                if (game.playerList[game.active].uid === uid) {
                    Game.addLabel('カードを選んで下さい。', 425, 380);
                    for (i = 0; i < game.peek.length; i++) {
                        Game.addSprite('view/build.png', game.peek[i] & 0x00ff, (i * 50) + 425, 400, 45, 45, function () {
                            var _i = i;

                            return function () {
                                send('g' + _i);
                            };
                        } ());
                    }
                } else {
                    for (i = 0; i < game.peek.length; i++) {
                        Game.addSprite('view/build.png', 27, (i * 50) + 425, 400, 45, 45);
                    }
                }
                break;
            case Phase.Build:
                if (game.playerList[game.active].uid === uid) Game.addLabel('建築して下さい。', 540, 440);
                break;
            case Phase.Kill:
                if (game.playerList[game.active].uid === uid) {
                    Game.addLabel('暗殺して下さい。', 425, 380);
                    for (i = 1, j = 0; i < game.job.length; i++) {
                        if (
                            (
                                game.job[i] >= 0
                                && !game.playerList[game.job[i]].isOpen
                            )
                            || game.job[i] === -1
                            || game.job[i] === -3
                        ) {
                            Game.addSprite('view/btn.png', i + 7, (j % 4) * 85 + 425, Math.floor(j / 4) * 30 + 405, 80, 25, function () {
                                var _i = i;

                                return function () {
                                    send('m' + _i);
                                };
                            } ());
                            j++;
                        }
                    }
                }
                break;
            case Phase.Steal:
                if (game.playerList[game.active].uid === uid) {
                    Game.addLabel('盗んで下さい。', 425, 380);
                    for (i = 2, j = 0; i < game.job.length; i++) {
                        if (
                            (
                                (
                                    game.job[i] >= 0
                                    && !game.playerList[game.job[i]].isOpen
                                )
                                || game.job[i] === -1
                                || game.job[i] === -3
                            ) && i !== game.kill
                        ) {
                            Game.addSprite('view/btn.png', i + 7, (j % 4) * 85 + 425, Math.floor(j / 4) * 30 + 405, 80, 25, function () {
                                var _i = i;

                                return function () {
                                    send('o' + _i);
                                };
                            } ());
                            j++;
                        }
                    }
                }
                break;
            case Phase.Trade:
                if (game.playerList[game.active].uid === uid) {
                    Game.addLabel('手札を交換して下さい。', 425, 380);
                    for (i = j = 0; i < game.playerList.length; i++) {
                        if (i !== game.active) {
                            Game.addSprite('view/btn.png', i + 18, j * 85 + 425, 405, 80, 25, function () {
                                var _i = i;

                                return function () {
                                    send('q' + _i);
                                };
                            } ());
                            j++;
                        }
                    }
                }
                break;
            case Phase.Replace:
                if (game.playerList[game.active].uid === uid) {
                    Game.addLabel('好きな枚数だけ、手札を捨てて下さい。', 425, 380);
                    if (game.discard > 0) {
                        Game.addSprite('view/btn.png', 23, 425, 470, 80, 25, function () {
                            return function () {
                                send('t');
                            };
                        } ());
                    }
                }
                Game.addLabel(game.discard + '枚 破棄', 520, 420, '24px');
                break;
            case Phase.Destroy:
                if (game.playerList[game.active].uid === uid) Game.addLabel('破壊して下さい。', 540, 440);
                break;
            case Phase.Cemetery:
                Game.addSprite('view/build.png', game.cemeteryCard & 0x00ff, 435, 410, 45, 45);
                if (game.playerList[game.cemeteryOwner].uid === uid) {
                    Game.addLabel('1コインを支払い、手札に加えますか?', 425, 380);
                    Game.addSprite('view/btn.png', 23, 425, 470, 80, 25, function () {
                        return function () {
                            send('C');
                        };
                    } ());
                    Game.addSprite('view/btn.png', 31, 510, 470, 80, 25, function () {
                        return function () {
                            send('D');
                        };
                    } ());
                }
                break;
            case Phase.Laboratory:
                if (game.playerList[game.active].uid === uid) Game.addLabel('手札を1枚捨てて下さい。', 500, 425);
                break;
        }
    }
    for (i = 0; i < game.job.length; i++) {
        if (game.job[i] === -2) {
            Game.addSprite('view/job.png', i, 775, 375, 50, 70);
            Game.addSprite('view/job.png', 8, 785, 410, 50, 70);
            if (game.phase !== Phase.Draft) Game.addSprite('view/job.png', 8, 775, 445, 50, 70);
            break;
        }
    }
    Game.addLabel('山札:' + game.deck.length, 425, 500);
}

Game.addPlayer = function (game, playerIdx) {
    var hoge;

    if (game.state === State.Play) {
        if (game.active === playerIdx) {
            Game.addSprite('view/actv.png', 0, Math.floor(playerIdx / 3) * 419 + 26, (playerIdx % 3) * 173 + 2, 107, 21);
        }
    }
    Game.addLabel(
        game.playerList[playerIdx].uid
        , Math.floor(playerIdx / 3) * 420 + 32
        , (playerIdx % 3) * 173 + 5
    );
    if (
        game.state === State.Ready
        || game.playerList[playerIdx].uid === uid
    ) {
        hoge = Game.score(game, playerIdx);
    } else {
        hoge = { score: '??', bonus: '??' };
    }
    Game.addLabel(
        '得点:' + hoge.score + '(+' + hoge.bonus + ')'
        , Math.floor(playerIdx / 3) * 420 + 140
        , (playerIdx % 3) * 173 + 5
    );
    Game.addLabel(
        'コイン:' + game.playerList[playerIdx].coin
        , Math.floor(playerIdx / 3) * 420 + 230
        , (playerIdx % 3) * 173 + 5
    );

    if (game.playerList[playerIdx].job !== -1) {
        if (
            game.state === State.Ready
            || game.playerList[playerIdx].uid === uid
            || game.playerList[playerIdx].isOpen
        ) {
            if (playerIdx < 3) {
                Game.addSprite('view/job.png', game.playerList[playerIdx].job, 5, 173 * playerIdx + 30, 50, 70);
            } else {
                Game.addSprite('view/job.png', game.playerList[playerIdx].job, 425, 173 * (playerIdx - 3) + 30, 50, 70);
            }
        } else {
            if (playerIdx < 3) {
                Game.addSprite('view/job.png', 8, 5, 173 * playerIdx + 30, 50, 70);
            } else {
                Game.addSprite('view/job.png', 8, 425, 173 * (playerIdx - 3) + 30, 50, 70);
            }
        }
    }

    if (playerIdx === game.king) Game.addSprite('view/king.png', 0, Math.floor(playerIdx / 3) * 419 + 6, (playerIdx % 3) * 173 + 5, 15, 15);

    Game.addHand(game, playerIdx);
    Game.addBuild(game, playerIdx);
}

Game.addHand = function (game, playerIdx) {
    var i, x, y;

    for (i = 0; i < game.playerList[playerIdx].hand.length; i++) {
        if (playerIdx < 3) {
            x = i * 35 + 60;
            y = 173 * playerIdx + 43;
        } else {
            x = i * 35 + 480;
            y = 173 * (playerIdx - 3) + 43;
        }

        if (
            game.state === State.Ready
            || game.playerList[playerIdx].uid === uid
        ) {
            Game.addSprite('view/build.png', game.playerList[playerIdx].hand[i] & 0x00ff, x, y, 45, 45, function () {
                var _i = i;

                if (
                    game.playerList[playerIdx].uid === uid
                    && game.active === playerIdx
                ) {
                    switch (game.phase) {
                        case Phase.Build:
                            if (
                                ((game.playerList[playerIdx].hand[i] & 0x0f00) >> 8)
                                <= game.playerList[playerIdx].coin
                            ) {
                                return function () {
                                    send('j' + _i);
                                };
                            }
                            break;
                        case Phase.Replace:
                            if (game.deck.length >= game.discard + 1) {
                                return function () {
                                    send('s' + _i);
                                };
                            }
                            break;
                        case Phase.Laboratory:
                            return function () {
                                send('F' + _i);
                            };
                            break;
                    }
                }
            } ());
        } else {
            Game.addSprite('view/build.png', 27, x, y, 45, 45);
        }
    }
}

Game.addBuild = function (game, playerIdx) {
    var i, x, y;

    for (i = 0; i < game.playerList[playerIdx].build.length; i++) {
        if (playerIdx < 3) {
            x = i * 43 + 5;
            y = 173 * playerIdx + 115;
        } else {
            x = i * 43 + 425;
            y = 173 * (playerIdx - 3) + 115;
        }

        Game.addSprite('view/build.png', game.playerList[playerIdx].build[i] & 0x00ff, x, y, 45, 45, function () {
            var _i = i;

            if (
                game.phase === Phase.Destroy
                && game.playerList[game.active].uid === uid
                && playerIdx !== game.active
                && game.playerList[playerIdx].build[i] !== Card.Lookout
                && game.playerList[playerIdx].build.length < 8
                && (
                    game.playerList[playerIdx].job !== Job.Evangelist
                    || !game.playerList[playerIdx].isOpen
                ) && (
                    ((game.playerList[playerIdx].build[i] & 0x0f00) >> 8)
                    <= game.playerList[game.active].coin + 1
                )
            ) {
                return function () {
                    Game.send('A' + playerIdx + ' ' + _i);
                };
            }
        } ());
    }
}

Game.score = function (game, playerIdx) {
    var i, score = 0, bonus = 0, haveYellow = 0, haveBlue = 0, haveGreen = 0, haveRed = 0,
    havePurple = 0, haveGhostTown = 0;

    for (i = 0; i < game.playerList[playerIdx].build.length; i++) {
        score += (game.playerList[playerIdx].build[i] & 0x0f00) >> 8;

        switch (game.playerList[playerIdx].build[i]) {
            case Card.DragonsProtection:
            case Card.University:
                bonus += 2;
                break;
        }

        switch (game.playerList[playerIdx].build[i] & 0xf000) {
            case Color.Yellow:
                if (haveYellow === 0) haveYellow++;
                break;
            case Color.Blue:
                if (haveBlue === 0) haveBlue++;
                break;
            case Color.Green:
                if (haveGreen === 0) haveGreen++;
                break;
            case Color.Red:
                if (haveRed === 0) haveRed++;
                break;
            case Color.Purple:
                if (game.playerList[playerIdx].build[i] === Card.GhostTown) {
                    haveGhostTown++;
                } else if (havePurple === 0) {
                    havePurple++;
                }
                break;
        }
    }

    if (
        (haveYellow + haveBlue + haveGreen + haveRed + havePurple + haveGhostTown)
        >= 5
    ) {
        bonus += 3;
    }

    if (game.playerList[playerIdx].build.length >= 8) {
        if (game.firstFinish === playerIdx) {
            bonus += 4;
        } else {
            bonus += 2;
        }
    }

    return { 'score': score, 'bonus': bonus };
}

Game.addSound = function (game) {
    var frame;

    frame = Game.isMute ? 35 : 34;

    Game.addSprite('view/btn.png', frame, 760, 346, 80, 25, function () {
        Game.isMute = !Game.isMute;

        this.frame = Game.isMute ? 35 : 34;
    });
}

Game.color = function (type) {
    switch (type) {
        case 0:
            return '赤';
        case 1:
            return '青';
        case 2:
            return '黄';
        case 3:
            return '緑';
        case 4:
            return '紫';
    }
}