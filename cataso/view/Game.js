enchant();

var Game = function () { }

Game.isOpen = false;
Game.isSent = false;
Game.isMute = false;
Game.core = null;
Game.trade = {
    destroy: [0, 0, 0, 0, 0]
    , create: [0, 0, 0, 0, 0]
    , pool: 0
};

Game.send = function (msg) {
    if (!Game.isSent) {
        send(msg);
        Game.isSent = true;
    }
}

Game.addLabel = function (text, x, y, font) {
    var label;

    if (!font) font = '14px monospace';
    label = new Label(text);
    label.x = x;
    label.y = y;
    label.font = font;
    Game.core.rootScene.addChild(label);

    return label;
}

Game.addSprite = function (image, frame, x, y, width, height, onTouch) {
    var sprite;

    sprite = new Sprite(width, height);
    sprite.image = Game.core.assets[image];
    sprite.frame = frame;
    sprite.x = x;
    sprite.y = y;
    if (onTouch) sprite.addEventListener('touchstart', onTouch);
    Game.core.rootScene.addChild(sprite);

    return sprite;
}

Game.onLoad = function () {
    Game.core = new Core(840, 520);
    Game.core.fps = 5;
    Game.core.preload(
        'view/bg.png', 'view/btn.png', 'view/actv.png'
        , 'view/tile.png', 'view/chip.png', 'view/settlement.png'
        , 'view/road.png', 'view/resource.png', 'view/robber.png'
        , 'view/skin.png', 'view/rsrcbtn.png', 'view/card.png'
        , 'view/dice.png', 'view/prize.png', 'view/updown.png'
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
    for (i = 0; i < 4; i++) Game.addPlayer(game, i);
    Game.addStock(game);
    Game.addHarbor(game);
    Game.addTileList(game);
    Game.addNumList(game);
    Game.addRoad(game);
    Game.addSettlementList(game);
    Game.addBuildRoad(game);
    Game.addRobber(game);
    Game.addDice(game);
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
            case Phase.SetupSettlement1:
                text = '対戦中 - 1件目の家配置';
                break;
            case Phase.SetupRoad1:
                text = '対戦中 - 1本目の道配置';
                break;
            case Phase.SetupSettlement2:
                text = '対戦中 - 2件目の家配置';
                break;
            case Phase.SetupRoad2:
                text = '対戦中 - 2本目の道配置';
                break;
            case Phase.DiceRoll:
                text = '対戦中 - ダイスロール';
                break;
            case Phase.Burst:
                text = '対戦中 - バースト';
                break;
            case Phase.Robber1:
                text = '対戦中 - 盗賊の移動';
                break;
            case Phase.Robber2:
                text = '対戦中 - 資源の略奪';
                break;
            case Phase.Main:
                text = '対戦中 - メイン';
                break;
            case Phase.BuildRoad:
                text = '対戦中 - 道';
                break;
            case Phase.BuildSettlement:
                text = '対戦中 - 家';
                break;
            case Phase.BuildCity:
                text = '対戦中 - 街';
                break;
            case Phase.InternationalTrade:
                text = '対戦中 - 海外貿易';
                break;
            case Phase.DomesticTrade1:
                text = '対戦中 - 国内貿易';
                break;
            case Phase.DomesticTrade2:
                text = '対戦中 - 国内貿易(確認中)';
                break;
            case Phase.Soldier1:
                text = '対戦中 - 盗賊の移動(騎士)';
                break;
            case Phase.Soldier2:
                text = '対戦中 - 資源の略奪(騎士)';
                break;
            case Phase.RoadBuilding1:
                text = '対戦中 - 街道(1本目)';
                break;
            case Phase.RoadBuilding2:
                text = '対戦中 - 街道(2本目)';
                break;
            case Phase.YearOfPlenty1:
                text = '対戦中 - 収穫(1資源目)';
                break;
            case Phase.YearOfPlenty2:
                text = '対戦中 - 収穫(2資源目)';
                break;
            case Phase.Monopoly:
                text = '対戦中 - 独占';
                break;
        }
    }
    Game.addLabel(text, 527, 6);
}

