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
    'view/bg.png', 'view/tile.png', 'view/btn.png',
    'view/actv.png'
  );
  Game.core.onload = function() {
    Game.isOpen = true;
    Game.send('g');
  }
  Game.core.start();
}

Game.onMessage = function(g) {
  var s, i, j, k;
  
  Game.isSent = false;
  while(Game.core.rootScene.childNodes.length > 0) {
    Game.core.rootScene.removeChild(Game.core.rootScene.childNodes[0]);
  }
  s = new Sprite(780, 430);
  s.image = Game.core.assets['view/bg.png'];
  Game.core.rootScene.addChild(s);
  
  if(g.state === GameService.Ready) {
    s = new Label('募集中');
  } else {
    s = new Label('対戦中');
  }
  s.x = 650;
  s.y = 13;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  
  Game.addPlayer(g, 0);
  Game.addPlayer(g, 1);
  
  if(g.state === GameService.Ready
  && g.players[0].userid !== ''
  && g.players[1].userid !== ''
  && (
      g.players[0].userid === Vrunr.userid
      || g.players[1].userid === Vrunr.userid
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
  
  Game.addFishMap(g);
  Game.addPenguinMap(g);
}

Game.addPlayer = function(g, idx) {
  var s;
  if (g.state === GameService.Ready) {
    if(g.players[idx].userid === '') {
      s = new Sprite(80, 25);
      s.image = Game.core.assets['view/btn.png'];
      s.frame = 0;
      s.x = 555;
      if(idx === 0) {
        s.y = 66;
      } else {
        s.y = 126;
      }
      s.addEventListener('touchstart', function() {
        Game.send('a' + idx);
      });
      Game.core.rootScene.addChild(s);
    } else if(g.players[idx].userid === Vrunr.userid) {
      s = new Sprite(80, 25);
      s.image = Game.core.assets['view/btn.png'];
      s.frame = 1;
      s.x = 555;
      if(idx === 0) {
        s.y = 66;
      } else {
        s.y = 126;
      }
      s.addEventListener('touchstart', function() {
        Game.send('b' + idx);
      });
      Game.core.rootScene.addChild(s);
    }
  } else if(g.active === idx) {
      s = new Sprite(107, 21);
      s.image = Game.core.assets['view/actv.png'];
      s.x = 666;
      if(idx === 0) {
        s.y = 42;
      } else {
        s.y = 102;
      }
      Game.core.rootScene.addChild(s);
  }
  s = new Label('枚数:' + g.players[idx].count);
  s.font = '13px sens-serif';
  s.x = 655;
  if(idx === 0) {
    s.y = 70;
  } else {
    s.y = 130;
  }
  Game.core.rootScene.addChild(s);
  if(g.state === GameService.Ready
  || g.players[idx].userid === Vrunr.userid) {
    s = new Label('得点:' + g.players[idx].score);
  } else {
    s = new Label('得点:?');
  }
  s.font = '13px sens-serif';
  s.x = 705;
  if(idx === 0) {
    s.y = 70;
  } else {
    s.y = 130;
  }
  Game.core.rootScene.addChild(s);
  s = new Label(g.players[idx].userid);
  s.x = 670;
  if(idx === 0) {
    s.y = 45;
  } else {
    s.y = 105;
  }
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addFishMap = function(g) {
  var s, i, j, k, size;
  k = 0;
  i = 11;
  size = 7;
  while(i <= 84) {
    for(j = 0; j < size; j++, i++) {
      if(g.fishMap[i] !== 0) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/tile.png'];
        if (size === 7) {
          s.x = j * 66 + 43;
          s.y = k * 50 + 7;
        } else {
          s.x = j * 66 + 10;
          s.y = k * 50 + 7;
        }
        switch(g.fishMap[i]) {
          case 1:
            s.frame = 0;
            if(g.state === GameService.Playing
            && g.phase === Phase.Setup
            && g.players[g.active].userid === Vrunr.userid
            ) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('d' + _i);
                }
              }());
            }
          break;
          case 2:
            s.frame = 1;
          break;
          case 3:
            s.frame = 2;
          break;
        }
        if(g.state === GameService.Playing
        && g.phase === Phase.Hunting
        && g.hunter !== -1
        && g.players[g.active].userid === Vrunr.userid
        && Game.canHuntFish(g, i)
        ) {
          s.addEventListener('touchstart', function() {
            var _i = i;
            return function() {
              Game.send('f' + _i);
            }
          }());
        }
        Game.core.rootScene.addChild(s);
      }
    }
    k++;
    i += 2;
    if(size === 7) {
      size = 8;
    } else {
      size = 7;
    }
  }
}

Game.addPenguinMap = function(g) {
  var s, i, j, k, size;
  k = 0;
  i = 11;
  size = 7;
  while(i <= 84) {
    for(j = 0; j < size; j++, i++) {
      if(
        g.state === GameService.Playing
        && (g.hunter === i
        || g.before === i
        )
      ) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/tile.png'];
        if(g.hunter === i) {
          s.frame = 5;
        } else {
          s.frame = 6;
        }
        s.opacity = 0.7;
        if(size === 7) {
          s.x = j * 66 + 43;
          s.y = k * 50 + 7;
        } else {
          s.x = j * 66 + 10;
          s.y = k * 50 + 7;
        }
        Game.core.rootScene.addChild(s);
      }
      if(g.penguinMap[i] !== -1) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/tile.png'];
        if(size === 7) {
          s.x = j * 66 + 43;
          s.y = k * 50 + 7;
        } else {
          s.x = j * 66 + 10;
          s.y = k * 50 + 7;
        }
        if(g.penguinMap[i] === 0) {
          s.frame = 3;
        } else {
          s.frame = 4;
        }
        if (g.state === GameService.Playing) {
          if(g.phase === Phase.Hunting
          && g.active === g.penguinMap[i]
          && Game.canMovePenguin(g, i)
          && g.players[g.active].userid === Vrunr.userid
          ) {
            s.addEventListener('touchstart', function() {
              var _i = i;
              return function() {
                Game.send('e' + _i);
              }
            }());
          }
        }
        Game.core.rootScene.addChild(s);
      }
    }
    k++;
    i += 2;
    if(size === 7) {
      size = 8;
    } else {
      size = 7;
    }
  }
}

Game.canMovePenguin = function(g, h) {
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

Game.canHuntFish = function(g, t) {
  var canHunt = false;
  
  if(Game.testHuntFish(g, t, -1)) {
    canHunt = true;
  } else if(Game.testHuntFish(g, t, -10)) {
    canHunt = true;
  } else if(Game.testHuntFish(g, t, -9)) {
    canHunt = true;
  } else if(Game.testHuntFish(g, t, 1)) {
    canHunt = true;
  } else if(Game.testHuntFish(g, t, 10)) {
    canHunt = true;
  } else if(Game.testHuntFish(g, t, 9)) {
    canHunt = true;
  }
  
  return canHunt;
}

Game.testHuntFish = function(g, t, m) {
  if(g.hunter === t + m) {
    return true;
  } else if(g.fishMap[t + m] === 0 || g.penguinMap[t + m] !== -1) {
    return false;
  }
  
  return Game.testHuntFish(g, t + m, m);
}