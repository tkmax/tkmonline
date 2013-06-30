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

Game.onMessage = function(o) {
  var s, i, j, k;
  
  Game.isSent = false;
  while(Game.core.rootScene.childNodes.length > 0) {
    Game.core.rootScene.removeChild(Game.core.rootScene.childNodes[0]);
  }
  s = new Sprite(780, 430);
  s.image = Game.core.assets['view/bg.png'];
  Game.core.rootScene.addChild(s);
  
  if(o.state === GameService.Ready) {
    s = new Label('募集中');
  } else {
    s = new Label('対戦中');
  }
  s.x = 650;
  s.y = 13;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  
  Game.addPlayer(o, 0, 45);
  Game.addPlayer(o, 1, 105);
  
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
  
  Game.addFishMap(o);
  
  Game.addPenguinMap(o);
}

Game.addPlayer = function(o, n, y) {
  var s;
  if (o.state === GameService.Ready) {
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
  } else if(o.active === n) {
      s = new Sprite(107, 21);
      s.image = Game.core.assets['view/actv.png'];
      s.x = 666;
      s.y = y - 3;
      Game.core.rootScene.addChild(s);
  }
  s = new Label('ペンギン:' + o.players[n].penguin);
  s.font = '11px sens-serif';
  s.x = 655;
  s.y = y + 20;
  Game.core.rootScene.addChild(s);
  if(o.state === GameService.Ready
  || o.players[n].userid === Vrunr.userid) {
    s = new Label('枚数:' + o.players[n].count);
  } else {
    s = new Label('枚数:?');
  }
  s.font = '11px sens-serif';
  s.x = 655;
  s.y = y + 32;
  Game.core.rootScene.addChild(s);
  if(o.state === GameService.Ready
  || o.players[n].userid === Vrunr.userid) {
    s = new Label('得点:' + o.players[n].score);
  } else {
    s = new Label('得点:?');
  }
  s.font = '11px sens-serif';
  s.x = 700;
  s.y = y + 32;
  Game.core.rootScene.addChild(s);
  s = new Label(o.players[n].userid);
  s.x = 670;
  s.y = y;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addFishMap = function(o) {
  var s, i, j, k, size;
  k = 0;
  i = 11;
  size = 7;
  while(i <= 84) {
    for(j = 0; j < size; j++, i++) {
      if(o.fishMap[i] !== 0) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/tile.png'];
        if (size === 7) {
          s.x = j * 66 + 43;
          s.y = k * 50 + 7;
        } else {
          s.x = j * 66 + 10;
          s.y = k * 50 + 7;
        }
        switch(o.fishMap[i]) {
          case 1:
            s.frame = 0;
            if(o.state === GameService.Playing
            && o.phase === Phase.Setup
            && o.players[o.active].userid === Vrunr.userid
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
        if(o.state === GameService.Playing
        && o.phase === Phase.Hunting
        && o.hunter !== -1
        && o.players[o.active].userid === Vrunr.userid
        && Game.canHuntFish(o, i)
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

Game.addPenguinMap = function(o) {
  var s, i, j, k, size;
  k = 0;
  i = 11;
  size = 7;
  while(i <= 84) {
    for(j = 0; j < size; j++, i++) {
      if(o.hunter === i) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/tile.png'];
        s.frame = 5;
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
      if(o.penguinMap[i] !== -1) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/tile.png'];
        if(size === 7) {
          s.x = j * 66 + 43;
          s.y = k * 50 + 7;
        } else {
          s.x = j * 66 + 10;
          s.y = k * 50 + 7;
        }
        if(o.penguinMap[i] === 0) {
          s.frame = 3;
        } else {
          s.frame = 4;
        }
        if (o.state === GameService.Playing) {
          if(o.phase === Phase.Hunting
          && o.active === o.penguinMap[i]
          && Game.canMovePenguin(o, i)
          && o.players[o.active].userid === Vrunr.userid
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

Game.canMovePenguin = function(o, h) {
  var canMove = false;
  
  if(o.fishMap[h - 1] !== 0 && o.penguinMap[h - 1] === -1) {
    canMove = true;
  } else if(o.fishMap[h - 10] !== 0 && o.penguinMap[h - 10] === -1) {
    canMove = true;
  } else if(o.fishMap[h - 9] !== 0 && o.penguinMap[h - 9] === -1) {
    canMove = true;
  } else if(o.fishMap[h + 1] !== 0 && o.penguinMap[h + 1] === -1) {
    canMove = true;
  } else if(o.fishMap[h + 10] !== 0 && o.penguinMap[h + 10] === -1) {
    canMove = true;
  } else if(o.fishMap[h + 9] !== 0 && o.penguinMap[h + 9] === -1) {
    canMove = true;
  }
  
  return canMove;
}

Game.canHuntFish = function(o, t) {
  var canHunt = false;
  
  if(Game.testHuntFish(o, t, -1)) {
    canHunt = true;
  } else if(Game.testHuntFish(o, t, -10)) {
    canHunt = true;
  } else if(Game.testHuntFish(o, t, -9)) {
    canHunt = true;
  } else if(Game.testHuntFish(o, t, 1)) {
    canHunt = true;
  } else if(Game.testHuntFish(o, t, 10)) {
    canHunt = true;
  } else if(Game.testHuntFish(o, t, 9)) {
    canHunt = true;
  }
  
  return canHunt;
}

Game.testHuntFish = function(o, t, m) {
  if(o.hunter === t + m) {
    return true;
  } else if(o.fishMap[t + m] === 0 || o.penguinMap[t + m] !== -1) {
    return false;
  }
  
  return Game.testHuntFish(o, t + m, m);
}