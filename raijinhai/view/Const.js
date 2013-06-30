// カードを定数で定義(ランクも兼ねる)
var Card = function() {}

Card.None = 9;      // カード無し
Card.Queen = 0;     // 王妃
Card.Infantry = 1;  // 歩兵
Card.Cavalry = 2;   // 騎兵
Card.Elephant = 3;  // 象兵
Card.King = 4;      // 王
Card.Thunder = 5;   // 雷神

// フェイズを定数で定義
var Phase = function() {}

Phase.Select = 'select';
Phase.Ready = 'ready';
Phase.BattleStart = 'bs';
Phase.BattleFinish = 'bf';

// フェイズを定数で定義
var GameService = function() {}

// ゲームの状態を定数で定義
GameService.Ready = 'ready';      // 待機中
GameService.Playing = 'playing';  // プレイ中
