const events = require('events');
const { exec } = require("child_process");

class BleEventStream extends events.EventEmitter {
  constructor(id) {
    super();
    this.id = id;
  }

  dispatch(bleEvent) {
    switch (bleEvent.type) {
      case 'payload':
        if (bleEvent.payload === 'shutdown') {
          exec('sudo shutdown -h now');
          break;
        } else if (bleEvent.payload === 'prev') {
          this.emit('bleEvent', { type: 'ble:contents:prev' });
          break;
        } else if (bleEvent.payload === 'next') {
          this.emit('bleEvent', { type: 'ble:contents:next' });
          break;
        } else if (bleEvent.payload === 'repeat') {
          this.emit('bleEvent', { type: 'ble:contents:repeat' });
          break;
        } else if (bleEvent.payload === 'play') {
          this.emit('bleEvent', { type: 'ble:contents:play' });
          break;
        } else if (bleEvent.payload === 'pause') {
          this.emit('bleEvent', { type: 'ble:contents:pause' });
          break;
        } else if (bleEvent.payload === 'pos') {
          this.emit('bleEvent', { type: 'ble:contents:pos' });
          break;
        } else if (bleEvent.payload === 'neg') {
          this.emit('bleEvent', { type: 'ble:contents:neg' });
          break;
        } else if (bleEvent.payload.substring(0, 7) === 'assigns') {
          this.emit('bleEvent', { type: 'ble:contents:assigns', payload: bleEvent.payload.substring(8) });
          break;
        } else {
          this.emit('bleEvent', { type: 'ble:contents:payload', payload: bleEvent.payload });
          break;
        }
      case 'setWifiNet':
        this.emit('bleEvent', { type: 'ble:setwifi', payload: bleEvent.payload });
        break;
      case 'contentId':  // eslint-disable-line
        const payloads = bleEvent.payload.split(':');
        const contentIds = `${payloads[1]}`.split(',');
        contentIds.pop();  // remove last element

        this.emit('bleEvent', { type: 'ble:contents:ids', payload: contentIds });
        break;
      default:
        break;
    }
  }
}

module.exports = BleEventStream;
