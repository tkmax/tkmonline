window.onload = function () {
    createjs.Sound.registerSound(Tkm.man.join("|"));

    view = $('#view')[0].contentWindow;

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
                    if (optn[0] === "") {
                        Tkm.userList.length = 0;
                    } else {
                        Tkm.userList = optn;
                    }
                    $('#login-users').empty();
                    if (Tkm.userList.length > 0) {
                        for (i in Tkm.userList) {
                            tmp1 = Tkm.userList[i].split('%');
                            tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                            if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                            $('#login-users').append(tmp2 + '</li>');
                        }
                    } else {
                        $('#login-users').append('<li>現在、ログイン中のユーザーはいません。</li>');
                    }
                    break;
                case 'C':
                    $('#login').hide();
                    $('#play').show();
                    view.onLoad();
                    tmp1 = (Tkm.splitForSyntax1(evnt.data)).split('%');
                    view.uid = tmp1[0];
                    tmp2 = '<span class="label label-inverse">' + tmp1[0] + '</span>';
                    if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                    $("#uid").append(tmp2);
                    $('#chat-text').keypress(function (e) {
                        if (e.keyCode === 13 && $(this).val() !== '') {
                            Tkm.send('e' + $(this).val());
                            $(this).val('');
                        }
                    });
                    $('#bell-btn').click(function () {
                        Tkm.send('d');
                    });
                    $('#chat-silent-btn').click(function () {
                        if ($(this).val() === 'チャット音') {
                            $(this).removeClass('btn-warning');
                            $(this).val('OFF');
                        } else {
                            $(this).addClass('btn-warning');
                            $(this).val('チャット音');
                        }
                    });
                    $('#bell-silent-btn').click(function () {
                        if ($(this).val() === 'ベル音') {
                            $(this).removeClass('btn-warning');
                            $(this).val('OFF');
                        } else {
                            $(this).addClass('btn-warning');
                            $(this).val('ベル音');
                        }
                    });
                    break;
                case 'D':
                    $('#err-msg').show();
                    break;
            }
        } else {
            switch (evnt.data[0]) {
                case 'B':
                    optn = Tkm.splitForSyntax3(evnt.data);
                    if (optn[0] === "") {
                        Tkm.userList.length = 0;
                    } else {
                        Tkm.userList = optn;
                    }
                    $('#user-list').empty();
                    if (Tkm.userList.length > 0) {
                        for (i in Tkm.userList) {
                            tmp1 = Tkm.userList[i].split('%');
                            tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                            if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                            $('#user-list').append(tmp2 + '</li>');
                        }
                    }
                    break;
                case 'E':
                    optn = Tkm.splitForSyntax1(evnt.data);
                    Tkm.userList.push(optn);
                    tmp1 = optn.split('%');
                    tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                    if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                    $('#user-list').append(tmp2 + '</li>');
                    break;
                case 'F':
                    optn = Tkm.splitForSyntax1(evnt.data);
                    for (i in Tkm.userList) {
                        if (Tkm.userList[i] === optn) {
                            Tkm.userList.splice(i, 1);
                            break;
                        }
                    }
                    $('#user-list').empty();
                    if (Tkm.userList.length > 0) {
                        for (i in Tkm.userList) {
                            tmp1 = Tkm.userList[i].split('%');
                            tmp2 = '<li><span class="label label-inverse">' + tmp1[0] + '</span>';
                            if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                            $('#user-list').append(tmp2 + '</li>');
                        }
                    }
                    break;
                case 'G':
                    if ($('#bell-silent-btn').val() !== 'OFF') Tkm.sound('../bell.mp3');
                    optn = Tkm.splitForSyntax1(evnt.data);
                    $('#log').append(
                        '<i class="icon-volume-up"></i>:<span class="label label-inverse">' + optn + '</span>' + '<span style="color: blue;">がベルを鳴らしました。</span></br>'
                    );
                    $('#log').scrollTop($('#log')[0].scrollHeight);
                    break;
                case 'H':
                    if ($('#chat-silent-btn').val() !== 'OFF') Tkm.sound('../chat.mp3');
                    optn = Tkm.splitForSyntax2(evnt.data);
                    if (optn[0] === '?') {
                        $('#log').append(
                            '<i class="icon-cog"></i>' + ':<span style="color: deeppink;">' + optn[1] + '</span></br>'
                        );
                    } else {
                        $('#log').append(
                            '<span class="label label-inverse">' + optn[0] + '</span>' + ':<span>' + optn[1] + '</span></br>'
                        );
                    }
                    $('#log').scrollTop($('#log')[0].scrollHeight);
                    break;
                case 'I':
                    tmp1 = (Tkm.splitForSyntax1(evnt.data)).split('%');
                    view.cid = tmp1[0];
                    tmp2 = '<span class="label label-inverse">' + tmp1[0] + '</span>';
                    if (tmp1.length > 1) tmp2 += '%<span class="label label-success">' + tmp1[1] + '</span>';
                    $("#cid").empty();
                    $("#cid").append(tmp2);
                    break;
                case 'J':
                    view.onMessage(Tkm.splitForSyntax1(evnt.data));
                    break;
            }
        }

        $('#login-uid').keypress(function (e) {
            if (e.keyCode === 13 && $(this).val() !== '') {
                Tkm.send('c' + $(this).val());
                $(this).val('');
            }
        });

        $('#login-btn').click(function () {
            if ($(this).val() !== '') {
                Tkm.send('c' + $('#login-uid').val());
                $('#login-uid').val('');
            }
        });
    }
}