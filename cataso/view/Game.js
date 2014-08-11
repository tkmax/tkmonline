enchant();

var Game = function () { }

Game.isOpen = false;
Game.canSend = true;
Game.core = null;

Game.trade = {
      input: [0, 0, 0, 0, 0]
    , output: [0, 0, 0, 0, 0]
    , pool: 0
};

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
        , 'view/map.png'
        , 'view/land.png'
        , 'view/number.png'
        , 'view/robber.png'
        , 'view/active.png'
        , 'view/priority.png'
        , 'view/settlement.png'
        , 'view/road.png'
        , 'view/resource.png'
        , 'view/skin.png'
        , 'view/resource-button.png'
        , 'view/updown.png'
        , 'view/card.png'
        , 'view/prize.png'
        , 'view/dice.png'
        , 'view/signpost.png'
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
    this.addSetupOption(game);
    this.addStock(game);
    this.addHeadLine(game);
    this.addCommand(game);
    this.addDice(game);

    var i;
    for (i = 0; i < game.playerSize; i++) { this.addPlayer(game, i); }

    this.addMap(game);
    this.addRoad(game);
    this.addSettlement(game);
    this.addCanBuildRoad(game);
    this.addCanBuildSettlement(game);
    this.addCanBuildCity(game);
    this.addCanPillageSettlement(game);
    this.addCanMoveRobber(game);
}

Game.removeAll = function () {
    while (this.core.rootScene.childNodes.length > 0) {
        this.core.rootScene.removeChild(this.core.rootScene.childNodes[0]);
    }
}

Game.addSetupOption = function(game) {
    var frame = 0;

    if(game.setup === Option.RANDOM_SETUP) { frame = 1; }

    this.addSprite('view/signpost.png', frame, 2, 2, 30, 30);
}

Game.addHeadLine = function (game) {
    var text = '';
    
    if (game.state === State.READY) {
        text = '募集中';
    } else {
        switch (game.phase) {
            case Phase.SETUP_SETTLEMENT1:
                text = '対戦中 - 初期配置 家(1件目)';
                break;
            case Phase.SETUP_ROAD1:
                text = '対戦中 - 初期配置 道(1本目)';
                break;
            case Phase.SETUP_SETTLEMENT2:
                text = '対戦中 - 初期配置 家(2件目)';
                break;
            case Phase.SETUP_ROAD2:
                text = '対戦中 - 初期配置 道(2本目)';
                break;
            case Phase.DICE:
                text = '対戦中 - ダイス';
                break;
            case Phase.BURST:
                text = '対戦中 - バースト';
                break;
            case Phase.ROBBER1:
                text = '対戦中 - 盗賊(移動)';
                break;
            case Phase.ROBBER2:
                text = '対戦中 - 盗賊(略奪)';
                break;
            case Phase.MAIN:
                text = '対戦中 - メイン';
                break;
            case Phase.BUILD_ROAD:
                text = '対戦中 - 道';
                break;
            case Phase.BUILD_SETTLEMENT:
                text = '対戦中 - 家';
                break;
            case Phase.BUILD_CITY:
                text = '対戦中 - 街';
                break;
            case Phase.INTERNATIONAL_TRADE:
                text = '対戦中 - 海外貿易';
                break;
            case Phase.DOMESTIC_TRADE1:
                text = '対戦中 - 国内貿易';
                break;
            case Phase.DOMESTIC_TRADE2:
                text = '対戦中 - 国内貿易(確認)';
                break;
            case Phase.SOLDIER1:
                text = '対戦中 - 騎士カード(移動)';
                break;
            case Phase.SOLDIER2:
                text = '対戦中 - 騎士カード(略奪)';
                break;
            case Phase.ROAD_BUILDING1:
                text = '対戦中 - 街道カード(1本目)';
                break;
            case Phase.ROAD_BUILDING2:
                text = '対戦中 - 街道カード(2本目)';
                break;
            case Phase.YEAR_OF_PLENTY1:
                text = '対戦中 - 収穫カード(1枚目)';
                break;
            case Phase.YEAR_OF_PLENTY2:
                text = '対戦中 - 収穫カード(2枚目)';
                break;
            case Phase.MONOPOLY:
                text = '対戦中 - 独占カード';
                break;
        }
    }
    
    this.addLabel(text, 502, 6);
}

