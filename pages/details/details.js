// pages/details/details.js
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */

  data: {
    STATIC_HOST: '',
    bookInfo: {},
    book_rate: 0, //书籍评分
    showInfoContent: true,
    allRecommendBooks: [],//全部推荐书籍
    showRecommendBooks: [], //随机展示的三本推荐书籍
    shortReviews: {},
    addedShelf: false
  },

  showTab: function (event) {
    this.setData({
      showInfoContent: !!parseInt(event.target.dataset.id)
    });
  },

  addShelf: function () {
    if (this.data.addedShelf) {
      return
    }
    let shelfData = {
      bookInfo: {
        id: this.data.bookInfo._id,
        title: this.data.bookInfo.title,
        cover: this.data.bookInfo.cover,
        laterChapter: this.data.bookInfo.updated
      },
      readNum: 1,
      laterScrollTop: 0 //上次滑动的距离
    };
    wx.getStorage({
      key: 'bookShelfData',
      success: res => {
        res.data.unshift(shelfData);
        wx.setStorage({
          key: 'bookShelfData',
          data: res.data,
        });
        this.setData({
          addedShelf: true
        });
      },
    })
  },

  getBookInfo: function (book_id) {
    wx.request({
      url: api.book.bookInfo(book_id),
      success: res => {
        wx.hideLoading();
        let score = Math.floor(res.data.rating.score / 2);
        this.setData({
          bookInfo: res.data,
          book_rate: score
        });
      }
    })
  },

  getRelatedRecommendedBooks: function (book_id) {
    wx.request({
      url: api.book.relatedRecommendedBooks(book_id),
      success: res => {
        this.setData({
          allRecommendBooks: res.data.books
        });
        this.randomRecommendBooks();
      }
    })
  },

  randomRecommendBooks: function () {  //在所有推荐书籍中随机选出三本展示
    this.setData({
      showRecommendBooks: []
    });
    let recommendBooksLen = this.data.allRecommendBooks.length;
    let randomIndex;
    for (let i = 0; i < 3; i++) {
      let newRandom = Math.floor(Math.random() * recommendBooksLen);
      if (newRandom === randomIndex) {
        i--;
        break;
      }
      randomIndex = newRandom;
      this.data.showRecommendBooks.push(this.data.allRecommendBooks[randomIndex])
    }
    this.setData({
      showRecommendBooks: this.data.showRecommendBooks
    });
  },

  getBookShortReviews(book_id) {
    wx.request({
      url: api.comment.shortReviews(book_id),
      success: res => {
        this.setData({
          shortReviews: res.data
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.getStorage({  //检查此书是否加入书架
      key: 'bookShelfData',
      success: res => {
        res.data.forEach(item => {
          if (item.bookInfo.id === options.book_id) {
            this.setData({
              addedShelf: true
            });
            return;
          }
        });
      },
    });
    this.setData({
      STATIC_HOST: api.STATIC_HOST
    });
    this.getBookInfo(options.book_id);
    this.getRelatedRecommendedBooks(options.book_id);
    this.getBookShortReviews(options.book_id);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
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
