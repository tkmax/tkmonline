var Player = function() {}

Player.clear = function(p) {
  p.userid = '';
  p.penguin = 0;
  p.score = 0;
  p.count = 0;
}

Player.start = function(p) {
  p.penguin = 4;
  p.score = 0;
  p.count = 0;
}
