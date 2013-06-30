var Crunr = function(){}

Crunr.ctrlrid = '';

Crunr.observe = function(t) {
  window.parent.Runr.watchList.push(t);
}

Crunr.send = function(u, m) {
  window.parent.Runr.send('k' + u + ' ' + m);
}

Crunr.broadcast = function(m) {
  window.parent.Runr.send('l' + m);
}

Crunr.bell = function() {
  window.parent.Runr.send('m');
}

Crunr.chat = function(m) {
  window.parent.Runr.send('n' + m);
}

Crunr.onLoad = function() {}

Crunr.onMessage = function(u, m) {}

Crunr.onController = function(u) {}

Crunr.onBell = function(u) {}

Crunr.onChat = function(u, m) {}

Crunr.onAddUser = function(u) {}

Crunr.onRemoveUser = function(u) {}

window.onload = function() {
  Crunr.onLoad();
}