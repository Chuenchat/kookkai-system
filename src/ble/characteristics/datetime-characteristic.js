const bleno = require('@abandonware/bleno');


class BleDateTimeCharacteristic extends bleno.Characteristic {
  constructor(eventStream) {
    super({
      uuid: '13333333333333333333333333330007',
      properties: ['read', 'write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'String Valued DateTime.',
        }),
      ],
    });

    this.eventStream = eventStream;
    this.dtString = null;
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else if (data.length !== 19) {
      callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    } else {
      const dt = data.toString('utf8');
      this.dtString = dt;
      this.eventStream.dispatch({ type: 'syncTime', payload: dt });
      callback(this.RESULT_SUCCESS);
    }
  }

  onReadRequest(offset, callback) {
    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG, null);
    } else {
      const data = Buffer.alloc(19);
      data.write(this.dtString, 'utf8');
      callback(this.RESULT_SUCCESS, data);
    }
  }
}

module.exports = BleDateTimeCharacteristic;
