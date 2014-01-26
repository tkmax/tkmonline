enchant();

var Game = function () { }

Game.isOpen = false;
Game.isSent = false;
Game.isMute = false;
Game.core = null;
Game.tab = 0;
Game.buy = {
    output: [0, 0, 0, 0, 0, 0, 0]
    , ticket: 0
    , sum: 0
};
Game.sell = {
    input: [0, 0, 0, 0, 0, 0, 0]
    , sum: 0
};
Game.trade = {
    input: [0, 0, 0, 0, 0, 0, 0]
    , output: [0, 0, 0, 0, 0, 0, 0]
    , ticket: 0
};
Game.tab = Tab.HotelChain;

Game.send = function (msg) {
    if (!this.isSent) {
        send(msg);
        this.isSent = true;
    }
}

Game.addLabel = function (text, x, y, font) {
    var label;

    if (!font)
        font = '14px "ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro","メイリオ",Meiryo,"ＭＳ Ｐゴシック",sans-serif';
    else
        font += ' ' + '"ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro","メイリオ",Meiryo,"ＭＳ Ｐゴシック",sans-serif'; 
    label = new Label(text);
    label.x = x;
    label.y = y;
    label.font = font;
    this.core.rootScene.addChild(label);

    return label;
}

Game.addSprite = function (image, frame, x, y, width, height, onTouch, opacity) {
    var sprite;

    sprite = new Sprite(width, height);
    sprite.image = this.core.assets[image];
    sprite.frame = frame;
    sprite.x = x;
    sprite.y = y;
    sprite.opacity = opacity;
    if (onTouch) sprite.addEventListener('touchstart', onTouch);
    this.core.rootScene.addChild(sprite);

    return sprite;
}

Game.onLoad = function () {
    this.core = new Core(840, 520);
    this.core.fps = 5;
    this.core.preload(
        'view/active.png', 'view/background.png', 'view/button.png'
        , 'view/hotelchain-horizontal.png', 'view/hotelchain-vertical.png'
        , 'view/lock.png' ,'view/map.png' , 'view/market.png'
        , 'view/priority.png' , 'view/skin.png', 'view/tab.png'
        , 'view/tile.png', 'view/updown.png'
    );
    this.core.onload = function () {
        Game.isOpen = true;
        Game.send('a');
    }
    this.core.start();
}

Game.onMessage = function (game) {
    sound(game.sound);
    this.rePaint(game);
}

Game.rePaint = function(game) {
    this.removeAll();
    this.addBackGround();
    this.addHeadLine(game);
    this.addCommand(game);
    for (i = game.playerNumber - 1; i >= 0; i--) this.addPlayer(game, i);
    this.addMarket(game);
    this.addMap(game);
    this.addHotelChain(game);
}

Game.removeAll = function () {
    this.isSent = false;
    while (this.core.rootScene.childNodes.length > 0)
        this.core.rootScene.removeChild(this.core.rootScene.childNodes[0]);
}

Game.isDeadTile = function (game, index) {
    var i, isJoinHotelChain = [false, false, false, false, false, false, false]
      , hotelChain, safetyHotelChain = 0;

    i = game.playerList[game.priority].hand[index];

    if (i >= 12) {
        hotelChain = game.map[i - 12].hotelChain;
        if (hotelChain !== HotelChain.None) isJoinHotelChain[hotelChain] = true;
    }
    if (i % 12 > 0) {
        hotelChain = game.map[i - 1].hotelChain;
        if (hotelChain !== HotelChain.None) isJoinHotelChain[hotelChain] = true;
    }
    if (i % 12 < 11) {
        hotelChain = game.map[i + 1].hotelChain;
        if (hotelChain !== HotelChain.None) isJoinHotelChain[hotelChain] = true;
    }
    if (i <= 95) {
        hotelChain = game.map[i + 12].hotelChain;
        if (hotelChain !== HotelChain.None) isJoinHotelChain[hotelChain] = true;
    }

    for (i = 0; i < 7; i++)
        if (isJoinHotelChain[i] && game.hotelChain[i].size >= 11) safetyHotelChain++;
    
    if (safetyHotelChain >= 2)
        return true;
    else
        return false;
}

