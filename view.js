var uid = null, cid = null, send, onLoad, onMessage;

send = function (msg) {
    window.parent.Tkm.send('f' + msg);
}

sound = function (id) {
    window.parent.Tkm.sound[id].play();
}

onLoad = function() {}

onMessage = function(msg) {}