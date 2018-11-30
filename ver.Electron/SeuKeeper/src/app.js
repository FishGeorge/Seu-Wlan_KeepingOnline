'use strict';

const { ipcRenderer,
} = require('electron');

const Store = require('electron-store');
const store = new Store();

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

// switchUI刷新
function switch_refresh(type) {
    let div_out = null;
    let Val_bool = null;
    if (type === "autoStart") {
        Val_bool = IfAutoStart;
        div_out = document.getElementById("sw_autoStart");
    } else {
        Val_bool = IfAutoLogin;
        div_out = document.getElementById("sw_autoLogin");
    }
    div_out.style.setProperty('background-color', Val_bool ? '#a1ed2b' : 'white');
    div_out.style.setProperty('flex-direction', Val_bool ? 'row-reverse' : 'row');
}

// 开机自启/自动登录 switch点击事件
function switch_click(type) {
    if (type === "autoStart") {
        IfAutoStart = !IfAutoStart;
        switch_refresh(type);
        store.set('AutoStart', IfAutoStart);
        ipcRenderer.send('action', 'update|AS|');
    }
    else if (type === "autoLogin") {
        IfAutoLogin = !IfAutoLogin;
        switch_refresh(type);
        store.set('AutoLogin', IfAutoLogin);
        ipcRenderer.send('action', 'update|AL|');
        if (!IfAutoStart && IfAutoLogin) {
            IfAutoStart = !IfAutoStart;
            switch_refresh("autoStart");
            store.set('AutoStart', IfAutoStart);
            ipcRenderer.send('action', 'update|AS|');
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
function refresh_up() {
    var input_u = document.getElementById('input_username');
    var input_p = document.getElementById('input_password');
    Username = input_u.value;
    Password = input_p.value;
    store.set('UserName', Username);
    store.set('Password', Password);
}

// 点击跳转
function about_onClick() {
    ipcRenderer.send('action', 'about||');
}

// 与主进程（main.js）的通信
// 发送
ipcRenderer.send('action', 'ver||');
ipcRenderer.send('action', 'load||');
// 接收
// Network
ipcRenderer.on('network', (e, msg) => {
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        case 'login':
            alert("code:" + arg1 + " (0=登陆成功,else失败)");
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
        case 'alert':
            alert(arg1);
            break;
        case 'ver':
            document.getElementById('p_version').innerText = 'v' + arg1;

            // 以下相当于初始化
            // 读取本地数据库
            // 账密
            let name = store.get('UserName', 'null');
            let key = store.get('Password', 'null');
            console.log(name);
            if (name.toString() !== "null")
                document.getElementById('input_username').value = name.toString();
            if (key.toString() !== "null")
                document.getElementById('input_password').value = key.toString();
            // 开关
            let AS = store.get('AutoStart', 'null');
            let AL = store.get('AutoLogin', 'null');
            if (AS.toString() !== "null") {
                IfAutoStart = AS.toString();
                switch_refresh("autoStart");
            }
            if (AL.toString() !== "null") {
                IfAutoLogin = AL.toString();
                switch_refresh("autoLogin");
            }
            break;
        // 一些变量改变刷新
        case 'update':
            var div_out = null;
            switch (arg1) {
                case 'AS':
                    IfAutoStart = !IfAutoStart;
                    console.log('AS' + IfAutoStart);
                    switch_refresh('autoStart');
                    store.set('AutoStart', IfAutoStart);
                    break;
                case 'AL':
                    IfAutoLogin = !IfAutoLogin;
                    console.log('AL' + IfAutoLogin);
                    switch_refresh('autoLogin');
                    store.set('AutoLogin', IfAutoLogin);
                    break;
                case 'IL':
                    isLogined = !isLogined;
                    break;
                case 'RT':
                    runningTime = arg2;
                    break;
                default:
            }
            break;
        default:
    }
});