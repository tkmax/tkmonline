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
    'view/bg.png', 'view/card.png', 'view/flag.png',
    'view/touch.png', 'view/btn.png', 'view/actv.png'
  );
  Game.core.onload = function() {
    Game.isOpen = true;
    Game.send('t');
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
  
  Game.addPlayer(g, 0, 45);
  Game.addPlayer(g, 1, 105);
  
  Game.addWeather(g);
  Game.addFlags(g);
  
  Game.addField(g, 0);
  Game.addField(g, 1);
  
  Game.addHand(g, 0, 0);
  Game.addHand(g, 1, 370);
  
  Game.addTalon(g, 0);
  Game.addTalon(g, 1);
  
  Game.addTouch(g);
  
  Game.addUnitDeck(g);
  Game.addTacticsDeck(g);
  
  Game.addMessage(g);
  
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
}

Game.addPlayer = function(o, n, y) {
  var s;
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
  } else if(o.active === n) {
      s = new Sprite(107, 21);
      s.image = Game.core.assets['view/actv.png'];
      s.x = 666;
      s.y = y - 3;
      Game.core.rootScene.addChild(s);
  }
  s = new Label(o.players[n].userid);
  s.x = 670;
  s.y = y;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  s = new Label('戦術カード: ' + o.players[n].count + '枚');
  s.x = 650;
  s.y = y + 26;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addHand = function(o, n, y) {
  var s, i, j, m, canPlayUnit = false, canPlayWeather = false,
  canPlayRedeploy = false, canPlayDeserter = false, canPlayTraitor = false;
  
  if(n === 0) {
    m = 1;
  } else {
    m = 0;
  }
  for(i = 0; !canPlayUnit && i < o.flags.length; i++) {
    if(o.flags[i] === -1
    && o.players[n].field[i].length < o.size[i]
    ) {
      canPlayUnit = true;
    }
  }
  for (i = 0; !canPlayWeather && i < o.flags.length; i++) {
    if(o.flags[i] === -1) {
      canPlayWeather = true;
    }
  }
  for(i in o.flags) {
    if(o.flags[i] === -1
    && o.players[n].field[i].length > 0
    ) {
      canPlayRedeploy = true;
      break;
    }
  }
  for(i in o.flags) {
    if(o.flags[i] === -1
    && o.players[m].field[i].length > 0
    ) {
      canPlayDeserter = true;
      break;
    }
  }
  if(canPlayUnit) {
    for(i = 0; !canPlayTraitor && i < o.flags.length; i++) {
      if(o.flags[i] === -1) {
        for(j in o.players[m].field[i]) {
          if((o.players[m].field[i][j] & 0xff00) !== 0x0600) {
            canPlayTraitor = true;
            break;
          }
        }
      }
    }
  }
  for(i = 0; i < o.players[n].hand.length; i++) {
    s = new Sprite(60, 60);
    s.image = Game.core.assets['view/card.png'];
    if(o.state === GameService.Ready
    || o.players[n].userid === Vrunr.userid
    || (
        o.active === n
        && o.play === i
      )
    ) {
      s.frame = ((0xff00 & o.players[n].hand[i]) >> 8) * 10 + (0x00ff & o.players[n].hand[i]);
    } else {
      if ((0xff00 & o.players[n].hand[i]) !== 0x0600) {
        s.frame = 70;
      } else {
        s.frame = 71;
      }
      
    }
    if(o.state === GameService.Playing
    && o.active === n
    && o.players[n].userid === Vrunr.userid
    ) {
      if(o.phase === Phase.Main
      && o.play === -1
      ) {
        if((o.players[n].hand[i] & 0xff00) !== 0x0600) {
          if(canPlayUnit) {
            s.addEventListener('touchstart', function() {
              var j = i;
              return function() {
                Game.send('e' + j);
              };
            }());
          }
        } else if(o.players[n].count <= o.players[m].count) {
          if((
              (o.players[n].hand[i] === Tactics.Alexander
              || o.players[n].hand[i] === Tactics.Darius
              ) && o.players[n].leader === 0
            )
          || o.players[n].hand[i] === Tactics.Companion
          || o.players[n].hand[i] === Tactics.Shield
          ) {
            if(canPlayUnit) {
              s.addEventListener('touchstart', function() {
                var j = i;
                return function() {
                  Game.send('e' + j);
                };
              }());
            }
          } else if(o.players[n].hand[i] === Tactics.Scout) {
            if(o.unitDeck.length + o.tacticsDeck.length > 3) {
              s.addEventListener('touchstart', function() {
                var j = i;
                return function() {
                  Game.send('e' + j);
                };
              }());
            }
          } else if(o.players[n].hand[i] === Tactics.Fog
          || o.players[n].hand[i] === Tactics.Mud
          ) {
            if(canPlayWeather) {
              s.addEventListener('touchstart', function() {
                var j = i;
                return function() {
                  Game.send('e' + j);
                };
              }());
            }
          } else if(o.players[n].hand[i] === Tactics.Redeploy) {
            if(canPlayRedeploy) {
              s.addEventListener('touchstart', function() {
                var j = i;
                return function() {
                  Game.send('e' + j);
                };
              }());
            }
          } else if(o.players[n].hand[i] === Tactics.Deserter) {
            if(canPlayDeserter) {
              s.addEventListener('touchstart', function() {
                var j = i;
                return function() {
                  Game.send('e' + j);
                };
              }());
            }
          } else if(o.players[n].hand[i] === Tactics.Traitor) {
            if(canPlayTraitor) {
              s.addEventListener('touchstart', function() {
                var j = i;
                return function() {
                  Game.send('e' + j);
                };
              }());
            }
          }
        }
      } else if(o.phase === Phase.Scout2) {
        if(o.unitDeck.length + o.tacticsDeck.length > 3) {
          s.addEventListener('touchstart', function() {
            var j = i;
            return function() {
              Game.send('k' + j);
            };
          }());
        }
      }
    }
    s.x = i * 45 + 5;
    s.y = y;
    if(o.active === n
    && o.play === i) {
      if(n === 0) {
        s.y += 10;
      } else {
        s.y -= 10;
      }
    }
    Game.core.rootScene.addChild(s);
  }
}

