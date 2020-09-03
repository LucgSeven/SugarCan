//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    gameList:[
      {
        id:1,
        picUrl:"../../common/mine_help_center.png",
        accessnum:"1",
        gameName:"2048",
        gameDesc:"这个可以玩！",
        gameUrl:"/pages/games/2048/2048"
      },
      {
        id:2,
        picUrl:"../../common/camera_switch_camera_ic.png",
        accessnum:"2",
        gameName:"贪吃蛇",
        gameDesc:"asad1",
        gameUrl:""
      },
      {
        id:3,
        picUrl:"../../common/cm.png",
        accessnum:"3",
        gameName:"飞机大战",
        gameDesc:"asad",
        gameUrl:""
      },
      {
        id:4,
        picUrl:"../../common/co.png",
        accessnum:"4",
        gameName:"不知道啥了",
        gameDesc:"asad",
        gameUrl:""
      }
    ]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  //跳转对应小游戏加载页
  toGameLoad: function(ev) {
    var gameUrl = ev.currentTarget.dataset.gameurl;
    wx.navigateTo({
      url: gameUrl,
      success: function(res){
      },
      fail: function(res) {
      },
      complete: function(res) {
      }
    })
  },
  onLoad: function () {
  }
})
