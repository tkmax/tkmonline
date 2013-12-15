var uid = null, cid = null;

var send = function (msg) {
    window.parent.Tkm.send('d' + msg);
}

var sound = function (id) {
    if (window.parent.document.getElementById('se-silent-btn').alt === 'on') window.parent.Tkm.sound(id);
}

var onLoad = function () { }

var onMessage = function (msg) { }