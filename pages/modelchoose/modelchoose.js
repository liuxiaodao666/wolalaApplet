// pages/modelchoose/modelchoose.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceID: "",
    serviceID: "",
    characteristicID: "",
  },

  goToAutoModel: function (event) {
    wx.showToast({
      title: '自动模式功能暂未开放',
      icon: 'none'
    })
    // wx.navigateTo({
    //   url: '../automodel/automodel',
    // }) 
  },

  goToHandleModel: function (event) {
    var that = this
    wx.navigateTo({
      url: "../manualmodel/manualmodel?deviceid=" + that.data.deviceID + '&serviceid=' + that.data.serviceID + '&characteristicid=' + that.data.characteristicID, 
    })
  },
  /*  */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      deviceID: options.deviceid,
      serviceID: options.serviceid,
      characteristicID: options.characteristicid,
    })

    console.log(this.data.deviceID, this.data.serviceID, this.data.characteristicID);
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