Game.addCommand = function (game) {
    var i, j, sprite, canJoin, canLeave, canStart;

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
            Game.addSprite('view/btn.png', 0, 600, 410, 80, 25, function () {
                Game.send('b');
            });
        } else if (canStart) {
            Game.addSprite('view/btn.png', 2, 600, 410, 80, 25, function () {
                Game.send('d');
            });
        }
        if (canLeave) {
            Game.addSprite('view/btn.png', 1, 685, 410, 80, 25, function () {
                Game.send('c');
            });
        }
    } else if (game.playerList[game.active].uid === uid) {
        switch (game.phase) {
            case Phase.DiceRoll:
                Game.addSprite('view/skin.png', 1, 525, 338, 313, 180);
                Game.addSprite('view/btn.png', 3, 550, 345, 80, 25, function () {
                    Game.send('i');
                });
                Game.addSprite('view/btn.png', 10, 640, 345, 80, 25, function () {
                    if (game.playerList[game.active].score + game.playerList[game.active].bonus >= 10) {
                        return function () {
                            Game.send('B');
                        };
                    }
                } ());
                Game.addCardCommand(game);
                break;
            case Phase.Robber1:
            case Phase.Soldier1:
                Game.addLabel('盗賊を移動させて下さい。', 595, 410);
                break;
            case Phase.Robber2:
            case Phase.Soldier2:
                Game.addLabel('資源を略奪して下さい。', 595, 410);
                break;
            case Phase.Main:
                for (i = 0; i < 5; i++) {
                    Game.trade.destroy[i] = 0;
                    Game.trade.create[i] = 0;
                }
                Game.trade.pool = 0;
                Game.addSprite('view/skin.png', 1, 525, 338, 313, 180);
                Game.addSprite('view/btn.png', 4, 550, 345, 80, 25, function () {
                    if (
                        game.playerList[game.active].resource[Resource.Brick] >= 1
                        && game.playerList[game.active].resource[Resource.Lumber] >= 1
                        && game.playerList[game.active].road > 0
                        && Game.canBuildRoads(game)
                    ) {
                        return function () {
                            Game.send('m');
                        };
                    }
                } ());
                Game.addSprite('view/btn.png', 5, 640, 345, 80, 25, function () {
                    if (
                        game.playerList[game.active].resource[Resource.Brick] >= 1
                        && game.playerList[game.active].resource[Resource.Wool] >= 1
                        && game.playerList[game.active].resource[Resource.Grain] >= 1
                        && game.playerList[game.active].resource[Resource.Lumber] >= 1
                        && game.playerList[game.active].settlement > 0
                        && Game.canBuildSettlements(game)
                    ) {
                        return function () {
                            Game.send('o');
                        };
                    }
                } ());
                Game.addSprite('view/btn.png', 6, 730, 345, 80, 25, function () {
                    if (
                        game.playerList[game.active].resource[Resource.Ore] >= 3
                        && game.playerList[game.active].resource[Resource.Grain] >= 2
                        && game.playerList[game.active].city > 0
                        && Game.canBuildCitys(game)
                    ) {
                        return function () {
                            Game.send('q');
                        };
                    }
                } ());
                Game.addSprite('view/btn.png', 7, 550, 375, 80, 25, function () {
                    if (
                        game.playerList[game.active].resource[Resource.Wool] >= 1
                        && game.playerList[game.active].resource[Resource.Ore] >= 1
                        && game.playerList[game.active].resource[Resource.Grain] >= 1
                        && game.card.length > 0
                    ) {
                        return function () {
                            Game.send('s');
                        };
                    }
                } ());
                Game.addSprite('view/btn.png', 8, 640, 375, 80, 25, function () {
                    Game.send('w');
                });
                Game.addSprite('view/btn.png', 9, 730, 375, 80, 25, function () {
                    Game.send('t');
                });
                Game.addSprite('view/btn.png', 10, 550, 405, 80, 25, function () {
                    if (game.playerList[game.active].score + game.playerList[game.active].bonus >= 10) {
                        return function () {
                            Game.send('B');
                        };
                    }
                } ());
                Game.addSprite('view/btn.png', 11, 640, 405, 80, 25, function () {
                    Game.send('C');
                });
                Game.addCardCommand(game);
                break;
            case Phase.BuildRoad:
            case Phase.RoadBuilding1:
            case Phase.RoadBuilding2:
                Game.addLabel('道を建設して下さい。', 595, 410);
                break;
            case Phase.BuildSettlement:
                Game.addLabel('家を建設して下さい。', 595, 410);
                break;
            case Phase.BuildCity:
                Game.addLabel('街を建設して下さい。', 595, 410);
                break;
            case Phase.InternationalTrade:
                Game.addInternationalTradeCommand(game);
                break;
            case Phase.DomesticTrade1:
                Game.addDomesticTrade1Command(game);
                break;
            case Phase.YearOfPlenty1:
            case Phase.YearOfPlenty2:
                Game.addYearOfPlentyCommand(game);
                break;
            case Phase.Monopoly:
                Game.addMonopolyCommand(game);
                break;
        }
    }
    switch (game.phase) {
        case Phase.Burst:
            Game.addSprite('view/skin.png', 0, 525, 338, 313, 180);
            for (i = 0; i < 4; i++) Game.addBurstCommand(game, i);
            break;
        case Phase.DomesticTrade2:
            if(game.playerList[game.trade.playerIdx].uid === uid) Game.addDomesticTrade2Command(game);
            break;
    }
}

Game.addBurstCommand = function (game, playerIdx) {
    var i;

    if (game.playerList[playerIdx].burst > 0) {
        if (game.playerList[playerIdx].uid === uid) {
            Game.addLabel('バースト中<br/>あと' + game.playerList[playerIdx].burst + '枚破棄', 530, 45 * playerIdx + 345);
            for (i = 0; i < 5; i++) {
                Game.addSprite('view/rsrcbtn.png', i + 5, i * 45 + 615, 45 * playerIdx + 346, 30, 30, function () {
                    var _playerIdx = playerIdx, _i = i;

                    if (game.playerList[_playerIdx].resource[_i] > 0) {
                        return function () {
                            Game.send('j' + _playerIdx + ' ' + _i);
                        };
                    }
                } ());
            }
        } else {
            Game.addLabel('バースト中 あと' + game.playerList[playerIdx].burst + '枚破棄', 545, 45 * playerIdx + 348, '24px monospace');
        }
    } else {
        Game.addLabel('待機中', 655, 45 * playerIdx + 348, '24px monospace');
    }
}

