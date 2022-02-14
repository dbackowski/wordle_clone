'use strict';

const grid = document.querySelector('#grid');
const keyboard = document.querySelector('#keyboard');
const LIGHT_GREY = '#d3d6da';
const GREY = '#939598';
const GREEN = '#538d4e';
const YELLOW = '#b59f3b';
const worldList = [
  'patio',
  'river',
  'piano',
  'champ',
  'horse',
];
const randomIndex = Math.floor(Math.random() * worldList.length);
const secret = worldList[randomIndex];
const attempts = [];
let currentAttempt = '';

function buildGrid() {
  for (let i = 0; i < 6; i++) {
    let row = document.createElement('div');
    for (let j = 0; j < 5; j++) {
      let cell = document.createElement('div')
      cell.className = 'cell'
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function updateGrid() {
  let row = grid.firstChild;
  for (let attempt of attempts) {
    drawAttempt(row, attempt, false)
    row = row.nextSibling;
  }
  drawAttempt(row, currentAttempt, true);
}

function drawAttempt(row, attempt, isCurrent) {
  for (let i = 0; i < 5; i++) {
    let cell = row.children[i];
    cell.innerHTML = attempt[i] || '&nbsp;';
    if (!isCurrent) cell.style.backgroundColor = getBgColor(attempt, i);
  }
}

function getBgColor(attempt, i) {
  let correctLetter = secret[i];
  let attemptLetter = attempt[i];

  if (!attempt || secret.indexOf(attemptLetter) === -1) return GREY;
  if (correctLetter === attemptLetter) return GREEN;

  return YELLOW;
}

function handleKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  let key = e.key.toLowerCase();

  if (key === "enter") {
    if (currentAttempt.length < 5) return
    if (!worldList.includes(currentAttempt)) {
      alert('Not a valid word');
      return;
    }
    attempts.push(currentAttempt);
    currentAttempt = '';
  } else if (key === 'backspace') {
    currentAttempt = currentAttempt.slice(0, currentAttempt.length - 1);
  } else if (/^[a-z]$/.test(key)) {
    if (currentAttempt.length < 5) {
      currentAttempt += key;
    }
  }

  updateGrid();
}

function buildKeyboard() {
  buildKeyboardRow('qwertyuiop');
  buildKeyboardRow('asdfghjkl');
  buildKeyboardRow('zxcvbnm', true);
}

function createButton(letter) {
  const button = document.createElement('button');
  button.className = 'button';
  button.textContent = letter;
  button.style.backgroundColor = LIGHT_GREY;
  button.onclick = function() {
    button.blur();
    self.dispatchEvent(new KeyboardEvent('keydown',  { 'key': letter }));
  };
  return button;
}

function buildKeyboardRow(letters, addSpecials=false) {
  let row = document.createElement('div');
  if (addSpecials) row.appendChild(createButton("Enter"));

  for (let letter of letters) {
    row.appendChild(createButton(letter));
  }

  if (addSpecials) row.appendChild(createButton("Backspace"));
  keyboard.appendChild(row)
}

buildGrid();
buildKeyboard();
window.addEventListener('keydown', handleKeyDown);
