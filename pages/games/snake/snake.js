// pages/games/snake/snake.js
const bgmContext = wx.createInnerAudioContext({});
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
    food: [], // 普通果实
    fastFood: [], // 变快果实
    slowFood: [], // 变慢果实
    bestFood: [], // 百分果实
    dangerFood: [], // 爆炸果实
    x: 0,
    y: 0,
    direction: '',
    timer: '',
    notEnded: true,
    speed: 250,
    speedLevel: 0,
    started: false,
    isPause: false,
    isMusicOn: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      touchWeight: wx.getSystemInfoSync().windowWidth,
      touchHeight: wx.getSystemInfoSync().windowHeight - 140,
    });
    let maxScore = wx.getStorageSync('snake-maxScore');
    if (!maxScore) maxScore = 0
    this.setData({
      maxScore: maxScore
    });
    this.initGround(this.data.rows, this.data.cols);
    this.initSnake(5);
    this.creatFood();
    this.move();

    bgmContext.src = "http://music.163.com/song/media/outer/url?id=1456443773.mp3";
    bgmContext.autoplay = true;
    bgmContext.srcloop = true;
    this.musicOn();
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
  haveFood: false,
  haveFastFood: false,
  haveSlowFood: false,
  haveBestFood: false,
  haveDangerFood: false,

  //生成普通果实
  creatFood: function () {
    if (!this.haveFood) {
      let x = Math.floor(Math.random() * this.data.rows);
      let y = Math.floor(Math.random() * this.data.cols);
      let food = [x, y];
      let ground = this.data.ground;
      ground[x][y] = 2;
      this.setData({
        food: food,
        ground: ground
      });
      this.haveFood = true;
    }

    this.creatFastFood();
    this.creatSlowFood();
    this.creatBestFood();
    this.deleteDangerFood();
    this.creatDangerFood();
  },
  // 生成变快果实
  creatFastFood: function () {
    if (this.haveFastFood || Math.random() > 0.1) {
      return;
    }
    let x = Math.floor(Math.random() * this.data.rows);
    let y = Math.floor(Math.random() * this.data.cols);
    let fastFood = [x, y];
    let ground = this.data.ground;
    ground[x][y] = 3;
    this.setData({
      fastFood: fastFood,
      ground: ground
    });
    this.haveFastFood = true;
  },
  // 生成变慢果实
  creatSlowFood: function () {
    if (this.haveSlowFood || this.data.speedLevel < 2 ||
      Math.random() > 0.1) {
      return;
    }
    let x = Math.floor(Math.random() * this.data.rows);
    let y = Math.floor(Math.random() * this.data.cols);
    let slowFood = [x, y];
    let ground = this.data.ground;
    ground[x][y] = 4;
    this.setData({
      slowFood: slowFood,
      ground: ground
    });
    this.haveSlowFood = true;
  },
  // 生成百分果实
  creatBestFood: function () {
    if (this.haveBestFood || Math.random() > 0.1) {
      return;
    }
    let x = Math.floor(Math.random() * this.data.rows);
    let y = Math.floor(Math.random() * this.data.cols);
    let bestFood = [x, y];
    let ground = this.data.ground;
    ground[x][y] = 5;
    this.setData({
      bestFood: bestFood,
      ground: ground
    });
    this.haveBestFood = true;
  },
  // 生成爆炸果实
  creatDangerFood: function () {
    if (this.haveDangerFood || Math.random() > 0.1) {
      return;
    }
    let x = Math.floor(Math.random() * this.data.rows);
    let y = Math.floor(Math.random() * this.data.cols);
    let dangerFood = [x, y];
    let ground = this.data.ground;
    ground[x][y] = 6;
    this.setData({
      dangerFood: dangerFood,
      ground: ground
    });
    this.haveDangerFood = true;
  },
  deleteDangerFood: function () {
    if (!this.haveDangerFood) {
      return;
    }
    if (Math.random() > 0.1) {
      return;
    }
    let dangerFood = this.data.dangerFood;
    let ground = this.data.ground;
    ground[dangerFood[0]][dangerFood[1]] = 0;
    this.setData({
      dangerFood: [],
      ground: ground
    });
    this.haveDangerFood = false;
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
    if (Math.max(absdisX, absdisY) == 0) { // 确定没有在移动
      return;
    }
    var direction = absdisX > absdisY ? (disX < 0 ? 'right' : 'left') : (disY < 0 ? 'down' : 'up'); // 确定移动方向
    var lastDirection = this.data.direction;
    if ((['right', 'left'].indexOf(direction) > -1 && ['right', 'left'].indexOf(lastDirection) > -1) ||
      (['down', 'up'].indexOf(direction) > -1 && ['down', 'up'].indexOf(lastDirection) > -1)) {
      return;
    }

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
      wx.setStorageSync('snake-maxScore', this.data.maxScore)
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
  upperLevel: function () {
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
    if (!dir) {
      return;
    }

    let snake = this.data.snake;
    let len = snake.length;
    let snakeHead = snake[len - 1],
      snakeTail = snake[0];
    let ground = this.data.ground;
    ground[snakeTail[0]][snakeTail[1]] = 0;
    for (let i = 0; i < len - 1; i++) {
      snake[i] = snake[i + 1];
    }
    let x = snakeHead[0],
      y = snakeHead[1];
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
    if (snakeHead[0] < 0 || snakeHead[0] >= this.data.rows || snakeHead[1] < 0 || snakeHead[1] >= this.data.cols ||
      this.checkKnock(snake, len, snakeHead)) {
      clearInterval(this.data.timer);
      this.setData({
        notEnded: false
      })
    }
    if (this.eatFood(snakeHead, this.data.food)) { // 普通果实
      this.haveFood = false;
      snake.unshift(snakeTail);
      this.setData({
        score: this.data.score + 10
      });
      this.storeScore();
      this.creatFood();
    } else if (this.eatFood(snakeHead, this.data.bestFood)) { // 百分果实
      this.haveBestFood = false;
      snake.unshift(snakeTail);
      this.setData({
        score: this.data.score + 100
      });
      this.storeScore();
      this.creatFood();
    } else if (this.eatFood(snakeHead, this.data.fastFood)) { // 变快果实
      this.haveFastFood = false;
      snake.unshift(snakeTail);
      this.setData({
        score: this.data.score + 10
      });
      this.storeScore();
      this.creatFood();

      clearInterval(this.data.timer);
      var speedLevel = this.data.speedLevel;
      speedLevel += 2;
      this.setData({
        speedLevel: speedLevel
      });
      let that = this;
      this.data.timer = setInterval(function () {
        that.changeDir(that.data.direction);
        that.upperLevel();
      }, this.data.speed - speedLevel * 10);
    } else if (this.eatFood(snakeHead, this.data.slowFood)) { // 变慢果实
      this.haveSlowFood = false;
      snake.unshift(snakeTail);
      this.setData({
        score: this.data.score + 10
      });
      this.storeScore();
      this.creatFood();

      clearInterval(this.data.timer);
      var speedLevel = this.data.speedLevel;
      speedLevel -= 2;
      this.setData({
        speedLevel: speedLevel
      });
      let that = this;
      this.data.timer = setInterval(function () {
        that.changeDir(that.data.direction);
        that.upperLevel();
      }, this.data.speed - speedLevel * 10);
    } else if (this.eatFood(snakeHead, this.data.dangerFood)) { // 爆炸果实
      this.haveDangerFood = false;
      clearInterval(this.data.timer);
      this.setData({
        notEnded: false
      })
    }
  },
  checkKnock: function (snake, len, snakeHead) { // 是否碰到身体
    let isKnocked = false;
    let noHead = snake.slice(0, len - 1);
    noHead.forEach(element => {
      if (element[0] == snakeHead[0] && element[1] == snakeHead[1]) {
        isKnocked = true;
        return;
      }
    });
    return isKnocked;
  },
  eatFood: function (snakeHead, food) {
    return snakeHead[0] == food[0] && snakeHead[1] == food[1];
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
      isPause: false,
    });
    this.haveFood = false,
      this.haveFastFood = false,
      this.haveSlowFood = false,
      this.haveBestFood = false,
      this.haveDangerFood = false,
      this.onLoad();
  },
  speedChange: function (e) {
    this.setData({
      speed: e.detail.value
    });
    clearInterval(this.data.timer);
    let that = this;
    this.data.timer = setInterval(function () {
      that.changeDir(that.data.direction);
      that.upperLevel();
    }, this.data.speed - this.data.speedLevel * 10);
  },
  pause: function () {
    if (!this.data.started) {
      return;
    }
    clearInterval(this.data.timer);
    this.setData({
      isPause: true
    });
  },
  pauseEnd: function () {
    if (!this.data.started) {
      return;
    }
    clearInterval(this.data.timer);
    let that = this;
    this.data.timer = setInterval(function () {
      that.changeDir(that.data.direction);
      that.upperLevel();
    }, this.data.speed - this.data.speedLevel * 10);
    this.setData({
      isPause: false
    });
  },
  restart: function () {
    clearInterval(this.data.timer);
    this.modalChange();
  },
  musicOn: function () {
    this.setData({
      isMusicOn: true
    });
    bgmContext.play();
  },
  musicOff: function () {
    this.setData({
      isMusicOn: false
    });
    bgmContext.pause();
  }
})