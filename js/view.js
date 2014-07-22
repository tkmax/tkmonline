var uid = null;
var cid = null;

var send = function (message) {
    window.parent.Tkm.send('d' + message);
}

var sound = function (type) {
    window.parent.Tkm.sound(type);
}

var onLoad = function () { }

var onMessage = function (message) { }