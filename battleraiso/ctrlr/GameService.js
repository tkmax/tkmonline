var GameService = function() {}

GameService.splitOption = function(m) {
  return (m.substring(1)).split(' ');
}

GameService.clear = function(g) {
  g.state = State.Ready;
  g.phase = '';
  g.active = -1;
  g.play = -1;
  g.target = {
    x:-1, y:-1
  };
  g.unitDeck = [];
  g.tacticsDeck = [];
  g.flags = [];
  g.size = [];
  g.weather = [];
  g.stock = [];
  g.before = {
    idx: -1, x: -1, y: -1
  };
  g.players = [new Player(), new Player()];
  Player.clear(g.players[0]);
  Player.clear(g.players[1]);
}

GameService.start = function(g) {
  var i, j, t;
  g.state = State.Play;
  g.phase = Phase.Main;
  g.active = 0;
  g.play = -1;
  g.target.x = g.target.y = -1;
  g.before.idx = g.before.x = g.before.y = -1;
  g.flags.length = 0;
  g.size.length = 0;
  g.weather.length = 0;
  g.stock.length = 0;
  for(i = 0; i < 6; i++) {
    for(j = 0; j < 10; j++) {
      g.stock.push(j);
    }
  }
  for(i = 0; i < 9; i++) {
    g.flags.push(-1);
    g.size.push(3);
    g.weather.push(0);
  }
  Player.start(g.players[0]);
  Player.start(g.players[1]);
  t = [];
  for(i = 0x0000; i < 0x0600; i += 0x0100) {
    for(j = 0x0009; j >= 0x0000; j -= 0x0001) {
      t.push(i | j);
    }
  }
  g.unitDeck.length = 0;
  while(t.length > 0) {
    i = Math.floor(Math.random() * t.length);
    g.unitDeck.push(t[i]);
    t.splice(i, 1);
  }
  for(i = 0x0000; i < 0x000A; i += 0x0001) {
    t.push(0x0600 | i);
  }
  g.tacticsDeck.length = 0;
  while(t.length > 0) {
    i = Math.floor(Math.random() * t.length);
    g.tacticsDeck.push(t[i]);
    t.splice(i, 1);
  }
  for(i = 0; i < 7; i++) {
    g.players[0].hand.push(g.unitDeck.shift());
    g.players[1].hand.push(g.unitDeck.shift());
  }
}

GameService.discard = function(g) {
  g.players[g.active].talon.push(
    g.players[g.active].hand[g.play]
  );
  g.players[g.active].hand.splice(g.play, 1);
  g.play = -1;
}

GameService.nextTurn = function(g) {
  if(g.active === 0) {
    g.active = 1;
  } else {
    g.active = 0;
  }
  g.phase = Phase.Main;
  Crunr.bell();
}

GameService.isWin = function(g) {
  var i, sequence = 0, count = 0;
  for(i in g.flags) {
    if(g.flags[i] === g.active) {
      sequence++;
      count++;
    } else {
      sequence = 0;
    }
    if(sequence >= 3 || count >= 5) {
      return true;
    }
  }
  return false;
}