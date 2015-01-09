enchant();

var Game = function () { }

Game.isOpen = false;
Game.canSend = true;
Game.core = null;
Game.tab = Tab.HOTEL_CHAIN;

Game.buy = {
      output: [0, 0, 0, 0, 0, 0, 0]
    , ticket: 0
    , summary: 0
};

Game.sell = {
      input: [0, 0, 0, 0, 0, 0, 0]
    , summary: 0
};

Game.trade = {
      input: [0, 0, 0, 0, 0, 0, 0]
    , output: [0, 0, 0, 0, 0, 0, 0]
    , pool: 0
};

Game.send = function (message) {
    if (this.canSend) {
        send(message);
        this.canSend = false;
    }
}

Game.addLabel = function (text, x, y, font, color) {
    var label;

    if (!font) {
        font = '14px "メイリオ",Meiryo';
    } else {
        font += ' ' + '"メイリオ",Meiryo';
    }

    label = new Label(text);
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
          'view/active.png'
        , 'view/background.png'
        , 'view/button.png'
        , 'view/fresh.png'
        , 'view/hotelchain-horizontal.png'
        , 'view/hotelchain-vertical.png'
        , 'view/independence.png'
        , 'view/lock.png'
        , 'view/map.png'
        , 'view/market.png'
        , 'view/priority.png'
        , 'view/skin.png'
        , 'view/tab.png'
        , 'view/tile.png'
        , 'view/updown.png'
    );

    this.core.onload = function () {
        Game.isOpen = true;
        Game.send('a');
    }

    this.core.start();
}

Game.onMessage = function (game) {
    if(game.sound !== '') { sound(game.sound); }
    
    this.canSend = true;

    this.rePaint(game);
}

Game.rePaint = function (game) {
    this.removeAll();
    this.addSprite('view/background.png', 0, 0, 0, 800, 545);
    this.addHeadLine(game);
    this.addCommand(game);

    var i;
    var len1 = game.playerSize;
    for (i = 0; i < len1; i++) { this.addPlayer(game, i); }

    this.addMarket(game);
    this.addMap(game);
    this.addCanPlayTile(game);
    this.addHotelChain(game);
}

Game.removeAll = function () {
    while (this.core.rootScene.childNodes.length > 0) {
        this.core.rootScene.removeChild(this.core.rootScene.childNodes[0]);
    }
}

Game.isDeadTile = function (game, index) {
    var hasJoin = [false, false, false, false, false, false, false];
    var hotelChain;
    var safety = 0;

    var i = game.playerList[game.priority].hand[index];

    if (i >= 12) {
        hotelChain = game.map[i - 12].hotelChain;

        if (hotelChain !== HotelChain.NONE) { hasJoin[hotelChain] = true; }
    }

    if (i % 12 > 0) {
        hotelChain = game.map[i - 1].hotelChain;

        if (hotelChain !== HotelChain.NONE) { hasJoin[hotelChain] = true; }
    }

    if (i % 12 < 11) {
        hotelChain = game.map[i + 1].hotelChain;

        if (hotelChain !== HotelChain.NONE) { hasJoin[hotelChain] = true; }
    }

    if (i <= 95) {
        hotelChain = game.map[i + 12].hotelChain;

        if (hotelChain !== HotelChain.NONE) { hasJoin[hotelChain] = true; }
    }

    for (i = 0; i < 7; i++) {
        if (hasJoin[i] && game.hotelChain[i].size >= 11) { safety++; }
    }
    
    if (safety >= 2) {
        return true;
    } else {
        return false;
    }
}