Game.haveDeadTile = function (game) {
    var i, have = false;

    for (i = game.playerList[game.priority].hand.length - 1; !have && i >= 0; i--)
        if (this.isDeadTile(game, i)) have = true;

    return have;
}

Game.canPlayTile = function (game, index) {
    var i, canPlay = false, isAvailable = false, cell, isJoinCoverNone = false
      , isJoinHotelChain = false;

    if (!this.isDeadTile(game, index)) {
        for (i = 0; !isAvailable && i < 7; i++)
            if (game.hotelChain[i].position === Position.None) isAvailable = true;

        if (isAvailable) {
            canPlay = true;
        } else {
            i = game.playerList[game.priority].hand[index];
            
            if (i >= 12) {
                cell = game.map[i - 12];
                if (cell.isCover) {
                    if (cell.hotelChain === HotelChain.None)
                        isJoinCoverNone = true;
                    else
                        isJoinHotelChain = true;
                }
            }
            if (i % 12 > 0) {
                cell = game.map[i - 1];
                if (cell.isCover) {
                    if (cell.hotelChain === HotelChain.None)
                        isJoinCoverNone = true;
                    else
                        isJoinHotelChain = true;
                }
            }
            if (i % 12 < 11) {
                cell = game.map[i + 1];
                if (cell.isCover) {
                    if (cell.hotelChain === HotelChain.None)
                        isJoinCoverNone = true;
                    else
                        isJoinHotelChain = true;
                }
            }
            if (i <= 95) {
                cell = game.map[i + 12];
                if (cell.isCover) {
                    if (cell.hotelChain === HotelChain.None)
                        isJoinCoverNone = true;
                    else
                        isJoinHotelChain = true;
                }
            }

            if (isJoinHotelChain || !isJoinCoverNone) canPlay = true;
        }
    }

    return canPlay;
}

Game.haveCanPlayTile = function (game) {
    var i, priorityPlayer = game.playerList[game.priority], canPlay = false;

    for (i = priorityPlayer.hand.length - 1; !canPlay && i >= 0; i--)
        if (this.canPlayTile(game, i)) canPlay = true;

    return canPlay;
}

Game.isFinish = function (game) {
    var i, haveHotelChain = false, isFinish = false;

    for (i = game.hotelChain.length - 1; i >= 0; i--) {
        if (game.hotelChain[i].position !== Position.None) {
            haveHotelChain = true;

            if (game.hotelChain[i].size >= 41) {
                isFinish = true;
                break;
            } else if (game.hotelChain[i].size < 11) {
                break;
            }
        }
    }
    if (haveHotelChain && i < 0) isFinish = true;

    return isFinish;
}

Game.getStockPrice = function (game, type) {
    var size = game.hotelChain[type].size, price = 0;

    if (size >= 41)
        price = StockPrice[type][8];
    else if(size >= 31)
        price = StockPrice[type][7];
    else if(size >= 21)
        price = StockPrice[type][6];
    else if(size >= 11)
        price = StockPrice[type][5];
    else if(size >= 6)
        price = StockPrice[type][4];
    else if(size >= 5)
        price = StockPrice[type][3];
    else if(size >= 4)
        price = StockPrice[type][2];
    else if(size >= 3)
        price = StockPrice[type][1];
    else if(size >= 2)
        price = StockPrice[type][0];

    return price;
}

Game.getMajorityBonus = function (game, type) {
    var size = game.hotelChain[type].size, bonus = 0;

    if (size >= 41)
        bonus = MajorityBonus[type][8];
    else if(size >= 31)
        bonus = MajorityBonus[type][7];
    else if(size >= 21)
        bonus = MajorityBonus[type][6];
    else if(size >= 11)
        bonus = MajorityBonus[type][5];
    else if(size >= 6)
        bonus = MajorityBonus[type][4];
    else if(size >= 5)
        bonus = MajorityBonus[type][3];
    else if(size >= 4)
        bonus = MajorityBonus[type][2];
    else if(size >= 3)
        bonus = MajorityBonus[type][1];
    else if(size >= 2)
        bonus = MajorityBonus[type][0];

    return bonus;
}

