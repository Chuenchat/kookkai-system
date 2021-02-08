const bleno = require('@abandonware/bleno');

const BleCommandCharacteristic = require('../characteristics/blecommand-characteristic');
const PayloadCharacteristic = require('../characteristics/payload-characteristic');
const WifiNetCharacteristic = require('../characteristics/wifinet-characteristic');


class BleRpiService extends bleno.PrimaryService {
  constructor(bleEventStream) {
    super({
      uuid: '13333333333333333333333333333337',
      characteristics: [
        new BleCommandCharacteristic(bleEventStream),
        new PayloadCharacteristic(bleEventStream),
        new WifiNetCharacteristic(bleEventStream),
      ],
    });
  }
}

module.exports = BleRpiService;