Game.addInternationalTradeCommand = function (game) {
    var i, cost, req, pool;

    Game.addSprite('view/skin.png', 2, 525, 338, 313, 180);
    Game.addLabel('海外貿易ができます。', 535, 345);
    Game.addLabel('残り:', 750, 456);
    pool = Game.addLabel('' + Game.trade.pool, 795, 456);
    for (i = 0; i < 5; i++) {
        if (game.playerList[game.active].harbor[i]) {
            cost = 2;
        } else if (game.playerList[game.active].harbor[Harbor.Generic]) {
            cost = 3;
        } else {
            cost = 4;
        }
        Game.addLabel(cost, i * 53 + 580, 365);
        req = Game.addLabel('' + Game.trade.destroy[i], i * 53 + 572, 390);
        Game.addSprite('view/updown.png', 0, i * 53 + 593, 383, 15, 15, function () {
            var _i = i, _cost = cost, _pool = pool, _req = req;

            return function () {
                if (Game.trade.destroy[_i] + _cost <= game.playerList[game.active].resource[_i]) {
                    Game.trade.destroy[_i] += _cost;
                    Game.trade.pool++;
                    _req.text = '' + Game.trade.destroy[_i];
                    _pool.text = '' + Game.trade.pool;
                }
            };
        } ());
        Game.addSprite('view/updown.png', 1, i * 53 + 593, 397, 15, 15, function () {
            var _i = i, _cost = cost, _pool = pool, _req = req;

            return function () {
                if (Game.trade.destroy[_i] - _cost <= game.playerList[game.active].resource[_i]) {
                    Game.trade.destroy[_i] -= _cost;
                    Game.trade.pool--;
                    _req.text = '' + Game.trade.destroy[_i];
                    _pool.text = '' + Game.trade.pool;
                }
            };
        } ());
        req = Game.addLabel('' + Game.trade.create[i], i * 53 + 572, 421);
        Game.addSprite('view/updown.png', 0, i * 53 + 593, 414, 15, 15, function () {
            var _i = i, _pool = pool, _req = req;

            return function () {
                if (Game.trade.pool > 0) {
                    Game.trade.create[_i]++;
                    Game.trade.pool--;
                    _req.text = '' + Game.trade.create[_i];
                    _pool.text = '' + Game.trade.pool;
                }
            };
        } ());
        Game.addSprite('view/updown.png', 1, i * 53 + 593, 428, 15, 15, function () {
            var _i = i, _pool = pool, _req = req;

            return function () {
                if (Game.trade.create[_i] > 0) {
                    Game.trade.create[_i]--;
                    Game.trade.pool++;
                    _req.text = '' + Game.trade.create[_i];
                    _pool.text = '' + Game.trade.pool;
                }
            };
        } ());
    }
    Game.addSprite('view/btn.png', 12, 550, 452, 80, 25, function () {
        if (
            Game.trade.pool === 0
            && Game.trade.destroy.join('') !== '00000'
        ) {
            Game.send('v' + Game.trade.destroy.join(' ') + ' ' + Game.trade.create.join(' '));
        }
    });
    Game.addSprite('view/btn.png', 13, 640, 452, 80, 25, function () {
        Game.send('u');
    });
}

Game.addDomesticTrade1Command = function (game) {
    var i, req;

    Game.addSprite('view/skin.png', 2, 525, 338, 313, 180);
    Game.addLabel('国内貿易ができます。', 535, 345);
    for (i = 0; i < 5; i++) {
        req = Game.addLabel('' + Game.trade.destroy[i], i * 53 + 572, 390);
        Game.addSprite('view/updown.png', 0, i * 53 + 593, 383, 15, 15, function () {
            var _i = i, _req = req;
            return function () {
                if (Game.trade.destroy[_i] + 1 <= game.playerList[game.active].resource[_i]) {
                    Game.trade.destroy[_i]++;
                    _req.text = '' + Game.trade.destroy[_i];
                }
            };
        } ());
        Game.addSprite('view/updown.png', 1, i * 53 + 593, 397, 15, 15, function () {
            var _i = i, _req = req;
            return function () {
                if (Game.trade.destroy[_i] > 0) {
                    Game.trade.destroy[_i]--;
                    _req.text = '' + Game.trade.destroy[_i];
                }
            };
        } ());
        req = Game.addLabel('' + Game.trade.create[i], i * 53 + 572, 421);
        Game.addSprite('view/updown.png', 0, i * 53 + 593, 414, 15, 15, function () {
            var _i = i, _req = req;
            return function () {
                if (Game.trade.create[_i] < 19) {
                    Game.trade.create[_i]++;
                    _req.text = '' + Game.trade.create[_i];
                }
            };
        } ());
        Game.addSprite('view/updown.png', 1, i * 53 + 593, 428, 15, 15, function () {
            var _i = i, _req = req;
            return function () {
                if (Game.trade.create[_i] > 0) {
                    Game.trade.create[_i]--;
                    _req.text = '' + Game.trade.create[_i];
                }
            };
        } ());
    }
    Game.addSprite('view/btn.png', 14, 550, 452, 80, 25, function () {
        if (game.active !== 0) {
            return function () {
                Game.send('y0 ' + Game.trade.destroy.join(' ') + ' ' + Game.trade.create.join(' '));
            };
        }
    } ());
    Game.addSprite('view/btn.png', 15, 640, 452, 80, 25, function () {
        if (game.active !== 1) {
            return function () {
                Game.send('y1 ' + Game.trade.destroy.join(' ') + ' ' + Game.trade.create.join(' '));
            };
        }
    } ());
    Game.addSprite('view/btn.png', 16, 730, 452, 80, 25, function () {
        if (game.active !== 2) {
            return function () {
                Game.send('y2 ' + Game.trade.destroy.join(' ') + ' ' + Game.trade.create.join(' '));
            };
        }
    } ());
    Game.addSprite('view/btn.png', 17, 550, 482, 80, 25, function () {
        if (game.active !== 3) {
            return function () {
                Game.send('y3 ' + Game.trade.destroy.join(' ') + ' ' + Game.trade.create.join(' '));
            };
        }
    } ());
    Game.addSprite('view/btn.png', 13, 640, 482, 80, 25, function () {
        Game.send('x');
    });
}

Game.addDomesticTrade2Command = function (game) {
    var i;

    Game.addSprite('view/skin.png', 2, 525, 338, 313, 180);
    Game.addLabel('海外貿易(提案)が' + game.playerList[game.active].uid + '(' + Game.color(game.active) + ')から着ています。', 535, 345);
    for (i = 0; i < 5; i++) {
        Game.addLabel(' ' + game.trade.destroy[i], i * 53 + 572, 390);
        Game.addLabel(' ' + game.trade.create[i], i * 53 + 572, 421);
    }
    Game.addSprite('view/btn.png', 12, 550, 452, 80, 25, function () {
        Game.send('A');
    });
    Game.addSprite('view/btn.png', 13, 640, 452, 80, 25, function () {
        Game.send('z');
    });
}