Game.canPlayTile = function (game, index) {
    if (!this.isDeadTile(game, index)) {
        var i;
        for (i = 0; i < 7; i++) {
            if (game.hotelChain[i].position === Position.NONE) {
                return true;
            }
        }

        var cell;
        var hasHotelChain = false;
        var hasNotHotelChain = false;

        i = game.playerList[game.priority].hand[index];

        if (i >= 12) {
            cell = game.map[i - 12];

            if (cell.isCover) {
                if (cell.hotelChain === HotelChain.NONE) {
                    hasNotHotelChain = true;
                } else {
                    hasHotelChain = true;
                }
            }
        }

        if (i % 12 > 0) {
            cell = game.map[i - 1];

            if (cell.isCover) {
                if (cell.hotelChain === HotelChain.NONE) {
                    hasNotHotelChain = true;
                } else {
                    hasHotelChain = true;
                }
            }
        }

        if (i % 12 < 11) {
            cell = game.map[i + 1];

            if (cell.isCover) {
                if (cell.hotelChain === HotelChain.NONE) {
                    hasNotHotelChain = true;
                } else {
                    hasHotelChain = true;
                }
            }
        }

        if (i <= 95) {
            cell = game.map[i + 12];

            if (cell.isCover) {
                if (cell.hotelChain === HotelChain.NONE) {
                    hasNotHotelChain = true;
                } else {
                    hasHotelChain = true;
                }
            }
        }

        if (!hasNotHotelChain || hasHotelChain) { return true; }
    }

    return false;
}

Game.hasCanPlayTile = function (game) {
    var i;
    var len1 = game.playerList[game.priority].hand.length;
    for (i =  0; i < len1; i++) {
        if (this.canPlayTile(game, i)) { return true; }
    }

    return false;
}

Game.isFinish = function (game) {
    var hasHotelChain = false;
    var isFinish = true;

    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        if (game.hotelChain[i].position !== Position.NONE) {
            hasHotelChain = true;

            if (game.hotelChain[i].size >= 41) {
                isFinish = true;
                break;
            } else if (game.hotelChain[i].size < 11) {
                isFinish = false;
            }
        }
    }

    if (!hasHotelChain) { isFinish = false; }

    return isFinish;
}

Game.getStockPrice = function (game, type) {
    var size = game.hotelChain[type].size;

    if (size >= 41) {
        return STOCK_PRICE[type][8];
    } else if(size >= 31) {
        return STOCK_PRICE[type][7];
    } else if(size >= 21) {
        return STOCK_PRICE[type][6];
    } else if(size >= 11) {
        return STOCK_PRICE[type][5];
    } else if(size >= 6) {
        return STOCK_PRICE[type][4];
    } else if(size >= 5) {
        return STOCK_PRICE[type][3];
    } else if(size >= 4) {
        return STOCK_PRICE[type][2];
    } else if(size >= 3) {
        return STOCK_PRICE[type][1];
    } else if(size >= 2) {
        return STOCK_PRICE[type][0];
    }

    return 0;
}

Game.getMajorityBonus = function (game, type) {
    var size = game.hotelChain[type].size;

    if (size >= 41) {
        return MAJORITY_BONUS[type][8];
    } else if(size >= 31) {
        return MAJORITY_BONUS[type][7];
    } else if(size >= 21) {
        return MAJORITY_BONUS[type][6];
    } else if(size >= 11) {
        return MAJORITY_BONUS[type][5];
    } else if(size >= 6) {
        return MAJORITY_BONUS[type][4];
    } else if(size >= 5) {
        return MAJORITY_BONUS[type][3];
    } else if(size >= 4) {
        return MAJORITY_BONUS[type][2];
    } else if(size >= 3) {
        return MAJORITY_BONUS[type][1];
    } else if(size >= 2) {
        return MAJORITY_BONUS[type][0];
    }

    return 0;
}

Game.getMinorityBonus = function (game, type) {
    var size = game.hotelChain[type].size;

    if (size >= 41) {
        return MINORITY_BONUS[type][8];
    } else if(size >= 31) {
        return MINORITY_BONUS[type][7];
    } else if(size >= 21) {
        return MINORITY_BONUS[type][6];
    } else if(size >= 11) {
        return MINORITY_BONUS[type][5];
    } else if(size >= 6) {
        return MINORITY_BONUS[type][4];
    } else if(size >= 5) {
        return MINORITY_BONUS[type][3];
    } else if(size >= 4) {
        return MINORITY_BONUS[type][2];
    } else if(size >= 3) {
        return MINORITY_BONUS[type][1];
    } else if(size >= 2) {
        return MINORITY_BONUS[type][0];
    }

    return 0;
}