Game.addCommand = function (game) {
    if (game.state === State.READY) {
        this.addReadyCommand(game);
    } else {
        switch (game.phase) {
            case Phase.SETUP_SETTLEMENT1:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('家を配置して下さい。', 585, 425); }
                break;
            case Phase.SETUP_ROAD1:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('道を配置して下さい。', 585, 425); }
                break;
            case Phase.SETUP_SETTLEMENT2:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('家を配置して下さい。', 585, 425); }
                break;
            case Phase.SETUP_ROAD2:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('道を配置して下さい。', 585, 425); }
                break;
            case Phase.DICE:
                if (this.hasPriorityUid(game, uid)) { this.addDiceCommand(game); }
                break;
            case Phase.BURST:
                this.addBurstCommand(game);
                break;
            case Phase.ROBBER1:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('盗賊を移動して下さい。', 585, 425); }
                break;
            case Phase.ROBBER2:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('資源を略奪して下さい。', 585, 425); }
                break;
            case Phase.MAIN:
                if (this.hasPriorityUid(game, uid)) { this.addMainCommand(game); }
                break;
            case Phase.BUILD_ROAD:
                if (this.hasPriorityUid(game, uid)) {
                    this.addLabel('道を配置して下さい。', 585, 410);
                    
                    this.addSprite('view/button.png', 13, 610, 435, 80, 25, function () {
                        Game.send('e');
                    });
                }
                break;
            case Phase.BUILD_SETTLEMENT:
                if (this.hasPriorityUid(game, uid)) {
                    this.addLabel('家を配置して下さい。', 585, 410);
                    
                    this.addSprite('view/button.png', 13, 610, 435, 80, 25, function () {
                        Game.send('e');
                    });
                }
                break;
            case Phase.BUILD_CITY:
                if (this.hasPriorityUid(game, uid)) {
                    this.addLabel('街を配置して下さい。', 585, 410);
                    
                    this.addSprite('view/button.png', 13, 610, 435, 80, 25, function () {
                        Game.send('e');
                    });
                }
                break;
            case Phase.DOMESTIC_TRADE1:
                if (this.hasPriorityUid(game, uid)) { this.addDomesticTrade1Command(game); }
                break;
            case Phase.DOMESTIC_TRADE2:
                if (this.hasPriorityUid(game, uid)) { this.addDomesticTrade2Command(game); }
                break;
            case Phase.INTERNATIONAL_TRADE:
                if (this.hasPriorityUid(game, uid)) { this.addInternationalTrade(game); }
                break;
            case Phase.SOLDIER1:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('盗賊を移動して下さい。', 585, 425); }
                break;
            case Phase.SOLDIER2:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('資源を略奪して下さい。', 585, 425); }
                break;
            case Phase.ROAD_BUILDING1:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('道を配置して下さい。', 585, 425); }
                break;
            case Phase.ROAD_BUILDING2:
                if (this.hasPriorityUid(game, uid)) { this.addLabel('道を配置して下さい。', 585, 425); }
                break;
            case Phase.YEAR_OF_PLENTY1:
                if (this.hasPriorityUid(game, uid)) { this.addYearOfPlentyCommand(game); }
                break;
            case Phase.YEAR_OF_PLENTY2:
                if (this.hasPriorityUid(game, uid)) { this.addYearOfPlentyCommand(game); }
                break;
            case Phase.MONOPOLY:
                if (this.hasPriorityUid(game, uid)) { this.addMonopolyCommand(game); }
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
        && game.playerList[2].uid !== ''
    ) {
        canStart = true;
    }

    if (canJoin) {
        this.addSprite('view/button.png', 0, 610, 422, 80, 25, function () {
            Game.send('b');
        });
    }

    if (canLeave) {
        this.addSprite('view/button.png', 1, 700, 422, 80, 25, function () {
            Game.send('c');
        });

        if (canStart) {
            this.addSprite('view/button.png', 2, 520, 422, 80, 25, function () {
                Game.send('d');
            });
        }
    }
}

Game.addBurstCommand = function (game) {
    this.addSprite('view/skin.png', 0, 499, 338, 299, 205);

    var i;
    var len1 = game.playerSize;
    for (i = 0; i < len1; i++) {
        if (game.playerList[i].burst > 0) {
            if (game.playerList[i].uid === uid) {
                this.addLabel('バースト中', 509, i * 51 + 345);
                this.addLabel('あと' + game.playerList[i].burst + '枚廃棄', 509, i * 51 + 365);

                var j;
                for (j = 0; j < 5; j++) {
                    this.addSprite('view/resource-button.png', j + 5, j * 40 + 598, i * 51 + 347, 30, 30, function () {
                        if (game.playerList[i].resource[j] > 0) {
                            var _i = i;
                            var _j = j;

                            return function () {
                                Game.send('k' + _i + ' ' + _j);
                            };
                        }
                    }());
                }
            } else {
                this.addLabel('バースト中 あと' + game.playerList[i].burst + '枚廃棄', 517, i * 51 + 350, '24px');
            }
        } else {
            this.addLabel('待機中', 618, i * 51 + 350, '24px');
        }
    }
}

Game.addDomesticTrade1Command = function (game) {
    this.addSprite('view/skin.png', 2, 499, 338, 299, 205);
    
    this.addLabel('国内貿易をして下さい。', 585, 352);

    var i;
    for (i = 0; i < 5; i++) {
        var label = this.addLabel('' + Game.trade.input[i], i * 53 + 542, 405);
        
        this.addSprite('view/updown.png', 0, i * 53 + 563, 398, 15, 15, function () {
            var _i = i;
            var _label = label;

            return function () {
                if (Game.trade.input[_i] + 1 <= game.playerList[game.active].resource[_i]) {
                    _label.text = '' + ++Game.trade.input[_i];
                }
            };
        }());
        
        this.addSprite('view/updown.png', 1, i * 53 + 563, 412, 15, 15, function () {
            var _i = i;
            var _label = label;
            
            return function () {
                if (Game.trade.input[_i] > 0) { _label.text = '' + --Game.trade.input[_i]; }
            };
        }());
        
        label = this.addLabel('' + Game.trade.output[i], i * 53 + 542, 436);
        
        this.addSprite('view/updown.png', 0, i * 53 + 563, 429, 15, 15, function () {
            var _i = i;
            var _label = label;
            
            return function () {
                if (Game.trade.output[_i] < 19) { _label.text = '' + ++Game.trade.output[_i]; }
            };
        }());
        
        this.addSprite('view/updown.png', 1, i * 53 + 563, 443, 15, 15, function () {
            var _i = i;
            var _label = label;
            
            return function () {
                if (Game.trade.output[_i] > 0) { _label.text = '' + --Game.trade.output[_i]; }
            };
        }());
    }
    
    this.addSprite('view/button.png', 14, 520, 470, 80, 25, function () {
        if (game.active !== 0) {
            return function () {
                Game.send('v0 ' + Game.trade.input.join(' ') + ' ' + Game.trade.output.join(' '));
            };
        }
    }());
    
    this.addSprite('view/button.png', 15, 610, 470, 80, 25, function () {
        if (game.active !== 1) {
            return function () {
                Game.send('v1 ' + Game.trade.input.join(' ') + ' ' + Game.trade.output.join(' '));
            };
        }
    }());
    
    this.addSprite('view/button.png', 16, 700, 470, 80, 25, function () {
        if (game.active !== 2) {
            return function () {
                Game.send('v2 ' + Game.trade.input.join(' ') + ' ' + Game.trade.output.join(' '));
            };
        }
    }());
    
    if (game.playerSize === 4) {
        this.addSprite('view/button.png', 17, 520, 500, 80, 25, function () {
            if (game.active !== 3) {
                return function () {
                    Game.send('v3 ' + Game.trade.input.join(' ') + ' ' + Game.trade.output.join(' '));
                };
            }
        }());
    }
    
    this.addSprite('view/button.png', 13, 610, 500, 80, 25, function () {
        Game.send('e');
    });
}

