const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const timeLeftElement = document.getElementById('timeLeft');
const livesElement = document.getElementById('lives');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const pauseBtn = document.getElementById('pauseBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

let score = 0;
let timeLeft = 60;
let lives = 3;
let difficulty = 'easy';
let isPaused = false;
let gameLoop = null;
let timerInterval = null;
let moleTimeout = null;
let hasSpecialMoles = false;

const difficultySettings = {
    easy: { minTime: 800, maxTime: 1500, speed: 1200, special: false, name: 'Easy' },
    medium: { minTime: 600, maxTime: 1200, speed: 900, special: false, name: 'Medium' },
    hard: { minTime: 400, maxTime: 800, speed: 600, special: false, name: 'Hard' },
    extreme: { minTime: 300, maxTime: 700, speed: 500, special: true, name: 'Extreme' }
};

// Start game
function startGame(diff) {
    difficulty = diff;
    const settings = difficultySettings[diff];
    hasSpecialMoles = settings.special;
    
    modeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    difficultyDisplay.textContent = settings.name;
    
    initGame();
    startTimer();
    popMole();
}

// Initialize game
function initGame() {
    score = 0;
    timeLeft = 60;
    lives = 3;
    isPaused = false;
    updateDisplay();
    
    // Clear all moles
    document.querySelectorAll('.mole').forEach(mole => mole.remove());
}

// Update display
function updateDisplay() {
    scoreElement.textContent = score;
    timeLeftElement.textContent = timeLeft;
    livesElement.textContent = lives;
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// Pop mole
function popMole() {
    if (timeLeft <= 0 || lives <= 0) return;
    
    const settings = difficultySettings[difficulty];
    const randomHole = Math.floor(Math.random() * 9);
    const hole = document.querySelector(`[data-hole="${randomHole}"]`);
    
    // Check if hole already has a mole
    if (hole.querySelector('.mole')) {
        popMole();
        return;
    }
    
    // Create mole
    const mole = document.createElement('div');
    
    // Determine mole type
    let moleType = 'normal';
    if (hasSpecialMoles) {
        const rand = Math.random();
        if (rand < 0.15) {
            moleType = 'bomb';
        } else if (rand < 0.25) {
            moleType = 'golden';
        }
    }
    
    mole.className = `mole ${moleType}`;
    
    if (moleType === 'bomb') {
        mole.textContent = '💣';
    } else if (moleType === 'golden') {
        mole.textContent = '🌟';
    } else {
        mole.textContent = '🦔';
    }
    
    mole.addEventListener('click', () => whackMole(mole, moleType));
    hole.appendChild(mole);
    
    // Animate mole up
    setTimeout(() => mole.classList.add('show'), 10);
    
    // Remove mole after time
    const showTime = settings.minTime + Math.random() * (settings.maxTime - settings.minTime);
    setTimeout(() => {
        if (mole.parentElement) {
            mole.classList.remove('show');
            setTimeout(() => mole.remove(), 300);
        }
    }, showTime);
    
    // Schedule next mole
    if (!isPaused && timeLeft > 0 && lives > 0) {
        moleTimeout = setTimeout(popMole, settings.speed);
    }
}

// Whack mole
function whackMole(mole, type) {
    if (!mole.classList.contains('show') || mole.classList.contains('whacked')) return;
    
    mole.classList.add('whacked');
    
    if (type === 'bomb') {
        // Hit bomb - lose life and points
        lives--;
        score = Math.max(0, score - 10);
        mole.style.background = 'red';
        if (lives <= 0) {
            endGame();
        }
    } else if (type === 'golden') {
        // Hit golden mole - bonus points
        score += 20;
        mole.style.background = 'gold';
    } else {
        // Normal mole
        score += 10;
        mole.style.background = 'lightgreen';
    }
    
    updateDisplay();
    
    setTimeout(() => {
        mole.classList.remove('show');
        setTimeout(() => mole.remove(), 300);
    }, 200);
}

// End game
function endGame() {
    clearInterval(timerInterval);
    clearTimeout(moleTimeout);
    
    let message = lives <= 0 ? 
        `Game Over! You ran out of lives!\nFinal Score: ${score}` :
        `Time's up!\nFinal Score: ${score}`;
    
    alert(message);
    changeMode();
}

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (!isPaused && timeLeft > 0 && lives > 0) {
        popMole();
    }
}

// Change mode
function changeMode() {
    clearInterval(timerInterval);
    clearTimeout(moleTimeout);
    gameArea.style.display = 'none';
    modeSelector.style.display = 'block';
    document.querySelectorAll('.mole').forEach(mole => mole.remove());
}

pauseBtn.addEventListener('click', togglePause);
changeModeBtn.addEventListener('click', changeMode);