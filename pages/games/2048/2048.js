// pages/games/2048/2048.js
var Board = require("./grid.js");
var Main = require("./main.js");

Page({ 
  data: {
    originBestScore: 0,
    originBestNum: 0,
    touchWeight: 0,
    touchHeight: 0,
    hidden: false,
    start: "开始游戏",
    num: [],
    maxNum: 0,
    score: 0,
    bestScore: 0, // 最高分
    bestNum: 0, // 最高数字
    endMsg: '',
    over: false  // 游戏是否结束 
  },
  // 页面渲染完成
  onReady: function () {
    this.setData({
      touchWeight: wx.getSystemInfoSync().windowWidth,
      touchHeight: wx.getSystemInfoSync().windowHeight * 0.93 -100,
    });
    if(!wx.getStorageSync("2048-highScore"))
      wx.setStorageSync('2048-highScore', 0);

    if(!wx.getStorageSync("2048-highNum"))
      wx.setStorageSync('2048-highNum', 0);
    this.gameStart();
  },
  gameStart: function() {  // 游戏开始
    var main = new Main(4);
    this.setData({
      main: main,
      bestScore: wx.getStorageSync('2048-highScore'),
      bestNum: wx.getStorageSync('2048-highNum'),
      originBestScore: wx.getStorageSync('2048-highScore'),
      originBestNum: wx.getStorageSync('2048-highNum'),
    });
    this.data.main.__proto__ = main.__proto__;
    
    this.setData({
      hidden: true,
      over: false,
      maxNum: 0,
      score: 0,
      num: this.data.main.board.grid
    });  
  },
  gameOver: function() {  // 游戏结束
    this.setData({
      over: true 
    });
 
    if (this.data.score > this.data.originBestScore) {
      this.setData({
        endMsg: '创造新纪录！',
        bestScore: this.data.score
      }); 
      wx.setStorageSync('2048-highScore', this.data.score);
    } else {
      this.setData({
        endMsg: '游戏结束！'
      }); 
      if (this.data.maxNum >= 2048) {
        this.setData({ 
          endMsg: '恭喜达到2048！',
          bestNum: this.data.maxNum
        });
      }
    }

    if (this.data.maxNum > this.data.originBestNum) {
      this.setData({ 
        bestNum: this.data.maxNum
      });
      wx.setStorageSync('2048-highNum', this.data.maxNum);
    }
  },
  // 触摸
  touchStartX: 0,
  touchStartY: 0,
  touchEndX: 0,
  touchEndY: 0,
  touchStart: function(ev) { // 触摸开始坐标
    var touch = ev.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  },
  touchMove: function(ev) { // 触摸最后移动时的坐标
    var touch = ev.touches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  },
  touchEnd: function() {
    var disX = this.touchStartX - this.touchEndX;
    var absdisX = Math.abs(disX);
    var disY = this.touchStartY - this.touchEndY;
    var absdisY = Math.abs(disY);

    if(this.data.main.isOver()) { // 游戏是否结束
      this.gameOver();
    } else {
      if (Math.max(absdisX, absdisY) > 0) { // 确定是否在滑动
          this.setData({
            start: "重新开始",
          });
        var direction = absdisX > absdisY ? (disX < 0 ? 1 : 3) : (disY < 0 ? 2 : 0);  // 确定移动方向
        var data = this.data.main.move(direction,this.data.score);
        this.updateView(data);
      }   
    }      
  },
  updateView(dataVal) {
    var data = dataVal.result;
    var score = dataVal.score;

    var max = 0;
    for(var i = 0; i < 4; i++)
      for(var j = 0; j < 4; j++)
        if(data[i][j] != "" && data[i][j] > max)
          max = data[i][j];
    this.setData({
      num: data,
      maxNum: max,
      score: score
    });
    if (this.data.maxNum > this.data.bestNum) {
      this.setData({
        bestNum: this.data.maxNum
      });
    }
    if (this.data.score > this.data.bestScore) {
      this.setData({
        bestScore: this.data.score
      });
    }
  },
  onShareAppMessage: function() {
    return {
      title: '2048小游戏',
      desc: '来试试你能达到多少分',
      path: '"pages/games/2048/2048"'
    }
  }
})
