// const exec = require('child-process-promise');
// const sequencePromises = require('./index');

// const exec  = require('child_process').exec;
const { exec } = require("child_process");
const sequencePromises = (promises) => (
  promises.reduce((promise, promiseFunction) => (
    promise.then(() => promiseFunction())
  ), Promise.resolve())
);

const hostapdCommands = [
  'sudo systemctl stop wpa_supplicant.service',
  'sudo ifdown wlan0',
  'sudo cp /home/pi/network_configs/hostapd/interfaces /etc/network',
  'sudo ifup wlan0',
  'sudo systemctl start hostapd.service',
  'sudo systemctl start isc-dhcp-server.service',
];

const clientmodeCommands = [
  'sudo systemctl stop hostapd.service',
  'sudo systemctl stop isc-dhcp-server.service',
  'sudo ifdown wlan0',
  'sudo cp /home/pi/network_configs/client/interfaces /etc/network/',
  'sudo ifup wlan0',
  'sudo systemctl start wpa_supplicant.service',
  'sudo systemctl restart dhcpcd.service',
];

const createWpaConf = (ssid, psk) => (
  `'
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=TH

network={
        ssid="${ssid}"
        psk="${psk}"
}'`
);

const createCmdPromise = (command) => (
  exec(command)
);

const sequenceSysCmds = (commandList) => {
  const promises = commandList.map(command => () => createCmdPromise(command));
  return sequencePromises(promises);
};

const setHostApdMode = () => sequenceSysCmds(hostapdCommands);

const setClientMode = () => sequenceSysCmds(clientmodeCommands);

const createWifiNetUpdateCmdPromises = ({ wifiSsid, wifiPassword }, currentUserId) => {
  const wpaconf = createWpaConf(wifiSsid, wifiPassword);
  const writeWpaConfCmd = `echo ${wpaconf} >> /home/pi/network_configs/client/wpa_supplicant.conf`;
  const commands = [
    writeWpaConfCmd,
    'sudo chmod 600 /home/pi/network_configs/client/wpa_supplicant.conf',
    'sudo cp /home/pi/network_configs/client/wpa_supplicant.conf /etc/wpa_supplicant',
    'sudo rm -rf /home/pi/network_configs/client/wpa_supplicant.conf',
    'sleep 5',
    'sudo systemctl restart dhcpcd.service',    
    ];
  // Commands to replace wpa_supplicant.conf
  const sysCmdsPromises = commands.map(command => () => createCmdPromise(command));
  // Update system state in database

  return sequencePromises(sysCmdsPromises);
};

exports.setWifiMode = (mode) => (mode === 0 ? setHostApdMode() : setClientMode());

exports.updateWifiNet =
  (wifiNet, currentUserId) => createWifiNetUpdateCmdPromises(wifiNet, currentUserId);