Game.addDomesticTrade2Command = function (game) {
    this.addSprite('view/skin.png', 2, 499, 338, 299, 205);
    
    this.addLabel('国内貿易の提案が着ました。', 565, 352);

    var i;
    for (i = 0; i < 5; i++) {
        this.addLabel('' + game.trade.input[i], i * 53 + 542, 405);
        this.addLabel('' + game.trade.output[i], i * 53 + 542, 436);
    }
    
    this.addSprite('view/button.png', 12, 570, 480, 80, 25, function () {
        Game.send('w');
    });
    
    this.addSprite('view/button.png', 13, 660, 480, 80, 25, function () {
        Game.send('x');
    });
}

Game.addInternationalTrade = function (game) {
    this.addSprite('view/skin.png', 2, 499, 338, 299, 205);
    
    this.addLabel('海外貿易をして下さい。', 585, 352);
    
    var poolLabel = this.addLabel('残り:' + Game.trade.pool, 635, 465);

    var i;
    for (i = 0; i < 5; i++) {
        var cost;

        if (game.playerList[game.active].harbor[i + 1]) {
            cost = 2;
        } else if (game.playerList[game.active].harbor[Harbor.GENERIC]) {
            cost = 3;
        } else {
            cost = 4;
        }
        
        this.addLabel('' + cost, i * 53 + 552, 380);
        
        var tradeLabel = this.addLabel('' + Game.trade.input[i], i * 53 + 542, 405);
        
        this.addSprite('view/updown.png', 0, i * 53 + 563, 398, 15, 15, function () {
            var _i = i;
            var _poolLabel = poolLabel;
            var _tradeLabel = tradeLabel;
            var _cost = cost;
            
            return function () {
                if (Game.trade.input[_i] + _cost <= game.playerList[game.active].resource[_i]) {
                    _poolLabel.text = '残り:' + ++Game.trade.pool;
                    Game.trade.input[_i] += _cost;
                    _tradeLabel.text = '' + Game.trade.input[_i];
                }
            };
        }());
        
        this.addSprite('view/updown.png', 1, i * 53 + 563, 412, 15, 15, function () {
            var _i = i;
            var _poolLabel = poolLabel;
            var _tradeLabel = tradeLabel;
            var _cost = cost;
            
            return function () {
                if (Game.trade.input[_i] > 0) {
                    _poolLabel.text = '残り:' + --Game.trade.pool;
                    Game.trade.input[_i] -= _cost;
                    _tradeLabel.text = '' + Game.trade.input[_i];
                }
            };
        }());
        
        tradeLabel = this.addLabel('' + Game.trade.output[i], i * 53 + 542, 436);
        
        this.addSprite('view/updown.png', 0, i * 53 + 563, 429, 15, 15, function () {
            var _i = i;
            var _poolLabel = poolLabel;
            var _tradeLabel = tradeLabel;
            
            return function () {
                if (Game.trade.pool > 0 && game.resourceStock[_i] > 0) {
                    _poolLabel.text = '残り:' + --Game.trade.pool;
                    _tradeLabel.text = '' + ++Game.trade.output[_i];
                }
            };
        }());
        
        this.addSprite('view/updown.png', 1, i * 53 + 563, 443, 15, 15, function () {
            var _i = i;
            var _poolLabel = poolLabel;
            var _tradeLabel = tradeLabel;
            
            return function () {
                if (Game.trade.output[_i] > 0) {
                    _poolLabel.text = '残り:' + ++Game.trade.pool;
                    _tradeLabel.text = '' + --Game.trade.output[_i];
                }
            };
        }());
    }
    
    this.addSprite('view/button.png', 12, 570, 490, 80, 25, function () {
        var i;
        for (i = 0; i < 5; i++) {
            if (Game.trade.input[i] > 0) {
                Game.send('z' + Game.trade.input.join(' ') + ' ' + Game.trade.output.join(' '));
                break;
            }
        }
    });
    
    this.addSprite('view/button.png', 13, 660, 490, 80, 25, function () {
        Game.send('e');
    });
}

Game.addCardCommand = function (game) {
    this.addSprite('view/button.png', 18, 520, 470, 80, 25, function () {
        if (game.canPlayCard && game.playerList[game.active].wakeCard[Card.SOLDIER] > 0) {
            return function () {
                Game.send('C');
            };
        }
    }());
    
    this.addSprite('view/button.png', 19, 610, 470, 80, 25, function () {
        if (game.canPlayCard && game.playerList[game.active].wakeCard[Card.ROAD_BUILDING] > 0) {
            return function () {
                Game.send('F');
            };
        }
    }());
    
    this.addSprite('view/button.png', 20, 700, 470, 80, 25, function () {
        if (game.canPlayCard && game.playerList[game.active].wakeCard[Card.YEAR_OF_PLENTY] > 0) {
            return function () {
                Game.send('I');
            };
        }
    }());
    
    this.addSprite('view/button.png', 21, 520, 500, 80, 25, function () {
        if (game.canPlayCard && game.playerList[game.active].wakeCard[Card.MONOPOLY] > 0) {
            return function () {
                Game.send('L');
            };
        }
    }());
}

Game.addDiceCommand = function (game) {
    this.addSprite('view/skin.png', 1, 499, 338, 299, 205);
    
    this.addSprite('view/button.png', 3, 570, 384, 80, 25, function () {
        Game.send('j');
    });
    
    this.addSprite('view/button.png', 10, 660, 384, 80, 25, function () {
        if (game.playerList[game.active].baseScore + game.playerList[game.active].bonusScore >= 10) {
            return function () {
                Game.send('A');
            };
        }
    }());
    
    this.addCardCommand(game);
}

Game.addYearOfPlentyCommand = function (game) {
    this.addLabel('資源を選択して下さい。', 580, 400);

    var command = '';

    if (game.phase === Phase.YEAR_OF_PLENTY1) {
        command = 'J';
    } else {
        command = 'K';
    }

    var i;
    for (i = 0; i < 5; i++) {
        this.addSprite('view/resource-button.png', i + 10, i * 40 + 560, 425, 30, 30, function () {
            var _i = i;

            return function () {
                Game.send(command + _i);
            };
        }());
    }
}