Game.addHeadLine = function (game) {
    var text = '';

    if (game.state === State.READY) {
        text = '募集中';
    } else {
        switch (game.phase) {
            case Phase.PLAY:
                text = 'タイル配置';
                break;
            case Phase.CHAIN:
                text = 'ホテルチェーン';
                break;
            case Phase.ABSORB:
                text = '合併(親ホテルチェーン選択)';
                break;
            case Phase.MERGE:
                text = '合併';
                break;
            case Phase.SELL:
                text = '合併(売却)';
                break;
            case Phase.TRADE:
                text = '合併(交換)';
                break;
            case Phase.BUY:
                text = '購入';
                break;
        }
    }

    this.addLabel(text, 502, 6);
}

Game.addCommand = function (game) {
    if (game.state === State.READY) {
        this.addReadyCommand(game);
    } else {
        if (game.playerList[game.priority].uid === uid) {
            switch (game.phase) {
                case Phase.PLAY:
                    this.addPlayCommand(game);
                    break;
                case Phase.CHAIN:
                    this.addLabel('ホテルチェーンを配置して下さい。', 547, 415);
                    break;
                case Phase.ABSORB:
                    this.addLabel('親ホテルチェーンを選択して下さい。', 540, 415);
                    break;
                case Phase.MERGE:
                    this.addMergeCommand();
                    break;
                case Phase.SELL:
                    this.addSellCommand(game);
                    break;
                case Phase.TRADE:
                    this.addTradeCommand(game);
                    break;
                case Phase.BUY:
                    this.addBuyCommand(game);
                    break;
            }
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

Game.addPlayer = function (game, index) {
    if (game.state === State.PLAYING && game.active === index) {
        this.addSprite('view/active.png', 0, 503, index * 78 + 29, 15, 15);
    }

    if (game.state === State.PLAYING && game.priority === index) {
        this.addSprite('view/priority.png', 0, 523, index * 78 + 26, 112, 21);
    }

    this.addLabel(game.playerList[index].uid, 524, index * 78 + 28);

    this.addLabel('$' + game.playerList[index].money, 640, index * 78 + 28);

    var frame;

    if (
           game.state === State.READY
        || game.playerList[index].uid === uid
    ) {
        frame = 0;
    } else {
        frame = 108;
    }

    var i;
    var len1 = game.playerList[index].hand.length;
    for (i = 0; i < len1; i++) {
        if (frame !== 108) {
            frame = game.playerList[index].hand[i];

            this.addSprite('view/tile.png', frame, i * 50 + 504, index * 78 + 52, 40, 40);

            var j;
            var len2 = game.playerList[index].fresh.length;
            for(j = 0; j < len2; j++) {
                if (frame === game.playerList[index].fresh[j]) {
                    this.addSprite('view/fresh.png', 0, i * 50 + 501, index * 78 + 87, 46, 10);
                }
            }

            if (
                game.state === State.PLAYING
                && game.phase === Phase.PLAY
                && game.priority === index
                && game.canTrash
                && Game.isDeadTile(game, i)
                ) {
                this.addSprite(
                    'view/tile.png'
                    , 110
                    , i * 50 + 504
                    , index * 78 + 52
                    , 40
                    , 40
                    , function () {
                        var _i = i;

                        return function () {
                            Game.send('f' + _i);
                        };
                    }()
                    , 0.5
                );
            }
        } else {
            this.addSprite('view/tile.png', frame, i * 50 + 504, index * 78 + 52, 40, 40);
        }
    }
}

Game.addMarket = function (game) {
    if (game.map.length > 0) {
        var hasHotelChainTab = false;
        var hasMarketTab = false;
        var hasExchangeRateTab = false;

        switch (Game.tab) {
            case Tab.HOTEL_CHAIN:
                hasMarketTab = hasExchangeRateTab = true;
                this.addHotelChainTab(game);
                break;
            case Tab.MARKET:
                hasHotelChainTab = hasExchangeRateTab = true;
                this.addMarketTab(game);
                break;
            case Tab.EXCHANGE_RATE:
                hasHotelChainTab = hasMarketTab = true;
                this.addSprite('view/market.png', Tab.EXCHANGE_RATE, 10, 8, 480, 165);
                break;
        }

        if (hasHotelChainTab) {
            this.addSprite('view/tab.png', 0, 10, 8, 36, 36, function () {
                Game.tab = Tab.HOTEL_CHAIN;
                Game.rePaint(game);
            });
        }

        if (hasMarketTab) {
            this.addSprite('view/tab.png', 0, 10, 46, 36, 36, function () {
                Game.tab = Tab.MARKET;
                Game.rePaint(game);
            });
        }

        if (hasExchangeRateTab) {
            this.addSprite('view/tab.png', 0, 10, 84, 36, 36, function () {
                Game.tab = Tab.EXCHANGE_RATE;
                Game.rePaint(game);
            });
        }
    }
}

Game.addHotelChainTab = function (game) {
    this.addSprite('view/market.png', Tab.HOTEL_CHAIN, 10, 8, 480, 165);
    this.addLabel('残り:' + game.deck.length + '枚', 238, 35, '28px');
}

Game.addMarketTab = function (game) {
    this.addSprite('view/market.png', Tab.MARKET, 10, 8, 480, 165);

    var i;
    var len1 = game.certificate.length;
    for (i = 0; i < len1; i++) {
        this.addLabel(game.certificate[i] + '枚', i * 57 + 103, 32, '12px');
        this.addLabel('$' + Game.getStockPrice(game, i), i * 57 + 98, 49, '12px');
        this.addLabel('$' + Game.getMajorityBonus(game, i), i * 57 + 94, 66, '12px');
        this.addLabel('$' + Game.getMinorityBonus(game, i), i * 57 + 94, 83, '12px');
    }

    len1 = game.playerList.length;
    for (i = 0; i < len1; i++) {
        var j;
        var len2 = game.playerList[i].certificate.length;
        for(j = 0; j < len2; j++) {
            this.addLabel(game.playerList[i].certificate[j] + '枚', j * 57 + 103, i * 17 + 102, '12px');
        }
    }
}

Game.addMap = function (game) {
    if (game.map.length > 0) {
        this.addSprite('view/map.png', 0, 10, 175, 480, 360);

        var i;
        var len1 = game.map.length;
        for (i = 0; i < len1; i++) {
            if (game.map[i].isCover) {
                this.addSprite('view/tile.png', i, (i % 12) * 40 + 10, Math.floor(i / 12) * 40 + 175, 40, 40);
            }
        }

        if (game.justTile !== Position.NONE) {
            this.addSprite(
                 'view/tile.png'
                , 109
                , (game.justTile % 12) * 40 + 10
                , Math.floor(game.justTile / 12) * 40 + 175
                , 40
                , 40
                , null
                , 0.5
            );
        }
    }
}

Game.addCanPlayTile = function (game) {
    if (
           game.state === State.PLAYING
        && game.phase === Phase.PLAY
        && game.playerList[game.priority].uid === uid
    ) {
        var i;
        var len1 = game.playerList[game.priority].hand.length;
        for (i = 0; i < len1; i++) {
            if (Game.canPlayTile(game, i)) {
                this.addSprite(
                      'view/tile.png'
                    , 110
                    , (game.playerList[game.priority].hand[i] % 12) * 40 + 10
                    , Math.floor(game.playerList[game.priority].hand[i] / 12) * 40 + 175
                    , 40
                    , 40
                    , function () {
                          var _i = i;

                          return function () {
                              Game.send('g' + _i);
                          };
                      }()
                    , 0.5
                );
            }
        }
    }
}

Game.addHotelChain = function (game) {
    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        var independenceX;
        var independenceY;

        var hotelChain = game.hotelChain[i];
        if (hotelChain.position === Position.NONE) {
            if (Game.tab === Tab.HOTEL_CHAIN) {
                this.addSprite(
                      'view/hotelchain-vertical.png'
                    , i
                    , i * 39 + 146
                    , 95
                    , 36
                    , 76
                );

                if (
                       game.state === State.PLAYING
                    && game.phase === Phase.CHAIN
                    && game.playerList[game.priority].uid === uid
                ) {
                    this.addSprite(
                          'view/hotelchain-vertical.png'
                        , 8
                        , i * 39 + 146
                        , 95
                        , 36
                        , 76
                        , function () {
                              var _i = i;

                              return function () {
                                  Game.send('i' + _i);
                              };
                          }()
                        , 0.5
                    );
                }
            }
        } else {
            var positionX = (hotelChain.position % 12) * 40 + 12;
            var positionY = Math.floor(hotelChain.position / 12) * 40 + 177;

            if (hotelChain.rotation === Rotation.HORIZONTAL) {
                this.addSprite(
                      'view/hotelchain-horizontal.png'
                    , i
                    , positionX
                    , positionY
                    , 76
                    , 36
                );

                this.addLabel(hotelChain.size, positionX + 3, positionY + 17, null, i === 2 || i === 3 ? 'white' : 'black');

                if (
                       game.state === State.PLAYING
                    && game.phase === Phase.ABSORB
                    && game.playerList[game.priority].uid === uid
                    && hotelChain.isParent
                ) {
                    this.addSprite(
                          'view/hotelchain-horizontal.png'
                        , 8
                        , positionX
                        , positionY
                        , 76
                        , 36
                        , function () {
                              var _i = i;

                              return function () {
                                  Game.send('j' + _i);
                              };
                          }()
                        , 0.5
                    );
                }

                independenceX = positionX + 54;
                independenceY = positionY + 1;
            } else {
                this.addSprite(
                      'view/hotelchain-vertical.png'
                    , i
                    , positionX
                    , positionY
                    , 36
                    , 76
                );

                this.addLabel(hotelChain.size, positionX + 3, positionY + 57, null, i === 2 || i === 3 ? 'white' : 'black');

                if (
                       game.state === State.PLAYING
                    && game.phase === Phase.ABSORB
                    && game.playerList[game.priority].uid === uid
                    && hotelChain.isParent
                ) {
                    this.addSprite(
                          'view/hotelchain-vertical.png'
                        , 8
                        , positionX
                        , positionY
                        , 36
                        , 76
                        , function () {
                            var _i = i;

                            return function () {
                                Game.send('j' + _i);
                            };
                        }()
                        , 0.5
                    );
                }

                independenceX = positionX + 14;
                independenceY = positionY + 1;
            }

            if (hotelChain.size >= 41) {
                this.addSprite(
                      'view/independence.png'
                    , 1
                    , independenceX
                    , independenceY
                    , 22
                    , 22
                );
            } else if (hotelChain.size >= 11) {
                this.addSprite(
                     'view/independence.png'
                    , 0
                    , independenceX
                    , independenceY
                    , 22
                    , 22
                );
            }

            if (
                    hotelChain.isSubsidiary
                && (
                       game.phase === Phase.MERGE
                    || game.phase === Phase.SELL
                    || game.phase === Phase.TRADE
                )
            ) {
                if (hotelChain.rotation === Rotation.HORIZONTAL) {
                    this.addSprite(
                          'view/hotelchain-horizontal.png'
                        , 7
                        , positionX
                        , positionY
                        , 76
                        , 36
                        , null
                        , 0.5
                    );
                } else {
                    this.addSprite(
                          'view/hotelchain-vertical.png'
                        , 7
                        , positionX
                        , positionY
                        , 36
                        , 76
                        , null
                        , 0.5
                    );
                }
            }
        }
    }
}

Game.addPlayCommand = function (game) {
    var i;
    var len1 = this.buy.output.length;
    for (i = 0; i < len1; i++) { this.buy.output[i] = 0; }

    this.addLabel('タイルを配置して下さい。', 572, 400);

    this.addSprite('view/button.png', 7, 610, 425, 80, 25, function () {
        if (!Game.hasCanPlayTile(game)) { Game.send('h'); }
    });
}

Game.addMergeCommand = function () {
    this.trade.ticket = 0;
    this.sell.summary = 0;

    var i;
    for (i = 0; i < 7; i++) {
        this.trade.input[i] = this.trade.output[i] = this.sell.input[i] = 0;
    }

    this.addSprite('view/skin.png', 2, 499, 338, 299, 205);

    this.addSprite('view/button.png', 8, 520, 358, 80, 25, function () {
        Game.send('k');
    });

    this.addSprite('view/button.png', 9, 610, 358, 80, 25, function () {
        Game.send('m');
    });

    this.addSprite('view/button.png', 4, 700, 358, 80, 25, function () {
        Game.send('o');
    });
}

Game.addBuyCommand = function (game) {
    this.buy.ticket = game.buyTicket;
    this.buy.summary = 0;

    var i;
    var len1 = this.buy.output.length;
    for (i = 0; i < len1; i++) {
        this.buy.ticket -= this.buy.output[i];

        if (this.buy.output[i] > 0) {
            this.buy.summary += this.getStockPrice(game, i) * this.buy.output[i];
        }
    }

    this.addSprite('view/skin.png', 0, 499, 338, 299, 205);
    this.addLabel('株券を購入できます。', 514, 351);

    var ticketLabel = this.addLabel('残り:' + this.buy.ticket + '枚', 588, 468);
    var sumLabel = this.addLabel('合計:$' + this.buy.summary, 655, 468);

    len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        if (game.hotelChain[i].position !== Position.NONE) {
            var stockPrice = this.getStockPrice(game, i);
            this.addLabel('' + stockPrice, i * 40 + 519, 406, '12px');

            var outputLabel = this.addLabel('' + this.buy.output[i], i * 40 + 521, 435, '12px');

            this.addSprite('view/updown.png', 0, i * 40 + 538, 427, 15, 15, function () {
                var _i = i;
                var _outputLabel = outputLabel;
                var _stockPrice = stockPrice;

                return function () {
                    if (
                           Game.buy.ticket > 0
                        && game.certificate[_i] - Game.buy.output[_i] > 0
                        && game.playerList[game.priority].money - (Game.buy.summary + _stockPrice) >= 0
                    ) {
                        Game.buy.output[_i]++;
                        Game.buy.summary += _stockPrice;
                        Game.buy.ticket--;
                        _outputLabel.text = '' + Game.buy.output[_i];
                        ticketLabel.text = '残り:' + Game.buy.ticket + '枚';
                        sumLabel.text = '合計:$' + Game.buy.summary;
                    }
                };
            }());

            this.addSprite('view/updown.png', 1, i * 40 + 538, 441, 15, 15, function () {
                var _i = i;
                var _outputLabel = outputLabel;
                var _stockPrice = stockPrice;

                return function () {
                    if (Game.buy.output[_i] > 0) {
                        Game.buy.output[_i]--;
                        Game.buy.summary -= _stockPrice;
                        Game.buy.ticket++;
                        _outputLabel.text = '' + Game.buy.output[_i];
                        ticketLabel.text = '残り:' + Game.buy.ticket + '枚';
                        sumLabel.text = '合計:$' + Game.buy.summary;
                    }
                };
            }());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 514, 399, 39, 29);
            this.addSprite('view/lock.png', 0, i * 40 + 514, 427, 39, 29);
        }
    }

    this.addSprite('view/button.png', 3, 520, 500, 80, 25, function () {
        if (Game.buy.summary > 0) {
            Game.send('p' + Game.buy.output.join(' '));

            len1 = Game.buy.output.length;
            for (i = 0; i < len1; i++) {
                Game.buy.output[i] = 0;
            }
        }
    });

    this.addSprite('view/button.png', 4, 610, 500, 80, 25, function () {
        Game.send('q');
    });
    
    this.addSprite('view/button.png', 5, 700, 500, 80, 25, function () {
        if (Game.isFinish(game)) { Game.send('r'); }
    });
}