Game.getMinorityBonus = function (game, type) {
    var size = game.hotelChain[type].size, bonus = 0;

    if (size >= 41)
        bonus = MinorityBonus[type][8];
    else if(size >= 31)
        bonus = MinorityBonus[type][7];
    else if(size >= 21)
        bonus = MinorityBonus[type][6];
    else if(size >= 11)
        bonus = MinorityBonus[type][5];
    else if(size >= 6)
        bonus = MinorityBonus[type][4];
    else if(size >= 5)
        bonus = MinorityBonus[type][3];
    else if(size >= 4)
        bonus = MinorityBonus[type][2];
    else if(size >= 3)
        bonus = MinorityBonus[type][1];
    else if(size >= 2)
        bonus = MinorityBonus[type][0];

    return bonus;
}

Game.addBackGround = function () {
    this.addSprite('view/background.png', 0, 0, 0, 840, 520);
}

Game.addHeadLine = function (game) {
    var text = '';

    if (game.state === State.Ready) {
        text = '募集中';
    } else {
        switch (game.phase) {
            case Phase.StartUp:
                text = '対戦中 - ターン開始';
                break;
            case Phase.Trash:
                text = '対戦中 - デッドタイル';
                break;
            case Phase.Play:
                text = '対戦中 - タイル配置';
                break;
            case Phase.Chain:
                text = '対戦中 - チェーン';
                break;
            case Phase.Absorb:
                text = '対戦中 - 合併(親チェーン選択)';
                break;
            case Phase.Merge:
                text = '対戦中 - 合併';
                break;
            case Phase.Sell:
                text = '対戦中 - 合併(売却)';
                break;
            case Phase.Trade:
                text = '対戦中 - 合併(交換)';
                break;
            case Phase.Buy:
                text = '対戦中 - 購入';
                break;
            case Phase.Draw:
                text = '対戦中 - ドロー';
                break;
        }
    }
    this.addLabel(text, 527, 5);
}

Game.addCommand = function (game) {
    var i, sprite, canJoin, canLeave, canStart;

    if (game.state === State.Ready) {
        canJoin = canLeave = canStart = false;
        for (i = game.playerList.length - 1; i >= 0; i--) {
            if (game.playerList[i].uid === '')
                canJoin = true;
            else
                if (game.playerList[i].uid === uid) canLeave = true;
        }
        if (
               game.playerList[0].uid !== ''
            && game.playerList[1].uid !== ''
            && game.playerList[2].uid !== ''
        ) canStart = true;
        if (canJoin) {
            this.addSprite('view/button.png', 0, 642, 410, 80, 25, function () {
                Game.send('b');
            });
        }
        if (canLeave) {
            this.addSprite('view/button.png', 1, 732, 410, 80, 25, function () {
                Game.send('c');
            });
            if (canStart) {
                this.addSprite('view/button.png', 2, 552, 410, 80, 25, function () {
                    Game.send('d');
                });
            }
        }
    } else {
        if (game.playerList[game.priority].uid === uid) {
            switch (game.phase) {
                case Phase.Play:
                    this.addLabel('タイルを配置して下さい。', 600, 400);
                    this.addSprite('view/button.png', 6, 600, 425, 80, 25, function () {
                        if (game.canTrash && Game.haveDeadTile(game)) Game.send('f');
                    });
                    this.addSprite('view/button.png', 7, 690, 425, 80, 25, function () {
                        if (!Game.haveCanPlayTile(game)) Game.send('i');
                    });
                    break;
                case Phase.Trash:
                    this.addLabel('デッドタイルを廃棄して下さい。', 580, 400);
                    this.addSprite('view/button.png', 10, 640, 425, 80, 25, function () {
                        Game.send('e');
                    });
                    break;
                case Phase.Chain:
                    this.addLabel('ホテルチェーンを配置して下さい。', 575, 415);
                    break;
                case Phase.Absorb:
                    this.addLabel('親チェーンを選択して下さい。', 600, 415);
                    break;
                case Phase.Merge:
                    this.addSprite('view/button.png', 8, 552, 348, 80, 25, function () {
                        Game.send('l');
                    });
                    this.addSprite('view/button.png', 9, 642, 348, 80, 25, function () {
                        Game.send('n');
                    });
                    this.addSprite('view/button.png', 4, 732, 348, 80, 25, function () {
                        Game.send('p');
                    });
                    break;
                case Phase.Sell:
                    this.addSellCommand(game);
                    break;
                case Phase.Trade:
                    this.addTradeCommand(game);
                    break;
                case Phase.Buy:
                    this.addBuyCommand(game);
                    break;
            }
        }
    }
}

