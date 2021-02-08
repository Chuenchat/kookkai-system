var SerialPort = require("serialport");
var gpio = require('onoff').Gpio;

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
    msleep(n*1000);
}

class Ax12 {
    constructor() {
        this.AX_WRITE_DATA = 3
        this.AX_GOAL_SP_LENGTH = 7
        this.AX_GOAL_POSITION_L = 30
        this.AX_START = 255
        this.TX_DELAY_TIME = 0.0001
    
        // this.RPI_DIRECTION_PIN = 18
        this.RPI_DIRECTION_PIN = 12
        this.RPI_DIRECTION_TX = true
        this.RPI_DIRECTION_RX = false
        this.RPI_DIRECTION_SWITCH_DELAY = 0.005
    
        this.port = null
        this.gpioSet = false

        this.port = new SerialPort('/dev/ttyS0', {
            baudRate: 1000000,
            databits: 8,
            parity: 'none'}, false);

        // gpio.setMode(gpio.MODE_BCM)
        // gpio.setup(this.RPI_DIRECTION_PIN, gpio.DIR_OUT);
        this.tick = new gpio(this.RPI_DIRECTION_PIN, 'out')
        this.gpioSet = true

        this.direction(this.RPI_DIRECTION_RX)
    }

    direction(d) {
        this.tick.writeSync(d)
        sleep(this.RPI_DIRECTION_SWITCH_DELAY)
    }

    moveSpeed(id, position, speed) {

        this.direction(this.RPI_DIRECTION_TX)
        
        var p = [position&0xff, position>>8]
        var s = [speed&0xff, speed>>8]
        var checksum = (~(id + this.AX_GOAL_SP_LENGTH + this.AX_WRITE_DATA + this.AX_GOAL_POSITION_L + p[0] + p[1] + s[0] + s[1]))&0xff
  
        var buffer = Buffer.alloc(11);
        buffer[0] = this.AX_START;
        buffer[1] = this.AX_START;
        buffer[2] = id;
        buffer[3] = this.AX_GOAL_SP_LENGTH;
        buffer[4] = this.AX_WRITE_DATA;
        buffer[5] = this.AX_GOAL_POSITION_L;
        buffer[6] = p[0];
        buffer[7] = p[1];
        buffer[8] = s[0];
        buffer[9] = s[1];
        buffer[10] = checksum;
        
        this.port.flush(function(err,results){});
        this.port.write(buffer, function (err, result) {
            if (err) {
                console.log('Error while sending message : ' + err);
            }
            if (result) {
                console.log('Response received after sending message : ' + result);
            }
        });
        sleep(this.TX_DELAY_TIME);
    }
}

module.exports = Ax12;