Game.addMonopolyCommand = function (game) {
    this.addLabel('資源を選択して下さい。', 580, 400);

    var i;
    for (i = 0; i < 5; i++) {
        this.addSprite('view/resource-button.png', i, i * 40 + 560, 425, 30, 30, function () {
            var _i = i;

            return function () {
                Game.send('M' + _i);
            };
        }());
    }
}

Game.addMainCommand = function (game) {
    this.trade.pool = 0;

    var i;
    for (i = 0; i < 5; i++) { this.trade.input[i] = this.trade.output[i] = 0; }
    
    this.addSprite('view/skin.png', 1, 499, 338, 299, 205);
    
    this.addSprite('view/button.png', 4, 520, 354, 80, 25, function () {
        if (
               game.playerList[game.active].roadStock > 0
            && game.playerList[game.active].resource[Resource.BRICK] >= 1
            && game.playerList[game.active].resource[Resource.LUMBER] >= 1
            && Game.hasCanBuildRoad(game)
        ) {
            return function () {
                return Game.send('n');
            };
        }
    }());
    
    this.addSprite('view/button.png', 5, 610, 354, 80, 25, function () {
        if (
               game.playerList[game.active].settlementStock > 0
            && game.playerList[game.active].resource[Resource.BRICK] >= 1
            && game.playerList[game.active].resource[Resource.WOOL] >= 1
            && game.playerList[game.active].resource[Resource.GRAIN] >= 1
            && game.playerList[game.active].resource[Resource.LUMBER] >= 1
            && Game.hasCanBuildSettlement(game)
        ) {
            return function () {
                return Game.send('p');
            };
        }
    }());
    
    this.addSprite('view/button.png', 6, 700, 354, 80, 25, function () {
        if (
               game.playerList[game.active].cityStock > 0
            && game.playerList[game.active].resource[Resource.ORE] >= 3
            && game.playerList[game.active].resource[Resource.GRAIN] >= 2
            && Game.hasCanBuildCity(game)
        ) {
            return function () {
                return Game.send('r');
            };
        }
    }());
    
    this.addSprite('view/button.png', 7, 520, 384, 80, 25, function () {
        if (
               game.cardStock.length > 0
            && game.playerList[game.active].resource[Resource.WOOL] >= 1
            && game.playerList[game.active].resource[Resource.ORE] >= 1
            && game.playerList[game.active].resource[Resource.GRAIN] >= 1
        ) {
            return function () {
                Game.send('t');
            };
        }
    }());
    
    this.addSprite('view/button.png', 8, 610, 384, 80, 25, function () {
        Game.send('u');
    });
    
    this.addSprite('view/button.png', 9, 700, 384, 80, 25, function () {
        Game.send('y');
    });
    
    this.addSprite('view/button.png', 10, 520, 414, 80, 25, function () {
        if (game.playerList[game.active].baseScore + game.playerList[game.active].bonusScore >= 10) {
            return function () {
                Game.send('A');
            };
        }
    }());
    
    this.addSprite('view/button.png', 11, 610, 414, 80, 25, function () {
        Game.send('B');
    });
    
    this.addCardCommand(game);
}

Game.addDice = function (game) {
    if (game.dice1 !== Index.NONE) {
        this.addSprite('view/dice.png', game.dice1 - 1, 25, 100, 30, 30);
        this.addSprite('view/dice.png', game.dice2 - 1, 56, 100, 30, 30);
    }
}

