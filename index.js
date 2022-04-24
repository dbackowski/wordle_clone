'use strict';

const grid = document.querySelector('#grid');
const keyboard = document.querySelector('#keyboard');
const LIGHT_GREY = '#d3d6da';
const GREY = '#939598';
const GREEN = '#538d4e';
const YELLOW = '#b59f3b';
const MAX_ATTEMPTS = 6;
const randomIndex = Math.floor(Math.random() * worldList.length);
let secret = worldList[randomIndex];
let attempts = [];
let currentAttempt = '';
let guessed = false;

function buildGrid() {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    let row = document.createElement('div');
    for (let j = 0; j < 5; j++) {
      let cell = document.createElement('div')
      cell.className = 'cell'
      let front = document.createElement('div')
      front.className = 'front'
      let back = document.createElement('div')
      back.className = 'back'

      cell.appendChild(front)
      cell.appendChild(back)
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

  if (row) {
    drawAttempt(row, currentAttempt, true);
  }
}

function drawAttempt(row, attempt, isCurrent) {
  for (let i = 0; i < 5; i++) {
    let cell = row.children[i]
    let front = cell.querySelector('.front');
    let back = cell.querySelector('.back');
    front.innerHTML = attempt[i] || '&nbsp;';
    back.innerHTML = attempt[i] || '&nbsp;';
    if (!isCurrent) {
      back.style.backgroundColor = getBgColor(attempt, i);
      back.style.borderColor = getBgColor(attempt, i);
      if (!cell.classList.contains('flip')) {
        setTimeout(function() {
          cell.classList.toggle('flip')
        }, 200 * i)
      }
    } else {
      if (attempt[i]) {
        back.style.borderColor = LIGHT_GREY;
      } else {
        back.style.borderColor = GREY;
      }
    }
  }
}

function animateLetter(index) {
  const rowIndex = attempts.length;
  const row = grid.children[rowIndex];
  const cell = row.children[index];

  cell.classList.remove('run-letter-press-animation');
  cell.classList.remove('run-invalid-word-animation');

  void cell.offsetWidth; // needed in order to restart the animation

  cell.classList.add('run-letter-press-animation');
}

function animateWrongWord() {
  const rowIndex = attempts.length;
  const row = grid.children[rowIndex];
  const cells = [...row.children];

  cells.forEach(function(cell) {
    cell.classList.remove('run-letter-press-animation');
    cell.classList.remove('run-invalid-word-animation');

    void cell.offsetWidth; // needed in order to restart the animation

    cell.classList.add('run-invalid-word-animation');
  });
}

function getBgColor(attempt, i) {
  let correctLetter = secret[i];
  let attemptLetter = attempt[i];

  if (!attempt || secret.indexOf(attemptLetter) === -1) return GREY;
  if (correctLetter === attemptLetter) return GREEN;

  return YELLOW;
}

function handleKeyDown(e) {
  if (attempts.length === MAX_ATTEMPTS || guessed) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  let key = e.key.toLowerCase();

  if (key === "enter") {
    if (currentAttempt.length < 5) return
    if (!worldList.includes(currentAttempt)) {
      showAlert('Not a valid word');
      animateWrongWord();
      return;
    }
    attempts.push(currentAttempt);
    if (currentAttempt === secret) {
      guessed = true;
      showAlert('success');
    }
    currentAttempt = '';
    updateKeyboard();
    saveProgress();
    if (attempts.length === MAX_ATTEMPTS && !guessed) {
      showAlert(secret);
    }
  } else if (key === 'backspace') {
    currentAttempt = currentAttempt.slice(0, currentAttempt.length - 1);
  } else if (/^[a-z]$/.test(key)) {
    if (currentAttempt.length < 5) {
      currentAttempt += key;
      animateLetter(currentAttempt.length - 1);
    }
  }

  updateGrid();
}

function buildKeyboard() {
  buildKeyboardRow('qwertyuiop');
  buildKeyboardRow('asdfghjkl');
  buildKeyboardRow('zxcvbnm', true);
}

function createButton(letter, icon) {
  const button = document.createElement('button');
  button.className = 'button';
  if (!icon) {
    button.textContent = letter;
  }
  button.style.backgroundColor = LIGHT_GREY;

  if (icon) {
    const icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.textContent = 'backspace';
    icon.style.fontSize = '16px';
    button.appendChild(icon);
  }

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

  if (addSpecials) row.appendChild(createButton("Backspace", 'backspace'));
  keyboard.appendChild(row)
}

function updateKeyboard() {
  const letterColors = new Map();

  for (let attempt of attempts) {
    for (let i = 0; i < attempt.length; i++) {
      const currentColor = letterColors.get(attempt[i]);
      const nextColor = getBgColor(attempt, i);
      letterColors.set(attempt[i], getLetterColor(currentColor, nextColor));
    }
  }

  document.querySelectorAll('button').forEach(function(elem) {
    const letter = elem.innerText.toLocaleLowerCase();
    const color = letterColors.get(letter);

    if (color) elem.style.backgroundColor = color;
  });
}

function showAlert(text) {
  const div = document.createElement('div');
  div.className = 'alert';
  div.innerHTML = text;

  document.querySelector('body').appendChild(div);

  setTimeout(function() {
    div.style.display = "none";
    div.remove();
  }, 1000);
}

function getLetterColor(currentColor, nextColor) {
  if (!currentColor) return nextColor;
  if (currentColor === GREEN || nextColor === GREEN) return GREEN;
  if (currentColor === YELLOW && nextColor === GREY) return YELLOW;

  return nextColor;
}

function loadProgress() {
  let gameData = JSON.parse(localStorage.getItem('gameData'));

  if (gameData != null) {
    attempts = gameData.attempts;
    secret = gameData.secret;
    guessed = gameData.guessed;
  }

  updateGrid();
  updateKeyboard();
}

function saveProgress() {
  const gameData = JSON.stringify({
    secret,
    attempts,
    guessed,
  });

  localStorage.setItem('gameData', gameData);
}

buildGrid();
buildKeyboard();
loadProgress();
window.addEventListener('keydown', handleKeyDown);
