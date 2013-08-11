enchant();

var Game = function () { }

Game.isOpen = false;
Game.isSent = false;
Game.isMute = false;

Game.send = function (msg) {
    if (!Game.isSent) {
        send(msg);
        Game.isSent = true;
    }
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
    var s, i, j, k;

    if (!Game.isMute && game.se !== '') {
        switch (game.se) {
            case 'play':
                sound('./view/play.mp3');
                break;
            case 'get':
                sound('./view/get.mp3');
                break;
            case 'end':
                sound('./view/end.mp3');
                break;
        }
    }

    Game.isSent = false;
    while (Game.core.rootScene.childNodes.length > 0) {
        Game.core.rootScene.removeChild(Game.core.rootScene.childNodes[0]);
    }

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

Game.addBackGround = function () {
    var sprite = new Sprite(840, 520);
    sprite.image = Game.core.assets['view/bg.png'];
    Game.core.rootScene.addChild(sprite);
}

Game.addSound = function () {
    var sprite = new Sprite(80, 25);
    sprite.image = Game.core.assets['view/btn.png'];
    sprite.x = 760;
    sprite.y = 495;
    if (Game.isMute) {
        sprite.frame = 6;
    } else {
        sprite.frame = 5;
    }
    sprite.addEventListener('touchstart', function () {
        Game.isMute = !Game.isMute;
        if (Game.isMute) {
            sprite.frame = 6;
        } else {
            sprite.frame = 5;
        }
    });
    Game.core.rootScene.addChild(sprite);
}

Game.addHeadline = function (game) {
    var sprite;
    if (game.state === State.Ready) {
        sprite = new Label('募集中');
    } else {
        sprite = new Label('対戦中');
    }
    sprite.x = 690;
    sprite.y = 5;
    sprite.font = '14px monospace';
    Game.core.rootScene.addChild(sprite);
}

Game.addPlayer = function (game, idx) {
    var sprite;
    if (game.state === State.Play && game.active === idx) {
        sprite = new Sprite(107, 21);
        sprite.image = Game.core.assets['view/actv.png'];
        sprite.x = 707;
        if (idx === 0) {
            sprite.y = 26;
        } else {
            sprite.y = 104;
        }
        Game.core.rootScene.addChild(sprite);
    }
    sprite = new Label(game.playerList[idx].uid);
    sprite.x = 711;
    if (idx === 0) {
        sprite.y = 29;
    } else {
        sprite.y = 107;
    }
    sprite.font = '14px monospace';
    Game.core.rootScene.addChild(sprite);
    sprite = new Label('戦術カード: ' + game.playerList[idx].count + '枚');
    sprite.x = 691;
    if (idx === 0) {
        sprite.y = 55;
    } else {
        sprite.y = 133;
    }
    sprite.font = '14px monospace';
    Game.core.rootScene.addChild(sprite);
}

Game.addHand = function (game, idx) {
    var sprite, i, j, unIdx, canPlayTroop = false, canPlayWeather = false,
    canPlayRedeploy = false, canPlayDeserter = false, canPlayTraitor = false;

    if (idx === 0) {
        unIdx = 1;
    } else {
        unIdx = 0;
    }
    for (i = 0; !canPlayTroop && i < game.flagList.length; i++) {
        if (game.flagList[i] === -1 && game.playerList[idx].field[i].length < game.size[i]) canPlayTroop = true;
    }
    for (i = 0; !canPlayWeather && i < game.flagList.length; i++) {
        if (game.flagList[i] === -1) {
            canPlayWeather = true;
        }
    }
    for (i in game.flagList) {
        if (game.flagList[i] === -1 && game.playerList[idx].field[i].length > 0) {
            canPlayRedeploy = true;
            break;
        }
    }
    for (i in game.flagList) {
        if (game.flagList[i] === -1 && game.playerList[unIdx].field[i].length > 0) {
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
    for (i = 0; i < game.playerList[idx].hand.length; i++) {
        sprite = new Sprite(65, 65);
        sprite.image = Game.core.assets['view/card.png'];
        if (game.state === State.Ready
        || game.playerList[idx].uid === uid
        || (game.active === idx && game.play === i
            && (game.phase === Phase.Redeploy2 || game.phase === Phase.Traitor2)
        )) {
            sprite.frame = ((0xff00 & game.playerList[idx].hand[i]) >> 8) * 10 + (0x00ff & game.playerList[idx].hand[i]);
        } else {
            if ((0xff00 & game.playerList[idx].hand[i]) !== 0x0600) {
                sprite.frame = 70;
            } else {
                sprite.frame = 71;
            }
        }
        if (game.state === State.Play
        && game.active === idx
        && game.playerList[idx].uid === uid
        ) {
            if (game.phase === Phase.Main
            || game.phase === Phase.Common
            || game.phase === Phase.Fog
            || game.phase === Phase.Mud
            || game.phase === Phase.Scout1
            || game.phase === Phase.Redeploy1
            || game.phase === Phase.Deserter
            || game.phase === Phase.Traitor1
            ) {
                if ((game.playerList[idx].hand[i] & 0xff00) !== 0x0600) {
                    if (canPlayTroop) {
                        sprite.addEventListener('touchstart', function () {
                            var _i = i;
                            return function () {
                                Game.send('e' + _i);
                            };
                        } ());
                    }
                } else if (game.playerList[idx].count <= game.playerList[unIdx].count) {
                    if (
                    (
                        (game.playerList[idx].hand[i] === Tactics.Alexander || game.playerList[idx].hand[i] === Tactics.Darius)
                    ) && game.playerList[idx].leader === 0
                    || game.playerList[idx].hand[i] === Tactics.Companion
                    || game.playerList[idx].hand[i] === Tactics.Shield
                    ) {
                        if (canPlayTroop) {
                            sprite.addEventListener('touchstart', function () {
                                var _i = i;
                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        }
                    } else if (game.playerList[idx].hand[i] === Tactics.Scout) {
                        if (game.troopDeck.length + game.tacticsDeck.length > 1) {
                            sprite.addEventListener('touchstart', function () {
                                var _i = i;
                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        }
                    } else if (game.playerList[idx].hand[i] === Tactics.Fog || game.playerList[idx].hand[i] === Tactics.Mud) {
                        if (canPlayWeather) {
                            sprite.addEventListener('touchstart', function () {
                                var _i = i;
                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        }
                    } else if (game.playerList[idx].hand[i] === Tactics.Redeploy) {
                        if (canPlayRedeploy) {
                            sprite.addEventListener('touchstart', function () {
                                var _i = i;
                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        }
                    } else if (game.playerList[idx].hand[i] === Tactics.Deserter) {
                        if (canPlayDeserter) {
                            sprite.addEventListener('touchstart', function () {
                                var _i = i;
                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        }
                    } else if (game.playerList[idx].hand[i] === Tactics.Traitor) {
                        if (canPlayTraitor) {
                            sprite.addEventListener('touchstart', function () {
                                var _i = i;
                                return function () {
                                    Game.send('e' + _i);
                                };
                            } ());
                        }
                    }
                }
            } else if (game.phase === Phase.Scout3) {
                sprite.addEventListener('touchstart', function () {
                    var _i = i;
                    return function () {
                        Game.send('k' + _i);
                    };
                } ());
            }
        }
        sprite.x = i * 45 + 5;
        if (idx === 0) {
            sprite.y = 2;
        } else {
            sprite.y = 453;
        }
        if (game.active === idx && game.play === i) {
            if (idx === 0) {
                sprite.y += 10;
            } else {
                sprite.y -= 10;
            }
        }
        Game.core.rootScene.addChild(sprite);
    }
}

Game.addWeather = function (game) {
    var i, sprite;
    for (i = 0; i < game.weather.length; i++) {
        if (game.weather[i] === 3 || game.weather[i] === 1) {
            sprite = new Sprite(65, 20);
            sprite.image = Game.core.assets['view/flag.png'];
            sprite.x = i * 75 + 5;
            sprite.y = 250;
            sprite.frame = 1;
            Game.core.rootScene.addChild(sprite);
        }
        if (game.weather[i] === 3 || game.weather[i] === 2) {
            sprite = new Sprite(65, 20);
            sprite.image = Game.core.assets['view/flag.png'];
            sprite.x = i * 75 + 5;
            sprite.y = 250;
            sprite.frame = 2;
            Game.core.rootScene.addChild(sprite);
        }
    }
}

Game.addflagList = function (game) {
    var i, sprite, unActive, activeScore, unActiveScore;
    if (game.active === 0) {
        unActive = 1;
    } else {
        unActive = 0;
    }
    for (i = 0; i < game.flagList.length; i++) {
        sprite = new Sprite(65, 20);
        sprite.image = Game.core.assets['view/flag.png'];
        sprite.frame = 0;
        sprite.x = i * 75 + 5;
        if (game.state === State.Play
        && game.playerList[game.active].uid === uid
        && game.phase === Phase.Main
        && game.playerList[game.active].field[i].length === game.size[i]
        ) {
            activeScore = Game.score(game.weather[i], game.playerList[game.active].field[i]);
            if (game.playerList[unActive].field[i].length > 0) {
                unActiveScore = Game.maxScore(-1, game.stock, game.weather[i], game.size[i], game.playerList[unActive].field[i]);
            } else {
                unActiveScore = Game.maxScoreForNothing(game, game.weather[i], game.size[i]);
            }
            if (activeScore >= unActiveScore) {
                sprite.addEventListener('touchstart', function () {
                    var j = i;
                    return function () {
                        Game.send('d' + j);
                    };
                } ());
            }
        }
        if (game.flagList[i] === 0) {
            sprite.y = 69;
        } else if (game.flagList[i] === 1) {
            sprite.y = 431;
        } else {
            sprite.y = 250;
        }
        Game.core.rootScene.addChild(sprite);
        if (game.flagList[i] === -1) {
            sprite = new Sprite(65, 20);
            sprite.image = Game.core.assets['view/flag.png'];
            sprite.frame = 12;
            sprite.x = i * 75 + 5;
            sprite.y = 250;
            if (game.phase === Phase.Fog) {
                sprite.addEventListener('touchstart', function () {
                    var _i = i;
                    return function () {
                        Game.send('g' + _i);
                    };
                } ());
                Game.core.rootScene.addChild(sprite);
            } else if (game.phase === Phase.Mud) {
                sprite.addEventListener('touchstart', function () {
                    var _i = i;
                    return function () {
                        Game.send('h' + _i);
                    };
                } ());
                Game.core.rootScene.addChild(sprite);
            }
        }
    }
}

Game.addTouch = function (game) {
    var i, sprite;
    if (game.state === State.Play && game.playerList[game.active].uid === uid) {
        if (game.phase === Phase.Common || game.phase === Phase.Traitor2) {
            for (i = 0; i < game.flagList.length; i++) {
                if (game.flagList[i] === -1 && game.playerList[game.active].field[i].length < game.size[i]) {
                    sprite = new Sprite(65, 160);
                    sprite.image = Game.core.assets['view/touch.png'];
                    sprite.x = i * 75 + 5;
                    if (game.phase === Phase.Common) {
                        sprite.addEventListener('touchstart', function () {
                            var _i = i;
                            return function () {
                                Game.send('f' + _i);
                            };
                        } ());
                        if (game.active === 0) {
                            sprite.y = 89;
                        } else {
                            sprite.y = 271;
                        }
                    } else {
                        sprite.addEventListener('touchstart', function () {
                            var _i = i;
                            return function () {
                                Game.send('p' + _i);
                            };
                        } ());
                        if (game.active === 0) {
                            sprite.y = 89;
                        } else {
                            sprite.y = 271;
                        }
                    }
                    Game.core.rootScene.addChild(sprite);
                }
            }
        } else if (game.phase === Phase.Redeploy2) {
            for (i = 0; i < game.flagList.length; i++) {
                if (game.flagList[i] === -1) {
                    sprite = new Sprite(65, 160);
                    sprite.image = Game.core.assets['view/touch.png'];
                    sprite.x = i * 75 + 5;
                    sprite.addEventListener('touchstart', function () {
                        var _i = i;
                        return function () {
                            Game.send('m' + _i);
                        };
                    } ());
                    if (game.active === 0) {
                        sprite.y = 89;
                    } else {
                        sprite.y = 271;
                    }
                    Game.core.rootScene.addChild(sprite);
                }
            }
        }
    }
}

Game.addField = function (game, idx) {
    var i, j, sprite;
    for (i = 0; i < game.playerList[idx].field.length; i++) {
        for (j = 0; j < game.playerList[idx].field[i].length; j++) {
            if (game.before.idx === idx && game.before.y === i && game.before.x === j) {
                sprite = new Sprite(71, 71);
                sprite.image = Game.core.assets['view/before.png'];
                sprite.x = i * 75 + 2;
                if (idx === 0) {
                    sprite.y = 181 - j * 31;
                } else {
                    sprite.y = j * 31 + 268;
                }
                Game.core.rootScene.addChild(sprite);
            }
            sprite = new Sprite(65, 65);
            sprite.image = Game.core.assets['view/card.png'];
            sprite.frame = ((0xff00 & game.playerList[idx].field[i][j]) >> 8) * 10 + (0x00ff & game.playerList[idx].field[i][j]);
            sprite.x = i * 75 + 5;
            if (idx === 0) {
                sprite.y = 184 - j * 31;
            } else {
                sprite.y = j * 31 + 271;
            }
            if (game.state === State.Play && game.playerList[game.active].uid === uid && game.flagList[i] === -1) {
                if (game.active === idx && game.phase === Phase.Redeploy1) {
                    sprite.addEventListener('touchstart', function () {
                        var _i = i, _j = j;
                        return function () {
                            Game.send('l' + _i + ' ' + _j);
                        };
                    } ());
                } else if (game.active !== idx) {
                    if (game.phase === Phase.Deserter) {
                        sprite.addEventListener('touchstart', function () {
                            var _i = i, _j = j;
                            return function () {
                                Game.send('n' + _i + ' ' + _j);
                            };
                        } ());
                    } else if (game.phase === Phase.Traitor1 && (game.playerList[idx].field[i][j] & 0xff00) !== 0x0600) {
                        sprite.addEventListener('touchstart', function () {
                            var _i = i, _j = j;
                            return function () {
                                Game.send('o' + _i + ' ' + _j);
                            };
                        } ());
                    }
                }
            }
            Game.core.rootScene.addChild(sprite);
            if (game.state === State.Play && game.target.y === i && game.target.x === j) {
                sprite = new Sprite(65, 65);
                sprite.image = Game.core.assets['view/card.png'];
                sprite.frame = 72;
                sprite.opacity = 0.7;
                sprite.x = i * 75 + 5;
                if (game.active === idx) {
                    if (game.phase === Phase.Redeploy2) {
                        if (idx === 0) {
                            sprite.y = 184 - j * 31;
                        } else {
                            sprite.y = j * 31 + 271;
                        }
                        Game.core.rootScene.addChild(sprite);
                    }
                } else {
                    if (game.phase === Phase.Traitor2) {
                        if (idx === 0) {
                            sprite.y = 184 - j * 31;
                        } else {
                            sprite.y = j * 31 + 271;
                        }
                        Game.core.rootScene.addChild(sprite);
                    }
                }
            }
        }
    }
}

Game.addTroopDeck = function (game) {
    var sprite = new Sprite(65, 65);
    sprite.image = Game.core.assets['view/card.png'];
    sprite.frame = 70;
    sprite.x = 695;
    sprite.y = 425;
    if (game.state === State.Play && game.playerList[game.active].uid === uid && game.troopDeck.length > 0) {
        if (game.phase === Phase.Draw) {
            sprite.addEventListener('touchstart', function () {
                Game.send('q');
            });
        } else if (game.phase === Phase.Scout1 || game.phase === Phase.Scout2) {
            sprite.addEventListener('touchstart', function () {
                Game.send('i');
            });
        }
    }
    Game.core.rootScene.addChild(sprite);
    sprite = new Label(game.troopDeck.length + '枚');
    sprite.x = 700;
    sprite.y = 430;
    sprite.font = '14px monospace';
    Game.core.rootScene.addChild(sprite);
}

Game.addTacticsDeck = function (game) {
    var sprite = new Sprite(65, 65);
    sprite.image = Game.core.assets['view/card.png'];
    sprite.frame = 71;
    sprite.x = 765;
    sprite.y = 425;
    if (game.state === State.Play && game.playerList[game.active].uid === uid && game.tacticsDeck.length > 0) {
        if (game.phase === Phase.Draw) {
            sprite.addEventListener('touchstart', function () {
                Game.send('r');
            });
        } else if (game.phase === Phase.Scout1 || game.phase === Phase.Scout2) {
            sprite.addEventListener('touchstart', function () {
                Game.send('j');
            });
        }
    }
    Game.core.rootScene.addChild(sprite);
    sprite = new Label(game.tacticsDeck.length + '枚');
    sprite.x = 770;
    sprite.y = 430;
    sprite.font = '14px monospace';
    Game.core.rootScene.addChild(sprite);
}

Game.addTalon = function (game, idx) {
    var i, sprite;
    for (i = 0; i < game.playerList[idx].talon.length; i++) {
        sprite = new Sprite(65, 65);
        sprite.image = Game.core.assets['view/card.png'];
        sprite.frame = ((0xff00 & game.playerList[idx].talon[i]) >> 8) * 10 + (0x00ff & game.playerList[idx].talon[i]);
        sprite.x = i * 45 + 432;
        if (idx === 0) {
            sprite.y = 2;
        } else {
            sprite.y = 453;
        }
        Game.core.rootScene.addChild(sprite);
    }
}

Game.addCommand = function (game) {
    var sprite, unActive, canPlayTroop = false, haveTroop = false;

    if (game.state === State.Ready) {
        sprite = new Sprite(80, 25);
        sprite.image = Game.core.assets['view/btn.png'];
        sprite.x = 725;
        sprite.y = 265;
        if (game.playerList[0].uid === '' || game.playerList[1].uid === '') {
            sprite.frame = 0;
            sprite.addEventListener('touchstart', function () {
                Game.send('a');
            });
            Game.core.rootScene.addChild(sprite);
        } else if(game.playerList[0].uid === uid || game.playerList[1].uid === uid) {
            sprite.frame = 2;
            sprite.addEventListener('touchstart', function () {
                Game.send('c');
            });
            Game.core.rootScene.addChild(sprite);
        }
        if (game.playerList[0].uid === uid || game.playerList[1].uid === uid) {
            sprite = new Sprite(80, 25);
            sprite.image = Game.core.assets['view/btn.png'];
            sprite.x = 725;
            sprite.y = 305;
            sprite.frame = 1;
            sprite.addEventListener('touchstart', function () {
                Game.send('b');
            });
            Game.core.rootScene.addChild(sprite);
        }
    } else if (game.playerList[game.active].uid === uid) {
        sprite = new Label('');
        sprite.x = 690;
        sprite.y = 193;
        sprite.font = '14px monospace';

        if (game.phase === Phase.Main) {
            sprite.text = '旗の獲得か、カードを<br />プレイして下さい。';
            Game.core.rootScene.addChild(sprite);
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
                sprite = new Sprite(80, 25);
                sprite.image = Game.core.assets['view/btn.png'];
                sprite.frame = 3;
                sprite.x = 705;
                sprite.y = 300;
                sprite.addEventListener('touchstart', function () {
                    Game.send('s');
                });
                Game.core.rootScene.addChild(sprite);
            }
        } else if (game.phase === Phase.Common) {
            sprite.text = '戦場へカードを出せま<br />す。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Fog) {
            sprite.text = '戦場を霧にできます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Mud) {
            sprite.text = '戦場を沼にできます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Scout1 || game.phase === Phase.Scout2) {
            sprite.text = '偵察により山札からカ<br />ードを引けます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Scout3) {
            sprite.text = '山札の上にカードを戻<br />せます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Redeploy1) {
            sprite.text = '再配置するカードを選<br />べます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Redeploy2) {
            if (game.playerList[game.active].uid === uid) {
                sprite.text = 'カードを移動か、除外<br />できます。';
                Game.core.rootScene.addChild(sprite);
                if (game.playerList[game.active].uid === uid) {
                    sprite = new Sprite(80, 25);
                    sprite.image = Game.core.assets['view/btn.png'];
                    sprite.frame = 4;
                    sprite.x = 690;
                    sprite.y = 385;
                    sprite.addEventListener('touchstart', function () {
                        Game.send('m-1');
                    });
                    Game.core.rootScene.addChild(sprite);
                }
            }
        } else if (game.phase === Phase.Deserter) {
            sprite.text = 'カードを除外できます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Traitor1) {
            sprite.text = '裏切らせる部隊カード<br />を選べます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Traitor2) {
            sprite.text = '部隊カードを移動でき<br />ます。';
            Game.core.rootScene.addChild(sprite);
        } else if (game.phase === Phase.Draw) {
            sprite.text = '山札からカードを引け<br />ます。';
            Game.core.rootScene.addChild(sprite);
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