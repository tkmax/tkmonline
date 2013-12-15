window.onload = function () {
    var queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest(Tkm.manifest, true);

    view = document.getElementById('view').contentWindow;

    Tkm.ws = new WebSocket(Tkm.wsurl);

    Tkm.ws.onopen = function () {
        Tkm.send('a');
    }

    Tkm.ws.onmessage = function (evnt) {
        var i, foo, bar, optn;

        if (view.uid === null) {
            switch (evnt.data[0]) {
                case 'A':
                    optn = Tkm.splitSyntax3(evnt.data);
                    if (optn[0] === '')
                        Tkm.userList.length = 0;
                    else
                        Tkm.userList = optn;
                    if (Tkm.userList.length > 0) {
                        document.getElementById('login-users').innerHTML = '';
                        for (i = 0; i < Tkm.userList.length; i++) {
                            foo = Tkm.userList[i].split('%');
                            bar = '<span class="uid">' + foo[0] + '</span>';
                            if (foo.length > 1) bar += '◆' + '<span class="trip">' + foo[1] + '</span>';
                            document.getElementById('login-users').innerHTML += '<li>' + bar + '</li>';
                        }
                    } else {
                        document.getElementById('login-users').innerHTML = '<li>ログイン中のユーザーはいません。</li>';
                    }
                    break;
                case 'B':
                    document.getElementById('login').style.display = 'none';
                    document.getElementById('play').style.display = 'block';
                    view.onLoad();
                    foo = (Tkm.splitSyntax1(evnt.data)).split('%');
                    view.uid = foo[0];
                    document.getElementById('chat-text').onkeypress = function (e) {
                        if (this.value !== '' && (e.which === 13 || e.keyCode === 13)) {
                            Tkm.send('c' + this.value);
                            this.value = '';
                        }
                    }
                    document.getElementById('chat-silent-btn').onclick = function () {
                        if (this.alt === 'on') {
                            this.src = '../img/chat-off.png';
                            this.alt = 'off';
                        } else {
                            this.src = '../img/chat-on.png';
                            this.alt = 'on';
                        }
                    }
                    document.getElementById('se-silent-btn').onclick = function () {
                        if (this.alt === 'on') {
                            this.src = '../img/se-off.png';
                            this.alt = 'off';
                        } else {
                            this.src = '../img/se-on.png';
                            this.alt = 'on';
                        }
                    }
                    Tkm.updateUserList();
                    break;
                case 'C':
                    document.getElementById('err-msg').style.display = 'block';
                    break;
            }
        } else {
            switch (evnt.data[0]) {
                case 'A':
                    optn = Tkm.splitSyntax3(evnt.data);
                    if (optn[0] === '')
                        Tkm.userList.length = 0;
                    else
                        Tkm.userList = optn;
                    Tkm.updateUserList();
                    break;
                case 'D':
                    optn = Tkm.splitSyntax1(evnt.data);
                    Tkm.userList.push(optn);
                    Tkm.updateUserList();
                    break;
                case 'E':
                    optn = Tkm.splitSyntax1(evnt.data);
                    for (i = 0; i < Tkm.userList.length; i++) {
                        if (Tkm.userList[i] === optn) {
                            Tkm.userList.splice(i, 1);
                            break;
                        }
                    }
                    Tkm.updateUserList();
                    break;
                case 'F':
                    foo = (Tkm.splitSyntax1(evnt.data)).split('%');
                    view.cid = foo[0];
                    Tkm.updateUserList();
                    break;
                case 'G':
                    view.cid = '';
                    Tkm.updateUserList();
                    break;
                case 'H':
                    if (document.getElementById('chat-silent-btn').alt === 'on') Tkm.sound('chat');
                    optn = Tkm.splitSyntax2(evnt.data);
                    if (optn[0] === '?') {
                        document.getElementById('log').innerHTML
                            += '<span style="color: ' + optn[1] + ';">' + optn[2] + '</span></br>';
                    } else {
                        document.getElementById('log').innerHTML
                            += '<span class="uid">' + optn[0]
                            + '</span>:<span style="color: ' + optn[1] + ';">'
                            + optn[2] + '</span></br>';
                    }
                    document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
                    break;
                case 'I':
                    view.onMessage(Tkm.splitSyntax1(evnt.data));
                    break;
            }
        }

        document.getElementById('login-btn').onclick = function () {
            var login_uid = document.getElementById('login-uid');

            if (login_uid.value !== '') {
                Tkm.send('b' + login_uid.value);
                login_uid.value = '';
            }
        }
    }
}