Game.addFlags = function(o) {
  var unActive, i, activeScore, unActiveScore;
  if(o.active === 0) {
    unActive = 1;
  } else {
    unActive = 0;
  }
  for(i = 0; i < o.flags.length; i++) {
    s = new Sprite(60, 20);
    s.image = Game.core.assets['view/flag.png'];
    s.frame = 0;
    s.x = i * 65 + 5;
    if(o.state === GameService.Playing
    && o.players[o.active].userid === Vrunr.userid
    && o.phase === Phase.Main
    && o.players[o.active].field[i].length === o.size[i]
    ) {
      activeScore = Game.score(o.weather[i], o.players[o.active].field[i]);
      if(o.players[unActive].field[i].length > 0) {
        unActiveScore = Game.maxScore(-1, o.stock, o.weather[i], o.size[i], o.players[unActive].field[i]);
      } else {
        unActiveScore = Game.maxScoreForNothing(o, o.weather[i], o.size[i]);
      }
      if(activeScore >= unActiveScore) {
        s.addEventListener('touchstart', function() {
          var j = i;
          return function() {
            Game.send('d' + j);
          };
        }());
      }
    }
    if (o.flags[i] === 0) {
      s.y = 62;
    } else if (o.flags[i] === 1) {
      s.y = 348;
    } else {
      s.y = 205;
    }
    Game.core.rootScene.addChild(s);
    if(o.flags[i] === -1) {
      s = new Sprite(60, 20);
      s.image = Game.core.assets['view/flag.png'];
      s.frame = 12;
      s.x = i * 65 + 5;
      s.y = 205;
      if(o.phase === Phase.Fog) {
        s.addEventListener('touchstart', function() {
          var j = i;
          return function() {
            Game.send('g' + j);
          };
        }());
        Game.core.rootScene.addChild(s);
      } else if(o.phase === Phase.Mud) {
        s.addEventListener('touchstart', function() {
          var j = i;
          return function() {
            Game.send('h' + j);
          };
        }());
        Game.core.rootScene.addChild(s);
      }
    }
  }
}