Game.addPlayer = function (game, color) {
    if (game.state === State.PLAYING) {
        if (game.active === color) { this.addSprite('view/active.png', 0, 503, color * 78 + 29, 15, 15); }
        if (Game.hasPriorityColor(game, color)) {
            this.addSprite('view/priority.png', 0, 523, color * 78 + 26, 112, 21);
        }
    }
    
    this.addLabel(game.playerList[color].uid, 524, color * 78 + 28);
    
    if (game.state === State.READY || game.playerList[color].uid === uid) {
        this.addLabel(game.playerList[color].baseScore + '(+' + game.playerList[color].bonusScore + ')点', 640, color * 78 + 28, '12px');
    } else {
        this.addLabel('??(+?)点', 640, color * 78 + 28, '12px');
    }
    
    this.addLabel('道:' + game.playerList[color].roadStock, 697, color * 78 + 28, '12px');
    this.addLabel('家:' + game.playerList[color].settlementStock, 732, color * 78 + 28, '12px');
    this.addLabel('街:' + game.playerList[color].cityStock, 761, color * 78 + 28, '12px');

    var i;
    var j;
    var len1;

    var k = 0;

    var summary1 = game.playerList[color].resource[Resource.BRICK]
                 + game.playerList[color].resource[Resource.WOOL]
                 + game.playerList[color].resource[Resource.ORE]
                 + game.playerList[color].resource[Resource.GRAIN]
                 + game.playerList[color].resource[Resource.LUMBER];

    if (summary1 > 18) {
        if (game.state === State.READY || game.playerList[color].uid === uid) {
            for (i = 0; i < 5; i++) {
                if (game.playerList[color].resource[i] > 0) {
                    this.addSprite('view/resource.png', i, k * 38 + 500, color * 78 + 52, 15, 15);
                    this.addLabel('' + game.playerList[color].resource[i], k * 38 + 519, color * 78 + 52, '12px');

                    k++;
                }
            }
        } else {
            this.addSprite('view/resource.png', 5, 500, color * 78 + 52, 15, 15);
            this.addLabel('' + summary1, 519, color * 78 + 52, '12px');
        }
    } else {
        for (i = 0; i < 5; i++) {
            len1 = game.playerList[color].resource[i];
            for (j = 0; j < len1; j++) {
                if (game.state === State.READY || game.playerList[color].uid === uid) {
                    this.addSprite('view/resource.png', i, k * 16 + 500, color * 78 + 52, 15, 15);
                } else {
                    this.addSprite('view/resource.png', 5, k * 16 + 500, color * 78 + 52, 15, 15);
                }

                k++;
            }
        }
    }

    k = 0;

    summary1 = 0;
    for(i = 0; i < 5; i++) {
        summary1 += game.playerList[color].wakeCard[i]
                 + game.playerList[color].sleepCard[i]
                 + game.playerList[color].deadCard[i];
    }

    if(summary1 > 15) {
        var summary2;

        if (game.state === State.READY || game.playerList[color].uid === uid) {
            for (i = 0; i < 5; i++) {
                summary2 = game.playerList[color].wakeCard[i] + game.playerList[color].sleepCard[i];

                if (summary2 > 0) {
                    this.addSprite('view/card.png', i, k * 24 + 500, color * 78 + 69, 30, 30);
                    this.addLabel('' + summary2, k * 24 + 503, color * 78 + 90, '8px');

                    k++;
                }
            }

            for (i = 0; i < 5; i++) {
                if (game.playerList[color].deadCard[i] > 0) {
                    this.addSprite('view/card.png', i, k * 24 + 518, color * 78 + 69, 30, 30);
                    this.addLabel('' + game.playerList[color].deadCard[i], k * 24 + 521, color * 78 + 90, '8px');

                    k++;
                }
            }
        } else {
            this.addSprite('view/card.png', 5, 500, color * 78 + 69, 30, 30);

            summary2 = 0;
            for (i = 0; i < 5; i++) {
                summary2 += game.playerList[color].wakeCard[i] + game.playerList[color].sleepCard[i];
            }

            this.addLabel('' + summary2, 534, color * 78 + 76);

            for (i = 0; i < 5; i++) {
                if (game.playerList[color].deadCard[i] > 0) {
                    this.addSprite('view/card.png', i, k * 31 + 586, color * 78 + 69, 30, 30);
                    this.addLabel('' + game.playerList[color].deadCard[i], k * 31 + 589, color * 78 + 90, '8px');

                    k++;
                }
            }
        }
    } else {
        for (i = 0; i < 5; i++) {
            len1 = game.playerList[color].wakeCard[i] + game.playerList[color].sleepCard[i];
            for (j = 0; j < len1; j++) {
                if (game.state === State.READY || game.playerList[color].uid === uid) {
                    this.addSprite('view/card.png', i, k * 15 + 500, color * 78 + 69, 30, 30);
                } else {
                    this.addSprite('view/card.png', 5, k * 15 + 500, color * 78 + 69, 30, 30);
                }

                k++;
            }
        }

        for (i = 0; i < 5; i++) {
            len1 = game.playerList[color].deadCard[i];
            for (j = 0; j < len1; j++) {
                this.addSprite('view/card.png', i, k * 15 + 525, color * 78 + 69, 30, 30);

                k++;
            }
        }
    }

    if (color === game.longestRoad) {
        this.addSprite('view/prize.png', 1, 777, color * 78 + 79, 20, 20);
    }

    if (color === game.largestArmy) {
        this.addSprite('view/prize.png', 0, 767, color * 78 + 69, 20, 20);
    }
}

Game.addMap = function (game) {
    if(game.landList.length > 0) {
        this.addSprite('view/map.png', 0, 8, 85, 484, 434);

        var frame;

        var i;
        var len1 = game.landList.length;
        for (i = 0; i < len1; i++) {
            if (game.landList[i] === Land.DESERT) {
                frame = 5;
            } else {
                frame = game.landList[i];
            }

            if (i < 3) {
                this.addSprite('view/land.png', frame, i * 69 + 145, 144, 70, 80);
            } else if (i < 7) {
                this.addSprite('view/land.png', frame, (i - 3) * 69 + 111, 203, 70, 80);
            } else if (i < 12) {
                this.addSprite('view/land.png', frame, (i - 7) * 69 + 77, 262, 70, 80);
            } else if (i < 16) {
                this.addSprite('view/land.png', frame, (i - 12) * 69 + 112, 321, 70, 80);
            } else {
                this.addSprite('view/land.png', frame, (i - 16) * 69 + 147, 380, 70, 80);
            }
        }

        var len1 = game.numberList.length;
        for (i = 0; i < len1; i++) {
            if (game.numberList[i] !== Land.DESERT) {
                if (game.numberList[i] < 7) {
                    frame = game.numberList[i] - 2;
                } else {
                    frame = game.numberList[i] - 3;
                }

                if (i < 3) {
                    this.addSprite('view/number.png', frame, i * 69 + 165, 169, 30, 30);
                } else if (i < 7) {
                    this.addSprite('view/number.png', frame, (i - 3) * 69 + 131, 228, 30, 30);
                } else if (i < 12) {
                    this.addSprite('view/number.png', frame, (i - 7) * 69 + 97, 287, 30, 30);
                } else if (i < 16) {
                    this.addSprite('view/number.png', frame, (i - 12) * 69 + 132, 346, 30, 30);
                } else {
                    this.addSprite('view/number.png', frame, (i - 16) * 69 + 167, 405, 30, 30);
                }
            }
        }
        
        if (game.robber < 3) {
            this.addSprite('view/robber.png', 0, game.robber * 69 + 155, 159, 50, 50, null, 0.7);
        } else if (game.robber < 7) {
            this.addSprite('view/robber.png', 0, (game.robber - 3) * 69 + 121, 218, 50, 50, null, 0.7);
        } else if (game.robber < 12) {
            this.addSprite('view/robber.png', 0, (game.robber - 7) * 69 + 87, 277, 50, 50, null, 0.7);
        } else if (game.robber < 16) {
            this.addSprite('view/robber.png', 0, (game.robber - 12) * 69 + 122, 336, 50, 50, null, 0.7);
        } else {
            this.addSprite('view/robber.png', 0, (game.robber - 16) * 69 + 157, 395, 50, 50, null, 0.7);
        }
    }
}

