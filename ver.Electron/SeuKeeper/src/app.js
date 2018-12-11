'use strict';

const { ipcRenderer,
} = require('electron');

const Store = require('electron-store');
const store = new Store();

var Username = '';
var Password = '';
var IfAutoStart = false;
var IfAutoLogin = false;

var login_failtime = 0;
var isLogined = false;
var runningTime = 0;

var input_u = document.getElementById('input_username');
var input_p = document.getElementById('input_password');
var div_setting = document.getElementById('div_setting');
var btn = document.getElementById('button');
var p_btn = document.getElementById('p_btn');
var p_tip = document.getElementById('p_tip');
var div_outPage = document.getElementById('div_outPage');
var p_time_d = document.getElementById('p_time_d');
var p_time_h = document.getElementById('p_time_h');
var p_time_m = document.getElementById('p_time_m');
var p_time_s = document.getElementById('p_time_s');

// 登录状态下每5分钟检查一次外网连接
var online_check = setInterval(() => {
    ipcRenderer.send('network', 'online_check||');
}, 300000);

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
    console.log('Val_bool ' + Val_bool);
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

// 
var countingTime = setInterval(() => {
    // console.log('hit0');
    if (isLogined) {
        // 先++
        // console.log('hit1');
        runningTime++;
        // 变更显示时间
        refresh_time();
    }
}, 1000);

//
function refresh_time() {
    p_time_d.innerText = parseInt(runningTime / 24 / 3600);
    p_time_h.innerText = padding(parseInt(runningTime / 3600) % 24);
    p_time_m.innerText = padding(parseInt(runningTime / 60) % 60);
    p_time_s.innerText = padding(runningTime % 60);
}

// 数字填0到两位 string
function padding(num) {
    var len = num.toString().length;
    while (len < 2) {
        num = "0" + num;
        len++;
    }
    return num;
}

// 刷新input取值
function refresh_up() {
    // var input_u = document.getElementById('input_username');
    // var input_p = document.getElementById('input_password');
    Username = input_u.value;
    Password = input_p.value;
    store.set('UserName', Username);
    store.set('Password', Password);
}

// “登录”按键点击事件
function login() {
    refresh_up();
    ipcRenderer.send('network', 'login|' + Username + '|' + Password);
}

// “注销”按键点击事件
function logout() {
    ipcRenderer.send('network', 'logout||');
}

// 登录成功后
function afterLogin() {
    // 失败次数清零
    login_failtime = 0;
    // 计时清零
    runningTime = 0;
    refresh_time();
    // 登录状态变更
    isLogined = true;
    // 动画开始
    input_u.style.animationPlayState = 'running';
    input_p.style.animationPlayState = 'running';
    div_setting.style.animationPlayState = 'running';
    btn.style.animationPlayState = 'running';
    div_outPage.style.animationPlayState = 'running';
    // 待动画结束
    setTimeout(() => {
        // 固定位置
        input_u.style.right = '300px';
        input_p.style.right = '300px';
        div_setting.style.right = '300px';
        btn.style.top = '70px';
        div_outPage.style.right = '0px';
        // 修改动画配置
        input_u.style.animation = 'Page_afterlogout 0.75s paused';
        input_p.style.animation = 'Page_afterlogout 0.75s paused';
        div_setting.style.animation = 'Page_afterlogout 0.75s paused';
        btn.style.animation = 'btn_afterlogout 0.75s paused';
        div_outPage.style.animation = 'OutPage_afterlogout 0.75s paused';
        // 修改按钮
        btn.onclick = logout;
        p_btn.innerText = '注 销';
    }, 750);
}

// 注销成功后
function afterLogout() {
    // 登录状态变更
    isLogined = false;
    // 动画开始
    input_u.style.animationPlayState = 'running';
    input_p.style.animationPlayState = 'running';
    div_setting.style.animationPlayState = 'running';
    btn.style.animationPlayState = 'running';
    div_outPage.style.animationPlayState = 'running';
    // 待动画结束
    setTimeout(() => {
        // 固定位置
        input_u.style.right = '0px';
        input_p.style.right = '0px';
        div_setting.style.right = '0px';
        btn.style.top = '0px';
        div_outPage.style.right = '-300px';
        // 修改动画配置
        input_u.style.animation = 'Page_afterlogin 0.75s paused';
        input_p.style.animation = 'Page_afterlogin 0.75s paused';
        div_setting.style.animation = 'Page_afterlogin 0.75s paused';
        btn.style.animation = 'btn_afterlogin 0.75s paused';
        div_outPage.style.animation = 'OutPage_afterlogin 0.75s paused';
        // 修改按钮
        btn.onclick = login;
        p_btn.innerText = '登 录';
    }, 750);
}

// 点击跳转关于页
function about_onClick() {
    ipcRenderer.send('action', 'about||');
}

// 与主进程（main.js）的通信
// 发送（窗口初始化）
ipcRenderer.send('action', 'ver||');
// ipcRenderer.send('action', 'load||');
// 接收
// Network
ipcRenderer.on('network', (e, msg) => {
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        case 'login_bck':
            // alert("code:" + arg1 + " (0=登陆成功,else失败)");
            if (arg1 === '0')
                afterLogin();
            else if (arg1 === '-1')
                login_failtime++;
            break;
        case 'online_state':
            if (arg1 === '-1') {
                // seu断了
                afterLogout();
            }
            else {
                if (arg2 === '-1') {
                    // seu未断，但因某种原因无法登陆
                    afterLogout();
                }
            }
            break;
        case 'logout_bck':
            afterLogout();
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
        case 'tip':
            p_tip.innerText = arg1;
            break;
        case 'alert':
            alert(arg1);
            break;
        case 'ver_bck':
            document.getElementById('p_version').innerText = 'v' + arg1;

            // 以下相当于初始化
            // 读取本地数据库
            // 账密
            let name = store.get('UserName', 'null');
            let key = store.get('Password', 'null');
            // console.log(name);
            if (name.toString() !== "null")
                document.getElementById('input_username').value = name.toString();
            if (key.toString() !== "null")
                document.getElementById('input_password').value = key.toString();
            // 开关
            let AS = store.get('AutoStart', 'null');
            let AL = store.get('AutoLogin', 'null');
            if (AS.toString() !== "null") {
                IfAutoStart = AS.toString();
                console.log('initAS ' + IfAutoStart);
                switch_refresh("autoStart");
            }
            if (AL.toString() !== "null") {
                IfAutoLogin = AL.toString();
                console.log('initAL ' + IfAutoStart);
                switch_refresh("autoLogin");
            }
            break;
        // 一些变量改变刷新
        case 'update':
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