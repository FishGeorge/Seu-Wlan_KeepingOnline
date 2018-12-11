'use strict';

const { app,
    BrowserWindow,
    Menu,
    MenuItem,
    dialog,
    ipcMain,
    net,
    Tray,
    shell
} = require('electron');

const Store = require('electron-store');
const store = new Store();

let mainWindow = null;
let appIcon = null;
let iconMenu = null;

const version = '1.0.4-alpha';

var main_IfAutoStart = false;
var main_IfAutoLogin = false;
var main_isLogined = false;
var main_runningTime = 0;

const createWindow = () => {
    // 隐藏菜单栏
    // Menu.setApplicationMenu(null)
    // Create the browser window.
    mainWindow = new BrowserWindow({
        // width: 300,
        // height: 412,
        width: 1102,
        height: 412,
        useContentSize: true,
        // frame:false,
        // resizable: false,
        center: true,
        minimizable: false,
        maximizable: false,
        // alwaysOnTop: true
        show: false
    });
    // 优雅地显示窗口
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // 关闭时清空mainWindow
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', () => {
    // 托盘图标右键菜单
    appIcon = new Tray(`${__dirname}/test.ico`);
    // 开关读取
    let AS = store.get('AutoStart', 'null');
    let AL = store.get('AutoLogin', 'null');
    if (AS.toString() !== "null")
        main_IfAutoStart = AS.toString();
    if (AL.toString() !== "null")
        main_IfAutoLogin = AL.toString();
    iconMenu = Menu.buildFromTemplate([
        {
            label: '关于',
            click: () => {
                shell.openExternal('https://github.com/FishGeorge/SeuKeeper');
            }
        },
        { type: 'separator' },
        {
            id: 'AS',
            label: '开机启动',
            type: 'checkbox',
            checked: main_IfAutoStart,
            click: () => {
                main_IfAutoStart = !main_IfAutoStart;
                mainWindow.webContents.send('action', 'update|AS|');
            }
        },
        {
            id: 'AL',
            label: '自动登录',
            type: 'checkbox',
            checked: main_IfAutoLogin,
            click: () => {
                main_IfAutoLogin = !main_IfAutoLogin;
                mainWindow.webContents.send('action', 'update|AL|');
                if (!main_IfAutoStart && main_IfAutoLogin) {
                    main_IfAutoStart = !main_IfAutoStart;
                    mainWindow.webContents.send('action', 'update|AS|');
                    console.log('main_AS::' + main_IfAutoStart);
                }
                iconMenu.getMenuItemById('AS').checked = main_IfAutoStart;
            }
        },
        { type: 'separator' },
        { label: '退出', role: 'quit' }
    ]);
    appIcon.setToolTip('SeuKeeper');
    appIcon.setContextMenu(iconMenu);
    appIcon.on("double-click", () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
    // 创建窗口
    createWindow();
});

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') app.quit();
    // app.quit();
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

function ifURLconnective(url) {
    return new Promise(function (resolve, reject) {
        let request = null;
        request = net.request({
            method: 'GET',
            url: url
        });
        request.on('response', (response) => {
            // console.log(response);
            if (response.statusCode === 200) {
                resolve(0);
            }
            else
                resolve(-1);
        });
        request.end();
        request = null;
    })
}

function getCookie(username) {
    return new Promise(function (resolve, reject) {
        let request = null;
        request = net.request({
            method: 'POST',
            url: SeuURL
        });
        request.on('response', (response) => {
            cookie = response.headers['set-cookie'][1];
            cookie = cookie + "; think_language=zh-Hans-CN" + "; sunriseUsername=" + username;
            console.log(cookie);
            resolve();
        });
        request.end();
        request = null;
    });
}

