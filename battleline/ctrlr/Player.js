var Player = function() {}

Player.clear = function(p) {
  p.userid = '';
  p.hand = [];
  p.talon = [];
  p.count = 0;
  p.leader = 0;
  p.field = [
    [], [], [], [], [], [], [], [], []
  ];
}

Player.start = function(p) {
  p.hand.length = 0;
  p.talon.length = 0;
  p.count = 0;
  p.leader = 0;
  p.field = [
    [], [], [], [], [], [], [], [], []
  ];
}
