var Vrunr = function() {}

Vrunr.userid = '';
Vrunr.ctrlrid = '';

Vrunr.send = function(m) {
  window.parent.Runr.send('j' + m);
}

Vrunr.onLoad = function() {}

Vrunr.onMessage = function(m) {}

Vrunr.onController = function(u) {}

Vrunr.onBell = function(u) {}

Vrunr.onChat = function(u, m) {}

Vrunr.onAddUser = function(u) {}

Vrunr.onRemoveUser = function(u) {}