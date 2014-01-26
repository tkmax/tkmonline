var Index = function () { }
Index.None = -1;

var State = function () { }
State.Ready = 0;
State.Playing = 1;

var Phase = function () { }
Phase.None = -1;
Phase.Play = 0;
Phase.Trash = 1;
Phase.Chain = 2;
Phase.Absorb = 3;
Phase.Merge = 4;
Phase.Sell = 5;
Phase.Trade = 6;
Phase.Buy = 7;

var HotelChain = function () { }
HotelChain.None = -1;
HotelChain.WorldWide = 0;
HotelChain.Sackson = 1;
HotelChain.Festival = 2;
HotelChain.Imperial = 3;
HotelChain.American = 4;
HotelChain.Continental = 5;
HotelChain.Tower = 6;

var HotelChainName = [
    '黒ポーン'
    , '白ポーン'
    , 'ナイト'
    , 'ビショップ'
    , 'ルーク'
    , 'クイーン'
    , 'キング'
];

var StockPrice = [
    [200, 300, 400, 500, 600, 700, 800, 900, 1000]
    , [200, 300, 400, 500, 600, 700, 800, 900, 1000]
    , [300, 400, 500, 600, 700, 800, 900, 1000, 1100]
    , [300, 400, 500, 600, 700, 800, 900, 1000, 1100]
    , [300, 400, 500, 600, 700, 800, 900, 1000, 1100]
    , [400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
    , [400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
];

var MajorityBonus = [
    [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
    , [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
    , [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]
    , [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]
    , [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000]
    , [4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]
    , [4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]
];

var MinorityBonus = [
    [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
    , [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
    , [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500]
    , [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500]
    , [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500]
    , [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000]
    , [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000]
];

var Position = function () { }
Position.None = -1;

var Rotation = function () { }
Rotation.None = 0;
Rotation.Horizontal = 1;
Rotation.Vertical = 2;

var Tab = function () { }
Tab.HotelChain = 0;
Tab.Market = 1;
Tab.StockHolder = 2;