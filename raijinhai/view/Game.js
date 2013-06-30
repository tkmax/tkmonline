enchant();

var Game = function() {}

Game.isOpen = false;
Game.isSent = false;
Game.isMute = false;

Game.send = function(m) {
  if(!Game.isSent) {
    Vrunr.send(m);
    Game.isSent = true;
  }
}

Game.onLoad = function() {
  Game.core = new Core(780, 430);
  Game.core.fps = 5;
  Game.core.preload(
    'view/bg.png', 'view/card.png', 'view/btn.png'
  );
  Game.core.onload = function() {
    Game.isOpen = true;
    Game.send('f');
  }
  Game.core.start();
}

Game.onMessage = function(o) {
  var t, s, i;
  
  while(Game.core.rootScene.childNodes.length > 0) {
    Game.core.rootScene.removeChild(Game.core.rootScene.childNodes[0]);
  }
  
  Game.isSent = false;
  
  var s = new Sprite(780, 430);
  s.image = Game.core.assets['view/bg.png'];
  s.frame = 0;
  s.x = 0;
  s.y = 0;
  Game.core.rootScene.addChild(s);
  
  if(o.state === GameService.Ready) {
    s = new Label('募集中');
  } else {
    s = new Label('対戦中 第 ' + o.round + ' ラウンド');
  }
  s.x = 650;
  s.y = 13;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  
  Game.addPlayer(o, 0, 45);
  Game.addPlayer(o, 1, 105);
  
  Game.addHand(o, 0, 5);
  Game.addHand(o, 1, 325);
  
  Game.addPlayed(o, 0, 290);
  Game.addPlayed(o, 1, 390);
  
  Game.addBattleFinish(o, 0, 120);
  Game.addBattleFinish(o, 1, 285);
  
  if(o.state === GameService.Ready
  && o.players[0].userid !== ''
  && o.players[1].userid !== ''
  && (
      o.players[0].userid === Vrunr.userid
      || o.players[1].userid === Vrunr.userid
    )
  ) {
    s = new Sprite(80, 25);
    s.image = Game.core.assets['view/btn.png'];
    s.frame = 2;
    s.x = 555;
    s.y = 7;
    s.addEventListener('touchstart', function() {
      Game.send('c');
    });
    Game.core.rootScene.addChild(s);
  }
}

Game.addPlayer = function(o, n, y) {
  var s = new Label(o.players[n].userid);
  s.x = 670;
  s.y = y;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  
  if(o.state === GameService.Ready) {
    if(o.players[n].userid === '') {
      s = new Sprite(80, 25);
      s.image = Game.core.assets['view/btn.png'];
      s.frame = 0;
      s.x = 555;
      s.y = y + 21;
      s.addEventListener('touchstart', function() {
        Game.send('a' + n);
      });
      Game.core.rootScene.addChild(s);
    } else if(o.players[n].userid === Vrunr.userid) {
      s = new Sprite(80, 25);
      s.image = Game.core.assets['view/btn.png'];
      s.frame = 1;
      s.x = 555;
      s.y = y + 21;
      s.addEventListener('touchstart', function() {
        Game.send('b' + n);
      });
      Game.core.rootScene.addChild(s);
    }
  }
  s = new Label('勝利点: ' + o.players[n].winCount);
  s.x = 670;
  s.y = y + 28;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addHand = function(o, n, y) {
  var s, i;
  for(i = 0; i < o.players[n].hand.length; i++) {
    s = new Sprite(80, 100);
    s.image = Game.core.assets['view/card.png'];
    if(o.state === GameService.Ready
    || o.players[n].userid === Vrunr.userid
    ) {
      s.frame = o.players[n].hand[i];
    } else {
      s.frame = 6;
    }
    if(o.state === GameService.Playing
    && o.players[n].userid === Vrunr.userid
    && o.players[n].phase === Phase.Select
    ) {
      s.addEventListener('touchstart', function() {
        var j = i;
        return function() {
          Game.send('d' + n + ' ' + j);
        };
      }());
    }
    s.x = i * 60 + 15;
    s.y = y;
    Game.core.rootScene.addChild(s);
  }
}

Game.addPlayed = function(o, n, x) {
  var s;
  if(o.players[n].played !== Card.None) {
    s = new Sprite(80, 100);
    s.image = Game.core.assets['view/card.png'];
    if(o.state === GameService.Ready
    || o.players[n].userid === Vrunr.userid   
    || o.players[0].phase === Phase.BattleStart
    || o.players[1].phase === Phase.BattleStart
    ) {
      s.frame = o.players[n].played;
    } else {
      s.frame = 6;
    }
    s.x = x;
    s.y = 165;
    s.addEventListener('touchstart', function() {
      Game.send('b' + n);
    });
    Game.core.rootScene.addChild(s);
  }
}

Game.addBattleFinish = function(o, n, y) {
  var s;
  
  if(o.players[n].phase === Phase.BattleStart
  && o.players[n].userid === Vrunr.userid
  ) {
    s = new Sprite(80, 25);
    s.image = Game.core.assets['view/btn.png'];
    s.frame = 3;
    s.x = 335;
    s.y = y;
    s.addEventListener('touchstart', function() {
      Game.send('e' + n);
    });
    Game.core.rootScene.addChild(s);
  }
}