Game.addCardCommand = function (game) {
    Game.addSprite('view/btn.png', 18, 550, 448, 80, 25, function () {
        if (
            !game.playerList[game.active].isPlayedCard
            && game.playerList[game.active].wakeCard[Card.Soldier] > 0
        ) {
            return function () {
                Game.send('D');
            };
        }
    } ());
    Game.addSprite('view/btn.png', 19, 640, 448, 80, 25, function () {
        if (
            !game.playerList[game.active].isPlayedCard
            && game.playerList[game.active].wakeCard[Card.RoadBuilding] > 0
            && Game.canBuildRoads(game)
        ) {
            return function () {
                Game.send('G');
            };
        }
    } ());
    Game.addSprite('view/btn.png', 20, 730, 448, 80, 25, function () {
        if (
            !game.playerList[game.active].isPlayedCard
            && game.playerList[game.active].wakeCard[Card.YearOfPlenty] > 0
            && Game.sumResource(game)
        ) {
            return function () {
                Game.send('J');
            };
        }
    } ());
    Game.addSprite('view/btn.png', 21, 550, 478, 80, 25, function () {
        if(
            !game.playerList[game.active].isPlayedCard
            && game.playerList[game.active].wakeCard[Card.Monopoly] > 0
        ) {
            return function () {
                Game.send('M');
            };
        }
    }());
}

Game.addYearOfPlentyCommand = function (game) {
    var i;

    Game.addLabel('資源を１枚生産して下さい。', 535, 345);

    for (i = 0; i < 5; i++) {
        Game.addSprite('view/rsrcbtn.png', i + 10, i * 45 + 575, 410, 30, 30, function () {
            var _i = i;

            if (game.resource[_i] > 0) {
                switch (game.phase) {
                    case Phase.YearOfPlenty1:
                        return function () {
                            Game.send('K' + _i);
                        };
                    case Phase.YearOfPlenty2:
                        return function () {
                            Game.send('L' + _i);
                        };
                }
            }
        } ());
    }
}

Game.addMonopolyCommand = function (game) {
    var i;

    Game.addLabel('資源を独占して下さい。', 535, 345);

    for (i = 0; i < 5; i++) {
        Game.addSprite('view/rsrcbtn.png', i, i * 45 + 575, 410, 30, 30, function () {
            var _i = i;

            return function () {
                Game.send('N' + _i);
            };
        } ());
    }
}

Game.addPlayer = function (game, playerIdx) {
    var i, j, k;

    if (
        game.state === State.Play
        && game.active === playerIdx
    ) Game.addSprite('view/actv.png', 0, 549, 78 * playerIdx + 26, 107, 21);
    Game.addLabel(game.playerList[playerIdx].uid, 551, 78 * playerIdx + 28);
    if (
        game.state === State.Ready
        || game.playerList[playerIdx].uid === uid
    ) {
        Game.addLabel(
            game.playerList[playerIdx].score + '点(+' + game.playerList[playerIdx].bonus + ')', 661, 78 * playerIdx + 28, '12px monospace'
        );
    } else {
        Game.addLabel('??点(+?)', 661, 78 * playerIdx + 28, '12px monospace');
    }
    Game.addLabel('道' + game.playerList[playerIdx].road, 715, 78 * playerIdx + 28, '12px monospace');
    Game.addLabel('家' + game.playerList[playerIdx].settlement, 745, 78 * playerIdx + 28, '12px monospace');
    Game.addLabel('街' + game.playerList[playerIdx].city, 770, 78 * playerIdx + 28, '12px monospace');
    if (game.largestArmy === playerIdx) Game.addSprite('view/prize.png', 0, 799, 78 * playerIdx + 26, 20, 20);
    if (game.longestRoad === playerIdx) Game.addSprite('view/prize.png', 1, 818, 78 * playerIdx + 26, 20, 20);
    k = 0;
    for (i = 0; i < game.playerList[playerIdx].resource.length; i++) {
        for (j = 0; j < game.playerList[playerIdx].resource[i]; j++) {
            if (
                game.state === State.Ready
                || game.playerList[playerIdx].uid === uid
            ) {
                Game.addSprite('view/resource.png', i, k * 16 + 526, 78 * playerIdx + 50, 15, 15);
            } else {
                Game.addSprite('view/resource.png', 5, k * 16 + 526, 78 * playerIdx + 50, 15, 15);
            }
            k++;
        }
    }
    Game.addCard(game, playerIdx);
}

Game.addCard = function (game, playerIdx) {
    var i, j, k;

    k = 0;
    for (i = 0; i < 5; i++) {
        for (j = 0; j < (game.playerList[playerIdx].sleepCard[i] + game.playerList[playerIdx].wakeCard[i]); j++) {
            if (
                game.state === State.Ready
                || game.playerList[playerIdx].uid === uid
            ) {
                Game.addSprite('view/card.png', i, k * 15 + 526, 78 * playerIdx + 68, 30, 30);
            } else {
                Game.addSprite('view/card.png', 5, k * 15 + 526, 78 * playerIdx + 68, 30, 30);
            }
            k++;
        }
    }
    for (i = 0; i < 5; i++) {
        for (j = 0; j < game.playerList[playerIdx].deadCard[i]; j++) {
            Game.addSprite('view/card.png', i, k * 15 + 551, 78 * playerIdx + 68, 30, 30);
            k++;
        }
    }
}

