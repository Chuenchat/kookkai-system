const bleno = require('@abandonware/bleno');

class WifiNetCharacteristic extends bleno.Characteristic {
  constructor(eventStream) {
    super({
      uuid: '13333333333333333333333333330006',
      properties: ['write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'ssid payload.',
        }),
      ],
    });
    this.eventStream = eventStream;
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else {
      const payload = data.toString('utf8');
      this.eventStream.dispatch({ type: 'setWifiNet', payload });
      callback(this.RESULT_SUCCESS);
    }
  }
}

module.exports = WifiNetCharacteristic;