Game.addPlayer = function (game, playerIndex) {
    var i, j, frame;

    if (game.state === State.Playing && game.active === playerIndex)
        this.addSprite('view/active.png', 0, 529, 78 * playerIndex + 29, 15, 15);

    if (game.state === State.Playing && game.priority === playerIndex)
        this.addSprite('view/priority.png', 0, 549, 78 * playerIndex + 26, 112, 21);

    this.addLabel(game.playerList[playerIndex].uid, 550, 78 * playerIndex + 28);

    this.addLabel('$' + game.playerList[playerIndex].money, 667, 78 * playerIndex + 30);

    if (
           game.state === State.Ready
        || game.playerList[playerIndex].uid === uid
    )
        frame = 0;
    else
        frame = 108;

    for (i = game.playerList[playerIndex].hand.length - 1; i >= 0; i--) {
        if (frame !== 108) frame = game.playerList[playerIndex].hand[i];
        this.addSprite('view/tile.png', frame, i * 50 + 535, 78 * playerIndex + 55, 42, 42, function () {
            var _i = i;

            if (
                   game.state === State.Playing
                && game.priority === playerIndex
            ) {
                switch (game.phase) {
                    case Phase.Play:
                        if (Game.canPlayTile(game, _i)) {
                            return function () {
                                Game.send('h' + _i);
                            };
                        }
                        break;
                    case Phase.Trash:
                        if (Game.isDeadTile(game, _i)) {
                            return function () {
                                Game.send('g' + _i);
                            };
                        }
                        break;
                }
            }
        } ());
    }
}

Game.addMarket = function (game) {
    var haveHotelChainTab = false, haveMarketTab = false, haveStockHolderTab = false;

    if (game.map.length > 0) {
        switch (Game.tab) {
            case Tab.HotelChain:
                haveMarketTab = haveStockHolderTab = true;
                this.addHotelChainTab(game);
                break;
            case Tab.Market:
                haveHotelChainTab = haveStockHolderTab = true;
                this.addMarketTab(game);
                break;
            case Tab.StockHolder:
                haveHotelChainTab = haveMarketTab = true;
                this.addStockHolderTab(game);
                break;
        }
        if (haveHotelChainTab) {
            this.addSprite('view/tab.png', 0, 11, 8, 53, 18, function () {
                Game.tab = Tab.HotelChain;
                Game.rePaint(game);
            });
        }
        if (haveMarketTab) {
            this.addSprite('view/tab.png', 0, 65, 8, 53, 18, function () {
                Game.tab = Tab.Market;
                Game.rePaint(game);
            });
        }
        if (haveStockHolderTab) {
            this.addSprite('view/tab.png', 0, 119, 8, 53, 18, function () {
                Game.tab = Tab.StockHolder;
                Game.rePaint(game);
            });
        }
    }
}

Game.addHotelChainTab = function (game) {
    this.addSprite('view/market.png', 0, 10, 8, 506, 108);
    this.addLabel('残り:' + game.deck.length, 88, 52, '28px');
}

Game.addMarketTab = function (game) {
    var i;

    this.addSprite('view/market.png', 1, 10, 8, 506, 108);
    for (i = game.certificate.length - 1; i >= 0; i--) {
        this.addLabel(game.certificate[i] + '枚', i * 57 + 95, 46, '12px');
        this.addLabel('$' + Game.getStockPrice(game, i), i * 57 + 90, 63, '12px');
        this.addLabel('$' + Game.getMajorityBonus(game, i), i * 57 + 86, 80, '12px');
        this.addLabel('$' + Game.getMinorityBonus(game, i), i * 57 + 86, 97, '12px');
    }
}

