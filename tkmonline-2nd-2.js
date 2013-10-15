window.onload = function () {
    view = document.getElementById('view').contentWindow;

    Tkm.ws = new WebSocket(Tkm.wsurl);

    Tkm.ws.onopen = function () {
        Tkm.send('b');
    }

    Tkm.ws.onmessage = function (evnt) {
        var i, tmp1, tmp2, optn;

        if (view.uid === null) {
            switch (evnt.data[0]) {
                case 'B':
                    optn = Tkm.splitForSyntax3(evnt.data);
                    if (optn[0] === '') {
                        Tkm.userList.length = 0;
                    } else {
                        Tkm.userList = optn;
                    }
                    if (Tkm.userList.length > 0) {
                        document.getElementById('login-users').innerHTML = '';
                        for (i = 0; i < Tkm.userList.length; i++) {
                            tmp1 = Tkm.userList[i].split('%');
                            tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                            if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                            document.getElementById('login-users').innerHTML += tmp2 + '</li>';
                        }
                    } else {
                        document.getElementById('login-users').innerHTML = '<li>現在、ログイン中のユーザーはいません。</li>';
                    }
                    break;
                case 'C':
                    document.getElementById('login').style.display = 'none';
                    document.getElementById('play').style.display = 'block';
                    view.onLoad();
                    tmp1 = (Tkm.splitForSyntax1(evnt.data)).split('%');
                    view.uid = tmp1[0];
                    tmp2 = '<span class="label label-inverse">' + tmp1[0] + '</span>';
                    if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                    document.getElementById('uid').innerHTML = tmp2;
                    document.getElementById('chat-text').onkeypress = function (e) {
                        if (this.value !== '' && (e.which === 13 || e.keyCode === 13)) {
                            Tkm.send('e' + this.value);
                            this.value = '';
                        }
                    }
                    document.getElementById('chat-silent-btn').onclick = function () {
                        if (this.value === 'チャット音') {
                            this.className = 'btn';
                            this.value = 'OFF';
                        } else {
                            this.className = 'btn btn-warning';
                            this.value = 'チャット音';
                        }
                    }
                    break;
                case 'D':
                    document.getElementById('err-msg').style.display = 'block';
                    break;
            }
        } else {
            switch (evnt.data[0]) {
                case 'B':
                    optn = Tkm.splitForSyntax3(evnt.data);
                    if (optn[0] === '') {
                        Tkm.userList.length = 0;
                    } else {
                        Tkm.userList = optn;
                    }
                    document.getElementById('user-list').innerHTML = '';
                    if (Tkm.userList.length > 0) {
                        for (i in Tkm.userList) {
                            tmp1 = Tkm.userList[i].split('%');
                            tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                            if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                            document.getElementById('user-list').innerHTML += tmp2 + '</li>';
                        }
                    }
                    break;
                case 'E':
                    optn = Tkm.splitForSyntax1(evnt.data);
                    Tkm.userList.push(optn);
                    tmp1 = optn.split('%');
                    tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                    if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                    document.getElementById('user-list').innerHTML += tmp2 + '</li>';
                    break;
                case 'F':
                    optn = Tkm.splitForSyntax1(evnt.data);
                    for (i in Tkm.userList) {
                        if (Tkm.userList[i] === optn) {
                            Tkm.userList.splice(i, 1);
                            break;
                        }
                    }
                    document.getElementById('user-list').innerHTML = '';
                    if (Tkm.userList.length > 0) {
                        for (i = 0; i < Tkm.userList.length; i++) {
                            tmp1 = Tkm.userList[i].split('%');
                            tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                            if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                            document.getElementById('user-list').innerHTML += tmp2 + '</li>';
                        }
                    }
                    break;
                case 'H':
                    if (document.getElementById('chat-silent-btn').value !== 'OFF') unitePlayer.play('chat');
                    optn = Tkm.splitForSyntax2(evnt.data);
                    if (optn[0] === '?') {
                        document.getElementById('log').innerHTML
                        += '<i class="icon-cog"></i>' + ':<span style="color: deeppink;">' + optn[1] + '</span></br>';
                    } else {
                        document.getElementById('log').innerHTML
                        += '<span class="label label-inverse">' + optn[0] + '</span>' + ':<span>' + optn[1] + '</span></br>';
                    }
                    document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
                    break;
                case 'I':
                    tmp1 = (Tkm.splitForSyntax1(evnt.data)).split('%');
                    view.cid = tmp1[0];
                    tmp2 = '<span class="label label-inverse">' + tmp1[0] + '</span>';
                    if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                    document.getElementById('cid').innerHTML = tmp2;
                    break;
                case 'J':
                    view.onMessage(Tkm.splitForSyntax1(evnt.data));
                    break;
            }
        }

        document.getElementById('login-uid').onkeypress = function (e) {
            if (this.value !== '' && (e.which === 13 || e.keyCode === 13)) {
                Tkm.send('c' + this.value);
                this.value = '';
            }
        }

        document.getElementById('login-btn').onclick = function () {
            var login_uid = document.getElementById('login-uid');

            if (login_uid.value !== '') {
                Tkm.send('c' + login_uid.value);
                login_uid.value = '';
            }
        }
    }
}