Game.addStock = function (game) {
    var i, sprite;

    for (i = 0; i < game.resource.length; i++) {
        sprite = new Sprite(48, 38);
        sprite.y = 14;
        sprite.x = i * 51 + 90;
        sprite.image = new Surface(48, 38);
        sprite.image.context.strokeStyle = 'black';
        switch (i) {
            case Resource.Brick:
                sprite.image.context.fillStyle = 'rgb(136,0,21)';
                break;
            case Resource.Wool:
                sprite.image.context.fillStyle = 'rgb(181,230,29)';
                break;
            case Resource.Ore:
                sprite.image.context.fillStyle = 'rgb(127,127,127)';
                break;
            case Resource.Grain:
                sprite.image.context.fillStyle = 'rgb(255,242,0)';
                break;
            case Resource.Lumber:
                sprite.image.context.fillStyle = 'rgb(34,177,76)';
                break;
        }
        sprite.image.context.fillRect(0, 38 - game.resource[i] * 2, 48, game.resource[i] * 2);
        sprite.image.context.strokeRect(0, 0, 48, 38);
        Game.core.rootScene.addChild(sprite);
    }
    sprite = new Sprite(48, 50);
    sprite.y = 2;
    sprite.x = 380;
    sprite.image = new Surface(48, 50);
    sprite.image.context.strokeStyle = 'black';
    sprite.image.context.fillStyle = 'rgb(185,122,87)';
    sprite.image.context.fillRect(0, 50 - game.card.length * 2, 48, game.card.length * 2);
    sprite.image.context.strokeRect(0, 0, 48, 50);
    Game.core.rootScene.addChild(sprite);
}

Game.addHarbor = function (game) {
    var i, j, x, y, frame;

    for (i = 0; i < game.harbor.length; i++) {
        for (j = 0; j < Sea[game.harbor[i]].length; j++) {
            if (i === 5 && j === 0) {
                x = 10;
            } else if ((i === 4 && j === 2) || (i === 5 && j === 1)) {
                x = 46;
            } else if ((i === 4 && j === 1) || (i === 5 && j === 2)) {
                x = 82;
            } else if ((i === 0 && j === 0) || (i === 4 && j === 0)) {
                x = 118;
            } else if ((i === 0 && j === 1) || (i === 3 && j === 2)) {
                x = 189;
            } else if ((i === 0 && j === 2) || (i === 3 && j === 1)) {
                x = 261;
            } else if ((i === 1 && j === 0) || (i === 3 && j === 0)) {
                x = 334;
            } else if ((i === 1 && j === 1) || (i === 2 && j === 2)) {
                x = 371;
            } else if ((i === 1 && j === 2) || (i === 2 && j === 1)) {
                x = 406;
            } else if (i === 2 && j === 0) {
                x = 442;
            }
            if (i === 0 || (i === 1 && j === 0)) {
                y = 53;
            } else if ((i === 1 && j === 1) || (i === 5 && j === 2)) {
                y = 116;
            } else if ((i === 1 && j === 2) || (i === 5 && j === 1)) {
                y = 179;
            } else if ((i === 5 && j === 0) || (i === 2 && j === 0)) {
                y = 242;
            } else if ((i === 2 && j === 1) || (i === 4 && j === 2)) {
                y = 305;
            } else if ((i === 2 && j === 2) || (i === 4 && j === 1)) {
                y = 368;
            } else if (i === 3 || (i === 4 && j === 0)) {
                y = 431;
            }
            if (Sea[game.harbor[i]][j] === Harbor.None) {
                Game.addSprite('view/tile.png', 6, x, y, 73, 85);
            } else {
                if ((i === 5 && j === 2) || (i === 0 && j === 0) || (i === 0 && j === 1)) frame = 9;
                if ((i === 0 && j === 2) || (i === 1 && j === 0) || (i === 1 && j === 1)) frame = 10;
                if ((i === 1 && j === 2) || (i === 2 && j === 0) || (i === 2 && j === 1)) frame = 11;
                if ((i === 2 && j === 2) || (i === 3 && j === 0) || (i === 3 && j === 1)) frame = 12;
                if ((i === 3 && j === 2) || (i === 4 && j === 0) || (i === 4 && j === 1)) frame = 7;
                if ((i === 4 && j === 2) || (i === 5 && j === 0) || (i === 5 && j === 1)) frame = 8;
                Game.addSprite('view/tile.png', frame, x, y, 73, 85);
                Game.addSprite('view/chip.png', 10 + Sea[game.harbor[i]][j], x + 21, y + 27, 30, 30);
            }
        }
    }
}

Game.addTileList = function (game) {
    var i, x, y;

    for (i = 0; i < game.tileList.length; i++) {
        if (i >= 0 && i < 3) {
            x = i * 72 + 154;
            y = 116;
        } else if (i >= 3 && i < 7) {
            x = (i - 3) * 72 + 118;
            y = 179;
        } else if (i >= 7 && i < 12) {
            x = (i - 7) * 72 + 82;
            y = 242;
        } else if (i >= 12 && i < 16) {
            x = (i - 12) * 72 + 118;
            y = 305;
        } else if (i >= 16 && i < 19) {
            x = (i - 16) * 72 + 154;
            y = 368;
        }
        if (game.tileList[i] === -1) {
            Game.addSprite('view/tile.png', 5, x, y, 73, 85);
        } else {
            Game.addSprite('view/tile.png', game.tileList[i], x, y, 73, 85);
        }
    }
}

Game.addNumList = function (game) {
    var i, x, y;

    for (i = 0; i < game.numList.length; i++) {
        if (game.numList[i] !== -1) {
            if (i >= 0 && i < 3) {
                x = i * 72 + 175;
                y = 143;
            } else if (i >= 3 && i < 7) {
                x = (i - 3) * 72 + 139;
                y = 206;
            } else if (i >= 7 && i < 12) {
                x = (i - 7) * 72 + 103;
                y = 269;
            } else if (i >= 12 && i < 16) {
                x = (i - 12) * 72 + 139;
                y = 332;
            } else if (i >= 16 && i < 19) {
                x = (i - 16) * 72 + 175;
                y = 395;
            }
            if (game.numList[i] < 7) {
                Game.addSprite('view/chip.png', game.numList[i] - 2, x, y, 30, 30);
            } else {
                Game.addSprite('view/chip.png', game.numList[i] - 3, x, y, 30, 30);
            }
        }
    }
}

