enchant();

var Game = function () { }

Game.isOpen = false;
Game.canSend = true;
Game.core = null;

Game.colorPosition = [
      { x : 132, y : 446 }
    , { x : 392, y : 446 }
    , { x : 392, y : 71 }
    , { x : 132, y : 71 }
];

Game.activePosition = [
      { x : 135, y : 449 }
    , { x : 395, y : 449 }
    , { x : 395, y : 74 }
    , { x : 135, y : 74 }
];

Game.priorityPosition = [
      { x : 156, y : 446 }
    , { x : 416, y : 446 }
    , { x : 416, y : 71 }
    , { x : 156, y : 71 }
];

Game.uidPosition = [
      { x : 158, y : 448 }
    , { x : 418, y : 448 }
    , { x : 418, y : 73 }
    , { x : 158, y : 73 }
];

Game.handPosition = [
      { x : 153, y : 480, xm : 45, ym : 0, rotation : 0 }
    , { x : 550, y : 402, xm : 0, ym : -45, rotation : 270 }
    , { x : 468, y : 8, xm : -45, ym : 0, rotation : 180 }
    , { x : 70, y : 86, xm : 0, ym : 45, rotation : 90 }
];

Game.defensePosition = [
      { x : 245, y : 333, xm : 43, ym : 0, rotation : 0 }
    , { x : 425, y : 310, xm : 0, ym : -43, rotation : 270 }
    , { x : 376, y : 155, xm : -43, ym : 0, rotation : 180 }
    , { x : 195, y : 178, xm : 0, ym : 43, rotation : 90 }
];

Game.offensePosition = [
      { x : 245, y : 388, xm : 43, ym : 0, rotation : 0 }
    , { x : 480, y : 310, xm : 0, ym : -43, rotation : 270 }
    , { x : 376, y : 100, xm : -43, ym : 0, rotation : 180 }
    , { x : 140, y : 178, xm : 0, ym : 43, rotation : 90 }
];

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

Game.addSprite = function (image, frame, x, y, width, height, onTouch, opacity, rotation) {
    var sprite = new Sprite(width, height);

    sprite.image = this.core.assets[image];
    sprite.frame = frame;
    sprite.x = x;
    sprite.y = y;

    if (onTouch) { sprite.addEventListener('touchstart', onTouch); }
    if (opacity || opacity === 0) { sprite.opacity = opacity; }
    if (rotation || rotation === 0) { sprite.rotation = rotation; }

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
        , 'view/color.png'
        , 'view/pai.png'
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
    this.addScore(game, 0);
    this.addScore(game, 1);
    this.addCommand(game);

    var pivot = 0;

    var i;
    var len1 = game.playerList.length;
    if (game.state === State.PLAYING) {
        for (i = 0; i < len1; i++) {
            if (game.playerList[i].uid === uid) {
                pivot = i;
                break;
            }
        }
    }

    var relative;
    for (i = 0; i < len1; i++) {
        relative = (pivot + i) % 4;

        this.addColor(game, relative, i);

        if (game.active === relative) {
            this.addActive(game, relative, i);
        }

        if (this.hasPriorityIndex(game, relative)) {
            this.addPriority(game, i);
        }

        this.addUid(game, relative, i);
        this.addHand(game, relative, i);
        this.addDefense(game, relative, i);
        this.addOffense(game, relative, i);
    }
}

Game.removeAll = function () {
    while (this.core.rootScene.childNodes.length > 0) {
        this.core.rootScene.removeChild(this.core.rootScene.childNodes[0]);
    }
}

