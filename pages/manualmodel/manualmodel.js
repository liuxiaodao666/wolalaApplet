// pages/manualmodel/manualmodel.js

var globalData = getApp().globalData
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    index: 0,

    currentTemperature: null,
    currentLevel: null,

    waterOpenBtnDsipaly: '', // none-隐藏按钮；''-显示按钮
    waterCloseBtnDsipaly: 'none',
    peristalsisOpenBtnDsipaly: '',
    peristalsisCloseBtnDsipaly: 'none',
    blowdownOpenBtnDsipaly: '',
    blowdownCloseBtnDsipaly: 'none',

    openWaterDisabled: true, //注水开  true-不可操作  false-可操作
    closeWaterDisabled: true, //注水关  true-不可操作  false-可操作
    openPeristalsisDisabled: true, //搅拌开  true-不可操作  false-可操作

    waterOpenBtnLoading: false, //false--不显示loading ，true--显示loading
    waterCloseBtnLoading: false,
    peristalsisOpenBtnLoading: false,
    peristalsisCloseBtnLoading: false,

    deviceID: "",
    serviceID: "0000FFF0-0000-1000-8000-00805F9B34FB",
    characteristicID: "",

    serviceUUID: "0000FFF0-0000-1000-8000-00805F9B34FB",
    readCharacteristicId:"0000FFF1-0000-1000-8000-00805F9B34FB",
    writeCharacteristicId:"0000FFF2-0000-1000-8000-00805F9B34FB",

    msgHeader: 90, //5A  数据帧头
    sendHeader: 1, //01 表示发送数据
    receiveHeader: 17, //11  表示接收到数据

    temperatureExp: 1, //01  温度
    waterLevelExp: 2, //02 液位
    waterBtn: 3, //注水开关    00-关，01-开
    PeristalsisBtn: 4, //搅拌开关  
    blowdownBtn: 5, //排污开关  
    workerModel: 6, //工作模式  00-自动，01-手动
    workerStatus: 7, // 00-自动模式开始， 01-自动模式通知/手动模式急停
    enableOpenWater: 8, // 08 00-手工模式下，水温达到预定温度，允许设备执行注水操作      08 01-手工模式下，水箱水位低告警




  },

  bindTemperaturePickerChange: function (event) {
    console.log('温度选择器发生变化，携带值为', event.detail.value);
    this.setData({
      index: event.detail.value
    })

    this.writeBLEValue(this.data.temperatureExp, this.data.array[event.detail.value])
  },

  //注水开关
  openWater: function (event) {
    console.log('打开注水开关');
    this.setData({
      waterOpenBtnLoading: true
      // waterOpenBtnDsipaly: 'none',
      // waterCloseBtnDsipaly: ''
    })
    this.writeBLEValue(this.data.waterBtn, 1);
  },

  closeWater: function (event) {
    console.log('关闭注水开关');
    this.setData({
      waterCloseBtnLoading: true
      // waterOpenBtnDsipaly: '',
      // waterCloseBtnDsipaly: 'none'
    })

    this.writeBLEValue(this.data.waterBtn, 0)
  },
  //蠕动开关
  openPeristalsis: function (event) {
    console.log('打开蠕动开关');
    this.setData({
      peristalsisOpenBtnLoading: true
      // peristalsisOpenBtnDsipaly: 'none',
      // peristalsisCloseBtnDsipaly: '',
    })
    this.writeBLEValue(this.data.PeristalsisBtn, 1)
  },

  closePeristalsis: function (event) {
    console.log('关闭蠕动开关');
    this.setData({
      peristalsisCloseBtnLoading:true
      // peristalsisOpenBtnDsipaly: '',
      // peristalsisCloseBtnDsipaly: 'none'
    })
    this.writeBLEValue(this.data.PeristalsisBtn, 0)
  },

  //排污开关
  openBlowdown: function (event) {
    console.log('打开排污开关');
    this.setData({
      blowdownOpenBtnDsipaly: 'none',
      blowdownCloseBtnDsipaly: '',
    })
  },

  closeBlowdown: function (event) {
    console.log('关闭排污开关');
    this.setData({
      blowdownOpenBtnDsipaly: '',
      blowdownCloseBtnDsipaly: 'none'
    })
  },

  emergencyStop: function (event) {
    console.log('执行紧急停止');
    this.setData({
      waterOpenBtnDsipaly: '',
      waterCloseBtnDsipaly: 'none',
      peristalsisOpenBtnDsipaly: '',
      peristalsisCloseBtnDsipaly: 'none',
      blowdownOpenBtnDsipaly: '',
      blowdownCloseBtnDsipaly: 'none',

      waterOpenBtnLoading: false, //false--不显示loading ，true--显示loading
      waterCloseBtnLoading: false,
      peristalsisOpenBtnLoading: false,
      peristalsisCloseBtnLoading: false,
    })

    this.writeBLEValue(this.data.workerStatus, 1)
  },

  getBLEDeviceValue: function (deviceID, serviceID, characteristicID) {
    wx.notifyBLECharacteristicValueChange({
      characteristicId: characteristicID,
      deviceId: deviceID,
      serviceId: serviceID,
      state: true,
    })

    wx.onBLECharacteristicValueChange((result) => {
      //fixme 这里需要增加result的解析逻辑
      
      console.log("onBLECharacteristicValueChange:", ab2hex(result.value));
      var ret = result.value
      var view = new DataView(ret)
      
      //单片机主动发送小消息
      if (view.getUint8(1) == this.data.sendHeader) {
        switch (view.getUint8(2)) {
          //实时水温反馈
          case this.data.temperatureExp:
            this.setData({
              currentTemperature: view.getUint8(3)
            });
            this.responeWriteBLEValue(ret);
            break;


          case this.data.enableOpenWater:
            switch (view.getUint8(3)) {
              //水温满足工作要求
              case 0:
                wx.showToast({
                  title: '水温达到设定值，可以执行注水',
                  icon: 'none'
                });
                this.setData({
                  openWaterDisabled: false
                });
                break;

                //水箱液位低，停止工作
              case 1:
                wx.showToast({
                  title: '水箱液位低，停止工作',
                  icon: 'none'
                });
                this.setData({
                  waterOpenBtnDsipaly: '',
                  waterCloseBtnDsipaly: 'none',
                  peristalsisOpenBtnDsipaly: '',
                  peristalsisCloseBtnDsipaly: 'none',
                  blowdownOpenBtnDsipaly: '',
                  blowdownCloseBtnDsipaly: 'none'
                });
                this.responeWriteBLEValue(ret)
                break;
            }
            break;
            //第一次注水，达到200ml
          case this.data.waterBtn:
            if (view.getUint8(3) == 0) {
              wx.showToast({
                title: '单次注水已满200ml，自动停止注水！',
                icon: 'none'
              });
            }
            this.setData({
              waterOpenBtnDsipaly: '',
              waterCloseBtnDsipaly: 'none',
              peristalsisOpenBtnDsipaly: '',
              peristalsisCloseBtnDsipaly: 'none',
              //  openWaterDisabled: false, 注水开  true-不可操作  false-可操作
              closeWaterDisabled: false,
              openPeristalsisDisabled: false
            })
            this.responeWriteBLEValue(ret)
        }

      }

      //单片机的应答信号
      if (view.getUint8(1) == this.data.receiveHeader) {
        switch (view.getUint8(2)) {
          //注水开关
          case this.data.waterBtn:
            //注水开应答
            if (view.getUint8(3) == 1) {
              this.setData({
                waterOpenBtnLoading: false,
                waterOpenBtnDsipaly: 'none',
                waterCloseBtnDsipaly: ''
              })
            }
            //注水关应答
            if (view.getUint8(3) == 0) {
              this.setData({
                waterCloseBtnLoading: false,
                waterOpenBtnDsipaly: '',
                waterCloseBtnDsipaly: 'none',
              })
            }
            break;

            //搅拌开关
          case this.data.PeristalsisBtn:
            //搅拌开应答
            if (view.getUint8(3) == 1) {
              this.setData({
                peristalsisOpenBtnLoading: false,
                peristalsisOpenBtnDsipaly: 'none',
                peristalsisCloseBtnDsipaly: '',
              })
            }
            //搅拌关应答
            if (view.getUint8(3) == 0) {
              this.setData({
                peristalsisCloseBtnLoading: false,
                peristalsisOpenBtnDsipaly: '',
                peristalsisCloseBtnDsipaly: 'none',
              })
            }
            break;

          default:
            console.log("ubknown operate object:", view.getUint8(2))
        }
      }

    })
  },
  responeWriteBLEValue: function (ret) {
    var view = new DataView(ret)
    view.setUint8(1, this.data.receiveHeader)
    view.setUint8(4, view.getUint8(0) + view.getUint8(1) + view.getUint8(2) + view.getUint8(3))

    wx.writeBLECharacteristicValue({
      characteristicId: this.data.writeCharacteristicId,
      deviceId: this.data.deviceID,
      serviceId: this.data.serviceUUID,
      value: ret,
      success(res) {
        console.log('respone writeBLECharacteristicValue success', res.errMsg)
      },
      fail(res) {
        console.log('respone writeBLECharacteristicValue fail', res.errMsg)
      }
    })
  },

  writeBLEValue: function (type, value) {
    var buffer = new ArrayBuffer(5);
    var dataView = new DataView(buffer);
    dataView.setUint8(0, this.data.msgHeader);
    dataView.setUint8(1, this.data.sendHeader);
    dataView.setUint8(2, type);
    dataView.setUint8(3, value);
    dataView.setUint8(4, this.data.msgHeader + this.data.sendHeader + type + value)
    wx.writeBLECharacteristicValue({
      characteristicId: this.data.writeCharacteristicId,
      deviceId: this.data.deviceID,
      serviceId: this.data.serviceUUID,
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail(res) {
        console.log('writeBLECharacteristicValue fail', res.errMsg)
      }
    })
  },






  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var v1 = globalData.openWaterDisabled
    var v2 = globalData.closeWaterDisabled
    var v3 = globalData.openPeristalsisDisabled
    this.setData({
      deviceID: options.deviceid,
      serviceID: options.serviceid,
      characteristicID: options.characteristicid,

      openWaterDisabled: v1, //注水开  true-不可操作  false-可操作
      closeWaterDisabled: v2, //注水关  true-不可操作  false-可操作
      openPeristalsisDisabled: v3, //搅拌开  true-不可操作  false-可操作
    })
  
    console.log(this.data.deviceID, this.data.serviceID, this.data.characteristicID);
    this.getBLEDeviceValue(this.data.deviceID, this.data.serviceUUID, this.data.readCharacteristicId);

    wx.showToast({
      title: '请先设置水温，默认值30℃',
      icon: 'none'
    })

    wx.enableAlertBeforeUnload({
      message: '退出页面会终止当前所有操作！！！',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.writeBLEValue(6, 1)
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
    this.emergencyStop();
    globalData.openWaterDisabled=this.data.openPeristalsisDisabled
    globalData.closeWaterDisabled=this.data.closeWaterDisabled
    globalData.openPeristalsisDisabled=this.data.openPeristalsisDisabled
    console.log("推出成功")
    //这里增加停止所有操作的逻辑
    //
    //
    //
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