Game.addRoad = function (game) {
    var i, x, y;

    for (i = 0; i < game.roadList.length; i++) {
        if (game.roadList[i] !== -1) {
            if (i === 33) {
                x = 67;
            } else if (i === 23 || i === 39) {
                x = 85;
            } else if (i === 18 || i === 49) {
                x = 103;
            } else if (i === 10 || i === 24 || i === 40 || i === 54) {
                x = 122;
            } else if (i === 6 || i === 34 || i === 62) {
                x = 139;
            } else if (i === 0 || i === 11 || i === 25 || i === 41 || i === 55 || i === 66) {
                x = 157;
            } else if (i === 19 || i === 50) {
                x = 175;
            } else if (i === 1 || i === 12 || i === 26 || i === 42 || i === 56 || i === 67) {
                x = 193;
            } else if (i === 7 || i === 35 || i === 63) {
                x = 211;
            } else if (i === 2 || i === 13 || i === 27 || i === 43 || i === 57 || i === 68) {
                x = 230;
            } else if (i === 20 || i === 51) {
                x = 247;
            } else if (i === 3 || i === 14 || i === 28 || i === 44 || i === 58 || i === 69) {
                x = 265;
            } else if (i === 8 || i === 36 || i === 64) {
                x = 283;
            } else if (i === 4 || i === 15 || i === 29 || i === 45 || i === 59 || i === 70) {
                x = 302;
            } else if (i === 21 || i === 52) {
                x = 319;
            } else if (i === 5 || i === 16 || i === 30 || i === 46 || i === 60 || i === 71) {
                x = 337;
            } else if (i === 9 || i === 37 || i === 65) {
                x = 355;
            } else if (i === 17 || i === 31 || i === 47 || i === 61) {
                x = 373;
            } else if (i === 22 || i === 53) {
                x = 391;
            } else if (i === 32 || i === 48) {
                x = 410;
            } else if (i === 38) {
                x = 427;
            }
            if (i < 6) {
                y = 112;
            } else if (i >= 6 && i < 10) {
                y = 144;
            } else if (i >= 10 && i < 18) {
                y = 176;
            } else if (i >= 18 && i < 23) {
                y = 208;
            } else if (i >= 23 && i < 33) {
                y = 240;
            } else if (i >= 33 && i < 39) {
                y = 271;
            } else if (i >= 39 && i < 49) {
                y = 302;
            } else if (i >= 49 && i < 54) {
                y = 333;
            } else if (i >= 54 && i < 62) {
                y = 365;
            } else if (i >= 62 && i < 66) {
                y = 396;
            } else if (i >= 66) {
                y = 427;
            }
            if (
                i === 1 || i === 3 || i === 5 || i === 11 || i === 13 || i === 15 || i === 17
                || i === 24 || i === 26 || i === 28 || i === 30 || i === 32 || i === 39 || i === 41
                || i === 43 || i === 45 || i === 47 || i === 54 || i === 56 || i === 58 || i === 60
                || i === 66 || i === 68 || i === 70
            ) {
                Game.addSprite('view/road.png', game.roadList[i] * 3 + 1, x, y, 30, 30);
            } else if (
                (i >= 6 && i < 10) || (i >= 18 && i < 23) || (i >= 33 && i < 39)
                || (i >= 49 && i < 54) || (i >= 62 && i < 66)
            ) {
                Game.addSprite('view/road.png', game.roadList[i] * 3 + 2, x, y, 30, 30);
            } else {
                Game.addSprite('view/road.png', game.roadList[i] * 3, x, y, 30, 30);
            }
        }
    }
}

Game.addSettlementList = function (game) {
    var i, j, x, y, frame;

    for (i = 0; i < game.settlementList.length; i++) {
        if (i === 21 || i === 27) {
            x = 67;
        } else if (i === 11 || i === 16 || i === 33 || i === 38) {
            x = 103;
        } else if (i === 3 || i === 7 || i === 22 || i === 28 || i === 43 || i === 47) {
            x = 139;
        } else if (i === 0 || i === 12 || i === 17 || i === 34 || i === 39 || i === 51) {
            x = 175;
        } else if (i === 4 || i === 8 || i === 23 || i === 29 || i === 44 || i === 48) {
            x = 211;
        } else if (i === 1 || i === 13 || i === 18 || i === 35 || i === 40 || i === 52) {
            x = 247;
        } else if (i === 5 || i === 9 || i === 24 || i === 30 || i === 45 || i === 49) {
            x = 283;
        } else if (i === 2 || i === 14 || i === 19 || i === 36 || i === 41 || i === 53) {
            x = 319;
        } else if (i === 6 || i === 10 || i === 25 || i === 31 || i === 46 || i === 50) {
            x = 355;
        } else if (i === 15 || i === 20 || i === 37 || i === 42) {
            x = 391;
        } else if (i === 26 || i === 32) {
            x = 427;
        }
        if (i < 3) {
            y = 98;
        } else if (i >= 3 && i < 7) {
            y = 119;
        } else if (i >= 7 && i < 11) {
            y = 161;
        } else if (i >= 11 && i < 16) {
            y = 182;
        } else if (i >= 16 && i < 21) {
            y = 224;
        } else if (i >= 21 && i < 27) {
            y = 245;
        } else if (i >= 27 && i < 33) {
            y = 287;
        } else if (i >= 33 && i < 38) {
            y = 308;
        } else if (i >= 38 && i < 43) {
            y = 350;
        } else if (i >= 43 && i < 47) {
            y = 371;
        } else if (i >= 47 && i < 51) {
            y = 413;
        } else if (i >= 51) {
            y = 434;
        }
        switch (game.settlementList[i] & 0xff00) {
            case SettlementRank.None:
                frame = 8;
                break;
            case SettlementRank.Settlement:
                frame = (game.settlementList[i] & 0x00ff) * 2;
                break;
            case SettlementRank.City:
                frame = (game.settlementList[i] & 0x00ff) * 2 + 1;
                break;
        }
        Game.addSprite('view/settlement.png', frame, x, y, 30, 30, function () {
            var _i = i, _playerIdx;

            switch (game.settlementList[_i] & 0xff00) {
                case SettlementRank.None:
                    if (
                        game.state === State.Play
                        && game.playerList[game.active].uid === uid
                    ) {
                        switch (game.phase) {
                            case Phase.SetupSettlement1:
                                if (Game.canSetupSettlement(game, _i)) {
                                    return function () {
                                        Game.send('e' + _i);
                                    };
                                };
                                break;
                            case Phase.SetupSettlement2:
                                if (Game.canSetupSettlement(game, _i)) {
                                    return function () {
                                        Game.send('g' + _i);
                                    };
                                }
                                break;
                            case Phase.BuildSettlement:
                                if (Game.canSetupSettlement(game, _i)) {
                                    return function () {
                                        Game.send('p' + _i);
                                    };
                                }
                                break;
                        }
                    }
                    break;
                case SettlementRank.Settlement:
                case SettlementRank.City:
                    if ((game.settlementList[_i] & 0xff00) === SettlementRank.Settlement) {
                        if (
                            game.phase === Phase.BuildCity
                            && (game.settlementList[_i] & 0x00ff) === game.active
                         ) {
                            return function () {
                                Game.send('r' + _i);
                            };
                        }
                    }
                    if (
                        (game.phase === Phase.Robber2 || game.phase === Phase.Soldier2)
                        && (game.settlementList[_i] & 0x00ff) !== game.active
                        && Game.playerSumResource(game.playerList[(game.settlementList[_i] & 0x00ff)]) > 0
                    ) {
                        for (j in TileLink[game.robber]) {
                            if (TileLink[game.robber][j] === _i) {
                                _playerIdx = (game.settlementList[_i] & 0x00ff);
                                if (game.phase === Phase.Robber2) {
                                    return function () {
                                        Game.send('l' + _playerIdx);
                                    };
                                } else {
                                    return function () {
                                        Game.send('F' + _playerIdx);
                                    };
                                }
                            }
                        }
                    }
                    break;
            }
        } ());
    }
}

