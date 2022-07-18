// pages/automodel/automodel.js
Page({

  /**
   * 页面的初始数据
   */

  data: {
    //水温范围
    temperatureArray: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    temperatureIndex: 0,

    //液位范围
    waterArray: [200, 300, 500],
    waterIndex: 0,

    //实时值
    currentTemperature: null,
    currentLevel: null,

    //工作状态渲染
    workState:["rgb(146, 146, 143)","greenyellow"],
    waterState:0,
    peristalsisState:0,
    blowdownState:0,

    //自动模式 开始/停止
    autoModelStartBtnDsipaly:'',
    autoModelSopBtnDsipaly:'none'

  },

  bindTemperaturePickerChange: function (event) {
    console.log("水温预设发生变化，携带值为", event.detail.value);
    this.setData({
      temperatureIndex: event.detail.value
    })
  },

  bindWaterLevelPickerChange: function (event) {
    console.log("液位预设发生变化，携带值为", event.detail.value);
    this.setData({
      waterIndex: event.detail.value
    })
  },

  autoModelStart: function(event){
    console.log("自动模式开始工作");
    this.setData({
    autoModelStartBtnDsipaly:'none',
    autoModelSopBtnDsipaly:'',
    waterState:1,
    })
  },

  autoModelStop: function(event){
    console.log("自动模式停止工作");
    this.setData({
    autoModelStartBtnDsipaly:'',
    autoModelSopBtnDsipaly:'none',
    waterState:0,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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