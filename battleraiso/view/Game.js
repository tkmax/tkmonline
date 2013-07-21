enchant();

var Game = function() {}

Game.isOpen = false;
Game.isSent = false;

Game.send = function(m) {
  if(!Game.isSent) {
    Vrunr.send(m);
    Game.isSent = true;
  }
}

Game.onLoad = function() {
  Game.core = new Core(840, 520);
  Game.core.fps = 5;
  Game.core.preload(
    'view/bg.png', 'view/card.png', 'view/flag.png',
    'view/touch.png', 'view/btn.png', 'view/actv.png',
    'view/before.png'
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
  s = new Sprite(840, 520);
  s.image = Game.core.assets['view/bg.png'];
  Game.core.rootScene.addChild(s);
  
  if(g.state === State.Ready) {
    s = new Label('募集中');
  } else {
    s = new Label('対戦中');
  }
  s.x = 710;
  s.y = 10;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  
  Game.addField(g, 0);
  Game.addField(g, 1);
  
  Game.addWeather(g);
  Game.addFlags(g);
  
  Game.addHand(g, 0);
  Game.addHand(g, 1);
  
  Game.addTalon(g, 0);
  Game.addTalon(g, 1);
  
  Game.addTouch(g);
  
  Game.addUnitDeck(g);
  Game.addTacticsDeck(g);
  
  Game.addMessage(g);
  
  Game.addPlayer(g, 0);
  Game.addPlayer(g, 1);
  
  if(g.state === State.Ready
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
    s.x = 615;
    s.y = 5;
    s.addEventListener('touchstart', function() {
      Game.send('c');
    });
    Game.core.rootScene.addChild(s);
  }
}

Game.addPlayer = function(g, idx) {
  var s;
  if(g.state === State.Ready) {
    if(g.players[idx].userid === '') {
      s = new Sprite(80, 25);
      s.image = Game.core.assets['view/btn.png'];
      s.frame = 0;
      s.x = 615;
      if(idx === 0) {
        s.y = 64;
      } else {
        s.y = 124;
      }
      s.addEventListener('touchstart', function() {
        Game.send('a' + idx);
      });
      Game.core.rootScene.addChild(s);
    } else if(g.players[idx].userid === Vrunr.userid) {
      s = new Sprite(80, 25);
      s.image = Game.core.assets['view/btn.png'];
      s.frame = 1;
      s.x = 615;
      if(idx === 0) {
        s.y = 64;
      } else {
        s.y = 124;
      }
      s.addEventListener('touchstart', function() {
        Game.send('b' + idx);
      });
      Game.core.rootScene.addChild(s);
    }
  } else if(g.active === idx) {
    s = new Sprite(107, 21);
    s.image = Game.core.assets['view/actv.png'];
    s.x = 726;
    if(idx === 0) {
      s.y = 40;
    } else {
      s.y = 100;
    }
    Game.core.rootScene.addChild(s);
  }
  s = new Label(g.players[idx].userid);
  s.x = 730;
  if(idx === 0) {
    s.y = 44;
  } else {
    s.y = 104;
  }
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
  s = new Label('戦術カード: ' + g.players[idx].count + '枚');
  s.x = 710;
  if(idx === 0) {
    s.y = 69;
  } else {
    s.y = 129;
  }
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addHand = function(g, idx) {
  var s, i, j, unIdx, canPlayUnit = false, canPlayWeather = false,
  canPlayRedeploy = false, canPlayDeserter = false, canPlayTraitor = false;
  
  if(idx === 0) {
    unIdx = 1;
  } else {
    unIdx = 0;
  }
  for(i = 0; !canPlayUnit && i < g.flags.length; i++) {
    if(g.flags[i] === -1
    && g.players[idx].field[i].length < g.size[i]
    ) {
      canPlayUnit = true;
    }
  }
  for (i = 0; !canPlayWeather && i < g.flags.length; i++) {
    if(g.flags[i] === -1) {
      canPlayWeather = true;
    }
  }
  for(i in g.flags) {
    if(g.flags[i] === -1
    && g.players[idx].field[i].length > 0
    ) {
      canPlayRedeploy = true;
      break;
    }
  }
  for(i in g.flags) {
    if(g.flags[i] === -1
    && g.players[unIdx].field[i].length > 0
    ) {
      canPlayDeserter = true;
      break;
    }
  }
  if(canPlayUnit) {
    for(i = 0; !canPlayTraitor && i < g.flags.length; i++) {
      if(g.flags[i] === -1) {
        for(j in g.players[unIdx].field[i]) {
          if((g.players[unIdx].field[i][j] & 0xff00) !== 0x0600) {
            canPlayTraitor = true;
            break;
          }
        }
      }
    }
  }
  for(i = 0; i < g.players[idx].hand.length; i++) {
    s = new Sprite(65, 65);
    s.image = Game.core.assets['view/card.png'];
    if(g.state === State.Ready
    || g.players[idx].userid === Vrunr.userid
    || (
        g.active === idx
        && g.play === i
      )
    ) {
      s.frame = ((0xff00 & g.players[idx].hand[i]) >> 8) * 10 + (0x00ff & g.players[idx].hand[i]);
    } else {
      if ((0xff00 & g.players[idx].hand[i]) !== 0x0600) {
        s.frame = 70;
      } else {
        s.frame = 71;
      }
    }
    if(g.state === State.Play
    && g.active === idx
    && g.players[idx].userid === Vrunr.userid
    ) {
      if(g.phase === Phase.Main
      || g.phase === Phase.Unit
      || g.phase === Phase.Fog
      || g.phase === Phase.Mud
      || g.phase === Phase.Scout1
      || g.phase === Phase.Redeploy1
      || g.phase === Phase.Deserter
      || g.phase === Phase.Traitor1
      ) {
        if((g.players[idx].hand[i] & 0xff00) !== 0x0600) {
          if(canPlayUnit) {
            s.addEventListener('touchstart', function() {
              var _i = i;
              return function() {
                Game.send('e' + _i);
              };
            }());
          }
        } else if(g.players[idx].count <= g.players[unIdx].count) {
          if((
              (g.players[idx].hand[i] === Tactics.Alexander
              || g.players[idx].hand[i] === Tactics.Darius
              ) && g.players[idx].leader === 0
            )
          || g.players[idx].hand[i] === Tactics.Companion
          || g.players[idx].hand[i] === Tactics.Shield
          ) {
            if(canPlayUnit) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('e' + _i);
                };
              }());
            }
          } else if(g.players[idx].hand[i] === Tactics.Scout) {
            if(g.unitDeck.length + g.tacticsDeck.length > 1) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('e' + _i);
                };
              }());
            }
          } else if(g.players[idx].hand[i] === Tactics.Fog
          || g.players[idx].hand[i] === Tactics.Mud
          ) {
            if(canPlayWeather) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('e' + _i);
                };
              }());
            }
          } else if(g.players[idx].hand[i] === Tactics.Redeploy) {
            if(canPlayRedeploy) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('e' + _i);
                };
              }());
            }
          } else if(g.players[idx].hand[i] === Tactics.Deserter) {
            if(canPlayDeserter) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('e' + _i);
                };
              }());
            }
          } else if(g.players[idx].hand[i] === Tactics.Traitor) {
            if(canPlayTraitor) {
              s.addEventListener('touchstart', function() {
                var _i = i;
                return function() {
                  Game.send('e' + _i);
                };
              }());
            }
          }
        }
      } else if(g.phase === Phase.Scout3) {
        s.addEventListener('touchstart', function() {
          var _i = i;
          return function() {
            Game.send('k' + _i);
          };
        }());
      }
    }
    s.x = i * 45 + 5;
    if(idx === 0) {
      s.y = 2;
    } else {
      s.y = 453;
    }
    if(g.active === idx
    && g.play === i) {
      if(idx === 0) {
        s.y += 10;
      } else {
        s.y -= 10;
      }
    }
    Game.core.rootScene.addChild(s);
  }
}