Game.addBuildRoad = function (game) {
    var i, x, y;

    if (
        game.state !== State.Play
        || game.playerList[game.active].uid !== uid
    ) return;

    if (
        game.phase !== Phase.SetupRoad1
        && game.phase !== Phase.SetupRoad2
        && game.phase !== Phase.BuildRoad
        && game.phase !== Phase.RoadBuilding1
        && game.phase !== Phase.RoadBuilding2
    ) return;

    for (i = 0; i < game.roadList.length; i++) {
        if (game.roadList[i] === -1) {
            if (i === 33) {
                x = 67;
            } else if (i === 23 || i === 39) {
                x = 85;
            } else if (i === 18 || i === 49) {
                x = 103;
            } else if (i === 10 || i === 24 || i === 40 || i === 54) {
                x = 122;
            } else if (i === 6 || i === 34 || i === 62) {
                x = 139;
            } else if (i === 0 || i === 11 || i === 25 || i === 41 || i === 55 || i === 66) {
                x = 157;
            } else if (i === 19 || i === 50) {
                x = 175;
            } else if (i === 1 || i === 12 || i === 26 || i === 42 || i === 56 || i === 67) {
                x = 193;
            } else if (i === 7 || i === 35 || i === 63) {
                x = 211;
            } else if (i === 2 || i === 13 || i === 27 || i === 43 || i === 57 || i === 68) {
                x = 230;
            } else if (i === 20 || i === 51) {
                x = 247;
            } else if (i === 3 || i === 14 || i === 28 || i === 44 || i === 58 || i === 69) {
                x = 265;
            } else if (i === 8 || i === 36 || i === 64) {
                x = 283;
            } else if (i === 4 || i === 15 || i === 29 || i === 45 || i === 59 || i === 70) {
                x = 302;
            } else if (i === 21 || i === 52) {
                x = 319;
            } else if (i === 5 || i === 16 || i === 30 || i === 46 || i === 60 || i === 71) {
                x = 337;
            } else if (i === 9 || i === 37 || i === 65) {
                x = 355;
            } else if (i === 17 || i === 31 || i === 47 || i === 61) {
                x = 373;
            } else if (i === 22 || i === 53) {
                x = 391;
            } else if (i === 32 || i === 48) {
                x = 410;
            } else if (i === 38) {
                x = 427;
            }
            if (i < 6) {
                y = 112;
            } else if (i >= 6 && i < 10) {
                y = 144;
            } else if (i >= 10 && i < 18) {
                y = 176;
            } else if (i >= 18 && i < 23) {
                y = 208;
            } else if (i >= 23 && i < 33) {
                y = 240;
            } else if (i >= 33 && i < 39) {
                y = 271;
            } else if (i >= 39 && i < 49) {
                y = 302;
            } else if (i >= 49 && i < 54) {
                y = 333;
            } else if (i >= 54 && i < 62) {
                y = 365;
            } else if (i >= 62 && i < 66) {
                y = 396;
            } else if (i >= 66) {
                y = 427;
            }
            Game.addSprite('view/road.png', 12, x, y, 30, 30, function () {
                var _i = i, j, isSecond;

                if (Game.canBuildRoad(game, _i)) {
                    switch (game.phase) {
                        case Phase.SetupRoad1:
                            return function () {
                                Game.send('f' + _i);
                            };
                        case Phase.SetupRoad2:
                            for (j in SettlementLink[game.playerList[game.active].secondSettlement]) {
                                if (SettlementLink[game.playerList[game.active].secondSettlement][j] === _i) {
                                    return function () {
                                        Game.send('h' + _i);
                                    };
                                }
                            }
                            break;
                        case Phase.BuildRoad:
                            return function () {
                                Game.send('n' + _i);
                            };
                        case Phase.RoadBuilding1:
                            return function () {
                                Game.send('H' + _i);
                            };
                        case Phase.RoadBuilding2:
                            return function () {
                                Game.send('I' + _i);
                            };
                    }
                }
            } ());
        }
    }
}

