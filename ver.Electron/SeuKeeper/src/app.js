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

/*----------------------------定时函数----------------------------*/
// 每5分钟若处于登录态，检查一次外网连接
var online_check = setInterval(() => {
    if (isLogined) {
        console.log(getFormatTime() + ' | Online check');
        ipcRenderer.send('network', 'online_check||');
    }
}, 300000);

// 读秒啊
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
/*--------------------------------------------------------*/

/*----------------------------点击事件响应函数----------------------------*/
// 开机自启/自动登录 switch点击事件
function switch_click(type) {
    if (type === "autoStart") {
        // console.log('test1 '+IfAutoStart);
        IfAutoStart = !IfAutoStart;
        // console.log('test2 '+IfAutoStart);
        switch_refresh(type);
        store.set('AutoStart', IfAutoStart);
        ipcRenderer.send('action', 'update|AS|' + IfAutoStart);
        // 若不开机自启，则必不能自动登录
        if (!IfAutoStart && IfAutoLogin) {
            IfAutoLogin = !IfAutoLogin;
            switch_refresh("autoLogin");
            store.set('AutoLogin', IfAutoLogin);
            ipcRenderer.send('action', 'update|AL|' + IfAutoLogin);
        }
    }
    else if (type === "autoLogin") {
        IfAutoLogin = !IfAutoLogin;
        switch_refresh(type);
        store.set('AutoLogin', IfAutoLogin);
        ipcRenderer.send('action', 'update|AL|' + IfAutoLogin);
        // 若自动登录，则必开机自启
        if (!IfAutoStart && IfAutoLogin) {
            IfAutoStart = !IfAutoStart;
            switch_refresh("autoStart");
            store.set('AutoStart', IfAutoStart);
            ipcRenderer.send('action', 'update|AS|' + IfAutoStart);
        }
    }
}

// “登录”按键点击事件
function login() {
    refresh_input();
    ipcRenderer.send('network', 'login|' + Username + '|' + Password);
}

// “注销”按键点击事件
function logout() {
    ipcRenderer.send('network', 'logout||');
}

// 点击跳转关于页
function about_onClick() {
    ipcRenderer.send('action', 'about||');
}
/*--------------------------------------------------------*/

/*----------------------------UI刷新函数----------------------------*/
// switchUI刷新
function switch_refresh(type) {
    let div_out = null;
    let Val_bool = null;
    if (type === "autoStart") {
        Val_bool = IfAutoStart;
        div_out = document.getElementById("sw_autoStart");
        // console.log('hit ' + IfAutoStart);
        // console.log(div_out.style.backgroundColor.toString());
    } else {
        Val_bool = IfAutoLogin;
        div_out = document.getElementById("sw_autoLogin");
    }
    div_out.style.setProperty('background-color', Val_bool ? '#a1ed2b' : 'white');
    div_out.style.setProperty('flex-direction', Val_bool ? 'row-reverse' : 'row');
}