Game.addWeather = function(g) {
  var i, s;
  for(i = 0; i < g.weather.length; i++) {
    if(g.weather[i] === 3
    || g.weather[i] === 1
    ) {
      s = new Sprite(65, 20);
      s.image = Game.core.assets['view/flag.png'];
      s.x = i * 75 + 5;
      s.y = 250;
      s.frame = 1;
      Game.core.rootScene.addChild(s);
    }
    if(g.weather[i] === 3
    || g.weather[i] === 2) {
      s = new Sprite(65, 20);
      s.image = Game.core.assets['view/flag.png'];
      s.x = i * 75 + 5;
      s.y = 250;
      s.frame = 2;
      Game.core.rootScene.addChild(s);
    }
  }
}

Game.addFlags = function(g) {
  var unActive, i, activeScore, unActiveScore;
  if(g.active === 0) {
    unActive = 1;
  } else {
    unActive = 0;
  }
  for(i = 0; i < g.flags.length; i++) {
    s = new Sprite(65, 20);
    s.image = Game.core.assets['view/flag.png'];
    s.frame = 0;
    s.x = i * 75 + 5;
    if(g.state === State.Play
    && g.players[g.active].userid === Vrunr.userid
    && g.phase === Phase.Main
    && g.players[g.active].field[i].length === g.size[i]
    ) {
      activeScore = Game.score(g.weather[i], g.players[g.active].field[i]);
      if(g.players[unActive].field[i].length > 0) {
        unActiveScore = Game.maxScore(-1, g.stock, g.weather[i], g.size[i], g.players[unActive].field[i]);
      } else {
        unActiveScore = Game.maxScoreForNothing(g, g.weather[i], g.size[i]);
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
    if (g.flags[i] === 0) {
      s.y = 69;
    } else if (g.flags[i] === 1) {
      s.y = 431;
    } else {
      s.y = 250;
    }
    Game.core.rootScene.addChild(s);
    if(g.flags[i] === -1) {
      s = new Sprite(65, 20);
      s.image = Game.core.assets['view/flag.png'];
      s.frame = 12;
      s.x = i * 75 + 5;
      s.y = 250;
      if(g.phase === Phase.Fog) {
        s.addEventListener('touchstart', function() {
          var _i = i;
          return function() {
            Game.send('g' + _i);
          };
        }());
        Game.core.rootScene.addChild(s);
      } else if(g.phase === Phase.Mud) {
        s.addEventListener('touchstart', function() {
          var _i = i;
          return function() {
            Game.send('h' + _i);
          };
        }());
        Game.core.rootScene.addChild(s);
      }
    }
  }
}

Game.addTouch = function(g) {
  var i;
  if(g.state === State.Play
  && g.players[g.active].userid === Vrunr.userid
  ) {
    if(g.phase === Phase.Unit
    || g.phase === Phase.Traitor2) {
      for(i = 0; i < g.flags.length; i++) {
        if(g.flags[i] === -1
        && g.players[g.active].field[i].length < g.size[i]
        ) {
          s = new Sprite(65, 160);
          s.image = Game.core.assets['view/touch.png'];
          s.x = i * 75 + 5;
          if (g.phase === Phase.Unit) {
            s.addEventListener('touchstart', function() {
              var _i = i;
              return function() {
                Game.send('f' + _i);
              };
            }());
            if(g.active === 0) {
              s.y = 89;
            } else {
              s.y = 271;
            }
          } else {
            s.addEventListener('touchstart', function() {
              var _i = i;
              return function() {
                Game.send('p' + _i);
              };
            }());
            if(g.active === 0) {
              s.y = 89;
            } else {
              s.y = 271;
            }
          }
          Game.core.rootScene.addChild(s);
        }
      }
    } else if(g.phase === Phase.Redeploy2) {
      for(i = 0; i < g.flags.length; i++) {
        if(g.flags[i] === -1) {
          s = new Sprite(65, 160);
          s.image = Game.core.assets['view/touch.png'];
          s.x = i * 75 + 5;
          s.addEventListener('touchstart', function() {
            var _i = i;
            return function() {
              Game.send('m' + _i);
            };
          }());
          if(g.active === 0) {
            s.y = 89;
          } else {
            s.y = 271;
          }
          Game.core.rootScene.addChild(s);
        }
      }
    }
  }
}

Game.addField = function(g, idx) {
  var i, j, s;
  for(i = 0; i < g.players[idx].field.length; i++) {
    for(j = 0; j < g.players[idx].field[i].length; j++) {
      if(g.before.idx === idx
      && g.before.y === i
      && g.before.x === j
      ) {
        s = new Sprite(71, 71);
        s.image = Game.core.assets['view/before.png'];
        s.x = i * 75 + 2;
        if(idx === 0) {
          s.y = 181 - j * 31;
        } else {
          s.y = j * 31 + 268;
        }
        Game.core.rootScene.addChild(s);
      }
      s = new Sprite(65, 65);
      s.image = Game.core.assets['view/card.png'];
      s.frame = ((0xff00 & g.players[idx].field[i][j]) >> 8) * 10 + (0x00ff & g.players[idx].field[i][j]);
      s.x = i * 75 + 5;
      if(idx === 0) {
        s.y = 184 - j * 31;
      } else {
        s.y = j * 31 + 271;
      }
      if(g.state === State.Play
      && g.players[g.active].userid === Vrunr.userid
      && g.flags[i] === -1
      ) {
        if(g.active === idx
        && g.phase === Phase.Redeploy1
        ) {
          s.addEventListener('touchstart', function() {
            var _i = i, _j = j;
            return function() {
              Game.send('l' + _i + ' ' + _j);
            };
          }());
        } else if(g.active !== idx) {
          if(g.phase === Phase.Deserter) {
            s.addEventListener('touchstart', function() {
              var _i = i, _j = j;
              return function() {
                Game.send('n' + _i + ' ' + _j);
              };
            }());
          } else if(g.phase === Phase.Traitor1
          && (g.players[idx].field[i][j] & 0xff00) !== 0x0600
          ) {
            s.addEventListener('touchstart', function() {
              var _i = i, _j = j;
              return function() {
                Game.send('o' + _i + ' ' + _j);
              };
            }());
          }
        }
      }
      Game.core.rootScene.addChild(s);
      if(g.state === State.Play
      && g.target.y === i
      && g.target.x === j
      ) {
        s = new Sprite(65, 65);
        s.image = Game.core.assets['view/card.png'];
        s.frame = 72;
        s.opacity = 0.7;
        s.x = i * 75 + 5;
        if(g.active === idx) {
          if(g.phase === Phase.Redeploy2) {
            if(idx === 0) {
              s.y = 184 - j * 31;
            } else {
              s.y = j * 31 + 271;
            }
            Game.core.rootScene.addChild(s);
          }
        } else {
          if(g.phase === Phase.Traitor2) {
            if(idx === 0) {
              s.y = 184 - j * 31;
            } else {
              s.y = j * 31 + 271;
            }
            Game.core.rootScene.addChild(s);
          }
        }
      }
    }
  }
}

Game.addUnitDeck = function(g) {
  var s = new Sprite(65, 65);
  s.image = Game.core.assets['view/card.png'];
  s.frame = 70;
  s.x = 700;
  s.y = 390;
  if(g.state === State.Play
  && g.players[g.active].userid === Vrunr.userid
  && g.unitDeck.length > 0
  ) {
    if(g.phase === Phase.Draw) {
      s.addEventListener('touchstart', function() {
        Game.send('q');
      });
    } else if(
         g.phase === Phase.Scout1
      || g.phase === Phase.Scout2
    ) {
      s.addEventListener('touchstart', function() {
        Game.send('i');
      });
    }
  }
  Game.core.rootScene.addChild(s);
  s = new Label(g.unitDeck.length + '枚');
  s.x = 705;
  s.y = 395;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addTacticsDeck = function(g) {
  var s = new Sprite(65, 65);
  s.image = Game.core.assets['view/card.png'];
  s.frame = 71;
  s.x = 770;
  s.y = 390;
  if(g.state === State.Play
  && g.players[g.active].userid === Vrunr.userid
  && g.tacticsDeck.length > 0
  ) {
    if(g.phase === Phase.Draw) {
      s.addEventListener('touchstart', function() {
        Game.send('r');
      });
    } else if(
         g.phase === Phase.Scout1
      || g.phase === Phase.Scout2
    ) {
      s.addEventListener('touchstart', function() {
        Game.send('j');
      });
    }
  }
  Game.core.rootScene.addChild(s);
  s = new Label(g.tacticsDeck.length + '枚');
  s.x = 775;
  s.y = 395;
  s.font = '13px sens-serif';
  Game.core.rootScene.addChild(s);
}

Game.addTalon = function(g, idx) {
  var i, s;
  for(i = 0; i < g.players[idx].talon.length; i++) {
    s = new Sprite(65, 65);
    s.image = Game.core.assets['view/card.png'];
    s.frame = ((0xff00 & g.players[idx].talon[i]) >> 8) * 10 + (0x00ff & g.players[idx].talon[i]);
    s.x = i * 45 + 445;
    if(idx === 0) {
      s.y = 2;
    } else {
      s.y = 453;
    }
    Game.core.rootScene.addChild(s);
  }
}

Game.addMessage = function(g) {
  var s, unActive, canPlayUnit = false, haveUnit = false;
  if(g.state === State.Play) {
    s = new Label('');
    s.x = 705;
    s.y = 170;
    s.font = '13px sens-serif';
    if(g.phase === Phase.Main) {
      s.text = '旗の獲得か、カードを<br />プレイできます。';
      Game.core.rootScene.addChild(s);
      if(g.players[g.active].userid === Vrunr.userid) {
        for(i in g.flags) {
          if(g.flags[i] === -1
          && g.players[g.active].field[i].length < g.size[i]
          ) {
            canPlayUnit = true;
            break;
          }
        }
        for(i in g.players[g.active].hand) {
          if((g.players[g.active].hand[i] & 0xff00) !== 0x0600) {
            haveUnit = true;
            break;
          }
        }
        if(!canPlayUnit || !haveUnit) {
          s = new Sprite(80, 25);
          s.image = Game.core.assets['view/btn.png'];
          s.frame = 3;
          s.x = 705;
          s.y = 300;
          s.addEventListener('touchstart', function() {
            Game.send('s');
          });
          Game.core.rootScene.addChild(s);
        }
      }
    } else if(g.phase === Phase.Unit) {
      s.text = '戦場へカードを出せま<br />す。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Fog) {
      s.text = '戦場を霧にできます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Mud) {
      s.text = '戦場を沼にできます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Scout1) {
      s.text = '偵察により山札からカ<br />ードを引けます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Scout2) {
      s.text = '山札の上にカードを戻<br />せます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Redeploy1) {
      s.text = '再配置するカードを選<br />べます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Redeploy2) {
      if(g.players[g.active].userid === Vrunr.userid) {
        s.text = 'カードを移動か、除外<br />できます。';
        Game.core.rootScene.addChild(s);
        if(g.players[g.active].userid === Vrunr.userid) {
          s = new Sprite(80, 25);
          s.image = Game.core.assets['view/btn.png'];
          s.frame = 4;
          s.x = 705;
          s.y = 300;
          s.addEventListener('touchstart', function() {
            Game.send('m-1');
          });
          Game.core.rootScene.addChild(s);
        }
      }
    } else if(g.phase === Phase.Deserter) {
      s.text = 'カードを除外できます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Traitor1) {
      s.text = '裏切らせる部隊カード<br />を選べます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Traitor2) {
      s.text = '部隊カードを移動でき<br />ます。';
      Game.core.rootScene.addChild(s);
    } else if(g.phase === Phase.Draw) {
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