Game.addSettlement = function (game) {
    var i;
    var len1 = game.settlementList.length;
    for (i = 0; i < len1; i++) {
        var rank;

        switch(game.settlementList[i] & 0xff00) {
            case SettlementRank.NONE:
                rank = -1;
                break;
            case SettlementRank.SETTLEMENT:
                rank = 0;
                break;
            case SettlementRank.CITY:
                rank = 1;
                break;
        }

        var x;
        var y;

        if (rank >= 0) {
            if (i < 7) {
                x = i * 34.5 + 130;
                y = i % 2 === 0 ? 143 : 125;
            } else if (i < 16) {
                x = (i - 7) * 34.5 + 96;
                y = i % 2 === 0 ? 184 : 202;
            } else if (i < 27) {
                x = (i - 16) * 34.5 + 62;
                y = i % 2 === 0 ? 261 : 243;
            } else if (i < 38) {
                x = (i - 27) * 34.5 + 62;
                y = i % 2 === 0 ? 320 : 302;
            } else if (i < 47) {
                x = (i - 38) * 34.5 + 97;
                y = i % 2 === 0 ? 361 : 379;
            } else {
                x = (i - 47) * 34.5 + 132;
                y = i % 2 === 0 ? 438 : 420;
            }
            
            this.addSprite('view/settlement.png', (game.settlementList[i] & 0x00ff) * 2 + rank, x, y, 30, 30);
        }
    }
}

Game.addRoad = function (game) {
    var i;
    var len1 = game.roadList.length;
    for (i = 0; i < len1; i++) {
        if(game.roadList[i] !== Index.NONE) {
            var angle = 2;
            
            if (
                   i === 6 || i === 7 || i === 8 || i === 9 || i === 18
                || i === 19 || i === 20 || i === 21 || i === 22 || i === 33
                || i === 34 || i === 35 || i === 36 || i === 37 || i === 38
                || i === 49 || i === 50 || i === 51 || i === 52 || i === 53
                || i === 62 || i === 63 || i === 64 || i === 65
            ) {
                angle = 2;
            } else if (
                   i === 0 || i === 2 || i === 4 || i === 10 || i === 12
                || i === 14 || i === 16 || i === 23 || i === 25 || i === 27
                || i === 29 || i === 31 || i === 40 || i === 42 || i === 44
                || i === 46 || i === 48 || i === 55 || i === 57 || i === 59
                || i === 61 || i === 67 || i === 69 || i === 71
            ) {
                angle = 0;
            } else {
                angle = 1;
            }

            var x;
            var y;

            if (i < 6) {
                x = i * 34.5 + 148;
                y = 139;
            } else if (i < 10) {
                x = (i - 6) * 69 + 130;
                y = 169;
            } else if (i < 18) {
                x = (i - 10) * 34.5 + 114;
                y = 198;
            } else if (i < 23) {
                x = (i - 18) * 69 + 96;
                y = 228;
            } else if (i < 33) {
                x = (i - 23) * 34.5 + 79;
                y = 258;
            } else if (i < 39) {
                x = (i - 33) * 69 + 62;
                y = 288;
            } else if (i < 49) {
                x = (i - 39) * 34.5 + 80;
                y = 316;
            } else if (i < 54) {
                x = (i - 49) * 69 + 97;
                y = 346;
            } else if (i < 62) {
                x = (i - 54) * 34.5 + 115;
                y = 375;
            } else if (i < 66) {
                x = (i - 62) * 69 + 132;
                y = 405;
            } else {
                x = (i - 66) * 34.5 + 150;
                y = 434;
            }
            
            this.addSprite('view/road.png', game.roadList[i] * 3 + angle, x, y, 30, 30);
        }
    }
}

Game.canBuildSetupSettlement = function (game, index) {
    var i;
    var len1 = SETTLEMENT_LINK[index].length;
    for (i = 0; i < SETTLEMENT_LINK[index].length; i++) {
        var j;
        var len2 = ROAD_LINK[SETTLEMENT_LINK[index][i]].length;
        for (j = 0; j < len2; j++) {
            if ((game.settlementList[ROAD_LINK[SETTLEMENT_LINK[index][i]][j]] & 0xff00) !== SettlementRank.NONE) {
                return false;
            }
        }
    }
    
    return true;
}

Game.canBuildSettlement = function (game, index) {
    var result = false;

    var i;
    var len1 = SETTLEMENT_LINK[index].length;
    for (i = 0; i < len1; i++) {
        if (game.roadList[SETTLEMENT_LINK[index][i]] === game.active) { result = true; }

        var j;
        var len2 = ROAD_LINK[SETTLEMENT_LINK[index][i]].length;
        for (j =  0; j < len2; j++) {
            if ((game.settlementList[ROAD_LINK[SETTLEMENT_LINK[index][i]][j]] & 0xff00) !== SettlementRank.NONE) {
                return false;
            }
        }
    }
    
    return result;
}

Game.hasCanBuildCity = function (game) {
    var i;
    var len1 = game.settlementList.length;
    for (i =  0; i < len1; i++) {
        if (
               (game.settlementList[i] & 0xff00) === SettlementRank.SETTLEMENT
            && (game.settlementList[i] & 0x00ff) === game.active
        ) {
            return true;
        }
    }
    
    return false;
}

Game.addCanBuildSettlement = function (game) {
    if (
           game.state === State.PLAYING
        && (
                  game.phase === Phase.SETUP_SETTLEMENT1
               || game.phase === Phase.SETUP_SETTLEMENT2
               || game.phase === Phase.BUILD_SETTLEMENT
           )
        && this.hasPriorityUid(game, uid)
    ) {
        var opacity;

        if (game.phase === Phase.BUILD_SETTLEMENT) {
            opacity = 0.7;
        } else {
            opacity = 0;
        }

        var i;
        var len1 = game.settlementList.length;
        for (i = 0; i < len1; i++) {
            var x;
            var y;

            if (i < 7) {
                x = i * 34.5 + 130;
                y = i % 2 === 0 ? 148 : 130;
            } else if (i < 16) {
                x = (i - 7) * 34.5 + 96;
                y = i % 2 === 0 ? 189 : 207;
            } else if (i < 27) {
                x = (i - 16) * 34.5 + 62;
                y = i % 2 === 0 ? 266 : 248;
            } else if (i < 38) {
                x = (i - 27) * 34.5 + 62;
                y = i % 2 === 0 ? 325 : 307;
            } else if (i < 47) {
                x = (i - 38) * 34.5 + 97;
                y = i % 2 === 0 ? 366 : 384;
            } else {
                x = (i - 47) * 34.5 + 132;
                y = i % 2 === 0 ? 443 : 425;
            }
            
            switch(game.phase) {
                case Phase.SETUP_SETTLEMENT1:
                    if (this.canBuildSetupSettlement(game, i)) {
                        this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                            var _i = i;
                            
                            return function () {
                                Game.send('f' + _i);
                            };
                        }(), opacity);
                    }
                    break;
                case Phase.SETUP_SETTLEMENT2:
                    if (this.canBuildSetupSettlement(game, i)) {
                        this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                            var _i = i;
                            
                            return function () {
                                Game.send('h' + _i);
                            };
                        }(), opacity);
                    }
                    break;
                case Phase.BUILD_SETTLEMENT:
                    if (this.canBuildSettlement(game, i)) {
                        this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                            var _i = i;
                            
                            return function () {
                                Game.send('q' + _i);
                            };
                        }(), opacity);
                    }
                    break;
            }
        }
    }
}

