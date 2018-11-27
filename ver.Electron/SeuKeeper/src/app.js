'use strict';

const { ipcRenderer,
} = require('electron');

var Username = '';
var Password = '';
var IfAutoStart = false;
var IfAutoLogin = false;

var isLogined = false;
var runningTime = 0;

// 每1000ms检查一次seu-wlan连接
// setInterval(
//     function () {
//         // alert(1);
//         const { app } = require('electron')
//         app.on('ready', () => {
//             const { net } = require('electron')
//             const request = net.request('https://github.com')
//             request.on('response', (response) => {
//                 console.log(`STATUS: ${response.statusCode}`)
//                 console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
//                 response.on('data', (chunk) => {
//                     console.log(`BODY: ${chunk}`)
//                 })
//                 response.on('end', () => {
//                     console.log('response请求中没有更多数据。')
//                 })
//             })
//             request.end()
//         })
//     },
//     5000
// );

// input实时监听(个屁，不知道为什么没用(似乎因为不支持这个函数addEventListener)
// var input_u = document.getElementById('input_username');
// var input_p = document.getElementById('input_password');
// input_u.addEventListener("onporpertychange", function () {
//     Username = input_u.value;
// });
// input_p.addEventListener("onporpertychange", function () {
//     Password = input_p.value;
// });

// 开机自启/自动登录 switch
function switch_click(type) {
    var div_out = null;
    if (type == "autoStart") {
        IfAutoStart = !IfAutoStart;
        div_out = document.getElementById("sw_autoStart");
        div_out.style.setProperty('background-color', IfAutoStart ? '#a1ed2b' : 'white');
        div_out.style.setProperty('flex-direction', IfAutoStart ? 'row-reverse' : 'row');
    }
    else if (type == "autoLogin") {
        IfAutoLogin = !IfAutoLogin;
        div_out = document.getElementById("sw_autoLogin");
        div_out.style.setProperty('background-color', IfAutoLogin ? '#a1ed2b' : 'white');
        div_out.style.setProperty('flex-direction', IfAutoLogin ? 'row-reverse' : 'row');
        if (!IfAutoStart && IfAutoLogin) {
            IfAutoStart = !IfAutoStart;
            div_out = document.getElementById("sw_autoStart");
            div_out.style.setProperty('background-color', IfAutoStart ? '#a1ed2b' : 'white');
            div_out.style.setProperty('flex-direction', IfAutoStart ? 'row-reverse' : 'row');
        }
    }
}

// “登录”按键点击事件
function login() {
    // console.log('Hit');
    // ipcRenderer.send('network','ifURLconnective|0|');
    refresh_up();
    ipcRenderer.send('network', 'login|' + Username + '|' + Password);
}

// 刷新input取值
function refresh_up(){
    var input_u = document.getElementById('input_username');
    var input_p = document.getElementById('input_password');
    Username = input_u.value;
    Password = input_p.value;
}

// 与主进程（main.js）的通信
// 发送
ipcRenderer.send('action', 'ver||');
// 接受
// Network
ipcRenderer.on('network', (e, msg) => {
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        case 'login':
            alert(arg1 + " 0就是踏马的登陆成功" + arg2);
            break;
        default:
    }
});

// ProgramAction
ipcRenderer.on('action', (e, msg) => {
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        case 'ver':
            document.getElementById('p_version').innerText='Ver:'+arg1;
            break;
        default:
    }
});