Game.addStockHolderTab = function (game) {
    var i, j;

    this.addSprite('view/market.png', 2, 10, 8, 506, 108);
    for (i = game.playerList.length - 1; i >= 0; i--) {
        this.addLabel(game.playerList[i].uid, 74, i * 17 + 45, '11px');
        for(j = game.playerList[i].certificate.length - 1; j >= 0; j--) {
            this.addLabel(game.playerList[i].certificate[j] + '枚', j * 44 + 178, i * 17 + 47, '11px');
        }
    }
}

Game.addMap = function (game) {
    var i;

    if (game.map.length > 0) {
        this.addSprite('view/map.png', 0, 10, 125, 506, 380);
        for (i = game.map.length - 1; i >= 0; i--) {
            if (game.map[i].isCover)
                this.addSprite('view/tile.png', i, (i % 12) * 42 + 11, Math.floor(i / 12) * 42 + 126, 42, 42);
        }
        if (game.justPlayTile !== Position.None) {
            this.addSprite(
                'view/tile.png', 109, (game.justPlayTile % 12) * 42 + 11
                , Math.floor(game.justPlayTile / 12) * 42 + 126, 42, 42, null, 0.5
            );
        }
    }
}

Game.addHotelChain = function (game) {
    var i, hotelChain, position, onTouch;

    for (i = 0; i < game.hotelChain.length; i++) {
        hotelChain = game.hotelChain[i];
        if (hotelChain.position === Position.None) {
            if (Game.tab === Tab.HotelChain) {
                this.addSprite('view/hotelchain-vertical.png', i, i * 43 + 212, 29, 38, 80, function () {
                    var _i = i;

                    if (
                           game.state === State.Playing
                        && game.playerList[game.priority].uid === uid
                        && game.phase === Phase.Chain
                    ) {
                        return function () {
                            Game.send('j' + _i);
                        };
                    }
                } ());
            }
        } else {
            position = hotelChain.position;
            onTouch = function () {
                var _i = i;

                if (
                       game.state === State.Playing
                    && game.playerList[game.priority].uid === uid
                    && game.phase === Phase.Absorb
                    && game.hotelChain[_i].isParent
                ) {
                    return function () {
                        Game.send('k' + _i);
                    };
                }
            }
            if (hotelChain.rotation === Rotation.Horizontal) {
                this.addSprite(
                    'view/hotelchain-horizontal.png', i
                    , (position % 12) * 42 + 13
                    , Math.floor(position / 12) * 42 + 128, 80, 38
                    , onTouch()
                );
            } else {
                this.addSprite(
                    'view/hotelchain-vertical.png', i
                    , (position % 12) * 42 + 13
                    , Math.floor(position / 12) * 42 + 128, 38, 80
                    , onTouch()
                );
            }
            if (
                game.hotelChain[i].isSubsidiary
                && (
                       game.phase === Phase.Merge
                    || game.phase === Phase.Sell
                    || game.phase === Phase.Trade
                )
            ) {
                if (hotelChain.rotation === Rotation.Horizontal) {
                    this.addSprite(
                        'view/hotelchain-horizontal.png', 7
                        , (position % 12) * 42 + 13
                        , Math.floor(position / 12) * 42 + 128, 80, 38
                        , null, 0.5
                    );
                } else {
                    this.addSprite(
                        'view/hotelchain-vertical.png', 7
                        , (position % 12) * 42 + 13
                        , Math.floor(position / 12) * 42 + 128, 38, 80
                        , null, 0.5
                    );
                }
            }
        }
    }
}

