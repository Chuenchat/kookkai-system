const bleno = require('@abandonware/bleno');

class BleCommandCharacteristic extends bleno.Characteristic {
  constructor(eventStream) {
    super({
      uuid: '13333333333333333333333333330001',
      properties: ['write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'String Valued ContentIds.',
        }),
      ],
    });
    this.eventStream = eventStream;
    this.bleCommandId = null;
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else {
      const payload = data.toString('utf8');
      this.bleCommandId = payload;
      this.eventStream.dispatch({ type: 'contentId', payload });
      callback(this.RESULT_SUCCESS);
    }
  }

}

module.exports = BleCommandCharacteristic;