Game.addCanBuildCity = function (game) {
    if (
           game.state === State.PLAYING
        && game.phase === Phase.BUILD_CITY
        && this.hasPriorityUid(game, uid)
    ) {
        var i;
        var len1 = game.settlementList.length;
        for (i = 0; i < len1; i++) {
            var rank = game.settlementList[i] & 0xff00;
            var color = game.settlementList[i] & 0x00ff;
            
            if (rank === SettlementRank.SETTLEMENT && color === game.active) {
                var x;
                var y;

                if (i < 7) {
                    x = i * 34.5 + 130;
                    y = i % 2 === 0 ? 148 : 130;
                } else if (i < 16) {
                    x = (i - 7) * 34.5 + 96;
                    y = i % 2 === 0 ? 189 : 207;
                } else if (i < 27) {
                    x = (i - 16) * 34.5 + 62;
                    y = i % 2 === 0 ? 266 : 248;
                } else if (i < 38) {
                    x = (i - 27) * 34.5 + 62;
                    y = i % 2 === 0 ? 325 : 307;
                } else if (i < 47) {
                    x = (i - 38) * 34.5 + 97;
                    y = i % 2 === 0 ? 366 : 384;
                } else {
                    x = (i - 47) * 34.5 + 132;
                    y = i % 2 === 0 ? 443 : 425;
                }
                
                this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                    var _i = i;
                    
                    return function () {
                        Game.send('s' + _i);
                    };
                }(), 0.7);
            }
        }
    }
}

