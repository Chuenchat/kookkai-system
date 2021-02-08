const bleno = require('@abandonware/bleno');
const LightsController = require('./demo_light');
const Ax12 = require('./demo_motor.js')
lit = new LightsController
servos = new Ax12

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n*1000);
}
test_move = function(d) {
  r1 = Math.round(d * (542 - 472) + 472)
  r2 = Math.round(d * (724 - 512) + 512)
  r3 = Math.round(d * (512 - 300) + 300)

  servos.moveSpeed(1, r1, 120)
  servos.moveSpeed(2, r2, 120)
  servos.moveSpeed(3, r3, 120)

  sleep(1)
}
r = true

should_blink = false
var loop_light = setInterval(() => {
  if (should_blink) {
    lit.blinkBody()
  }
  else {
    lit.turnOffBody()
  }
}, 1000)

should_dance = false
var loop_motor = setInterval(() => {
  if (should_dance) {
    test_move(r)
    r = !r  
  }
}, 1000)

class PayloadCharacteristic extends bleno.Characteristic {
  constructor(eventStream) {
    super({
      // uuid: '13333333333333333333333333330002',
      uuid: '13333333-3333-3333-3333-333333330002',
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

      // // should i put commands here?
      // if (payload == '21') {
      //   lit.blinkBody()
      // }
      // else if (payload == '22') {
      //   test_move(r)
      //   r = !r  
      // }

      // should i put commands here? 2
      if (payload == '21') {
        should_blink = !should_blink
      }
      else if (payload == '22') {
        should_dance = !should_dance
      }

      callback(this.RESULT_SUCCESS);
    }
  }
}

module.exports = PayloadCharacteristic;
