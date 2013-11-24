var uid = null, cid = null, send, onLoad, onMessage;

send = function (msg) {
    window.parent.Tkm.send('d' + msg);
}

sound = function (id) {
    window.parent.Tkm.sound(id);
}

onLoad = function () { }

onMessage = function (msg) { }