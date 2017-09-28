var bleno = require("bleno");
const CONFIG = require("./config");

bleno.on("stateChange", function(state) {
  if (state === "poweredOn") {
    bleno.startAdvertising(
      CONFIG.bleDevice.name,
      CONFIG.bleDevice.services_uuids,
      function(error) {
        if (error) {
          console.error(error);
        } else {
          console.log("DEBUG: Advertising started.");
        }
      }
    );
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on("advertisingStart", function(error) {
  if (error) {
    // error on advertise start
    console.error(error);
  } else {
    bleno.setServices([
      new bleno.PrimaryService({
        uuid: CONFIG.bleDevice.services_uuids[0],
        characteristics: [
          new bleno.Characteristic({
            uuid: Object.keys(
              CONFIG.bleDevice.characteristics[
                CONFIG.bleDevice.services_uuids[0]
              ]
            )[0],
            properties:
              CONFIG.bleDevice.characteristics[
                CONFIG.bleDevice.services_uuids[0]
              ][
                Object.keys(
                  CONFIG.bleDevice.characteristics[
                    CONFIG.bleDevice.services_uuids[0]
                  ]
                )[0]
              ],
            value: null,
            onWriteRequest: handleWriteRequest

            // updateValueCallback function emitted onNotify event
            // onNotify: function() {
            //   console.log("onNotify");
            // },

            // Start Notification Request
            // onSubscribe: function(maxValueSize, updateValueCallback) {
            //   console.log("DEBUG: Subscribed.");
            //   this.updateValueCallback = updateValueCallback;
            // },

            // Stop Notification Request
            // onUnsubscribe: function() {
            //   console.log("onUnsubscribe");
            // }
          }),

          new bleno.Characteristic({
            uuid: Object.keys(
              CONFIG.bleDevice.characteristics[
                CONFIG.bleDevice.services_uuids[0]
              ]
            )[1],
            properties:
              CONFIG.bleDevice.characteristics[
                CONFIG.bleDevice.services_uuids[0]
              ][
                Object.keys(
                  CONFIG.bleDevice.characteristics[
                    CONFIG.bleDevice.services_uuids[0]
                  ]
                )[1]
              ],
            value: null,
            onReadRequest: function(offset, callback) {
              callback(this.RESULT_SUCCESS, Buffer.from("Read Request"));
            }
          })
        ]
      })
    ]);
  }
});

bleno.on("servicesSet", function(error) {
  if (error) {
    console.error(error);
  } else {
    console.log("DEBUG: Services have set.");
  }
});

function handleWriteRequest(data, offset, withoutResponse, callback) {
  console.log("DEBUG: Handling write request...");
  var self = this;
  // send the received data twice
  defaultResponse(self, data, callback);
  console.log("DEBUG: Response has sent.");
}

function defaultResponse(self, data, callback) {
  var res = new Uint8Array(data.length * 2);
  res.set(data, 0);
  res.set(data, data.length);

  self.value = new Buffer(res);
  notifyClient(self, res, callback);
}


function notifyClient(self, data, callback) {
  self.updateValueCallback(data);
  callback(self.RESULT_SUCCESS);
}
