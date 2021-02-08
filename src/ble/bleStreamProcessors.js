const Rx = require('rxjs/Rx');
const { setWifiMode, updateWifiNet } = require('./utils/sysCommands');

class BLECommandProcessor {
  constructor(id, dispSocket) {
    this.id = id;
    this.dispSocket = dispSocket;
    this.observer = {
      next: (action) => this.onNext(action),
      error: (err) => this.onError(err),
      complete: () => this.onComplete(),
    };
  }

  onNext(action) {
    switch (action.type) {
      case 'ble:contents:ids':
        this.dispSocket.emit('setContentIds',
          { type: 'setContentIds', payload: action.payload }
        );
        break;
      case 'ble:contents:prev':
        this.dispSocket.emit('prevLesson',
          { type: 'prevLesson', payload: action.payload }
        );
        break;
      case 'ble:contents:next':
        this.dispSocket.emit('nextLesson',
          { type: 'nextLesson', payload: action.payload }
        );
        break;
      case 'ble:contents:repeat':
        this.dispSocket.emit('repeatLesson',
          { type: 'repeatLesson', payload: action.payload }
        );
        break;
      case 'ble:contents:play':
        this.dispSocket.emit('playLesson',
          { type: 'playLesson', payload: action.payload }
        );
        break;
      case 'ble:contents:pause':
        this.dispSocket.emit('pauseLesson',
          { type: 'pauseLesson', payload: action.payload }
        );
        break;
      case 'ble:contents:pos':
        this.dispSocket.emit('positiveFB',
          {
            type: 'positiveFB',
            payload: 'positive',
          });
        break;
      case 'ble:contents:neg':
        this.dispSocket.emit('encourageFB',
          {
            type: 'encourageFB',
            payload: 'encourage',
          });
        break;
      case 'ble:contents:assigns':
        this.dispSocket.emit('assigns',
          { type: 'assigns', payload: action.payload }
          );
        break;
      default:
        break;
    }
  }

  onError(err) {
    console.log(err);
  }

  onComplete() {
    console.log('completed.');
  }
}
module.exports = {
  BLECommandProcessor
}

// Observable from promise with proper error handling
module.exports.opModeCmdPromise = (action) => (
  Rx.Observable.fromPromise(setWifiMode(action.payload))
               .catch(error => Rx.Observable.of(`SETMODE ERROR: ${error}`))
);

module.exports.updateWifiNetPromise = (action, userId) => {
  const [wifiSsid, wifiPassword] = action.payload.split(':');
  return Rx.Observable.fromPromise(updateWifiNet({ wifiSsid, wifiPassword }, userId))
               .catch(error => Rx.Observable.of(`UPDATE SYSSTATE ERROR: ${error}`));
};
