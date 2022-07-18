// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
  },
  
  globalData: {
    userInfo: {},
    openWaterDisabled: true, //注水开  true-不可操作  false-可操作
    closeWaterDisabled: true, //注水关  true-不可操作  false-可操作
    openPeristalsisDisabled: true, //搅拌开  true-不可操作  false-可操作
  }
})
