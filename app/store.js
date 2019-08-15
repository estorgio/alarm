const EventEmitter = require('events');
const uuidv4 = require('uuid/v4');

class AlarmListEmitter extends EventEmitter {}

const emitter = new AlarmListEmitter();
let list = [];

function get(id) {
  return list.find(alarmItem => alarmItem.id === id);
}

function load() {
  const data = localStorage.getItem('alarm-list');
  list = JSON.parse(data) || [];
  emitter.emit('render', list);
}

function save() {
  const data = JSON.stringify(list);
  localStorage.setItem('alarm-list', data);
}

function add(name, time) {
  const id = uuidv4();

  list.push({
    id,
    name: name || 'Alarm',
    time: time || '',
    enabled: true,
    lastTriggered: null,
  });

  save();
  emitter.emit('render', list);
  return id;
}

function update(id, data, isRender = true) {
  const item = list.find(alarmItem => alarmItem.id === id);
  if (!item) return;

  item.name = typeof data.name !== 'undefined' ? data.name : item.name;
  item.time = typeof data.time !== 'undefined' ? data.time : item.time;
  item.enabled = typeof data.enabled !== 'undefined' ? data.enabled : item.enabled;

  save();
  if (isRender) emitter.emit('render', list);
}

function remove(id) {
  const item = list.find(alarmItem => alarmItem.id === id);
  if (!item) return;
  const index = list.indexOf(item);
  list.splice(index, 1);

  save();
  emitter.emit('render', list);
}

function alarm(callback) {
  emitter.on('alarm', callback);
}

function render(callback) {
  emitter.on('render', callback);
}

function getCurrentTime(offset = 0) {
  const currentTime = new Date(Date.now() + offset);
  let minute = currentTime.getMinutes();
  let hour = currentTime.getHours();
  const ampm = hour >= 0 && hour <= 11 ? 'AM' : 'PM';

  if (hour === 0) {
    hour = 12;
  } else if (hour >= 13) {
    hour -= 12;
  }

  hour = hour < 10 ? `0${hour}` : hour;
  minute = minute < 10 ? `0${minute}` : minute;

  return `${hour}:${minute} ${ampm}`;
}

setInterval(() => {
  const alarmsToActivate = list.filter((item) => {
    if (!item.enabled) return false;
    if (item.lastTriggered) {
      const msSinceTriggered = Date.now() - item.lastTriggered;
      if (msSinceTriggered < 60000) return false;
    }
    if (getCurrentTime() !== item.time) return false;
    return true;
  });

  if (alarmsToActivate.length <= 0) return;

  emitter.emit('alarm', alarmsToActivate);

  alarmsToActivate.forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    item.lastTriggered = Date.now();
  });
  save();
}, 1000);

module.exports = {
  add,
  update,
  get,
  remove,
  load,
  save,
  render,
  alarm,
  getCurrentTime,
};
