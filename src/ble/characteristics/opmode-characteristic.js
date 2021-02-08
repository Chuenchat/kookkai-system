const bleno = require('@abandonware/bleno');


class OpModeCharacteristic extends bleno.Characteristic {
  constructor(eventStream) {
    super({
      uuid: '13333333333333333333333333330009',
      properties: ['read', 'write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Operation mode payload.',
        }),
      ],
    });
    this.opMode = null;
    this.eventStream = eventStream;
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else if (data.length !== 1) {
      callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    } else {
      const mode = data.readUInt8(0);
      this.opMode = mode;
      this.eventStream.dispatch({ type: 'changeOpMode', payload: mode });
      callback(this.RESULT_SUCCESS);
    }
  }

  onReadRequest(offset, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG, null);
    } else {
      const data = Buffer.alloc(1);
      data.writeUInt8(this.opMode.mode);
      callback(this.RESULT_SUCCESS, data);
    }
  }
}

module.exports = OpModeCharacteristic;