Game.canBuildRoad = function (game, index) {
    if (game.roadList[index] === Index.NONE) {
        var i;
        var len1 = ROAD_LINK[index].length;
        for (i = 0; i < len1; i++) {
            if ((game.settlementList[ROAD_LINK[index][i]] & 0x00ff) === game.active) {
                return true;
            } else if ((game.settlementList[ROAD_LINK[index][i]] & 0xff00) === SettlementRank.NONE) {
                var j;
                var len2 = SETTLEMENT_LINK[ROAD_LINK[index][i]].length;
                for (j = 0; j < len2; j++) {
                    if (game.roadList[SETTLEMENT_LINK[ROAD_LINK[index][i]][j]] === game.active) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

Game.hasCanBuildRoad = function (game) {
    var i;
    var len1 = game.roadList.length;
    for (i = 0; i < len1; i++) {
        if(this.canBuildRoad(game, i)) { return true; }
    }
    
    return false;
}

Game.hasCanBuildSettlement = function (game) {
    var result = false;

    var i;
    var len1 = game.settlementList.length;
    for (i = 0; !result && i < len1; i++) {
        if (this.canBuildSettlement(game, i)) { return true; }
    }
    
    return false;
}

Game.canBuildSecondRoad = function (game, index) {
    var secondSettlement = game.playerList[game.active].secondSettlement;

    var i;
    var len1 = SETTLEMENT_LINK[secondSettlement].length;
    for (i = 0; i < len1; i++) {
        if (SETTLEMENT_LINK[secondSettlement][i] === index) { return true; }
    }
    
    return false;
}

Game.addCanBuildRoad = function (game) {
    if (
           game.state === State.PLAYING
        && (
                   game.phase === Phase.SETUP_ROAD1
                || game.phase === Phase.SETUP_ROAD2
                || game.phase === Phase.BUILD_ROAD
                || game.phase === Phase.ROAD_BUILDING1
                || game.phase === Phase.ROAD_BUILDING2
           )
        && this.hasPriorityUid(game, uid)
    ) {
        if (
               game.state === State.PLAYING
            && this.hasPriorityUid(game, uid)
        ) {
            var i;
            var len1 = game.roadList.length;
            for (i = 0; i < len1; i++) {
                var x;
                var y;

                if (i < 6) {
                    x = i * 34.5 + 148;
                    y = 139;
                } else if (i < 10) {
                    x = (i - 6) * 69 + 130;
                    y = 169;
                } else if (i < 18) {
                    x = (i - 10) * 34.5 + 114;
                    y = 198;
                } else if (i < 23) {
                    x = (i - 18) * 69 + 96;
                    y = 228;
                } else if (i < 33) {
                    x = (i - 23) * 34.5 + 79;
                    y = 258;
                } else if (i < 39) {
                    x = (i - 33) * 69 + 62;
                    y = 288;
                } else if (i < 49) {
                    x = (i - 39) * 34.5 + 80;
                    y = 316;
                } else if (i < 54) {
                    x = (i - 49) * 69 + 97;
                    y = 346;
                } else if (i < 62) {
                    x = (i - 54) * 34.5 + 115;
                    y = 375;
                } else if (i < 66) {
                    x = (i - 62) * 69 + 132;
                    y = 405;
                } else {
                    x = (i - 66) * 34.5 + 150;
                    y = 434;
                }

                switch(game.phase) {
                    case Phase.SETUP_ROAD2:
                        if (this.canBuildSecondRoad(game, i)) {
                            this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                                var _i = i;
                                
                                return function () {
                                    Game.send('i' + _i);
                                };
                            }(), 0.7);
                        }
                        break;
                    case Phase.SETUP_ROAD1:
                    case Phase.BUILD_ROAD:
                    case Phase.ROAD_BUILDING1:
                    case Phase.ROAD_BUILDING2:
                        if (this.canBuildRoad(game, i)) {
                            var command = '';

                            switch (game.phase) {
                                case Phase.SETUP_ROAD1:
                                    command = 'g';
                                    break;
                                case Phase.BUILD_ROAD:
                                    command = 'o';
                                    break;
                                case Phase.ROAD_BUILDING1:
                                    command = 'G';
                                    break;
                                case Phase.ROAD_BUILDING2:
                                    command = 'H';
                                    break;
                            }

                            this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                                var _i = i;

                                return function () {
                                    Game.send(command + _i);
                                };
                            }(), 0.7);
                        }
                        break;
                }
            }
        }
    }
}

Game.addCanMoveRobber = function (game) {
    if (
           game.state === State.PLAYING
        && (
                   game.phase === Phase.ROBBER1
                || game.phase === Phase.SOLDIER1
           )
        && this.hasPriorityUid(game, uid)
    ) {
        var i;
        var len1 = game.landList.length;
        for (i = 0; i < len1; i++) {
            if (i !== game.robber) {
                var x;
                var y;

                if (i < 3) {
                    x = i * 69 + 155;
                    y = 159;
                } else if (i < 7) {
                    x = (i - 3) * 69 + 121;
                    y = 218;
                } else if (i < 12) {
                    x = (i - 7) * 69 + 87;
                    y = 277;
                } else if (i < 16) {
                    x = (i - 12) * 69 + 122;
                    y = 336;
                } else {
                    x = (i - 16) * 69 + 157;
                    y = 395;
                }
                
                this.addSprite('view/robber.png', 1, x, y, 50, 50, function () {
                    var _i = i;
                    
                    if (game.phase === Phase.ROBBER1) {
                        return function () {
                            Game.send('l' + _i);
                        };
                    } else {
                        return function () {
                            Game.send('D' + _i);
                        };
                    }
                }(), 0.7);
            }
        }
    }
}

Game.addCanPillageSettlement = function (game) {
    if (
           game.state === State.PLAYING
        && (
                   game.phase === Phase.ROBBER2
                || game.phase === Phase.SOLDIER2
           )
        && this.hasPriorityUid(game, uid)
    ) {
        var i;
        var len1 = LAND_LINK[game.robber].length;
        for (i = 0; i < len1; i++) {
            var index = LAND_LINK[game.robber][i];
            var rank = game.settlementList[index] & 0xff00;
            var color = game.settlementList[index] & 0x00ff;
            
            if (
                   rank !== SettlementRank.NONE
                && color !== game.active
            ) {
                var x;
                var y;

                if (index < 7) {
                    x = index * 34.5 + 130;
                    y = index % 2 === 0 ? 148 : 130;
                } else if (index < 16) {
                    x = (index - 7) * 34.5 + 96;
                    y = index % 2 === 0 ? 189 : 207;
                } else if (index < 27) {
                    x = (index - 16) * 34.5 + 62;
                    y = index % 2 === 0 ? 266 : 248;
                } else if (index < 38) {
                    x = (index - 27) * 34.5 + 62;
                    y = index % 2 === 0 ? 325 : 307;
                } else if (index < 47) {
                    x = (index - 38) * 34.5 + 97;
                    y = index % 2 === 0 ? 366 : 384;
                } else {
                    x = (index - 47) * 34.5 + 132;
                    y = index % 2 === 0 ? 443 : 425;
                }
                
                this.addSprite('view/settlement.png', 8, x, y, 30, 30, function () {
                    var _color = color;
                    
                    if (game.phase === Phase.ROBBER2) {
                        return function () {
                            Game.send('m' + _color);
                        };
                    } else {
                        return function () {
                            Game.send('E' + _color);
                        };
                    }
                }(), 0.7);
            }
        }
    }
}

Game.hasPriorityColor = function (game, color) {
    if (color !== Index.NONE) {
        var i;
        var len1 = game.priority.length;
        for (i = 0; i < len1; i++) if (game.priority[i] === color) {
            return true;
        }
    }
    
    return false;
}

Game.hasPriorityUid = function (game, uid) {
    var i;
    var len1 = game.priority.length;
    for (i = 0; i < len1; i++) {
        if (game.playerList[game.priority[i]].uid === uid) { return true; }
    }
    
    return false;
}

Game.addStock = function (game) {
    var i;
    var len1 = game.resourceStock.length;
    for (i = 0; i < len1; i++) {
        if (game.resourceStock[i] > 0) {
            var sprite = new Sprite(48, 38);

            sprite.y = 30;
            sprite.x = i * 51 + 90;
            sprite.image = new Surface(48, 38);
            sprite.image.context.fillStyle = 'rgb(255,255,255)';
            sprite.image.context.fillRect(0, 0, 48, 38);
            
            switch (i) {
                case Resource.BRICK:
                    sprite.image.context.fillStyle = 'rgb(136,0,21)';
                    break;
                case Resource.WOOL:
                    sprite.image.context.fillStyle = 'rgb(181,230,29)';
                    break;
                case Resource.ORE:
                    sprite.image.context.fillStyle = 'rgb(127,127,127)';
                    break;
                case Resource.GRAIN:
                    sprite.image.context.fillStyle = 'rgb(255,242,0)';
                    break;
                case Resource.LUMBER:
                    sprite.image.context.fillStyle = 'rgb(34,177,76)';
                    break;
            }
            
            sprite.image.context.fillRect(0, 38 - game.resourceStock[i] * 2, 48, game.resourceStock[i] * 2);
            sprite.image.context.strokeRect(0, 0, 48, 38);

            this.core.rootScene.addChild(sprite);
        }
    }
    
    if (game.cardStock.length > 0) {
        sprite = new Sprite(48, 50);

        sprite.y = 18;
        sprite.x = 360;
        sprite.image = new Surface(48, 50);
        sprite.image.context.strokeStyle = 'black';
        sprite.image.context.fillStyle = 'rgb(0,0,0)';
        sprite.image.context.fillRect(0, 50 - game.cardStock.length * 2, 48, game.cardStock.length * 2);
        sprite.image.context.strokeRect(0, 0, 48, 50);

        this.core.rootScene.addChild(sprite);
    }
}