'use strict';

let grid = document.querySelector('#grid');
let worldList = [
  'patio',
  'river',
  'piano',
  'champ',
  'horse',
];
let randomIndex = Math.floor(Math.random() * worldList.length);
let secret = worldList[randomIndex];
let attempts = [];
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
    drawAttempt(row, attempt)
    row = row.nextSibling;
  }
  drawAttempt(row, currentAttempt);
}

function drawAttempt(row, attempt) {
  for (let i = 0; i < 5; i++) {
    let cell = row.children[i];
    cell.innerHTML = attempt[i] || '&nbsp;';
    cell.style.backgroundColor = getBgColor(attempt, i);
  }
}

function getBgColor(attempt, i) {
  let correctLetter = secret[i];
  let attemptLetter = attempt[i];

  if (!attempt || secret.indexOf(attemptLetter) === -1) return '#939598';
  if (correctLetter === attemptLetter) return '#538d4e';

  return '#b59f3b';
}

function handleKeyDown(e) {
  let key= e.key.toLowerCase();

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
  } else if (/[a-z]/.test(key)) {
    if (currentAttempt.length < 5) {
      currentAttempt += key;
    }
  }

  updateGrid();
}

buildGrid();
window.addEventListener('keydown', handleKeyDown);
