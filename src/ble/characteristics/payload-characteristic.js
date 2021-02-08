const bleno = require('@abandonware/bleno');

class PayloadCharacteristic extends bleno.Characteristic {
  constructor(eventStream) {
    super({
      uuid: '13333333333333333333333333330002',
      properties: ['write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'command payload.',
        }),
      ],
    });
    this.eventStream = eventStream;
    this.bleCommandPayload = null;
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else {
      const payload = data.toString('utf8');
      this.bleCommandPayload = payload;
      this.eventStream.dispatch({ type: 'payload', payload: `${payload}` });
      console.log(`buttonID: ${payload}`);
      callback(this.RESULT_SUCCESS);
    }
  }
}

module.exports = PayloadCharacteristic;
