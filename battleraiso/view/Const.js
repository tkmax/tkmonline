Sound = function () { }
Sound.BELL = 0;
Sound.BUILD = 1;
Sound.CHAT = 2;
Sound.DICE = 3;
Sound.ENDING = 4;
Sound.GET = 5;
Sound.JOIN = 6;
Sound.OPENING = 7;
Sound.PASS = 8;
Sound.ROBBER = 9;

State = function () { }
State.READY = 0;
State.PLAYING = 1;

Index = function () { }
Index.NONE = -1;

Phase = function () { }
Phase.NONE = -1;
Phase.MAIN = 0;
Phase.COMMON = 1;
Phase.FOG = 2;
Phase.MUD = 3;
Phase.SCOUT1 = 4;
Phase.SCOUT2 = 5;
Phase.SCOUT3 = 6;
Phase.REDEPLOY1 = 7;
Phase.REDEPLOY2 = 8;
Phase.DESERTER = 9;
Phase.TRAITOR1 = 10;
Phase.TRAITOR2 = 11;
Phase.DRAW = 12;

Tactics = function () { }
Tactics.ALEXANDER = 0x0600;
Tactics.DARIUS = 0x0601;
Tactics.COMPANION = 0x0602;
Tactics.SHIELD = 0x0603;
Tactics.FOG = 0x0604;
Tactics.MUD = 0x0605;
Tactics.SCOUT = 0x0606;
Tactics.REDEPLOY = 0x0607;
Tactics.DESERTER = 0x0608;
Tactics.TRAITOR = 0x0609;

FONT_COLOR = [
      'yellow'
    , 'lime'
];

COLOR_NAME = [
      '黄'
    , '緑'
];