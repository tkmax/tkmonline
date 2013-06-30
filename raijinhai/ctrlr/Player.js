var Player = function() {}

Player.clear = function(p) {
  p.userid = '';
  p.played = Card.None;
  p.hand = [];
  p.phase = '';
  p.winCount = 0;
}

Player.start = function(p) {
  p.played = Card.None;
  p.hand = [
    Card.Infantry,
    Card.Cavalry,
    Card.Elephant,
    Card.Queen,
    Card.King,
    Card.Thunder
  ];
  p.phase = Phase.Select;
  p.winCount = 0;
}

Player.nextRound = function(p) {
  p.played = Card.None;
  p.hand = [
    Card.Infantry,
    Card.Cavalry,
    Card.Elephant,
    Card.Queen,
    Card.King,
    Card.Thunder
  ];
  p.phase = Phase.Select;
}
