const Rx = require('rxjs/Rx');
const _ = require('lodash');

const client = require("socket.io-client");
const socket = client.connect("http://localhost:5000");

const socketRegistry = {};
const { rxBleContents, rxBleWifiNet } = require('./ble')
const { BLECommandProcessor, updateWifiNetPromise } = require('./ble/bleStreamProcessors')

socket.on('connect', () => {
    console.log("server connected")

    socket.emit('registration', { type: 'registration', key: 'raspberry' });
    socket.on('register', (data) => {
        socketRegistry[data.key] = socket.id;
        const commandProcessor = new BLECommandProcessor(1, socket);
        rxBleContents.subscribe(commandProcessor.observer);

        setTimeout(() => {
            socket.emit('sayIntroduction',
                { type: 'sayIntroduction', payload: '' }
            );
        }, 1000);
    });

    socket.on('disconnect', () => {
        const key = _.findKey(socketRegistry, socket.id);
        delete socketRegistry[key];
    });
});

rxBleWifiNet
    .flatMap(action => updateWifiNetPromise(action, 'admin'))
    .subscribe(
        val => console.log('val'),
        err => console.log('err'),
        () => console.log('completed')
);