function login(username, password) {
    return new Promise(function (resolve, reject) {
        let request = null;
        let up = "username=" + username + "&password=" + Base64.encode(password) + "&enablemacauth=0";
        let options = {
            method: 'POST',
            url: SeuLoginURL,
            headers: {
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-Hans-CN, zh-Hans; q=0.8, en-US; q=0.5, en; q=0.3",
                "Connection": "Keep-Alive",
                "Content-Length": up.length.toString(),
                "Content-Type": "application/x-www-form-urlencoded",
                "DNT": "1",
                "Host": "w.seu.edu.cn",
                "Origin": "http://w.seu.edu.cn/",
                "Referer": "http://w.seu.edu.cn/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko Core/1.63.5478.400 QQBrowser/10.1.1550.400",
                "X-Requested-With": "XMLHttpRequest",
                "cookie": cookie
            }
        }
        request = net.request(options);
        request.on('response', (response) => {
            // console.log('step1');
            response.on('data', (chunk) => {
                // 此处的chunk是buffer，需要toString()
                // console.log(chunk.toString());
                if (chunk.toString().indexOf("\\u8ba4\\u8bc1\\u6210\\u529f") >= 0) {
                    resolve(0);
                }
                else if (chunk.toString().indexOf("\\u8ba4\\u8bc1\\u5931\\u8d25\\uff0c\\u8d26\\u6237\\u6d41\\u91cf\\u8d85\\u914d\\u989d\\u9501\\u5b9a") >= 0) {
                    resolve(-1);
                }
                else {
                    resolve(-2);
                }
            });
        });
        request.end(up);
    });
}

// 与UI渲染进程（app.js）的通信
// Network
var BingURL = "https://cn.bing.com/";
var SeuURL = 'http://w.seu.edu.cn/';
var SeuLoginURL = "http://w.seu.edu.cn/index.php/index/login";
var SeuLogoutURL = "http://w.seu.edu.cn/index.php/index/logout";
var cookie = "";
ipcMain.on('network', (e, msg) => {
    // console.log("e:"+e.stringfy+", msg:"+msg); => e:[object Object], msg:test
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        case 'ifURLconnective':
            // 该接口暂无用
            let url = null;
            if (arg1 === 0) url = SeuURL
            else url = BingURL;
            ifURLconnective(url).then(function (data) {
                e.sender.send('network', 'ifURLconnective|' + data + '|');
            });
            break;
        case 'login':
            ifURLconnective(SeuURL).then(function (data) {
                if (data === -1)
                    e.sender.send('action', 'alert|' + "未连接seu" + '|');
                else
                    getCookie(arg1).then(function (data) {
                        // Login
                        return login(arg1, arg2);
                    }).then(function (data) {
                        // console.log("step2: " + data);
                        e.sender.send('network', 'login_bck|0|' + data);
                    });
            });
            break;
        case 'online_check':
            ifURLconnective(SeuURL).then((data1) => {
                if (data1 === '0')
                    ifURLconnective(BingURL).then((data2) => {
                        if (data1 !== '0')
                            getCookie(arg1).then(function (data) {
                                // Login
                                return login(arg1, arg2);
                            }).then(function (data) {
                                e.sender.send('network', 'online_state|' + data1 + '|' + data);
                            });
                    });
                else
                    e.sender.send('network', 'online_state|' + data1 + '|');
            });
            break;
        case 'relogin':
            getCookie(arg1).then(function (data) {
                // Login
                return login(arg1, arg2);
            }).then(function (data) {
                // console.log("step2: " + data);
                e.sender.send('network', 'login_bck|1|' + data);
            });
            break;
        case 'logout':
            // 1.0.4测试暂用
            e.sender.send('network', 'logout_bck|' + 0 + '|');
            break;
        default:
    }
});

// ProgramAction
ipcMain.on('action', (e, msg) => {
    let type = msg.split('|')[0];
    let arg1 = msg.split('|')[1];
    let arg2 = msg.split('|')[2];
    switch (type) {
        // 告知版本号    
        case 'ver':
            // console.log('ver|' + version + '|')
            e.sender.send('action', 'ver_bck|' + version + '|');
            break;
        // 一些变量改变刷新
        case 'update':
            switch (arg1) {
                case 'AS':
                    main_IfAutoStart = !main_IfAutoStart;
                    console.log('main_AS:' + main_IfAutoStart);
                    iconMenu.getMenuItemById('AS').checked = main_IfAutoStart;
                    break;
                case 'AL':
                    main_IfAutoLogin = !main_IfAutoLogin;
                    console.log('main_AL:' + main_IfAutoLogin);
                    iconMenu.getMenuItemById('AL').checked = main_IfAutoLogin;
                    break;
                case 'IL':
                    main_isLogined = !main_isLogined;
                    break;
                case 'RT':
                    main_runningTime = arg2;
                    break;
                default:
            }
            break;
        case 'about':
            shell.openExternal('https://github.com/FishGeorge/SeuKeeper');
            break;
        default:
    }
});

// Base64加解密
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    },
    decode: function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    },
    _utf8_encode: function (e) {
        e = e.replace(/rn/g, "n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    },
    _utf8_decode: function (e) {
        var t = "";
        var n = 0;
        var r = 0;
        var c1 = 0;
        var c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
}