Game.addBuyCommand = function (game) {
    var i, hotelChain = game.hotelChain, stockPrice, ticketLabel, sumLabel, outputLabel;

    for (i = this.buy.output.length - 1; i >= 0; i--)
        this.buy.output[i] = 0;

    this.buy.ticket = game.buyTicket;
    this.buy.sum = 0;

    this.addSprite('view/skin.png', 0, 525, 338, 313, 180);
    this.addLabel('株券を購入できます。', 530, 346);
    ticketLabel = this.addLabel('残り:' + this.buy.ticket, 530, 455);
    sumLabel = this.addLabel('合計:$' + this.buy.sum, 590, 455);

    for (i = hotelChain.length - 1; i >= 0; i--) {
        if (hotelChain[i].position !== Position.None) {
            stockPrice = this.getStockPrice(game, i);
            this.addLabel('' + stockPrice, i * 40 + 560, 401, '12px');
            outputLabel = this.addLabel('' + this.buy.output[i], i * 40 + 558, 430, '12px');

            this.addSprite('view/updown.png', 0, i * 40 + 579, 422, 15, 15, function () {
                var _i = i, _outputLabel = outputLabel, _stockPrice = stockPrice;

                return function () {
                    if (
                           Game.buy.ticket > 0
                        && game.certificate[_i] - Game.buy.output[_i] > 0
                        && game.playerList[game.priority].money - (Game.buy.sum + _stockPrice) > 0
                    ) {
                        Game.buy.output[_i]++;
                        Game.buy.sum += _stockPrice;
                        Game.buy.ticket--;
                        _outputLabel.text = '' + Game.buy.output[_i];
                        ticketLabel.text = '残り:' + Game.buy.ticket;
                        sumLabel.text = '合計:$' + Game.buy.sum;
                    }
                };
            } ());
            this.addSprite('view/updown.png', 1, i * 40 + 579, 436, 15, 15, function () {
                var _i = i, _outputLabel = outputLabel, _stockPrice = stockPrice;

                return function () {
                    if (Game.buy.output[_i] > 0) {
                        Game.buy.output[_i]--;
                        Game.buy.sum -= _stockPrice;
                        Game.buy.ticket++;
                        _outputLabel.text = '' + Game.buy.output[_i];
                        ticketLabel.text = '残り:' + Game.buy.ticket;
                        sumLabel.text = '合計:$' + Game.buy.sum;
                    }
                };
            } ());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 555, 394, 39, 29);
            this.addSprite('view/lock.png', 0, i * 40 + 555, 422, 39, 29);
        }
    }

    this.addSprite('view/button.png', 3, 552, 480, 80, 25, function () {
        if (Game.buy.sum > 0) Game.send('q' + Game.buy.output.join(' '));
    });

    this.addSprite('view/button.png', 4, 642, 480, 80, 25, function () {
        Game.send('r');
    });

    this.addSprite('view/button.png', 5, 732, 480, 80, 25, function () {
        if (Game.isFinish(game)) Game.send('s');
    });
}

Game.addSellCommand = function (game) {
    var i, hotelChain = game.hotelChain, stockPrice, sumLabel, inputLabel;

    for (i = this.sell.input.length - 1; i >= 0; i--)
        this.sell.input[i] = 0;

    this.sell.sum = 0;

    this.addSprite('view/skin.png', 1, 525, 338, 313, 180);
    this.addLabel('吸収ホテルチェーンの株券を売却できます。', 530, 346);
    sumLabel = this.addLabel('合計:$' + this.sell.sum, 530, 455);

    for (i = hotelChain.length - 1; i >= 0; i--) {
        if (hotelChain[i].isSubsidiary) {
            stockPrice = this.getStockPrice(game, i);
            this.addLabel('' + stockPrice, i * 40 + 560, 401, '12px');
            inputLabel = this.addLabel('' + this.sell.input[i], i * 40 + 558, 425, '12px');

            this.addSprite('view/updown.png', 0, i * 40 + 579, 422, 15, 15, function () {
                var _i = i, _inputLabel = inputLabel, _stockPrice = stockPrice;

                return function () {
                    if (game.playerList[game.priority].certificate[_i] - Game.sell.input[_i] > 0) {
                        Game.sell.input[_i]++;
                        Game.sell.sum += _stockPrice;
                        _inputLabel.text = '' + Game.sell.input[_i];
                        sumLabel.text = '合計:$' + Game.sell.sum;
                    }
                };
            } ());
            this.addSprite('view/updown.png', 1, i * 40 + 579, 436, 15, 15, function () {
                var _i = i, _inputLabel = inputLabel, _stockPrice = stockPrice;

                return function () {
                    if (Game.sell.input[_i] > 0) {
                        Game.sell.input[_i]--;
                        Game.sell.sum -= _stockPrice;
                        _inputLabel.text = '' + Game.sell.input[_i];
                        sumLabel.text = '合計:$' + Game.sell.sum;
                    }
                };
            } ());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 555, 394, 39, 29);
            this.addSprite('view/lock.png', 0, i * 40 + 555, 422, 39, 29);
        }
    }

    this.addSprite('view/button.png', 3, 552, 480, 80, 25, function () {
        if (Game.sell.sum > 0) {
            Game.send('m' + Game.sell.input.join(' '));
        }
    });

    this.addSprite('view/button.png', 10, 642, 480, 80, 25, function () {
        Game.send('e');
    });
}

