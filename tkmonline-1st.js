var ctrlr, view, Tkm = function() { };

Tkm.wsurl = 'ws://210.152.156.23:7911';
Tkm.ws = null;
Tkm.instanceIdx = null;
Tkm.userList = [];
Tkm.man = [
    '../bell.mp3'
    ,'../chat.mp3'
];

Tkm.sound = function (src) {
    createjs.Sound.play(src, createjs.Sound.INTERRUPT_ANY);
}

Tkm.send = function (msg) {
    Tkm.ws.send(String.fromCharCode(Tkm.instanceIdx) + msg);
}

Tkm.splitForSyntax1 = function(src) {
    return src.substring(1);
 }

Tkm.splitForSyntax2 = function(src) {
    var result = /^([^ ]*) ?(.*)$/.exec(src.substring(1));
    result.shift();
    return result;
}

Tkm.splitForSyntax3 = function (src) {
    return (src.substring(1)).split(' ');
}