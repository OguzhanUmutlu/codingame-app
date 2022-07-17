const electron = require("electron");
const fs = require("fs");
const {app, BrowserWindow, globalShortcut, Menu} = electron;
global.OS = {win32: "windows", darwin: "macOS"}[process.platform] || "linux";
global.NEXT_PATH = app.getPath("userData");
global.DESKTOP_PATH = require("path").join(require("os").homedir(), "Desktop");
global.HOMEDIR = require("os").homedir();

const load_url = async (url, br = browser) => {
    br.hide();
    br.setMenu(null);
    console.log(url);
    await br.loadFile("./loading.html");
    br.show();
    br.current_url = url;
    await br.loadURL(url);
    br.setMenu(br._menu || null);
};

const create_window = async () => {
    const browser = new BrowserWindow({show: false});
    browser.setIcon("./favicon.png");
    global.browser = browser;
    browser.setMenu(browser._menu = Menu.buildFromTemplate([
        {
            click: async () => await load_url("https://www.codingame.com/home"),
            label: "Main Page"
        },
        {
            click: async () => await load_url("https://www.codingame.com/multiplayer/clashofcode"),
            label: "Clash Of Code"
        },
        {
            click: async () => await load_url(browser.current_url),
            label: "Refresh"
        }
    ]));
    browser.setTitle("Code In Game");
    await load_url("https://www.codingame.com/home");
    browser.maximize();
    browser.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        const win = new BrowserWindow({show: false});
        load_url(url, win);
        event.newGuest = win;
    })
};
app.whenReady().then(async () => {
    globalShortcut.register("F5", console.info);
    globalShortcut.unregister("F5")
    globalShortcut.register("CommandOrControl+R", () => browser.reload());
    globalShortcut.register("CommandOrControl+D", () => browser.webContents.toggleDevTools());
    await create_window();
    app.on("activate", () => BrowserWindow.getAllWindows().length === 0 ? create_window() : null);
});
app.on("window-all-closed", () => process.platform !== "darwin" ? app.quit() : null);