Game.addTradeCommand = function (game) {
    var i, hotelChain = game.hotelChain, stockPrice, ticketLabel, inputLabel, outputLabel;

    for (i = this.sell.input.length - 1; i >= 0; i--)
        this.trade.input[i] = this.trade.output[i] = 0;

    this.trade.ticket = 0;

    this.addSprite('view/skin.png', 2, 525, 338, 313, 180);
    this.addLabel('吸収ホテルチェーンの株券を交換できます。', 530, 346);
    ticketLabel = this.addLabel('残り:' + this.trade.ticket, 530, 455);

    for (i = hotelChain.length - 1; i >= 0; i--) {
        if (hotelChain[i].isSubsidiary) {
            inputLabel = this.addLabel('' + this.trade.input[i], i * 40 + 560, 401, '12px');

            this.addSprite('view/updown.png', 0, i * 40 + 579, 394, 15, 15, function () {
                var _i = i, _inputLabel = inputLabel;

                return function () {
                    if (game.playerList[game.priority].certificate[_i] - Game.trade.input[_i] > 1) {
                        Game.trade.input[_i] += 2;
                        Game.trade.ticket++;
                        _inputLabel.text = '' + Game.trade.input[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket;
                    }
                };
            } ());
            this.addSprite('view/updown.png', 1, i * 40 + 579, 408, 15, 15, function () {
                var _i = i, _inputLabel = inputLabel;

                return function () {
                    if (Game.trade.ticket > 0 && Game.trade.input[_i] > 0) {
                        Game.trade.input[_i] -= 2;
                        Game.trade.ticket--;
                        _inputLabel.text = '' + Game.trade.input[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket;
                    }
                };
            } ());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 555, 394, 39, 29);
        }

        if (hotelChain[i].isParent) {
            outputLabel = this.addLabel('' + this.trade.output[i], i * 40 + 560, 429, '12px');

            this.addSprite('view/updown.png', 0, i * 40 + 579, 422, 15, 15, function () {
                var _i = i, _outputLabel = outputLabel;

                return function () {
                    if (Game.trade.ticket > 0) {
                        Game.trade.output[_i]++;
                        Game.trade.ticket--;
                        _outputLabel.text = '' + Game.trade.output[_i];
                        ticketLabel.text = '残り:' + Game.trade.ticket;
                    }
                };
            } ());
            this.addSprite('view/updown.png', 1, i * 40 + 579, 436, 15, 15, function () {
                var _i = i, _outputLabel = outputLabel;

                return function () {
                    if (Game.trade.output[_i] > 0) {
                        Game.trade.output[_i]--;
                        Game.trade.ticket++;
                        _outputLabel.text = '' + Game.trade.output[_i];
                        ticketLabel.text = '合計:' + Game.trade.ticket;
                    }
                };
            } ());
        } else {
            this.addSprite('view/lock.png', 0, i * 40 + 555, 422, 39, 29);
        }
    }

    this.addSprite('view/button.png', 3, 552, 480, 80, 25, function () {
        var i;

        if (Game.trade.ticket === 0) {
            for (i = Game.trade.output.length - 1; i >= 0; i--) {
                if (Game.trade.output[i] > 0) {
                    Game.send(
                        'o' + Game.trade.input.join(' ')
                        + ' ' + Game.trade.output.join(' ')
                    );
                    break;
                }
            }
        }
    });

    this.addSprite('view/button.png', 10, 642, 480, 80, 25, function () {
        Game.send('e');
    });
}