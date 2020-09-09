//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    gameList: [{
        id: 1,
        picUrl: "../../common/2048.png",
        accessnum: "1",
        gameName: "2048",
        gameDesc: "这个可以玩！",
        gameUrl: "/pages/games/2048/2048"
      },
      {
        id: 2,
        picUrl: "../../common/snake.png",
        accessnum: "2",
        gameName: "贪吃蛇",
        gameDesc: "这个也可以玩了！！",
        gameUrl: "/pages/games/snake/snake"
      }
    ],
    lastPageUrl: ''
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  //跳转对应小游戏加载页
  toGameLoad: function (ev) {
    var gameUrl = ev.currentTarget.dataset.gameurl;
    this.setData({
      lastPageUrl: gameUrl
    })
    if (app.globalData.userInfo) {
      this.toLoadPage(gameUrl);
      return;
    }
    const popup = this.selectComponent("#popup");
    popup.showPopup();
  },
  afterAuth: function () {
    var gameUrl = this.data.lastPageUrl;
    this.toLoadPage(gameUrl);
  },
  toLoadPage: function (gameUrl) {
    wx.navigateTo({
      url: gameUrl,
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {}
    })
  },
  onLoad: function () {}
})