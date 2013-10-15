var ctrlr, view, Tkm = function() { }, unitePlayer = function() { };

Tkm.wsurl = 'ws://210.152.156.23:7911';
Tkm.ws = null;
Tkm.instanceIdx = null;
Tkm.userList = [];

unitePlayer.param = {
    mp3: '../uni.mp3',
    volume: 1,
    preset: {
        build: ['0:15.05', '0:15.19']
        , dice: ['0:20.06', '0:20.8']
        , end: ['0:25.04', '0:26.11']
        , finish: ['0:30.06', '0:31.94']
        , get: ['0:35.06', '0:36.13']
        , robber: ['0:40.06', '0:40.8']
        , chat: ['0:45.1', '0:46.3']
    }
};

unitePlayer.track0 = new UnitePlayer(unitePlayer.param, 0, function callback(evt, uni, track, time) {
    switch (evt.type) {
        case "playing":
            unitePlayer.isPlaying = true;
            break;
        case "error":
        case "pause":
        case "ended":
            unitePlayer.isPlaying = false;
            break;
    }
});

unitePlayer.play = function (id) {
    if (
        id !== 'chat'
        || !unitePlayer.isPlaying
    ) {
        unitePlayer.track0.preset(id);
    }
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