Game.addSellCommand = function (game) {
    this.addSprite('view/skin.png', 0, 499, 338, 299, 205);
    this.addLabel('吸収ホテルチェーンの株券を売却できます。', 514, 351);

    var sumLabel = this.addLabel('合計:$' + this.sell.summary, 612, 468);

    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        if (game.hotelChain[i].isSubsidiary) {
            var stockPrice = this.getStockPrice(game, i);
            this.addLabel('' + stockPrice, i * 40 + 519, 406, '12px');

            var inputLabel = this.addLabel('' + this.sell.input[i], i * 40 + 521, 435, '12px');
            
            this.addSprite('view/updown.png', 0, i * 40 + 538, 427, 15, 15, function () {
                var _i = i;
                var _inputLabel = inputLabel;
                var _stockPrice = stockPrice;
                
                return function () {
                    if (game.playerList[game.priority].certificate[_i] - Game.sell.input[_i] > 0) {
                        Game.sell.input[_i]++;
                        Game.sell.summary += _stockPrice;
                        _inputLabel.text = '' + Game.sell.input[_i];
                        sumLabel.text = '合計:$' + Game.sell.summary;
                    }
                };
            }());

            this.addSprite('view/updown.png', 1, i * 40 + 538, 441, 15, 15, function () {
                var _i = i;
                var _inputLabel = inputLabel;
                var _stockPrice = stockPrice;
                
                return function () {
                    if (Game.sell.input[_i] > 0) {
                        Game.sell.input[_i]--;
                        Game.sell.summary -= _stockPrice;
                        _inputLabel.text = '' + Game.sell.input[_i];
                        sumLabel.text = '合計:$' + Game.sell.summary;
                    }
                };
            }());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 514, 399, 39, 29);
            this.addSprite('view/lock.png', 0, i * 40 + 514, 427, 39, 29);
        }
    }
    
    this.addSprite('view/button.png', 3, 570, 500, 80, 25, function () {
        if (Game.sell.summary > 0) { Game.send('l' + Game.sell.input.join(' ')); }
    });
    
    this.addSprite('view/button.png', 6, 660, 500, 80, 25, function () {
        Game.send('e');
    });
}

