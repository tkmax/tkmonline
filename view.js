var uid = null, cid = null, send, onLoad, onMessage;

send = function (msg) {
    window.parent.Tkm.send('f' + msg);
}

sound = function (src) {
    window.parent.Tkm.sound(src);
}

onLoad = function() {}

onMessage = function(msg) {}