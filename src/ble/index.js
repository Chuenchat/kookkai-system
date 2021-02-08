const Rx = require('rxjs/Rx');
const bleno = require('@abandonware/bleno');
const BleRpiService = require('./services/blerpi-service');
const BleEventStream = require('./utils/bleEventStream');

exports.bleEventStream = new BleEventStream(1);
const bleRpiService = new BleRpiService(exports.bleEventStream);

const name = 'Kookkai-Dev';

bleno.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    bleno.startAdvertising(name, [bleRpiService.uuid], (err) => {
      if (err) console.log(err);
    });
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', (err) => {
  if (!err) {
    console.log('advertising...');
    bleno.setServices([
      bleRpiService,
    ]);
  }
});

exports.rxBle = Rx.Observable.fromEvent(exports.bleEventStream, 'bleEvent');
exports.rxBleContents = exports.rxBle.filter(
  action => action.type.split(':')[1] === 'contents');
exports.rxBleOpMode = exports.rxBle.filter(action => action.type === 'ble:opmode');
exports.rxBleDateTime = exports.rxBle.filter(action => action.type === 'ble:synctime');
exports.rxBleWifiNet = exports.rxBle.filter(action => action.type === 'ble:setwifi');
