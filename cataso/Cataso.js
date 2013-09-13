var Instance = require('../Instance')
    , Const = require('./Const')
    , Player = require('./Player')
    , Game = require('./Game')
    , State = Const.State
    , Phase = Const.Phase
    , Resource = Const.Resource
    , Card = Const.Card
    , SettlementRank = Const.SettlementRank
    , SettlementLink = Const.SettlementLink
    , TileLink = Const.TileLink
    , RoadLink = Const.RoadLink
    , Harbor = Const.Harbor
    , Sea = Const.Sea;

var Cataso = function () {
    this.super();
    this.game = new Game();
    Game.clear(this.game);
};

Cataso.prototype = new Instance();

Cataso.prototype.onMessage = function (uid, msg) {
    var opt, i, j, foo, bar, hoge;

    if (msg[0] === 'a') {
        this.unicast(uid, JSON.stringify(this.game));
    } else {
        if (this.game.state === State.Ready) {
            switch (msg[0]) {
                case 'b':
                    for (i = 0; i < this.game.playerList.length; i++) {
                        if (this.game.playerList[i].uid === '') {
                            this.game.playerList[i].uid = uid;
                            break;
                        }
                    }
                    break;
                case 'c':
                    for (i = 0; i < this.game.playerList.length; i++) {
                        if (this.game.playerList[i].uid === uid) this.game.playerList[i].uid = '';
                    }
                    break;
                case 'd':
                    if (
                        this.game.playerList[0].uid !== ''
                        && this.game.playerList[1].uid !== ''
                        && this.game.playerList[2].uid !== ''
                        && this.game.playerList[3].uid !== ''
                    ) Game.start(this.game);
                    break;
            }
        } else {
            switch (msg[0]) {
                case 'e':
                    if (
                        this.game.phase === Phase.SetupSettlement1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        Game.buildSettlement(this.game, parseInt(opt[0]));
                        this.game.phase = Phase.SetupRoad1;
                        this.game.sound = 'build';
                    }
                    break;
                case 'f':
                    if (
                        this.game.phase === Phase.SetupRoad1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        Game.buildRoad(this.game, opt[0]);
                        if (this.game.active < 3) {
                            this.game.phase = Phase.SetupSettlement1;
                            this.game.active++;
                        } else {
                            this.game.phase = Phase.SetupSettlement2;
                        }
                        this.game.sound = 'end';
                    }
                    break;
                case 'g':
                    if (
                        this.game.phase === Phase.SetupSettlement2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        foo = parseInt(opt[0]);
                        Game.buildSettlement(this.game, foo);
                        this.game.playerList[this.game.active].secondSettlement = foo;
                        for (i = 0; i < TileLink.length; i++) {
                            for (j = 0; j < TileLink[i].length; j++) {
                                if (TileLink[i][j] === foo) Game.createResource(this.game, this.game.active, this.game.tileList[i], 1);
                            }
                        }
                        this.game.phase = Phase.SetupRoad2;
                        this.game.sound = 'build';
                    }
                    break;
                case 'h':
                    if (
                        this.game.phase === Phase.SetupRoad2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        Game.buildRoad(this.game, opt[0]);
                        if (this.game.active > 0) {
                            this.game.phase = Phase.SetupSettlement2;
                            this.game.active--;
                        } else {
                            this.game.phase = Phase.DiceRoll;
                        }
                        this.game.sound = 'end';
                    }
                    break;
                case 'i':
                    if (
                        this.game.phase === Phase.DiceRoll
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        foo = [1, 6, 2, 5, 3, 4, 4, 3, 5, 2, 6, 1];
                        bar = [];
                        while (foo.length > 0) {
                            i = Math.floor(Math.random() * foo.length);
                            bar.push(foo[i]);
                            foo.splice(i, 1);
                        }
                        while (bar.length > 0) {
                            i = Math.floor(Math.random() * bar.length);
                            foo.push(bar[i]);
                            bar.splice(i, 1);
                        }
                        this.game.dice1 = foo[4];
                        this.game.dice2 = foo[7];
                        foo = this.game.dice1 + this.game.dice2;
                        this.chat('ダイスロール -> ' + foo);
                        if (foo === 7) {
                            for (i = 0; i < this.game.playerList.length; i++) {
                                if (Game.sumPlayerResource(this.game, i) >= 8) {
                                    this.chat('バースト発生 -> ' + this.game.playerList[i].uid + '(' + Game.color(i) + ')');
                                    this.game.playerList[i].burst = Math.floor(Game.sumPlayerResource(this.game, i) / 2);
                                    this.game.phase = Phase.Burst;
                                }
                            }
                            this.chat('** 盗賊が発生しました **');
                            if (this.game.phase !== Phase.Burst) this.game.phase = Phase.Robber1;
                            this.game.sound = 'robber';
                        } else {
                            hoge = [0, 0, 0, 0, 0];
                            for (i = 0; i < this.game.numList.length; i++) {
                                if (
                                    i !== this.game.robber
                                    && this.game.numList[i] === foo
                                ) {
                                    for (j = 0; j < TileLink[i].length; j++) {
                                        switch (this.game.settlementList[TileLink[i][j]] & 0xff00) {
                                            case SettlementRank.Settlement:
                                                hoge[this.game.tileList[i]]++;
                                                break;
                                            case SettlementRank.City:
                                                hoge[this.game.tileList[i]] += 2;
                                                break;
                                        }
                                    }
                                }
                            }
                            for (i = 0; i < hoge.length; i++) {
                                if (this.game.resource[i] < hoge[i]) {
                                    hoge[i] = -1;
                                    this.chat('** 資源不足で' + Game.resource(i) + 'の生産失敗 **');
                                }
                            }
                            for (i = 0; i < this.game.numList.length; i++) {
                                if (
                                    i !== this.game.robber
                                    && hoge[this.game.tileList[i]] !== -1
                                    && this.game.numList[i] === foo
                                ) {
                                    for (j = 0; j < TileLink[i].length; j++) {
                                        switch (this.game.settlementList[TileLink[i][j]] & 0xff00) {
                                            case SettlementRank.Settlement:
                                                Game.createResource(this.game, this.game.settlementList[TileLink[i][j]] & 0x00ff, this.game.tileList[i], 1);
                                                break;
                                            case SettlementRank.City:
                                                Game.createResource(this.game, this.game.settlementList[TileLink[i][j]] & 0x00ff, this.game.tileList[i], 2);
                                                break;
                                        }
                                    }
                                }
                            }
                            this.game.phase = Phase.Main;
                            this.game.sound = 'dice';
                        }
                    }
                    break;
                case 'j':
                    opt = Game.option(msg);
                    if (
                        this.game.phase === Phase.Burst
                        && this.game.playerList[opt[0]].uid === uid
                        && this.game.playerList[opt[0]].burst > 0
                        && this.game.playerList[opt[0]].resource[opt[1]] > 0
                    ) {
                        this.chat(
                            Game.resource(parseInt(opt[1])) + 'を1枚を破棄 -> '
                            + this.game.playerList[opt[0]].uid + '(' + Game.color(parseInt(opt[0])) + ')'
                        );
                        this.game.playerList[opt[0]].burst--;
                        Game.destroyResource(this.game, opt[0], opt[1], 1);
                        foo = true;
                        for (i = 0; i < this.game.playerList.length; i++) {
                            if (this.game.playerList[i].burst > 0) {
                                foo = false;
                                break;
                            }
                        }
                        if (foo) this.game.phase = Phase.Robber1;
                    }
                    break;
                case 'k':
                    if (
                        this.game.phase === Phase.Robber1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        this.game.robber = parseInt(opt[0]);
                        foo = false;
                        for (i = 0; i < TileLink[this.game.robber].length; i++) {
                            if (
                                (this.game.settlementList[TileLink[this.game.robber][i]] & 0xff00) !== SettlementRank.None
                                && (this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff) !== this.game.active
                                && Game.sumPlayerResource(this.game, this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff) > 0
                            ) foo = true;
                        }
                        if (foo) {
                            this.game.phase = Phase.Robber2;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'l':
                    if (
                        this.game.phase === Phase.Robber2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        Game.robberResource(this.game, opt[0]);
                        this.chat('資源を１枚略奪 -> ' + this.game.playerList[opt[0]].uid + '(' + Game.color(parseInt(opt[0])) + ')');
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'm':
                    if (
                        this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                        && this.game.playerList[this.game.active].resource[Resource.Brick] >= 1
                        && this.game.playerList[this.game.active].resource[Resource.Lumber] >= 1
                        && this.game.playerList[this.game.active].road >= 1
                    ) {
                        Game.destroyResource(this.game, this.game.active, Resource.Brick, 1);
                        Game.destroyResource(this.game, this.game.active, Resource.Lumber, 1);
                        this.game.phase = Phase.BuildRoad;
                    }
                    break;
                case 'n':
                    opt = Game.option(msg);
                    if (
                        this.game.phase === Phase.BuildRoad
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        foo = Game.buildRoad(this.game, opt[0]);
                        if (foo !== -1) {
                            this.chat('** ' + this.game.playerList[foo].uid + '(' + Game.color(foo) + ')' + 'が道賞を獲得しました **');
                            this.game.sound = 'get';
                        } else {
                            this.game.sound = 'build';
                        }
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'o':
                    if (
                        this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                        && this.game.playerList[this.game.active].resource[Resource.Brick] >= 1
                        && this.game.playerList[this.game.active].resource[Resource.Wool] >= 1
                        && this.game.playerList[this.game.active].resource[Resource.Grain] >= 1
                        && this.game.playerList[this.game.active].resource[Resource.Lumber] >= 1
                        && this.game.playerList[this.game.active].settlement >= 1
                    ) {
                        Game.destroyResource(this.game, this.game.active, Resource.Brick, 1);
                        Game.destroyResource(this.game, this.game.active, Resource.Wool, 1);
                        Game.destroyResource(this.game, this.game.active, Resource.Grain, 1);
                        Game.destroyResource(this.game, this.game.active, Resource.Lumber, 1);
                        this.game.phase = Phase.BuildSettlement;
                    }
                    break;
                case 'p':
                    opt = Game.option(msg);
                    if (
                        this.game.phase === Phase.BuildSettlement
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        foo = Game.buildSettlement(this.game, parseInt(opt[0]));
                        if (foo !== -1) {
                            this.chat('** ' + this.game.playerList[foo].uid + '(' + Game.color(foo) + ')' + 'が道賞を獲得しました **');
                            this.game.sound = 'get';
                        } else {
                            this.game.sound = 'build';
                        }
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'q':
                    if (
                        this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                        && this.game.playerList[this.game.active].resource[Resource.Ore] >= 3
                        && this.game.playerList[this.game.active].resource[Resource.Grain] >= 2
                        && this.game.playerList[this.game.active].city >= 1
                    ) {
                        Game.destroyResource(this.game, this.game.active, Resource.Ore, 3);
                        Game.destroyResource(this.game, this.game.active, Resource.Grain, 2);
                        this.game.phase = Phase.BuildCity;
                    }
                    break;
                case 'r':
                    opt = Game.option(msg);
                    if (
                        this.game.phase === Phase.BuildCity
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        Game.buildCity(this.game, opt[0]);
                        this.game.phase = Phase.Main;
                        this.game.sound = 'build';
                    }
                    break;
                case 's':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.playerList[this.game.active].resource[Resource.Wool] >= 1
                        && this.game.playerList[this.game.active].resource[Resource.Ore] >= 1
                        && this.game.playerList[this.game.active].resource[Resource.Grain] >= 1
                        && this.game.card.length >= 1
                    ) {
                        foo = this.game.card.shift();
                        if (foo === Card.VictoryPoint) this.game.playerList[this.game.active].bonus++;
                        this.game.playerList[this.game.active].sleepCard[foo]++;
                        Game.destroyResource(this.game, this.game.active, Resource.Wool, 1);
                        Game.destroyResource(this.game, this.game.active, Resource.Ore, 1);
                        Game.destroyResource(this.game, this.game.active, Resource.Grain, 1);
                        this.chat('カードを1枚引きました。');
                    }
                    break;
                case 't':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                    ) this.game.phase = Phase.InternationalTrade;
                    break;
                case 'u':
                    if (
                        this.game.phase === Phase.InternationalTrade
                        && this.game.playerList[this.game.active].uid === uid
                    ) this.game.phase = Phase.Main;
                    break;
                case 'v':
                    if (
                        this.game.phase === Phase.InternationalTrade
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        foo = '海外貿易(出) ->';
                        for (i = 0; i < 5; i++) {
                            if (opt[i] !== '0') {
                                foo += ' ' + Game.resource(i) + ':' + opt[i];
                                Game.destroyResource(this.game, this.game.active, i, parseInt(opt[i]));
                            }
                        }
                        this.chat(foo);
                        foo = '海外貿易(入) ->';
                        for (i = 5; i < 10; i++) {
                            if (opt[i] !== '0') {
                                foo += ' ' + Game.resource(i - 5) + ':' + opt[i];
                                Game.createResource(this.game, this.game.active, i - 5, parseInt(opt[i]));
                            }
                        }
                        this.chat(foo);
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'w':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                    ) this.game.phase = Phase.DomesticTrade1;
                    break;
                case 'x':
                    if (
                        this.game.phase === Phase.DomesticTrade1
                        && this.game.playerList[this.game.active].uid === uid
                    ) this.game.phase = Phase.Main;
                    break;
                case 'y':
                    if (
                        this.game.phase === Phase.DomesticTrade1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        this.game.trade.playerIdx = parseInt(opt[0]);
                        this.chat('国内貿易を申し込みました -> ' + this.game.playerList[this.game.trade.playerIdx].uid + '(' + Game.color(this.game.trade.playerIdx) + ')');
                        foo = '';
                        for (i = 1; i < 6; i++) {
                            if (opt[i] !== '0') {
                                foo += ' ' + Game.resource(i - 1) + ':' + opt[i];
                            }
                            this.game.trade.destroy[i - 1] = parseInt(opt[i]);
                        }
                        if (foo === '') {
                            this.chat('国内貿易(出) -> なし');
                        } else {
                            this.chat('国内貿易(出) ->' + foo);
                        }
                        foo = '';
                        for (i = 6; i < 11; i++) {
                            if (opt[i] !== '0') {
                                foo += ' ' + Game.resource(i - 6) + ':' + opt[i];
                            }
                            this.game.trade.create[i - 6] = parseInt(opt[i]);
                        }
                        if (foo === '') {
                            this.chat('国内貿易(求) -> なし');
                        } else {
                            this.chat('国内貿易(求) ->' + foo);
                        }
                        this.game.phase = Phase.DomesticTrade2;
                    }
                    break;
                case 'z':
                    if (
                        this.game.phase === Phase.DomesticTrade2
                        && this.game.playerList[this.game.trade.playerIdx].uid === uid
                    ) {
                        this.chat('拒否されました。');
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'A':
                    if (
                        this.game.phase === Phase.DomesticTrade2
                        && this.game.playerList[this.game.trade.playerIdx].uid === uid
                    ) {
                        opt = Game.option(msg);
                        if (
                            this.game.playerList[this.game.trade.playerIdx].resource[Resource.Brick] >= this.game.trade.create[Resource.Brick]
                            && this.game.playerList[this.game.trade.playerIdx].resource[Resource.Wool] >= this.game.trade.create[Resource.Wool]
                            && this.game.playerList[this.game.trade.playerIdx].resource[Resource.Ore] >= this.game.trade.create[Resource.Ore]
                            && this.game.playerList[this.game.trade.playerIdx].resource[Resource.Grain] >= this.game.trade.create[Resource.Grain]
                            && this.game.playerList[this.game.trade.playerIdx].resource[Resource.Lumber] >= this.game.trade.create[Resource.Lumber]
                        ) {
                            for (i = 0; i < 5; i++) {
                                Game.huntResource(this.game, this.game.active, this.game.trade.playerIdx, i, this.game.trade.destroy[i]);
                                Game.huntResource(this.game, this.game.trade.playerIdx, this.game.active, i, this.game.trade.create[i]);
                            }
                            this.chat('交換しました。');
                        } else {
                            this.chat('** ' + this.game.playerList[this.game.trade.playerIdx].uid + '(' + Game.color(this.game.trade.playerIdx) + ')の資源不足のため交換できません。 **');
                        }
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'B':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && (this.game.playerList[this.game.active].score + this.game.playerList[this.game.active].bonus) >= 10
                    ) {
                        this.chat('** ' + this.game.playerList[this.game.active].uid + '(' + Game.color(this.game.active) + ')が勝利しました **');
                        for (i = 0; i < this.game.playerList.length; i++) this.game.playerList[i].uid = '';
                        this.game.state = State.Ready;
                        this.game.sound = 'finish';
                    }
                    break;
                case 'C':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid) {
                        for (i = 0; i < 5; i++) {
                            this.game.playerList[this.game.active].wakeCard[i] += this.game.playerList[this.game.active].sleepCard[i];
                            this.game.playerList[this.game.active].sleepCard[i] = 0;
                        }
                        this.game.playerList[this.game.active].isPlayedCard = false;
                        this.game.dice1 = 0;
                        this.game.dice2 = 0;
                        this.game.active = (this.game.active + 1) % 4;
                        this.game.phase = Phase.DiceRoll;
                        this.game.sound = 'end';
                    }
                    break;
                case 'D':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.Soldier] > 0
                    ) {
                        Game.playCard(this.game, Card.Soldier);
                        if (this.game.largestArmy === -1) {
                            if (this.game.playerList[this.game.active].deadCard[Card.Soldier] >= 3) {
                                this.game.largestArmy = this.game.active;
                                this.game.playerList[this.game.active].bonus += 2;
                                this.chat('** ' + this.game.playerList[this.game.active].uid + '(' + Game.color(this.game.active) + ')' + 'が騎士賞を獲得しました **');
                                this.game.sound = 'get';
                            }
                        } else if (
                            this.game.largestArmy !== this.game.active
                            && this.game.playerList[this.game.active].deadCard[Card.Soldier] > this.game.playerList[this.game.largestArmy].deadCard[Card.Soldier]
                        ) {
                            this.game.playerList[this.game.largestArmy].bonus -= 2;
                            this.game.largestArmy = this.game.active;
                            this.game.playerList[this.game.active].bonus += 2;
                            this.chat('** ' + this.game.playerList[this.game.active].uid + '(' + Game.color(this.game.active) + ')' + 'が騎士賞を獲得しました **');
                            this.game.sound = 'get';
                        }
                        this.game.phase = Phase.Soldier1;
                    }
                    break;
                case 'E':
                    if (
                        this.game.phase === Phase.Soldier1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        this.game.robber = parseInt(opt[0]);
                        foo = false;
                        for (i = 0; i < TileLink[this.game.robber].length; i++) {
                            if (
                                (this.game.settlementList[TileLink[this.game.robber][i]] & 0xff00) !== SettlementRank.None
                                && (this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff) !== this.game.active
                                && Game.sumPlayerResource(this.game, this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff) > 0
                            ) {
                                foo = true;
                            }
                        }
                        if (foo) {
                            this.game.phase = Phase.Soldier2;
                        } else {
                            if (this.game.dice1 === 0) {
                                this.game.phase = Phase.DiceRoll;
                            } else {
                                this.game.phase = Phase.Main;
                            }
                        }
                    }
                    break;
                case 'F':
                    if (
                        this.game.phase === Phase.Soldier2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        Game.robberResource(this.game, opt[0]);
                        this.chat('資源を１枚略奪 -> ' + this.game.playerList[opt[0]].uid + '(' + Game.color(parseInt(opt[0])) + ')');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'G':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.RoadBuilding] > 0
                    ) {
                        Game.playCard(this.game, Card.RoadBuilding);
                        this.game.phase = Phase.RoadBuilding1;
                    }
                    break;
                case 'H':
                    if (
                        this.game.phase === Phase.RoadBuilding1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        foo = Game.buildRoad(this.game, opt[0]);
                        if (foo !== -1) {
                            this.chat('** ' + this.game.playerList[foo].uid + '(' + Game.color(foo) + ')' + 'が道賞を獲得しました **');
                            this.game.sound = 'get';
                        } else {
                            this.game.sound = 'build';
                        }
                        if (Game.canBuildRoads(this.game)) {
                            this.game.phase = Phase.RoadBuilding2;
                        } else {
                            if (this.game.dice1 === 0) {
                                this.game.phase = Phase.DiceRoll;
                            } else {
                                this.game.phase = Phase.Main;
                            }
                        }
                    }
                    break;
                case 'I':
                    if (
                        this.game.phase === Phase.RoadBuilding2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        foo = Game.buildRoad(this.game, opt[0]);
                        if (foo !== -1) {
                            this.chat('** ' + this.game.playerList[foo].uid + '(' + Game.color(foo) + ')' + 'が道賞を獲得しました **');
                            this.game.sound = 'get';
                        } else {
                            this.game.sound = 'build';
                        }
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'J':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.YearOfPlenty] > 0
                        && Game.sumResource(this.game) > 0
                    ) {
                        Game.playCard(this.game, Card.YearOfPlenty);
                        this.game.phase = Phase.YearOfPlenty1;
                    }
                    break;
                case 'K':
                    opt = Game.option(msg);
                    if (
                        this.game.phase === Phase.YearOfPlenty1
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.resource[opt[0]] > 0
                    ) {
                        Game.createResource(this.game, this.game.active, opt[0], 1);
                        this.chat(Game.resource(parseInt(opt[0])) + 'を生産しました。');
                        if (Game.sumResource(this.game) > 0) {
                            this.game.phase = Phase.YearOfPlenty2;
                        } else {
                            if (this.game.dice1 === 0) {
                                this.game.phase = Phase.DiceRoll;
                            } else {
                                this.game.phase = Phase.Main;
                            }
                        }
                    }
                    break;
                case 'L':
                    opt = Game.option(msg);
                    if (
                        this.game.phase === Phase.YearOfPlenty2
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.resource[opt[0]] > 0
                    ) {
                        Game.createResource(this.game, this.game.active, opt[0], 1);
                        this.chat(Game.resource(parseInt(opt[0])) + 'を生産しました。');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'M':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.Monopoly] > 0
                    ) {
                        Game.playCard(this.game, Card.Monopoly);
                        this.game.phase = Phase.Monopoly;
                    }
                    break;
                case 'N':
                    if (
                        this.game.phase === Phase.Monopoly
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        opt = Game.option(msg);
                        for (i = 0; i < this.game.playerList.length; i++) {
                            if (i !== this.game.active) {
                                this.game.playerList[this.game.active].resource[opt[0]] += this.game.playerList[i].resource[opt[0]];
                                this.game.playerList[i].resource[opt[0]] = 0;
                            }
                        }
                        this.chat(Game.resource(parseInt(opt[0])) + 'を独占しました。');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
            }
        }
        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

Cataso.prototype.onCommand = function (uid, msg) {
    this.basicCommand(uid, msg);
    switch (msg[0]) {
        case '/reset':
            if (this.ctrlr.uid === uid) {
                Game.clear(this.game);
                this.broadcast(JSON.stringify(this.game));
                this.chat('リセットしました。');
            } else {
                this.chat('管理者でないためリセットできません。');
            }
            break;
    }
}

module.exports = Cataso;