var State = function () { }
State.Ready = 'ready';
State.Play = 'play';

var Phase = function () { }
Phase.SetupSettlement1 = 'setupsettlement1';
Phase.SetupRoad1 = 'setuproad1';
Phase.SetupSettlement2 = 'setupsettlement2';
Phase.SetupRoad2 = 'setuproad2';
Phase.DiceRoll = 'diceroll';
Phase.Burst = 'burst';
Phase.Robber1 = 'robber1';
Phase.Robber2 = 'robber2';
Phase.Main = 'main';
Phase.BuildRoad = 'buildroad';
Phase.BuildSettlement = 'buildsettlement';
Phase.BuildCity = 'buildcity';
Phase.InternationalTrade = 'internationaltrade';
Phase.DomesticTrade1 = 'domestictrade1';
Phase.DomesticTrade2 = 'domestictrade2';
Phase.Soldier1 = 'soldier1';
Phase.Soldier2 = 'soldier2';
Phase.RoadBuilding1 = 'roadbuilding1';
Phase.RoadBuilding2 = 'roadbuilding2';
Phase.YearOfPlenty1 = 'yearofplenty1';
Phase.YearOfPlenty2 = 'yearofplenty2';
Phase.Monopoly = 'monopoly';

var Resource = function () { }
Resource.Brick = 0;
Resource.Wool = 1;
Resource.Ore = 2;
Resource.Grain = 3;
Resource.Lumber = 4;

var Card = function () { }
Card.Soldier = 0;
Card.VictoryPoint = 1;
Card.RoadBuilding = 2;
Card.YearOfPlenty = 3;
Card.Monopoly = 4;

var SettlementRank = function () { }
SettlementRank.None = 0x0000;
SettlementRank.Settlement = 0x0100;
SettlementRank.City = 0x0200;

var SettlementLink = [
    [0, 1]
    , [2, 3]
    , [4, 5]
    , [0, 6]
    , [1, 2, 7]
    , [3, 4, 8]
    , [5, 9]
    , [6, 10, 11]
    , [7, 12, 13]
    , [8, 14, 15]
    , [9, 16, 17]
    , [10, 18]
    , [11, 12, 19]
    , [13, 14, 20]
    , [15, 16, 21]
    , [17, 22]
    , [18, 23, 24]
    , [19, 25, 26]
    , [20, 27, 28]
    , [21, 29, 30]
    , [22, 31, 32]
    , [23, 33]
    , [24, 25, 34]
    , [26, 27, 35]
    , [28, 29, 36]
    , [30, 31, 37]
    , [32, 38]
    , [33, 39]
    , [34, 40, 41]
    , [35, 42, 43]
    , [36, 44, 45]
    , [37, 46, 47]
    , [38, 48]
    , [39, 40, 49]
    , [41, 42, 50]
    , [43, 44, 51]
    , [45, 46, 52]
    , [47, 48, 53]
    , [49, 54]
    , [50, 55, 56]
    , [51, 57, 58]
    , [52, 59, 60]
    , [53, 61]
    , [54, 55, 62]
    , [56, 57, 63]
    , [58, 59, 64]
    , [60, 61, 65]
    , [62, 66]
    , [63, 67, 68]
    , [64, 69, 70]
    , [65, 71]
    , [66, 67]
    , [68, 69]
    , [70, 71]
];

var RoadLink = [
    [0, 3]
    , [0, 4]
    , [1, 4]
    , [1, 5]
    , [2, 5]
    , [2, 6]
    , [3, 7]
    , [4, 8]
    , [5, 9]
    , [6, 10]
    , [7, 11]
    , [7, 12]
    , [8, 12]
    , [8, 13]
    , [9, 13]
    , [9, 14]
    , [10, 14]
    , [10, 15]
    , [11, 16]
    , [12, 17]
    , [13, 18]
    , [14, 19]
    , [15, 20]
    , [16, 21]
    , [16, 22]
    , [17, 22]
    , [17, 23]
    , [18, 23]
    , [18, 24]
    , [19, 24]
    , [19, 25]
    , [20, 25]
    , [20, 26]
    , [21, 27]
    , [22, 28]
    , [23, 29]
    , [24, 30]
    , [25, 31]
    , [26, 32]
    , [27, 33]
    , [28, 33]
    , [28, 34]
    , [29, 34]
    , [29, 35]
    , [30, 35]
    , [30, 36]
    , [31, 36]
    , [31, 37]
    , [32, 37]
    , [33, 38]
    , [34, 39]
    , [35, 40]
    , [36, 41]
    , [37, 42]
    , [38, 43]
    , [39, 43]
    , [39, 44]
    , [40, 44]
    , [40, 45]
    , [41, 45]
    , [41, 46]
    , [42, 46]
    , [43, 47]
    , [44, 48]
    , [45, 49]
    , [46, 50]
    , [47, 51]
    , [48, 51]
    , [48, 52]
    , [49, 52]
    , [49, 53]
    , [50, 53]
];

var TileLink = [
    [0, 3, 4, 7, 8, 12]
    , [1, 4, 5, 8, 9, 13]
    , [2, 5, 6, 9, 10, 14]
    , [7, 11, 12, 16, 17, 22]
    , [8, 12, 13, 17, 18, 23]
    , [9, 13, 14, 18, 19, 24]
    , [10, 14, 15, 19, 20, 25]
    , [16, 21, 22, 27, 28, 33]
    , [17, 22, 23, 28, 29, 34]
    , [18, 23, 24, 29, 30, 35]
    , [19, 24, 25, 30, 31, 36]
    , [20, 25, 26, 31, 32, 37]
    , [28, 33, 34, 38, 39, 43]
    , [29, 34, 35, 39, 40, 44]
    , [30, 35, 36, 40, 41, 45]
    , [31, 36, 37, 41, 42, 46]
    , [39, 43, 44, 47, 48, 51]
    , [40, 44, 45, 48, 49, 52]
    , [41, 45, 46, 49, 50, 53]
];

var Harbor = function () { }
Harbor.None = -1;
Harbor.Brick = 0;
Harbor.Wool = 1;
Harbor.Ore = 2;
Harbor.Grain = 3;
Harbor.Lumber = 4;
Harbor.Generic = 5;

var Sea = [
    [Harbor.Generic, Harbor.None, Harbor.Grain]
    , [Harbor.None, Harbor.Ore, Harbor.None]
    , [Harbor.Generic, Harbor.None, Harbor.Wool]
    , [Harbor.None, Harbor.Generic, Harbor.None]
    , [Harbor.Generic, Harbor.None, Harbor.Brick]
    , [Harbor.None, Harbor.Lumber, Harbor.None]
];

var ColorName = [
    '赤'
    , '青'
    , '黄'
    , '緑'
];