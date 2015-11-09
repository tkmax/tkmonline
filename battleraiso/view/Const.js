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

Value = function () { }
Value.NONE = -1;

Index = function () { }
Index.NONE = -1;

Phase = function () { }
Phase.NONE = -1;
Phase.STARTUP = 0;
Phase.TROOP = 1;
Phase.ALEXANDER = 2;
Phase.DARIUS = 3;
Phase.COMPANION = 4;
Phase.SHIELD = 5;
Phase.FOG = 6;
Phase.MUD = 7;
Phase.SCOUT1 = 8;
Phase.SCOUT2 = 9;
Phase.SCOUT3 = 10;
Phase.REDEPLOY1 = 11;
Phase.REDEPLOY2 = 12;
Phase.DESERTER = 13;
Phase.TRAITOR1 = 14;
Phase.TRAITOR2 = 15;
Phase.DRAW = 16;

Card = function () { }
Card.TROOP = 0;
Card.TACTICS = 1;

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