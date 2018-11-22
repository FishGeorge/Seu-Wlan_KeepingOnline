'use strict';

let { app, BrowserWindow } = require('electron');
let { Menu, MenuItem, dialog, ipcMain } = require('electron');

let mainWindow = null;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 300,
        height: 412,
        useContentSize:true,
        resizable:false,
        center:true,
        minimizable:false,
        maximizable:false,
        alwaysOnTop:true
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow
    // () => {
    //     mainWindow = new BrowserWindow();
    //     mainWindow.loadURL(`file://${__dirname}/index.html`);
    //     mainWindow.on('closed', () => { mainWindow = null; });
    //     // mainWindow.webContents.openDevTools();
    // }
);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

//监听与UI渲染进程（app.js）的通信
ipcMain.on('reqaction', (event, arg) => {
    switch (arg) {
        case 'exit':
            //做点其它操作：比如记录窗口大小、位置等，下次启动时自动使用这些设置；不过因为这里（主进程）无法访问localStorage，这些数据需要使用其它的方式来保存和加载，这里就不作演示了。这里推荐一个相关的工具类库，可以使用它在主进程中保存加载配置数据：https://github.com/sindresorhus/electron-store
            //...
            safeExit = true;
            app.quit();//退出程序
            break;
    }
});