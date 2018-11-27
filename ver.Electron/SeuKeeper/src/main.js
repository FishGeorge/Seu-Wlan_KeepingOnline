'use strict';

const { app,
    BrowserWindow,
    Menu,
    MenuItem,
    dialog,
    ipcMain,
    net
} = require('electron');

let mainWindow = null;

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
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

const version = '1.0.3-alpha.2';

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
    // 告知版本号

});

function getCookie(arg1) {
    return new Promise(function (resolve, reject) {
        let request = null;
        request = net.request({
            method: 'POST',
            url: SeuURL
        });
        request.on('response', (response) => {
            cookie = response.headers['set-cookie'][1];
            cookie = cookie + "; think_language=zh-Hans-CN" + "; sunriseUsername=" + arg1;
            console.log(cookie);
            resolve();
        });
        request.end();
        request = null;
    });
}

function login(arg1, arg2) {
    return new Promise(function (resolve, reject) {
        let request = null;
        let up = "username=" + arg1 + "&password=" + Base64.encode(arg2) + "&enablemacauth=0";
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
                    // console.log('00000');
                    console.log(chunk.toString().indexOf("\\u8ba4\\u8bc1\\u6210\\u529f"));
                    resolve(0);
                }
                else if (chunk.toString().indexOf("\\u8ba4\\u8bc1\\u5931\\u8d25\\uff0c\\u8d26\\u6237\\u6d41\\u91cf\\u8d85\\u914d\\u989d\\u9501\\u5b9a") >= 0) {
                    // console.log(-1111);
                    resolve(-1);
                }
                else {
                    // console.log(-2222)
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
        case 'ifURLconnective': {
            let request = null;
            if (arg1 === 0)
                request = net.request({
                    method: 'GET',
                    url: SeuURL
                });
            else
                request = net.request({
                    method: 'GET',
                    url: BingURL
                });
            request.on('response', (response) => {
                // console.log(response);
                if (response.statusCode === 200) {
                    // console.log("test " + arg1);

                    // e.returnValue = 'true';

                    // break; 这里不能用break（因为这是函数参数里啊魂淡），所以想了下面这个鬼点子
                    // i = -1;// 让for循环结束 ps：request是异步的，这样做没什么卵用。
                }
                else
                    // e.returnValue = 'false';
                    ;
            });
            request.end();
        }
            break;
        case 'login':
            // GetCookie
            getCookie(arg1).then(function (data) {
                // Login
                return login(arg1, arg2);
            }).then(function (data) {
                // console.log("step2: " + data);
                e.sender.send('network', 'login|' + data + '|123');
            });
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
        case 'ver':
            console.log('ver|' + version + '|')
            e.sender.send('action', 'ver|' + version + '|');
            break;
        case 'exit':
            // 做点其它操作：比如记录窗口大小、位置等，下次启动时自动使用这些设置；不过因为这里（主进程）无法访问localStorage，这些数据需要使用其它的方式来保存和加载，这里就不作演示了。这里推荐一个相关的工具类库，可以使用它在主进程中保存加载配置数据：https://github.com/sindresorhus/electron-store
            //...
            safeExit = true;
            app.quit();// 退出程序
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