Game.addTradeCommand = function (game) {
    this.addSprite('view/skin.png', 1, 499, 338, 299, 205);
    this.addLabel('吸収ホテルチェーンの株券を交換できます。', 514, 351);

    var ticketLabel = this.addLabel('残り:' + this.trade.ticket + '枚', 612, 468);

    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        if (game.hotelChain[i].isSubsidiary) {
            var inputLabel = this.addLabel('' + this.trade.input[i], i * 40 + 521, 406, '12px');
            
            this.addSprite('view/updown.png', 0, i * 40 + 538, 399, 15, 15, function () {
                var _inputLabel = inputLabel;
                var _i = i;
                
                return function () {
                    if (game.playerList[game.priority].certificate[_i] - Game.trade.input[_i] > 1) {
                        Game.trade.input[_i] += 2;
                        Game.trade.ticket++;
                        _inputLabel.text = '' + Game.trade.input[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket + '枚';
                    }
                };
            }());

            this.addSprite('view/updown.png', 1, i * 40 + 538, 413, 15, 15, function () {
                var _inputLabel = inputLabel;
                var _i = i;
                
                return function () {
                    if (Game.trade.ticket > 0 && Game.trade.input[_i] > 0) {
                        Game.trade.input[_i] -= 2;
                        Game.trade.ticket--;
                        _inputLabel.text = '' + Game.trade.input[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket + '枚';
                    }
                };
            }());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 514, 399, 39, 29);
        }
        
        if (game.hotelChain[i].isParent) {
            var outputLabel = this.addLabel('' + this.trade.output[i], i * 40 + 521, 435, '12px');
            
            this.addSprite('view/updown.png', 0, i * 40 + 538, 427, 15, 15, function () {
                var _outputLabel = outputLabel;
                var _i = i;
                
                return function () {
                    if (
                           Game.trade.ticket > 0
                        && game.certificate[_i] - Game.trade.output[_i] > 0
                    ) {
                        Game.trade.output[_i]++;
                        Game.trade.ticket--;
                        _outputLabel.text = '' + Game.trade.output[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket + '枚';
                    }
                };
            }());

            this.addSprite('view/updown.png', 1, i * 40 + 538, 441, 15, 15, function () {
                var _outputLabel = outputLabel;
                var _i = i;
                
                return function () {
                    if (Game.trade.output[_i] > 0) {
                        Game.trade.output[_i]--;
                        Game.trade.ticket++;
                        _outputLabel.text = '' + Game.trade.output[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket + '枚';
                    }
                };
            }());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 514, 427, 39, 29);
        }
    }
    
    this.addSprite('view/button.png', 3, 570, 500, 80, 25, function () {
        if (Game.trade.ticket === 0) {
            len1 = Game.trade.output.length;
            for (i = 0; i < len1; i++) {
                if (Game.trade.output[i] > 0) {
                    Game.send('n' + Game.trade.input.join(' ') + ' ' + Game.trade.output.join(' '));
                    break;
                }
            }
        }
    });
    
    this.addSprite('view/button.png', 6, 660, 500, 80, 25, function () {
        Game.send('e');
    });
}