Game.addTouch = function(o) {
  var i;
  if(o.state === GameService.Playing
  && o.players[o.active].userid === Vrunr.userid
  ) {
    if(o.phase === Phase.Unit
    || o.phase === Phase.Traitor2) {
      for(i = 0; i < o.flags.length; i++) {
        if(o.flags[i] === -1
        && o.players[o.active].field[i].length < o.size[i]
        ) {
          s = new Sprite(60, 120);
          s.image = Game.core.assets['view/touch.png'];
          s.x = i * 65 + 5;
          if (o.phase === Phase.Unit) {
            s.addEventListener('touchstart', function() {
              var j = i;
              return function() {
                Game.send('f' + j);
              };
            }());
            if(o.active === 0) {
              s.y = 85;
            } else {
              s.y = 225;
            }
          } else {
            s.addEventListener('touchstart', function() {
              var j = i;
              return function() {
                Game.send('p' + j);
              };
            }());
            if(o.active === 0) {
              s.y = 85;
            } else {
              s.y = 225;
            }
          }
          Game.core.rootScene.addChild(s);
        }
      }
    } else if(o.phase === Phase.Redeploy2) {
      for(i = 0; i < o.flags.length; i++) {
        if(o.flags[i] === -1) {
          s = new Sprite(60, 120);
          s.image = Game.core.assets['view/touch.png'];
          s.x = i * 65 + 5;
          s.addEventListener('touchstart', function() {
            var j = i;
            return function() {
              Game.send('m' + j);
            };
          }());
          if(o.active === 0) {
            s.y = 85;
          } else {
            s.y = 225;
          }
          Game.core.rootScene.addChild(s);
        }
      }
    }
  }
}

Game.addField = function(o, n) {
  var i, j, s;
  for(i = 0; i < o.players[n].field.length; i++) {
    for(j = 0; j < o.players[n].field[i].length; j++) {
      s = new Sprite(60, 60);
      s.image = Game.core.assets['view/card.png'];
      s.frame = ((0xff00 & o.players[n].field[i][j]) >> 8) * 10 + (0x00ff & o.players[n].field[i][j]);
      s.x = i * 65 + 5;
      if(n === 0) {
        s.y = 143 - j * 20;
      } else {
        s.y = j * 20 + 227;
      }
      if(o.state === GameService.Playing
      && o.players[o.active].userid === Vrunr.userid
      && o.flags[i] === -1
      ) {
        if(o.active === n
        && o.phase === Phase.Redeploy1
        ) {
          s.addEventListener('touchstart', function() {
            var k = i, l = j;
            return function() {
              Game.send('l' + k + ' ' + l);
            };
          }());
        } else if(o.active !== n) {
          if(o.phase === Phase.Deserter) {
            s.addEventListener('touchstart', function() {
              var k = i, l = j;
              return function() {
                Game.send('n' + k + ' ' + l);
              };
            }());
          } else if(o.phase === Phase.Traitor1
          && (o.players[n].field[i][j] & 0xff00) !== 0x0600
          ) {
            s.addEventListener('touchstart', function() {
              var k = i, l = j;
              return function() {
                Game.send('o' + k + ' ' + l);
              };
            }());
          }
        }
      }
      Game.core.rootScene.addChild(s);
      if(o.state === GameService.Playing
      && o.target.y === i
      && o.target.x === j
      ) {
        s = new Sprite(60, 60);
        s.image = Game.core.assets['view/card.png'];
        s.frame = 72;
        s.opacity = 0.7;
        s.x = i * 65 + 5;
        if(o.active === n) {
          if(o.phase === Phase.Redeploy2) {
            if(n === 0) {
              s.y = 143 - j * 20;
            } else {
              s.y = j * 20 + 227;
            }
            Game.core.rootScene.addChild(s);
          }
        } else {
          if(o.phase === Phase.Traitor2) {
            if(n === 0) {
              s.y = 143 - j * 20;
            } else {
              s.y = j * 20 + 227;
            }
            Game.core.rootScene.addChild(s);
          }
        }
      }
    }
  }
}

