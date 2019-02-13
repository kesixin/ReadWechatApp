// pages/bookCats/bookCats.js
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: "",//窗口高度
    STATIC_HOST: '',
    gender: '',
    major: '',
    currentType: 'hot',
    typeList: [
      {
        id: 'hot',
        name: '热门'
      },
      {
        id: 'new',
        name: '新书'
      },
      {
        id: 'reputation',
        name: '好评'
      },
      {
        id: 'over',
        name: '完结'
      },
      {
        id: 'monthly',
        name: 'VIP'
      }
    ],
    currentMinor: '全部',
    showMinor: true,
    minorList: [],
    bookListTop: 164, //scroll-view的相对top
    books: {},
    tagColors: ['#FF8C00', '#00CED1', '#FF4500'],
    start: 0, //分页起始
    loadMore: true, //防止多次加载
    loadedAll: false, //已加载全部
    scrollTop: 0  //scroll-view 滚动条位置
  },

  getIndexBooks: function (gender, type, major, minor, start) {
    wx.request({
      url: api.classification.getCatsBooks(gender, type, major, minor, start),
      success: res => {
        wx.hideLoading();
        if (res.data.books.length === 0) {
          this.setData({
            loadedAll: true
          })
        } else {
          if (start !== 0) {
            this.data.books.books = this.data.books.books.concat(res.data.books);
            this.setData({
              books: this.data.books,
              loadMore: true
            });
          } else {
            this.setData({
              books: res.data,
              start: 0,
              scrollTop: 0
            });
          }
        }
      }
    })
  },

  loadMore: function () {
    if (this.data.loadMore) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this.setData({
        start: this.data.start + 20,
        loadMore: false
      });

      let minor = this.data.currentMinor === '全部' ? '' : this.data.currentMinor;
      this.getIndexBooks(this.data.gender, this.data.currentType, this.data.major, minor, this.data.start);
    }
  },

  switchType: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    this.setData({
      currentType: e.target.dataset.typeid
    });
    let minor = this.data.currentMinor === '全部' ? '' : this.data.currentMinor;
    this.getIndexBooks(this.data.gender, this.data.currentType, this.data.major, minor, 0);
  },

  switchMinor: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    this.setData({
      currentMinor: e.target.dataset.typeid
    });
    console.log(this.data.currentMinor)
    let minor = this.data.currentMinor === '全部' ? '' : this.data.currentMinor;
    this.getIndexBooks(this.data.gender, this.data.currentType, this.data.major, minor, 0);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    //  高度自适应
    wx.getSystemInfo({
      success: (res) => {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        this.setData({
          winHeight: calc
        });
      }
    });
    wx.setNavigationBarTitle({
      title: options.major,
    });
    wx.getStorage({
      key: 'minor',
      success: res => {
        let data = res.data[options.gender];
        for (let i = 0; i < data.length; i++) {
          if (data[i].major === options.major) {
            data[i].mins.unshift('全部');
            if (data[i].mins.length === 1) {
              this.setData({
                showMinor: false,
                bookListTop: 82,
                winHeight: this.data.winHeight + 80
              });
            }
            this.setData({
              STATIC_HOST: api.STATIC_HOST,
              minorList: data[i].mins
            });
          }
        }
      },
    });
    this.setData({
      gender: options.gender,
      major: options.major
    });
    this.getIndexBooks(options.gender, 'hot', options.major, '', 0);
  }
})