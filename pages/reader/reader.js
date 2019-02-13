// pages/reader/reader.js
const api = require('../../utils/api.js')
const WxParse = require('../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,//请求到数据显示界面
    clientWidth: "",
    clientHeight: "",
    winHeight: "",//窗口高度
    book_id: '',
    scrollTop: 0,
    bookSources: [],
    bookChapters: {},
    indexPage: 0, //当前章节
    indexChapterContent: {}, //当前阅读的内容
    readerCss: {
      titleSize: 20,
      contentSize: 16,
      color: '#333', //夜间 #424952
      lineHeight: 60,
      backgroundColor: '#fff' //#C7EDCC 护眼色  #080C10 黑夜
    },
    showMenu: false,
    showChapter: false,
    isDark: false,
    isHuyan: false
  },

  toggleDark: function () {
    this.setData({
      isDark: !this.data.isDark
    });
    if (this.data.isDark) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#080C10'
      });
      this.data.readerCss.color = '#696969';
      this.data.readerCss.backgroundColor = '#080C10';
      this.setData({
        isHuyan: false,
        readerCss: this.data.readerCss
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#cb1c36'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#fff';
      this.setData({
        isHuyan: false,
        readerCss: this.data.readerCss
      });
    }
  },

  toggleHuyan: function () {
    this.setData({
      isHuyan: !this.data.isHuyan
    });
    if (this.data.isHuyan) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#C7EDCC';
      this.setData({
        isDark: false,
        readerCss: this.data.readerCss
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#cb1c36'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#fff';
      this.setData({
        isDark: false,
        readerCss: this.data.readerCss
      });
    }
  },

  incSize: function () {
    if (this.data.readerCss.titleSize === 30) {
      return
    }
    this.data.readerCss.titleSize = this.data.readerCss.titleSize + 5;
    this.data.readerCss.lineHeight = this.data.readerCss.lineHeight + 10;
    this.data.readerCss.contentSize = this.data.readerCss.contentSize + 5;
    this.setData({
      readerCss: this.data.readerCss
    });
  },

  decSize: function () {
    if (this.data.readerCss.titleSize === 20) {
      return
    }
    this.data.readerCss.titleSize = this.data.readerCss.titleSize - 5;
    this.data.readerCss.contentSize = this.data.readerCss.contentSize - 5;
    this.data.readerCss.lineHeight = this.data.readerCss.lineHeight - 10;
    this.setData({
      readerCss: this.data.readerCss
    });
  },

  getBookSources: function (book_id) {
    wx.request({
      url: api.book.bookSources(book_id),
      success: res => {
        this.setData({
          bookSources: res.data
        });
        this.getBookChapters(this.data.bookSources[1] ? this.data.bookSources[1]._id : this.data.bookSources[0]._id);
      }
    })
  },

  getBookChapters: function (source_id) {
    wx.request({
      url: api.book.bookChapters(source_id),
      success: res => {
        this.setData({
          bookChapters: res.data
        });
        this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
      }
    })
  },

  getChapterContent: function (link) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: api.book.chapterContent(link),
      success: res => {
        wx.hideLoading();
        if (res.data.chapter.cpContent) {
          let bodyArray = res.data.chapter.cpContent.split(/\n/).map((item) => {  //给每个段落加开头空格 ,方案改为修改wxParse.wxss
            return item
          });
          res.data.chapter.cpContent = bodyArray.join('<br>');
        }
        let bodyArray = res.data.chapter.body.split(/\n/).map((item) => {
          return item
        });
        res.data.chapter.body = bodyArray.join('<br>');
        this.setData({
          showPage: true,
          showChapter: false,  //关闭目录
          indexChapterContent: res.data
        });
        //存储当前读到哪一章
        wx.getStorage({
          key: 'bookShelfData',
          success: res => {
            let data = res.data;
            for (let i = 0; i < data.length; i++) {
              if (this.data.book_id === data[i].bookInfo.id) {
                data[i].readNum = this.data.indexPage + 1;
                data[i].laterScrollTop = this.data.scrollTop
                wx.setStorage({
                  key: 'bookShelfData',
                  data: data,
                })
              }
            }
          },
        });
        //使用Wxparse格式化小说内容   对收费的显示文字   后期换接口处理
        WxParse.wxParse('article', 'html', this.data.indexChapterContent.chapter.cpContent ? '小轻还没有给主人搬到此书，去看看别的吧' : this.data.indexChapterContent.chapter.body, this);
        //等到渲染页面后调节scrollTop
        this.setData({
          scrollTop: this.data.scrollTop
        })
      }
    })
  },

  goPrev: function () {
    if (this.data.indexPage === 0) {
      wx.showToast({
        title: '已到第一章',
        icon: 'loading',
        mask: true
      });
    }
    this.setData({
      indexPage: this.data.indexPage - 1,
      scrollTop: 0
    });
    if (this.data.bookChapters.chapters[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
    }
  },

  goNext: function () {
    if (this.data.indexPage === this.data.bookChapters.chapters.length - 1) {  //当前在最后一章
      wx.showToast({
        title: '已到最新章节',
        icon: 'loading',
        mask: true
      });
      return;
    }
    this.setData({
      indexPage: this.data.indexPage + 1,
      scrollTop: 0
    });
    if (this.data.bookChapters.chapters[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
    }
  },
  //点击中央打开菜单
  openMenu: function (event) {
    let xMid = this.data.clientWidth / 2;
    let yMid = this.data.clientHeight / 2;
    let x = event.detail.x;
    let y = event.detail.y;
    if ((x > xMid - 100 && x < xMid + 100) && (y < yMid + 100 && y > yMid - 100)) {
      this.setData({
        showMenu: !this.data.showMenu
      });
    }
  },

  getScrollTop: function (event) {  //设置读取到文章的具体什么位置

    // this.setData({
    //   scrollTop: event.detail.scrollTop
    // });
    //存储读到章节的什么位置
    wx.getStorage({
      key: 'bookShelfData',
      success: res => {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (this.data.book_id === data[i].bookInfo.id) {
            data[i].laterScrollTop = event.detail.scrollTop;
            wx.setStorage({
              key: 'bookShelfData',
              data: data,
            })
          }
        }
      },
    });
  },

  showChapter: function () {
    this.setData({
      showChapter: !this.data.showChapter
    });
  },

  pickChapter: function (event) {
    this.setData({
      indexPage: event.target.dataset.indexpage,
      scrollTop: 0
    });
    this.getChapterContent(event.target.dataset.link);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      book_id: options.book_id
    });

    let bookShelfData = wx.getStorageSync('bookShelfData');  //利用缓存实现阅读记录和书架
    if (bookShelfData.length !== 0) {
      for (let i = 0; i < bookShelfData.length; i++) {
        if (bookShelfData[i].bookInfo.id === options.book_id) {
          this.setData({  //上次读到哪
            indexPage: bookShelfData[i].readNum - 1,
            scrollTop: bookShelfData[i].laterScrollTop
          });
          break;
        }
      }
    }

    wx.setNavigationBarTitle({   //设置标题
      title: options.book_title,
    });

    wx.getSystemInfo({
      success: (res) => {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        this.setData({
          clientHeight: clientHeight,
          clientWidth: clientWidth,
          winHeight: calc
        });
      }
    });
    wx.getStorage({
      key: 'isAlerted',
      success: (res) => {
        let data = res.data;
        if (!data) {
          wx.showModal({
            title: '提示',
            content: '点击呼出菜单',
            success: (res) => {
              if (res.confirm) {
                wx.setStorage({
                  key: 'isAlerted',
                  value: true
                });
              }
            }
          });
        }
      }
    });

    setTimeout(() => {
      wx.hideLoading();
      this.getBookSources(options.book_id);
    }, 2000);
  }
});
