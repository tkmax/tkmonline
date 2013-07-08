var GameService = function() {}

// ゲームの状態を定数で定義
GameService.Ready = 'ready';      // 待機中
GameService.Playing = 'playing';  // プレイ中

GameService.splitOption = function(m) {
  return (m.substring(1)).split(' ');
}

GameService.clear = function(g) {
  var i;
  
  g.state = GameService.Ready;
  g.phase = '';
  g.active = -1;
  g.hunter = -1;
  g.before = -1;
  g.players = [new Player(), new Player()];
  Player.clear(g.players[0]);
  Player.clear(g.players[1]);
  g.fishMap = [];
  for(i = 0; i < 95; i++) {
    g.fishMap.push(0);
  }
  g.penguinMap = [];
  for(i = 0; i < 95; i++) {
    g.penguinMap.push(-1);
  }
}

GameService.start = function(g) {
  var i, j, t = [], b = [];
  
  g.state = GameService.Playing;
  g.phase = Phase.Setup;
  g.active = 0;
  g.hunter= -1;
  g.before = -1;
  Player.start(g.players[0]);
  Player.start(g.players[1]);
  for(i = 0; i < 30; i++) {
    t.push(1);
  }
  for(i = 0; i < 20; i++) {
    t.push(2);
  }
  for(i = 0; i < 10; i++) {
    t.push(3);
  }
  while(t.length > 0) {
    i = Math.floor(Math.random() * t.length);
    b.push(t[i]);
    t.splice(i, 1);
  }
  i = 11;
  while(b.length > 0) {
    for(j = 0; j < 7; j++, i++) {
      g.fishMap[i] = b[0];
      b.shift();
    }
    i += 2;
    for(j = 0; j < 8; j++, i++) {
      g.fishMap[i] = b[0];
      b.shift();
    }
    i += 2;
  }
  for (i = 0; i < g.penguinMap.length; i++) {
    g.penguinMap[i] = -1;
  }
}

GameService.canMovePlayer = function(g) {
  var i, canMove = false;
  
  for(i = 0; i < g.penguinMap.length; i++) {
    if(g.penguinMap[i] === g.active) {
      canMove = GameService.canMovePenguin(g, i);
      if(canMove) {
        break;
      }
    }
  }
  
  return canMove;
}

GameService.canMovePenguin = function(g, h) {
  var canMove = false;
  
  if(g.fishMap[h - 1] !== 0 && g.penguinMap[h - 1] === -1) {
    canMove = true;
  } else if(g.fishMap[h - 10] !== 0 && g.penguinMap[h - 10] === -1) {
    canMove = true;
  } else if(g.fishMap[h - 9] !== 0 && g.penguinMap[h - 9] === -1) {
    canMove = true;
  } else if(g.fishMap[h + 1] !== 0 && g.penguinMap[h + 1] === -1) {
    canMove = true;
  } else if(g.fishMap[h + 10] !== 0 && g.penguinMap[h + 10] === -1) {
    canMove = true;
  } else if(g.fishMap[h + 9] !== 0 && g.penguinMap[h + 9] === -1) {
    canMove = true;
  }
  
  return canMove;
}
