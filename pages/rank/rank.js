// pages/rank/rank.js
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    STATIC_HOST: '',
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    weekRank: [],
    monthRank: [],
    totalRank: []
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },

  getRankList: function (ids) {
    for (let i = 0; i < ids.length; i++) {
      if (i == 0 && ids[i] !== 'undefined') {
        wx.request({
          url: api.rank.rankInfo(ids[i]),
          success: res => {
            wx.setNavigationBarTitle({
              title: res.data.ranking.title,
            });
            this.setData({
              weekRank: res.data.ranking.books
            });
            wx.hideLoading();
          }
        })
      }
      if (i == 1 && ids[i] !== 'undefined') {
        wx.request({
          url: api.rank.rankInfo(ids[i]),
          success: res => {
            this.setData({
              monthRank: res.data.ranking.books
            });
          }
        })
      }
      if (i == 2 && ids[i] !== 'undefined') {
        wx.request({
          url: api.rank.rankInfo(ids[i]),
          success: res => {
            this.setData({
              totalRank: res.data.ranking.books
            });
          }
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      STATIC_HOST: api.STATIC_HOST
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let ids = options.id.split('|');
    this.getRankList(ids);
    //  高度自适应
    wx.getSystemInfo({
      success: (res) => {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        this.setData({
          winHeight: calc
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})