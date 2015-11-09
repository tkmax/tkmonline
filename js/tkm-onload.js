window.onload = function () {
    (function () {
        try {
            (function(){
                Tkm.webAudioContext = new webkitAudioContext();

                Tkm.audio = Tkm.Audio.WEB_AUDIO_API;

                var i;
                var len1 = Tkm.soundUrlList.length;
                for (i = 0; i < len1; i++) {
                    var xhr = new XMLHttpRequest();

                    xhr.open('GET', Tkm.soundUrlList[i] + '.mp3', true);
                    xhr.responseType = 'arraybuffer';

                    xhr.onload = (function () {
                        var _i = i;

                        return function () {
                            Tkm.webAudioContext.decodeAudioData(this.response, function (buffer) {
                                Tkm.soundList[_i] = buffer;
                            });
                        }
                    })();

                    xhr.send();
                }
            })();
        } catch (e) {
            (function(){
                Tkm.audio = Tkm.Audio.CREATE_JS;

                var format = '.mp3';

                var userAgent = navigator.userAgent.toLowerCase();

                if(userAgent.match(/firefox/)) { format = '.ogg'; }

                var manifest = [];

                var i;
                var len1 = Tkm.soundUrlList.length;
                for (i = 0; i < len1; i++) {
                    manifest.push({ src: Tkm.soundUrlList[i] + format, id: i });
                }

                var queue = new createjs.LoadQueue(true);
                queue.installPlugin(createjs.Sound);
                queue.loadManifest(manifest, true);
            })();
        }

        Tkm.view = document.getElementById('play-view').contentWindow;

        document.getElementById('login-button').onclick = function () {
            var uid = document.getElementById('login-input-uid').value;

            if (uid !== '') { Tkm.send('b' + uid); }
        }

        document.getElementById('play-input-chat').onkeypress = function (event) {
            if (
                   this.value !== ''
                && (event.which === 13 || event.keyCode === 13)
            ) {
                Tkm.send('c' + this.value);
                this.value = '';
            }
        }

        document.getElementById('play-button-se').onclick = function () {
            if (Tkm.isMuteSE) {
                Tkm.isMuteSE = false;
                this.style.backgroundColor = 'orange';
            } else {
                Tkm.isMuteSE = true;
                this.style.backgroundColor = 'gray';
            }
        }

        document.getElementById('play-button-bs').onclick = function () {
            if (Tkm.isMuteBell) {
                Tkm.isMuteBell = false;
                this.style.backgroundColor = 'orange';
            } else {
                Tkm.isMuteBell = true;
                this.style.backgroundColor = 'gray';
            }
        }

        document.getElementById('play-button-dice').onclick = function () {
            Tkm.send('f');
        }

        document.getElementById('play-button-bell').onclick = function () {
            Tkm.send('e');
        }

        document.getElementById('play-select-volume').selectedIndex = 2;

        document.getElementById('play-select-volume').onchange = function () {
            Tkm.volume = parseFloat(this.value);
        }

        Tkm.ws = new WebSocket(Tkm.wsurl);
    })();

    Tkm.ws.onopen = function () {
        Tkm.send('a');
    }

    Tkm.ws.onmessage = function (event) {
        if (Tkm.view.uid === null) {
            switch (event.data[0]) {
                case 'A':
                    (function () {
                        var param = Tkm.splitSyntaxType3(event.data);

                        if (param[0] === '') {
                            document.getElementById('login-error').innerHTML = 'ログイン中のユーザーはいません。';
                        } else {
                            Tkm.userList = param;
                            Tkm.updateUserList();
                        }
                    })();
                    break;
                case 'B':
                    (function () {
                        var param = Tkm.splitSyntaxType1(event.data).split('%');

                        document.getElementById('login').style.display = 'none';
                        document.getElementById('play').style.display = 'block';
                        Tkm.view.uid = param[0];

                        Tkm.view.onLoad();
                    })();
                    break;
            }
        } else {
            switch (event.data[0]) {
                case 'A':
                    (function () {
                        var param = Tkm.splitSyntaxType3(event.data);

                        if (param[0] === '') {
                            Tkm.userList.length = 0;
                        } else {
                            Tkm.userList = param;
                        }

                        Tkm.updateUserList();
                    })();
                    break;
                case 'D':
                    Tkm.userList.push(Tkm.splitSyntaxType1(event.data));
                    Tkm.updateUserList();
                    break;
                case 'E':
                    (function () {
                        var param = Tkm.splitSyntaxType1(event.data);

                        var i;
                        var len1 = Tkm.userList.length;
                        for (i = 0; i < len1; i++) {
                            if (Tkm.userList[i] === param) {
                                Tkm.userList.splice(i, 1);
                                break;
                            }
                        }

                        Tkm.updateUserList();
                    })();
                    break;
                case 'F':
                    Tkm.view.cid = Tkm.splitSyntaxType1(event.data).split('%')[0];
                    Tkm.updateUserList();
                    break;
                case 'G':
                    Tkm.view.cid = '';
                    Tkm.updateUserList();
                    break;
                case 'H':
                    (function () {
                        var param = Tkm.splitSyntaxType2(event.data);
                        var playLog = document.getElementById('play-log');

                        if (param[0] === '?') {
                            playLog.innerHTML += '<div class="chat"><span style="color:' + param[1]
                                                + ';">' + param[2] + '</span></div>';
                        } else {
                            playLog.innerHTML += '<div class="chat"><span class="uid">' + param[0]
                                                + '</span>:<span style="color:' + param[1] + ';">'
                                                + param[2] + '</span></div>';
                        }

                        playLog.scrollTop = playLog.scrollHeight;

                        Tkm.sound(Tkm.Sound.CHAT);
                    })();
                    break;
                case 'I':
                    Tkm.view.onMessage(Tkm.splitSyntaxType1(event.data));
                    break;
                case 'J':
                    if(!Tkm.isMuteBell) { Tkm._sound(Tkm.Sound.BELL); }
                    break;
            }
        }
    }

    setInterval(
        function () {
            ws.send(String.fromCharCode(200));
        }, 5000
    );
}