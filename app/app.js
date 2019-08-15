// eslint-disable-next-line import/no-extraneous-dependencies
const { Menu } = require('electron').remote;

const store = require('./store');
const alarm = require('./alarm');

Menu.setApplicationMenu(null);

const alarmList = document.querySelector('#alarm-list');
const btnAddAlarm = document.querySelector('#btn-add-alarm');
const newEditAlarm = document.querySelector('#new-edit-alarm');
const alarmName = document.querySelector('#alarm-name');
const alarmTime = document.querySelector('#alarm-time');
const newEditAlarmSave = document.querySelector('#new-alarm-save');
const newEditAlarmCancel = document.querySelector('#new-alarm-cancel');

let currentPage = 'list';

store.alarm((list) => {
  alarm.show(list);
});

store.render((list) => {
  const collection = document.querySelector('#alarm-list .collection');
  collection.innerHTML = '';
  list.forEach((item) => {
    const element = document.createElement('a');
    element.classList.add('collection-item');
    element.setAttribute('href', '#!');
    element.setAttribute('data-id', item.id);
    element.innerHTML = `
      <span class="alarm-item">${item.time}</span>
      <span>${item.name}</span>
      <span class="secondary-content">
        <div class="switch">
          <label>
            <input type="checkbox" ${item.enabled ? 'checked' : ''} />
            <span class="lever"></span>
          </label>
        </div>
      </span>
    `;
    collection.appendChild(element);
  });
});

store.load();

function clearSelection() {
  const alarmItems = Array.from(
    document.querySelectorAll('#alarm-list .collection .collection-item'),
  );
  alarmItems.forEach(item => item.classList.remove('active'));
}

function selectAll() {
  const alarmItems = Array.from(
    document.querySelectorAll('#alarm-list .collection .collection-item'),
  );
  alarmItems.forEach(item => item.classList.add('active'));
}

function toggleSwitch(e) {
  if (e.target.tagName.toLowerCase() !== 'input') return;
  const { id } = e.target.closest('.collection-item').dataset;
  const { checked } = e.target;
  store.update(
    id,
    {
      enabled: checked,
    },
    false,
  );
}

function selectItem(e) {
  const isSwitch = e.target.getAttribute('type') === 'checkbox'
    || e.target.classList.contains('lever');
  if (isSwitch) {
    toggleSwitch(e);
    return;
  }

  const item = e.target.closest('.collection-item');
  if (!e.ctrlKey) clearSelection();
  item.classList.add('active');

  e.preventDefault();
  e.stopPropagation();
}

function moveSelected(direction) {
  const alarmItems = document.querySelector(
    '#alarm-list .collection .collection-item',
  );
  if (!alarmItems) return;

  const alarmItemSelected = document.querySelector(
    '#alarm-list .collection .collection-item.active',
  );

  if (!alarmItemSelected) {
    const nextItemSelected = document.querySelector(
      `#alarm-list .collection .collection-item:${
        direction === 'up' ? 'last-child' : 'first-child'
      }`,
    );
    nextItemSelected.classList.add('active');
    return;
  }

  const nextItemSelected = direction === 'up'
    ? alarmItemSelected.previousElementSibling
    : alarmItemSelected.nextElementSibling;

  if (!nextItemSelected) return;

  clearSelection();
  nextItemSelected.classList.add('active');
}

function gotoPage(page) {
  currentPage = page;
  switch (page) {
    case 'list':
      newEditAlarm.classList.add('hide');
      alarmList.classList.remove('hide');
      break;
    case 'add-edit':
      alarmList.classList.add('hide');
      newEditAlarm.classList.remove('hide');
      break;
    default:
  }
}

function newAlarm() {
  newEditAlarm.querySelector('h4').textContent = 'Add alarm';
  newEditAlarmSave.setAttribute('data-mode', 'add');

  alarmName.value = 'New Alarm';
  alarmTime.value = store.getCurrentTime(60000);

  alarmName.nextElementSibling.classList.add('active');
  alarmTime.nextElementSibling.classList.add('active');

  alarmName.classList.remove('invalid');
  alarmTime.classList.remove('invalid');

  setImmediate(() => alarmName.focus());

  gotoPage('add-edit');
}

function saveAlarm() {
  let selectedID;

  const { mode, id } = newEditAlarmSave.dataset;

  switch (mode) {
    case 'add':
      selectedID = store.add(alarmName.value, alarmTime.value);
      break;
    case 'edit':
      store.update(id, {
        name: alarmName.value,
        time: alarmTime.value,
      });
      selectedID = id;
      break;
    default:
  }

  alarmName.value = '';
  alarmTime.value = '';

  setImmediate(() => {
    const selectedAlarmItem = document.querySelector(
      `.collection-item[data-id="${selectedID}"]`,
    );
    selectedAlarmItem.classList.add('active');
  });

  gotoPage('list');
}

function editAlarm(id) {
  newEditAlarm.querySelector('h4').textContent = 'Edit alarm';
  newEditAlarmSave.setAttribute('data-mode', 'edit');
  newEditAlarmSave.setAttribute('data-id', id);

  const data = store.get(id);
  alarmName.value = data.name;
  alarmTime.value = data.time;

  alarmName.nextElementSibling.classList.add('active');
  alarmTime.nextElementSibling.classList.add('active');

  alarmName.classList.remove('invalid');
  alarmTime.classList.remove('invalid');

  setImmediate(() => alarmName.focus());

  gotoPage('add-edit');
}

function deleteSelected() {
  Array.from(
    document.querySelectorAll(
      '#alarm-list .collection .collection-item.active',
    ),
  )
    .map(element => element.dataset.id)
    .forEach(id => store.remove(id));
}

document.addEventListener('keydown', (e) => {
  if (currentPage !== 'list') return;
  if (e.ctrlKey && e.key === 'a') {
    selectAll();
  } else if (e.key === 'ArrowUp') {
    moveSelected('up');
  } else if (e.key === 'ArrowDown') {
    moveSelected('down');
  } else if (e.key === 'Enter') {
    const selectedItem = document.querySelector(
      '#alarm-list .collection .collection-item.active',
    );
    if (!selectedItem) return;
    const { id } = selectedItem.dataset;
    editAlarm(id);
  } else if (e.key === 'Delete') {
    deleteSelected();
  } else if (e.ctrlKey && e.key === 'n') {
    newAlarm();
  }
});

newEditAlarmCancel.addEventListener('click', (e) => {
  e.preventDefault();
  gotoPage('list');
});

document.body.addEventListener('click', (e) => {
  if (currentPage !== 'list') return;
  if (e.target === e.currentTarget) {
    clearSelection();
  }
});

newEditAlarm.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  saveAlarm();
});

newEditAlarm.querySelector('form').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    gotoPage('list');
  }
});

document
  .querySelector('#alarm-list .collection')
  .addEventListener('click', (e) => {
    selectItem(e);
  });

document
  .querySelector('#alarm-list .collection')
  .addEventListener('dblclick', (e) => {
    const { id } = e.target.closest('.collection-item').dataset;
    editAlarm(id);
  });

btnAddAlarm.addEventListener('click', () => {
  newAlarm();
});
