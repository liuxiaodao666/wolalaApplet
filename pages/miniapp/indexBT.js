// pages/miniapp/indexBT.js
var globalData = getApp().globalData

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrFoundBleName: "",
    bleDevices: [],
    connected: false,
    deviceID: "",
    serviceID: "",
    characteristicID: "",
    serviceUUID: "0000FFF0-0000-1000-8000-00805F9B34FB",

    connectionDeviceText: "当前无设备接入",
    noDeviceConnText: "当前无设备接入",
    deviceConnText: "设备已连接",

    materialScanBtn: 'none', // none-隐藏按钮；''-显示按钮

    signDsipaly: true,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
  
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },

  scanConsumableMaterialEqr: function (event) {
    var that = this
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        wx.request({
          url: 'https://www.liuxiaodao.cn/use/material/' + res.result,
          method: 'GET',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res.data)
            if (res.statusCode == 200) {
              wx.navigateTo({
                url: "../modelchoose/modelchoose?deviceid=" + that.data.deviceID + '&serviceid=' + that.data.serviceID + '&characteristicid=' + that.data.characteristicID,

                success: function () {
                  console.log("junp success")
                },
                fail: function () {
                  console.log("jump failed")
                },
                complete: function () {
                  console.log("jump complete")
                }
              });
              //todo 跳转

            } else {
              //todo 200以外的状态码全部视为失败
              wx.showToast({
                title: '无效条形码，请重新扫码',
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },

  scanDeviceEqr: function (event) {
    //调试代码
    // wx.navigateTo({
    //   url: "../modelchoose/modelchoose?deviceid=" + this.data.deviceID + '&serviceid=' + this.data.serviceID + '&characteristicid=' + this.data.characteristicID,
    //   success: function () {
    //     console.log("junp success")
    //   },
    //   fail: function () {
    //     console.log("jump failed")
    //   },
    //   complete: function () {
    //     console.log("jump complete")
    //   }
    // });
    //调试代码
    var that = this
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        that.setData({
          qrFoundBleName: res.result
        });
        that.openBluetoothAdapter();
        var deviceId = ""
        var out = setInterval(function () {
          var devices = that.data.bleDevices
          console.log("found device list:", devices);
          for (let i = 0; i < devices.length; i++) {


            // if (devices[i].name == that.data.qrFoundBleName) {
            if (devices[i].name != "" && that.data.qrFoundBleName.indexOf(devices[i].name) != -1) {
              clearTimeout(out)
              deviceId = devices[i].deviceId
              that.createBLEConnection(deviceId)
              var out1 = setInterval(function () {
                if (that.data.characteristicID.length != 0) {
                  clearTimeout(out1)
                  // wx.navigateTo({
                  //   url: "../modelchoose/modelchoose?deviceid=" + that.data.deviceID + '&serviceid=' + that.data.serviceID + '&characteristicid=' + that.data.characteristicID,

                  //   success: function () {
                  //     console.log("junp success")
                  //   },
                  //   fail: function () {
                  //     console.log("jump failed")
                  //   },
                  //   complete: function () {
                  //     console.log("jump complete")
                  //   }
                  // });
                }
              }, 1000)
            }
          }
        }, 1000)
      },
    })

  },

  openBluetoothAdapter() {
    var that = this
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        that.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter failed', res)
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              that.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },

  startBluetoothDevicesDiscovery() {
    // if (this._discoveryStarted) {
    //   return
    // }
    // this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },

  onBluetoothDeviceFound() {
    var that = this
    wx.onBluetoothDeviceFound((res) => {

      res.devices.forEach(device => {
        if (!device.name) {
          //forEach中，return相当于普通for循环的continue
          return
        }

        //test
        // if(device.advertisData!=null){

        //   let bf = device.advertisData.slice(0, 10);

        //   let mac = Array.prototype.map.call(new Uint8Array(bf), x => ('00' + x.toString(16)).slice(-2)).join(':');

        //   console.log("print mac:",mac.toUpperCase());

        // }
        //test

        const foundDevices = that.data.bleDevices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`bleDevices[${foundDevices.length}]`] = device
        } else {
          data[`bleDevices[${idx}]`] = device
        }
        this.setData(data)

        // if (device.name == that.data.qrFoundBleName) {
        //   console.log("found device:", device.name, ",prepare to connection");
        //   this.createBLEConnection(device.deviceId)
        //   throw new Error("break forEach")
        // }
      })
    })
  },
  stopBluetoothDevicesDiscovery() {
    console.log("--stopBluetoothDevicesDiscovery--");
    wx.stopBluetoothDevicesDiscovery()
  },
  createBLEConnection(deviceId) {
    var that = this
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("ble connection success, deviceId:", deviceId);
        that.setData({
          connected: true,
        })
        this.getBLEDeviceServices(deviceId)
        this.stopBluetoothDevicesDiscovery()
      }
    })

  },

  getBLEDeviceServices(deviceId) {
    this.setData({
      deviceID: deviceId,

    });
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("ble service list:", res.services);
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary && res.services[i].uuid.indexOf(this.data.serviceUUID) != -1) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            console.log("test=========================");
            return
          }

          // if (res.services[i].uuid=="0000FF00-0000-1000-8000-00805F9B34FB") {
          //   this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
          //   console.log("test=========================");
          //   return
          // }
        }
      }
    })
  },

  getBLEDeviceCharacteristics(deviceId, serviceId) {
    var that = this
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log("print device Characteristics:", res)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]

          if (item.properties.read && item.properties.write && item.properties.notify) {
            console.log('readBLECharacteristicValue:', res)
            that.setData({
              deviceID: deviceId,
              serviceID: serviceId,
              characteristicID: item.uuid,
              connectionDeviceText: this.data.deviceConnText,
              materialScanBtn: '',
            });
            break

            // wx.readBLECharacteristicValue({
            //   deviceId,
            //   serviceId,
            //   characteristicId: item.uuid,
            //   success: (res) => {

            //   }
            // })
          }
          // if (item.properties.write) {
          //   this.setData({
          //     canWrite: true
          //   })
          //   this._deviceId = deviceId
          //   this._serviceId = serviceId
          //   this._characteristicId = item.uuid
          //   console.log('writeBLECharacteristicValue:', res)

          // }
          // if (item.properties.notify || item.properties.indicate) {
          //   wx.notifyBLECharacteristicValueChange({
          //     deviceId,
          //     serviceId,
          //     characteristicId: item.uuid,
          //     state: true,
          //   })
          // }
        }

      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e) {

    console.log("globalData.userInfo: ",globalData.userInfo)
    if (wx.getUserProfile) {
      this.setData({
        userInfo: globalData.userInfo,
        canIUseGetUserProfile: true
      })
    }

    if (JSON.stringify(this.data.userInfo)=="{}"){
      this.setData({
        
      })
    }else{
      signDsipaly: false
    }

  },

  bindViewTap(e){
    if (JSON.stringify(this.data.userInfo)=="{}"){
      console.log("getUserProfile")
      this.getUserProfile(e) 
    }else{
      this.setData({
        userInfo: globalData.userInfo,
        hasUserInfo: true,
        signDsipaly: false
      })
    }
  },
  getUserProfile(e) {
   
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)

        globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          signDsipaly: false
        })
      },

      fail:(res) =>{
        console.log(res)
      }
    })
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