Game.hasPriorityIndex = function (game, index) {
    if (index !== Index.NONE) {
        var i;
        var len1 = game.priority.length;
        for (i = 0; i < len1; i++) if (game.priority[i] === index) {
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

Game.canThrowKing = function (game, index) {
    var count = 0;
    var i;
    var j;
    var len1 = game.playerList.length;
    var len2;
    for (i = 0; i < len1; i++) {
        len2 = game.playerList[i].defense.length;
        for (j = 0; j < len2; j++) {
            if (
                (
                       game.playerList[i].defense[j] === Card.KING1
                    || game.playerList[i].defense[j] === Card.KING2
                )
                && (
                       i === index
                    || !game.playerList[i].hidden[j]
                )
            ) {
                count++;
            }
        }

        len2 = game.playerList[i].offense.length;
        for (j = 0; j < len2; j++) {
            if (
                   game.playerList[i].offense[j] === Card.KING1
                || game.playerList[i].offense[j] === Card.KING2
            ) {
                count++;
            }
        }

        if (i === index) {
            len2 = game.playerList[i].hand.length;
            for (j = 0; j < len2; j++) {
                if (
                       game.playerList[i].hand[j] === Card.KING1
                    || game.playerList[i].hand[j] === Card.KING2
                ) {
                    count++;
                }
            }
        }
    }

    if (count === 2) {
        return true;
    }

    return false;
}

Game.addHeadLine = function (game) {
    var text = '';
    
    if (game.state === State.READY) {
        text = '募集中';
    } else {
        switch (game.phase) {
            case Phase.TRY:
                text = '打ち出し';
                break;
            case Phase.THROW:
                text = '攻め';
                break;
            case Phase.CATCH:
                text = '受け';
                break;
            case Phase.FINALLY:
                text = 'あがり';
                break;
            case Phase.FIVE_POWN:
            case Phase.PAUSE:
                text = '確認中';
                break;
        }
    }
    
    this.addLabel(text, 665, 5);
}

Game.addCommand = function (game) {
    if (game.state === State.READY) {
        this.addReadyCommand(game);
    } else {
        switch (game.phase) {
            case Phase.FIVE_POWN:
                if (this.hasPriorityUid(game, uid)) {
                    this.addFivePownCommand(game);
                }
                break;
            case Phase.TRY:
                if (this.hasPriorityUid(game, uid)) {
                    this.addLabel('1枚伏せる', 699, 290);
                }
                break;
            case Phase.THROW:
                if (this.hasPriorityUid(game, uid)) {
                    this.addLabel('1枚攻める', 699, 290);
                }
                break;
            case Phase.CATCH:
                if (this.hasPriorityUid(game, uid)) {
                    this.addCatchCommand(game);
                }
                break;
            case Phase.PAUSE:
                if (this.hasPriorityUid(game, uid)) {
                    this.addPauseCommand(game);
                }
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
            if (game.playerList[i].uid === uid) {
                canJoin = false;
                canLeave = true;
                break;
            }
        }
    }

    if (
           game.playerList[0].uid !== ''
        && game.playerList[1].uid !== ''
        && game.playerList[2].uid !== ''
        && game.playerList[3].uid !== ''
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

Game.addFivePownCommand = function (game) {
    this.addLabel('確認', 717, 290);

    this.addSprite('view/button.png', 4, 693, 310, 80, 25, function () {
        Game.send('e');
    });

    this.addSprite('view/button.png', 5, 693, 340, 80, 25, function () {
        Game.send('f');
    });
}

Game.addCatchCommand = function (game) {
    this.addLabel('1枚受ける', 699, 290);

    this.addSprite('view/button.png', 3, 693, 310, 80, 25, function () {
        Game.send('i');
    });
}

Game.addPauseCommand = function (game) {
    this.addLabel('確認', 717, 290);

    this.addSprite('view/button.png', 4, 693, 310, 80, 25, function () {
        Game.send('l');
    });
}

Game.addColor = function (game, relative, absolute) {
    this.addSprite('view/color.png', relative % 2, this.colorPosition[absolute].x, this.colorPosition[absolute].y, 22, 21);
}

Game.addActive = function (game, relative, absolute) {
    this.addSprite('view/active.png', relative % 2, this.activePosition[absolute].x, this.activePosition[absolute].y, 15, 15);
}

Game.addPriority = function (game, absolute) {
    this.addSprite('view/priority.png', 0, this.priorityPosition[absolute].x, this.priorityPosition[absolute].y, 112, 21);
}

Game.addUid = function (game, relative, absolute) {
    this.addLabel(game.playerList[relative].uid, this.uidPosition[absolute].x,  this.uidPosition[absolute].y);
}

Game.addScore = function (game, color) {
    this.addLabel(game.score[color] + '点', 695, color * 78 + 62, '22px');
}

Game.addHand = function (game, relative, absolute) {
    var hand = game.playerList[relative].hand;
    var image;
    var i;
    var len1 = hand.length;
    for (i = 0; i < len1; i++) {
        if (
               game.state === State.READY
            || game.playerList[relative].uid === uid
            || (
                   game.playerList[relative].peeping
                && (
                       (
                              game.phase === Phase.FIVE_POWN
                           && hand[i] === Card.POWN
                       )
                       || game.phase === Phase.PAUSE
                    )
                )
        ) {
            image = hand[i];
        } else {
            image = 9;
        }

        this.addSprite('view/pai.png', image, i * this.handPosition[absolute].xm + this.handPosition[absolute].x, i * this.handPosition[absolute].ym + this.handPosition[absolute].y, 40, 50, function () {
            var _i = i;

            if (Game.hasPriorityUid(game, uid)) {
                switch (game.phase) {
                    case Phase.TRY:
                        return function () {
                            Game.send('g' + _i);
                        };
                        break;
                    case Phase.THROW:
                        if ((hand[_i] !== Card.KING1 && hand[_i] !== Card.KING2) || Game.canThrowKing(game, relative)) {
                            return function () {
                                Game.send('h' + _i);
                            };
                        }
                        break;
                    case Phase.CATCH:
                        if (
                               hand[_i] === game.try
                            || (
                                       game.try !== Card.POWN
                                    && game.try !== Card.LANCE
                                    && (hand[_i] === Card.KING1 || hand[_i] === Card.KING2)
                               )
                        ) {
                            return function () {
                                Game.send('j' + _i);
                            };
                        }
                        break;
                    case Phase.FINALLY:
                        return function () {
                            Game.send('k');
                        };
                        break;
                }
            }
        } (), 1, this.handPosition[absolute].rotation);
    }
}

Game.addDefense = function (game, relative, absolute) {
    var defense = game.playerList[relative].defense;
    var hidden = game.playerList[relative].hidden;
    var i;
    var len1 = game.playerList[relative].defense.length;
    for (i = 0; i < len1; i++) {
        if (
               !hidden[i]
            || (
                      i === 3
                   && (
                            game.state === State.READY
                         || game.phase === Phase.PAUSE
                      )
               )
        ) {
            image = defense[i];
        } else {
            image = 9;
        }
        
        this.addSprite('view/pai.png', image, i * this.defensePosition[absolute].xm + this.defensePosition[absolute].x, i * this.defensePosition[absolute].ym + this.defensePosition[absolute].y, 40, 50, null, 1, this.defensePosition[absolute].rotation);
    }
}

Game.addOffense = function (game, relative, absolute) {
    var offense = game.playerList[relative].offense;
    var len1 = offense.length;
    for (i = 0; i < len1; i++) {
        this.addSprite('view/pai.png', offense[i], i * this.offensePosition[absolute].xm + this.offensePosition[absolute].x, i * this.offensePosition[absolute].ym + this.offensePosition[absolute].y, 40, 50, null, 1, this.offensePosition[absolute].rotation);
    }
}