// 刷新input取值
function refresh_input() {
    // var input_u = document.getElementById('input_username');
    // var input_p = document.getElementById('input_password');
    Username = input_u.value;
    Password = input_p.value;
    store.set('UserName', Username);
    store.set('Password', Password);
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

//
function refresh_time() {
    p_time_d.innerText = parseInt(runningTime / 24 / 3600);
    p_time_h.innerText = padding(parseInt(runningTime / 3600) % 24);
    p_time_m.innerText = padding(parseInt(runningTime / 60) % 60);
    p_time_s.innerText = padding(runningTime % 60);
}
/*--------------------------------------------------------*/

/*----------------------------utils函数----------------------------*/
// 数字填0到两位 string
function padding(num) {
    var len = num.toString().length;
    while (len < 2) {
        num = "0" + num;
        len++;
    }
    return num;
}

function str2bool(str) {
    if (str === 'true')
        return true;
    else if (str === 'false')
        return false;
    else
        return -1;
}

function getFormatTime() {
    var date = new Date();
    var month = date.getMonth() + 1;
    month = month > 9 ? month : "0" + month;
    var day = date.getDate();
    day = day > 9 ? day : "0" + day;
    var hour = date.getHours();
    hour = hour > 9 ? hour : "0" + hour;
    var min = date.getMinutes();
    min = min > 9 ? min : "0" + min;
    var sec = date.getSeconds();
    sec = sec > 9 ? sec : "0" + sec;
    return month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
}
/*--------------------------------------------------------*/

/*----------------------------与main通信的接收函数----------------------------*/
// Network
ipcRenderer.on('network', (e, msg) => {
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        case 'login_bck':
            // alert("code:" + arg1 + " (0=登陆成功,else失败)");
            if (arg1 === '0') {
                // if (arg2 === '0') {// arg2固定为0，用于测试
                // console.log('hithere')
                afterLogin();
                isLogined = true;
            }
            else if (arg1 === '-1')
                login_failtime++;
            break;
        case 'online_check_bck':
            // console.log('hit!!')
            if (arg1 === '0') {
                // console.log('hit1')
                // seu未断
                if (arg2 === '0') {
                    // 网也没断
                    // console.log(isLogined);
                    if (!isLogined) {
                        // 初次打开程序时isLogined为false，此时check，可能已联网，使程序进入登录态
                        // 登录态isLogined为true，定时check，返回仍然联网，防止程序于登录态调用afterLogin()
                        afterLogin();
                    }
                }
                else if (arg2 === '-1') {
                    // 但因某种原因已断网
                    if (isLogined) {
                        // 初次打开程序时isLogined为false，此时check，可能未联网，防止程序于注销态调用afterLogout()
                        afterLogout();
                        // 尝试重登
                        console.log(getFormatTime() + ' | Try to relogin');
                        ipcRenderer.send('network', 'login|' + Username + '|' + Password);
                    } else {
                        if (IfAutoLogin) {
                            // 自动登录
                            ipcRenderer.send('network', 'login|' + Username + '|' + Password);
                        }
                    }
                } else {
                    // nothing arrive
                }
            } else if (arg1 === '-1') {
                // console.log('hit2')
                // seu断了
                afterLogout();
            }
            else {
                // nothing arrive
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
        case 'init':
            // 读取本地数据库
            // 询问版本号
            ipcRenderer.send('action', 'ver||');
            // 检查在线状态
            ipcRenderer.send('network', 'online_check||');
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
                IfAutoStart = str2bool(AS.toString());
                console.log('initAS ' + IfAutoStart);
                switch_refresh("autoStart");
                ipcRenderer.send('action', 'update|AS|' + IfAutoStart);
            }
            if (AL.toString() !== "null") {
                IfAutoLogin = str2bool(AL.toString());
                console.log('initAL ' + IfAutoLogin);
                switch_refresh("autoLogin");
                ipcRenderer.send('action', 'update|AL|' + IfAutoLogin);
            }
            // 告知初始化完成
            ipcRenderer.send('action', 'init_bck||');
            break;
        case 'ver_bck':
            document.getElementById('p_version').innerText = 'v' + arg1;
            break;
        // 一些变量改变刷新
        case 'update':
            switch (arg1) {
                case 'AS':
                    IfAutoStart = str2bool(arg2);
                    console.log('AS_fromMain:' + IfAutoStart);
                    switch_refresh('autoStart');
                    store.set('AutoStart', IfAutoStart);
                    break;
                case 'AL':
                    IfAutoLogin = str2bool(arg2);
                    console.log('AL_fromMain:' + IfAutoLogin);
                    switch_refresh('autoLogin');
                    store.set('AutoLogin', IfAutoLogin);
                    break;
                case 'IL':
                    isLogined = str2bool(arg2);
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
/*--------------------------------------------------------*/