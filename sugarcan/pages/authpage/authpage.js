// pages/authpage/authpage.js
var app = getApp()
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hidePopup: function () {
      this.setData({
        flag: !this.data.flag
      })
    },
    //展示弹框
    showPopup() {
      this.setData({
        flag: !this.data.flag
      })
    },
    /*
     * 内部私有方法建议以下划线开头
     * triggerEvent 用于触发事件
     */
    _cancel() {
      this.setData({
        flag: !this.data.flag
      })
    },
    _afterGetUserInfo: function (e) {
      if (e.detail.userInfo) {
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({
          flag: !this.data.flag
        });
        this.triggerEvent("success");
      }
    },
  }
})