Game.addUnitDeck = function(o) {
  var s = new Sprite(60, 60);
  s.image = Game.core.assets['view/card.png'];
  s.frame = 70;
  s.x = 645;
  s.y = 350;
  if(o.state === GameService.Playing
  && o.players[o.active].userid === Vrunr.userid
  && o.unitDeck.length > 0
  ) {
    if(o.phase === Phase.Draw) {
      s.addEventListener('touchstart', function() {
        Game.send('q');
      });
    } else if(o.phase === Phase.Scout1) {
      s.addEventListener('touchstart', function() {
        Game.send('i');
      });
    }
  }
  Game.core.rootScene.addChild(s);
  s = new Label(o.unitDeck.length + '枚');
  s.x = 650;
  s.y = 355;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addTacticsDeck = function(o) {
  var s = new Sprite(60, 60);
  s.image = Game.core.assets['view/card.png'];
  s.frame = 71;
  s.x = 710;
  s.y = 350;
  if(o.state === GameService.Playing
  && o.players[o.active].userid === Vrunr.userid
  && o.tacticsDeck.length > 0
  ) {
    if(o.phase === Phase.Draw) {
      s.addEventListener('touchstart', function() {
        Game.send('r');
      });
    } else if(o.phase === Phase.Scout1) {
      s.addEventListener('touchstart', function() {
        Game.send('j');
      });
    }
  }
  Game.core.rootScene.addChild(s);
  s = new Label(o.tacticsDeck.length + '枚');
  s.x = 715;
  s.y = 355;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addTalon = function(o, n) {
  var i, s;
  for(i = 0; i < o.players[n].talon.length; i++) {
    s = new Sprite(60, 60);
    s.image = Game.core.assets['view/card.png'];
    s.frame = ((0xff00 & o.players[n].talon[i]) >> 8) * 10 + (0x00ff & o.players[n].talon[i]);
    s.x = i * 30 + 440;
    if(n === 0) {
      s.y = 0;
    } else {
      s.y = 370;
    }
    Game.core.rootScene.addChild(s);
  }
}

Game.addWeather = function(o) {
  var i, s;
  for(i = 0; i < o.weather.length; i++) {
    if(o.weather[i] === 3
    || o.weather[i] === 1
    ) {
      s = new Sprite(60, 20);
      s.image = Game.core.assets['view/flag.png'];
      s.x = i * 65 + 5;
      s.y = 205;
      s.frame = 1;
      Game.core.rootScene.addChild(s);
    }
    if(o.weather[i] === 3
    || o.weather[i] === 2) {
      s = new Sprite(60, 20);
      s.image = Game.core.assets['view/flag.png'];
      s.x = i * 65 + 5;
      s.y = 205;
      s.frame = 2;
      Game.core.rootScene.addChild(s);
    }
  }
}

Game.addMessage = function(o) {
  var s, unActive, canPlayUnit = false, haveUnit = false;
  if(o.state === GameService.Playing) {
    s = new Label('');
    s.x = 645;
    s.y = 170;
    s.font = '13px sens-serif';
    if(o.phase === Phase.Main) {
      s.text = '旗の獲得か、カードを<br />プレイできます。';
      Game.core.rootScene.addChild(s);
      if(o.players[o.active].userid === Vrunr.userid) {
        for(i in o.flags) {
          if(o.flags[i] === -1
          && o.players[o.active].field[i].length < o.size[i]
          ) {
            canPlayUnit = true;
            break;
          }
        }
        for(i in o.players[o.active].hand) {
          if((o.players[o.active].hand[i] & 0xff00) !== 0x0600) {
            haveUnit = true;
            break;
          }
        }
        if(!canPlayUnit || !haveUnit) {
          s = new Sprite(80, 25);
          s.image = Game.core.assets['view/btn.png'];
          s.frame = 3;
          s.x = 645;
          s.y = 300;
          s.addEventListener('touchstart', function() {
            Game.send('s');
          });
          Game.core.rootScene.addChild(s);
        }
      }
    } else if(o.phase === Phase.Unit) {
      s.text = '戦場へカードを出せま<br />す。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Fog) {
      s.text = '戦場を霧にできます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Mud) {
      s.text = '戦場を沼にできます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Scout1) {
      s.text = '偵察により山札からカ<br />ードを引けます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Scout2) {
      s.text = '山札の上にカードを戻<br />せます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Redeploy1) {
      s.text = '再配置するカードを選<br />べます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Redeploy2) {
      if(o.players[o.active].userid === Vrunr.userid) {
        s.text = 'カードを移動か、除外<br />できます。';
        Game.core.rootScene.addChild(s);
        if(o.players[o.active].userid === Vrunr.userid) {
          s = new Sprite(80, 25);
          s.image = Game.core.assets['view/btn.png'];
          s.frame = 4;
          s.x = 645;
          s.y = 300;
          s.addEventListener('touchstart', function() {
            Game.send('m-1');
          });
          Game.core.rootScene.addChild(s);
        }
      }
    } else if(o.phase === Phase.Deserter) {
      s.text = 'カードを除外できます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Traitor1) {
      s.text = '裏切らせる部隊カード<br />を選べます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Traitor2) {
      s.text = '部隊カードを移動でき<br />ます。';
      Game.core.rootScene.addChild(s);
    } else if(o.phase === Phase.Draw) {
      s.text = '山札からカードを引け<br />ます。';
      Game.core.rootScene.addChild(s);
    }
  }
}

Game.maxScoreForNothing = function(g, weather, size) {
  var result, i, j, k, l;
  result = -1;
  if(weather === 1 || weather === 3) {
    k = l = 0;
    for(i = g.stock.length - 1; l < size && i >= g.stock.length - 10; i--) {
      for(j = i; l < size && j >= 0; j -= 10) {
        if(g.stock[j] !== -1) {
          k += g.stock[j];
          l++;
        }
      }
    }
    result = k;
  } else {
    for(i = g.stock.length - 1; i >= 0; i -= 10) {
      k = l = 0;
      for(j = i; (i - j) < 10; j--) {
        if(g.stock[j] !== -1) {
          k += g.stock[j];
          l++;
          if(l >= size) {
            if(result < k) {
              result = k;
            }
            break;
          }
        } else {
          k = l = 0;
        }
      }
    }
    if(result > -1) {
      return result + 400;
    }
    for(i = g.stock.length - 1; i >= g.stock.length - 10; i--) {
      k = l = 0;
      for(j = i; j >= 0; j -= 10) {
        if(g.stock[j] !== -1) {
          k += g.stock[j];
          l++;
          if(l >= size) {
            if(result < k) {
              result = k;
            }
            break;
          }
        }
      }
    }
    if(result > -1) {
      return result + 300;
    }
    for(i = g.stock.length - 1; i >= 0; i -= 10) {
      k = l = 0;
      for(j = i; (i - j) < 10; j--) {
        if(g.stock[j] !== -1) {
          k += g.stock[j];
          l++;
          if(l >= size) {
            if(result < k) {
              result = k;
            }
            break;
          }
        } else {
          k = 0;
        }
      }
    }
    if(result > -1) {
      return result + 200;
    }
    k = l = 0;
    for(i = g.stock.length - 1; i >= g.stock.length - 10; i--) {
      for(j = i; j >= 0; j -= 10) {
        if(g.stock[j] !== -1) {
          k += g.stock[j];
          l++;
          break;
        }
      }
      if(j < 0) {
        k = l = 0;
      }
      if(l >= size) {
        result = k;
        break;
      }
    }
    if(result > -1) {
      return result + 100;
    }
    k = l = 0;
    for(i = g.stock.length - 1; i >= g.stock.length - 10; i--) {
      for(j = i; j >= 0; j -= 10) {
        if(g.stock[j] !== -1) {
          k += g.stock[j];
          l++;
          break;
        }
      }
      if(l >= size) {
        if(result < k) {
          result = k;
        }
        break;
      }
    }
  }
  return result;
}

Game.maxScore = function(max, stock, weather, size, sample) {
  var score, i, j;
  if(sample.length === size) {
    return Game.score(weather, sample);
  }
  for(i = 0x0000; i < 0x0600; i += 0x0100) {
    for(j = 0x0009; j >= 0x0000; j -= 0x0001) {
      if(stock[((i >> 8) * 10 + j)] !== -1) {
        stock[((i >> 8) * 10 + j)] = -1;
        sample.push(i | j);
        score = Game.maxScore(max, stock, weather, size, sample);
        if(score > max) {
          max = score;
        }
        stock[((i >> 8) * 10 + j)] = j;
        sample.splice(sample.length - 1, 1);
      }
    }
  }
  return max;
}

Game.score = function(weather, formation) {
  var sample = [], i, j, k, l, isFlush, isStraight, isThree,
  flush, straight, three, leader = 0, companion = 0, shield = 0;
  for(i = 0; i < formation.length; i++) {
    switch(formation[i]) {
      case Tactics.Alexander:
      case Tactics.Darius:
        leader++;
      break;
      case Tactics.Companion:
        companion++;
      break;
      case Tactics.Shield:
        shield++;
      break;
      default:
        sample.push(formation[i]);
      break;
    }
  }
  for(i = 0; i < sample.length - 1; i++) {
    for(j = i + 1; j < sample.length; j++) {
      if((sample[i] & 0x00ff) < (sample[j] & 0x00ff)) {
        k = sample[i];
        sample[i] = sample[j];
        sample[j] = k;
      }
    }
  }
  isFlush = false;
  flush = 0;
  j = 0;
  for(i = 0; i < sample.length; i++) {
    flush += (sample[i] & 0x00ff);
    if((sample[0] & 0xff00) === (sample[i] & 0xff00)) {
      j++;
    }
  }
  flush += leader * 9 + companion * 7 + shield * 2;
  if((j + leader + companion + shield) === formation.length) {
    isFlush = true;
  }
  isThree = false;
  three = 0;
  j = 0;
  for(i = 0; i < sample.length; i++) {
    three += (sample[i] & 0x00ff);
    if((sample[0] & 0x00ff) === (sample[i] & 0x00ff)) {
      j++;
    }
  }
  if((j + leader) === formation.length) {
    three += (sample[0] & 0x00ff) * leader;
    isThree = true;
  } else if(sample.length > 0) {
    if((sample[0] & 0x00ff) === 7) {
      if((j + leader + companion) === formation.length) {
        three += 7 * (leader + companion);
        isThree = true;
      }
    } else if((sample[0] & 0x00ff) === 0
    || (sample[0] & 0x00ff) === 1
    || (sample[0] & 0x00ff) === 2
    ) {
      if((j + leader + shield) === formation.length) {
        three += (sample[0] & 0x00ff) * (leader + shield);
        isThree = true;
      }
    }
  }
  isStraight = true;
  straight = 0;
  if(sample.length > 0) {
    k = (sample[0] & 0x00ff);
    l = (sample[sample.length - 1] & 0x00ff);
    straight += k;
    j = k;
    i = 1;
    while(i < sample.length) {
      if(j - 1 === (sample[i] & 0x00ff)) {
        j = (sample[i] & 0x00ff);
        straight += j;
        i++;
      } else {
        if(companion > 0 && j === 8) {
          companion--;
          j -= 1;
          straight += j;
        } else if(shield > 0
        && (j === 3
          || j === 2
          || j === 1
          )
        ) {
          shield--;
          j -= 1;
          straight += j;
        } else if(leader > 0) {
          leader--;
          j -= 1;
          straight += j;
        } else {
          isStraight = false;
          break;
        }
      }
    }
    if(isStraight && companion > 0) {
      if(k + 1 === 7) {
        companion--;
        k++;
        straight += k;
      } else if(k + 2 === 7 && leader >= 1) {
        companion--;
        leader--;
        k += 2;
        straight += k;
      } else if(k + 3 === 7 && leader >= 2) {
        companion--;
        leader -= 2;
        k += 3;
        straight += k;
      } else if(l - 1 === 7) {
        companion--;
        l--;
        straight += l;
      } else if(l - 2 === 7 && leader > 0) {
        companion--;
        leader--;
        l -= 2;
        straight += l;
      } else {
        isStraight = false;
      }
    }
    if(isStraight && shield > 0) {
      if(k + 1 === 1
      || k + 1 === 2
      ) {
        shield--;
        k++;
        straight += k;
      } else if(k + 2 === 2 && leader >= 1) {
        shield--;
        leader--;
        k += 2;
        straight += k;
      } else if(l - 1 === 0
      || l - 1 === 1
      || l - 1 === 2
      ) {
        shield--;
        l--;
        straight += l;
      } else if(l - 2 === 2 && leader >= 1) {
        shield--;
        leader--;
        l -= 2;
        straight += l;
      } else if(l - 3 === 2 && leader >= 2) {
        shield--;
        leader -= 2;
        l -= 3;
        straight += l;
      } else {
        isStraight = false;
      }
    } 
    while(isStraight && leader > 0) {
      if(k + 1 <= 9) {
        leader--;
        k++;
        straight += k;
      } else {
        leader--;
        l--;
        straight += l;
      }
    }
  } else {
    if(companion > 0 && shield > 0) {
      isStraight = false;
    } else {
      if(companion > 0) {
        if(formation.length === 3) {
          straight = 24;
        } else {
          straight = 30;
        }
      } else {
        if(formation.length === 3) {
          straight = 9;
        } else {
          straight = 14;
        }
      }
    }
  }
  if(!(weather === 1 || weather === 3)) {
    if(isFlush && isStraight) {
      return 400 + straight;
    } else if(isThree) {
      return 300 + three;
    } else if(isFlush) {
      return 200 + flush;
    } else if(isStraight) {
      return 100 + straight;
    }
  }
  return flush;
}