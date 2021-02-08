const Rx = require('rxjs/Rx');
const i2c = require('i2c-bus');

const controlByte  = 0x24
const colorOff = 0x00;
const GPIOA  = 0x12
const GPIOB  = 0x13

// point to your i2c address, '/dev/i2c-1'
const i2c1 = i2c.openSync(1);

i2c1.writeByteSync(controlByte, GPIOA, 0x00)
i2c1.writeByteSync(controlByte, GPIOB, 0x00)

const speedOfLight = {
    slow: 800,
    medium: 500,
    fast: 100,
  };

class LightsController {
    constructor() {
      this.state = {};
      this.commandStreamBody = null;
      this.commandStreamHead = null;
    }
  
    staticBody() {
        var DataA = colorOff | 0xFF
        var DataB = this.state.bodyColor | 0x0F
        i2c1.writeByteSync(controlByte, GPIOA, DataA, (err) => { if (err) console.error(err); });
        i2c1.writeByteSync(controlByte, GPIOB, DataB, (err) => { if (err) console.error(err); });
    }
  
    blinkBody() {
      if (!this.state.bodyLight) {
        this.staticBody();
        this.state.bodyLight = true;
      } else {
        this.turnOffBody();
        this.state.bodyLight = false;
      }
    }
  
    loopBody(shift) {
        var DataA = shift[0]
        var DataB = this.state.bodyColor | shift[1]
        i2c1.writeByteSync(controlByte, GPIOA, DataA, (err) => { if (err) console.error(err); });
        i2c1.writeByteSync(controlByte, GPIOB, DataB, (err) => { if (err) console.error(err); });
    }
  
    turnOffBody() {
        // var DataA = colorOff | 0xFF
        // var DataB = colorOff | 0xFF
        var DataA = colorOff
        var DataB = colorOff
        i2c1.writeByteSync(controlByte, GPIOA, DataA, (err) => { if (err) console.error(err); });
        i2c1.writeByteSync(controlByte, GPIOB, DataB, (err) => { if (err) console.error(err); });
    }
  
    setState(newState) {
      const {
        bodyLightRed,
        bodyLightGreen,
        bodyLightBlue,
        headLightRed,
        headLightGreen,
        headLightBlue,
      } = newState;
      const hred = headLightRed ? 2 : 0;
      const hgreen = headLightGreen ? 4 : 0;
      const hblue = headLightBlue ? 1 : 0;
  
      const bred = bodyLightRed ? 2 : 0;
      const bgreen = bodyLightGreen ? 4 : 0;
      const bblue = bodyLightBlue ? 1 : 0;
  
      let bodyColor = bred | bgreen | bblue;
      bodyColor <<= 4;
  
      let headColor = hred | hgreen | hblue;
      headColor <<= 4;
  
      this.state = Object.assign({}, this.state, newState, { bodyColor, headColor });
      this.operate();
    }
  
    operate() {
      if (this.state.bodyLight) {
        if (this.commandStreamBody) this.commandStreamBody.unsubscribe();
        this.commandStreamBody = this.generatecommandStreamBody().subscribe();
      } else {
        if (this.commandStreamBody) this.commandStreamBody.unsubscribe();
        this.commandStreamBody = null;
        this.turnOffBody();
      }
    }
  
    generatecommandStreamBody() {
      switch (this.state.bodyLightMode) {
        case 'static':
          return Rx.Observable.from([1]).map(() => this.staticBody());
        case 'blink':
          return Rx.Observable.interval(
            speedOfLight[this.state.bodyLightSpeed])
            .map(() => this.blinkBody());
        case 'loop':
          return Rx.Observable.interval(speedOfLight[this.state.bodyLightSpeed])
                          .scan((acc, x, i, source) =>
                              ([~acc[0], ~acc[1] & 0x0F]), [0x00 | 0xAA, 0x00 | 0xAA])
                          .map(shift => this.loopBody(shift));
        default:
          return null;
        }
    }  
}

// module.exports = { LightsController };
module.exports = LightsController;