Game.addRobber = function (game) {
    var i, x, y;

    if (game.robber !== -1) {
        if (game.robber >= 0 && game.robber < 3) {
            x = game.robber * 72 + 166;
            y = 135;
        } else if (game.robber >= 3 && game.robber < 7) {
            x = (game.robber - 3) * 72 + 130;
            y = 198;
        } else if (game.robber >= 7 && game.robber < 12) {
            x = (game.robber - 7) * 72 + 94;
            y = 261;
        } else if (game.robber >= 12 && game.robber < 16) {
            x = (game.robber - 12) * 72 + 130;
            y = 324;
        } else if (game.robber >= 16 && game.robber < 19) {
            x = (game.robber - 16) * 72 + 166;
            y = 387;
        }
        Game.addSprite('view/robber.png', 0, x, y, 50, 50);
        if (
            (game.phase === Phase.Robber1 || game.phase === Phase.Soldier1)
            && game.playerList[game.active].uid === uid
        ) {
            for (i = 0; i < game.tileList.length; i++) {
                if (i !== game.robber) {
                    sprite = new Sprite(50, 50);
                    sprite.image = Game.core.assets['view/robber.png'];
                    sprite.frame = 1;
                    if (i >= 0 && i < 3) {
                        x = i * 72 + 166;
                        y = 135;
                    } else if (i >= 3 && i < 7) {
                        x = (i - 3) * 72 + 130;
                        y = 198;
                    } else if (i >= 7 && i < 12) {
                        x = (i - 7) * 72 + 94;
                        y = 261;
                    } else if (i >= 12 && i < 16) {
                        x = (i - 12) * 72 + 130;
                        y = 324;
                    } else if (i >= 16 && i < 19) {
                        x = (i - 16) * 72 + 166;
                        y = 387;
                    }
                    Game.addSprite('view/robber.png', 1, x, y, 50, 50, function () {
                        var _i = i;

                        switch (game.phase) {
                            case Phase.Robber1:
                                return function () {
                                    Game.send('k' + _i);
                                };
                            case Phase.Soldier1:
                                return function () {
                                    Game.send('E' + _i);
                                };
                        }
                    } ());
                }
            }
        }
    }
}

Game.addDice = function (game) {
    if (game.dice1 === 0) return;

    Game.addSprite('view/dice.png', game.dice1 - 1, 30, 460, 30, 30);
    Game.addSprite('view/dice.png', game.dice2 - 1, 65, 460, 30, 30);
}

Game.addSound = function (game) {
    var frame;

    if (Game.isMute) {
        frame = 23;
    } else {
        frame = 22;
    }
    Game.addSprite('view/btn.png', frame, 445, 495, 80, 25, function () {
        Game.isMute = !Game.isMute;
        if (Game.isMute) {
            this.frame = 23;
        } else {
            this.frame = 22;
        }
    });
}

Game.canSetupSettlement = function (game, pt) {
    var i, j, result = true;

    for (i in SettlementLink[pt]) {
        for (j in RoadLink[SettlementLink[pt][i]]) {
            if ((game.settlementList[RoadLink[SettlementLink[pt][i]][j]] & 0xff00) !== SettlementRank.None) {
                result = false;
                break;
            }
        }
        if (!result) break;
    }
    return result;
}

Game.canBuildSettlement = function (game, pt) {
    var i, j, result = false;

    for (i in SettlementLink[pt]) {
        if (game.roadList[SettlementLink[pt][i]] === game.active) {
            result = true;
            for (j in RoadLink[SettlementLink[pt][i]]) {
                if ((game.settlementList[RoadLink[SettlementLink[pt][i]][j]] & 0xff00) !== SettlementRank.None) {
                    result = false;
                    break;
                }
            }
        }
    }
    return result;
}

Game.canBuildSettlements = function (game) {
    var i, result = false;

    for (i in game.settlementList) {
        result = Game.canBuildSettlement(game, i);
        if (result) break;
    }
    return result;
}

Game.canBuildCity = function (game, pt) {
    if(game.settlementList[pt] === (SettlementRank.Settlement | game.active)) return true;
    return false;
}

Game.canBuildCitys = function (game) {
    var i, result = false;
    for (i in game.settlementList) {
        if (Game.canBuildCity(game, i)) {
            result = true;
            break;
        }
    }
    return result;
}

Game.canBuildRoad = function (game, pt) {
    var i, j, result = false;

    if (game.roadList[pt] === -1) {
        for (i in RoadLink[pt]) {
            if ((game.settlementList[RoadLink[pt][i]] & 0x00ff) === game.active) {
                result = true;
                break;
            }
            for (j in SettlementLink[RoadLink[pt][i]]) {
                if (game.roadList[SettlementLink[RoadLink[pt][i]][j]] === game.active) {
                    result = true;
                    break;
                }
            }
            if (result) break;
        }
    }
    return result;
}

Game.canBuildRoads = function (game) {
    var i, result = false;

    for (i in game.roadList) {
        result = Game.canBuildRoad(game, i);
        if (result) break;
    }
    return result;
}

Game.playerSumResource = function (player) {
    var i, sum = 0;

    for (i in player.resource) sum += player.resource[i];
    return sum;
}

Game.sumResource = function(game) {
    var i, sum = 0;

    for (i in game.resource) sum += game.resource[i];
    return sum;
}

Game.color = function (playerIdx) {
    var result;
    switch (playerIdx) {
        case 0:
            result = '赤';
            break;
        case 1:
            result = '青';
            break;
        case 2:
            result = '黄';
            break;
        case 3:
            result = '緑';
            break;
    }
    return result;
}