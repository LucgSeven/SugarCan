// pages/games/snake/snake.js
Page({
  data: {
    touchWeight: 0,
    touchHeight: 0,
    score: 0,
    maxScore: 0,
    ground: [],
    rows: 56,
    cols: 44,
    snake: [],
    food: [],
    x: 0,
    y: 0,
    direction: '',
    timer: '',
    notEnded: true,
    speed: 250,
    speedLevel: 0,
    started: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      touchWeight: wx.getSystemInfoSync().windowWidth,
      touchHeight: wx.getSystemInfoSync().windowHeight- 140,
    });
    let maxscore = wx.getStorageSync('maxscore');
    if (!maxscore) maxscore = 0
    this.setData({
      maxscore: maxscore
    });
  },
  onShow: function(options) {
    this.initGround(this.data.rows, this.data.cols);
    this.initSnake(3);
    this.creatFood();
    this.move();
  },
  //初始化草地
  initGround: function (rows, cols) {
    let ground = Array(rows).fill(0).map(item => Array(cols).fill(0));
    this.setData({
      ground: ground
    });
  },
  //初始化蛇
  initSnake: function (len) {
    let snake = this.data.snake;
    let ground = this.data.ground;
    for (let i = 0; i < len; i++) {
      snake.push([0, i]);
      ground[0][i] = 1;
    }
    this.setData({
      snake: snake,
      ground: ground
    })
  },
  //生成食物
  creatFood: function () {
    let x = Math.floor(Math.random() * this.data.rows);
    let y = Math.floor(Math.random() * this.data.cols);
    let food = [x, y];
    let ground = this.data.ground;
    ground[x][y] = 2;
    this.setData({
      food: food,
      ground: ground
    })
  },
    // 触摸
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
  touchStart: function (e) {
    var touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  },
  touchMove: function (e) {
    var touch = e.touches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  },
  touchEnd: function () {
    var disX = this.touchStartX - this.touchEndX;
    var absdisX = Math.abs(disX);
    var disY = this.touchStartY - this.touchEndY;
    var absdisY = Math.abs(disY);

    if (!this.data.started) {
      this.setData({
        direction: 'right',
        started: true
      })
      return;
    }
    if (Math.max(absdisX, absdisY) == 0) {// 确定没有在移动
      return;
    }
    var direction = absdisX > absdisY ? (disX < 0 ? 'right' : 'left') : (disY < 0 ? 'down' : 'up');  // 确定移动方向

    this.setData({
      direction: direction
    })
  },
  //计分器
  storeScore: function () {
    if (this.data.maxScore < this.data.score) {
      this.setData({
        maxScore: this.data.score
      })
      wx.setStorageSync('maxScore', this.data.maxScore)
    }
  },
  //移动函数
  move: function () {
    let that = this;
    this.data.timer = setInterval(function () {
      that.changeDir(that.data.direction);
      that.upperLevel();
    }, this.data.speed);
  },
  // 难度升级
  upperLevel: function() {
    var speedLevel = this.data.speedLevel;
    var score = this.data.score;
    if (Math.pow(2, speedLevel) * 100 > score) {
      return;
    }
    if (this.data.speed - speedLevel * 10 < 10) { // 控制速度不能过快
      return;
    }

    speedLevel += 1;
    this.setData({
      speedLevel: speedLevel
    })

    clearInterval(this.data.timer);
    let that = this;
    this.data.timer = setInterval(function () {
      that.changeDir(that.data.direction);
      that.upperLevel();
    }, this.data.speed - speedLevel * 10);
  },

  changeDir: function (dir) {
    if(!dir){
      return;
    }

      let snake = this.data.snake;
      let len = snake.length;
      let snakeHead = snake[len - 1], snakeTail = snake[0];
      let ground = this.data.ground;
      ground[snakeTail[0]][snakeTail[1]] = 0;
      for (let i = 0; i < len - 1; i++) {
        snake[i] = snake[i + 1];
      }
      let x = snakeHead[0], y = snakeHead[1];
      switch (dir) {
        case 'left':
          y--;
          break;
        case 'right':
          y++;
          break;
        case 'up':
          x--;
          break;
        case 'down':
          x++;
          break;
      };
      snake[len - 1] = [x, y];
      this.checkGame(snakeTail);
      for (let i = 1; i < len; i++) {
        ground[snake[i][0]][snake[i][1]] = 1;
      }
      this.setData({
        snake: snake,
        ground: ground
      })
  },
  checkGame: function (snakeTail) {
    let snake = this.data.snake;
    let len = snake.length;
    let snakeHead = snake[len - 1];
    if (snakeHead[0] < 0 || snakeHead[0] >= this.data.rows || snakeHead[1] < 0 || snakeHead[1] >= this.data.cols) {
      clearInterval(this.data.timer);
      this.setData({
        notEnded: false
      })
    }
    if (snakeHead[0] == this.data.food[0] && snakeHead[1] == this.data.food[1]) {
      snake.unshift(snakeTail)
      this.setData({
        score: this.data.score + 10
      });
      this.storeScore();
      this.creatFood();
    }
  },
  modalChange: function () {
    this.setData({
      score: 0,
      snake: [],
      ground: [],
      food: [],
      notEnded: true,
      direction: '',
      started: false,
      speedLevel: 0,
      speed: 250
    });
    this.onShow();
  },
  speedChange: function (e) {
    this.setData({
      speed : e.detail.value
    });
    clearInterval(this.data.timer);
    let that = this;
    this.data.timer = setInterval(function () {
      that.changeDir(that.data.direction);
      that.upperLevel();
    }, this.data.speed - this.data.speedLevel * 10);
  }
})
