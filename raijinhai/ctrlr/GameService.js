var GameService = function() {}

// ゲームの状態を定数で定義
GameService.Ready = 'ready';      // 待機中
GameService.Playing = 'playing';  // プレイ中

GameService.splitOption = function(m) {
  return (m.substring(1)).split(' ');
}

GameService.clear = function(g) {
  g.state = GameService.Ready;
  g.round = 1;
  g.players = [
    new Player(),
    new Player()
  ];
  Player.clear(g.players[0]);
  Player.clear(g.players[1]);
}

GameService.start = function(g) {
  gs.se = 0;
  g.state = GameService.Playing;
  g.round = 1;
  Player.start(g.players[0]);
  Player.start(g.players[1]);
}

GameService.nextRound = function(g) {
  g.round++;
  Player.nextRound(g.players[0]);
  Player.nextRound(g.players[1]);
}

