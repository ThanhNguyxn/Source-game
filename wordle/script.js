const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const WORDS = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
    'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AVOID', 'AWARD',
    'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BASIS', 'BEACH', 'BEGAN', 'BEGIN', 'BEING',
    'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLIND', 'BLOCK', 'BLOOD', 'BOARD',
    'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING',
    'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH',
    'CAUSE', 'CHAIN', 'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD',
    'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE',
    'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRACK', 'CRAFT', 'CRASH', 'CRAZY',
    'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CYCLE', 'DAILY', 'DANCE', 'DATED',
    'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA',
    'DRANK', 'DRAWN', 'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER',
    'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL',
    'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER',
    'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR',
    'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD',
    'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING',
    'GRACE', 'GRADE', 'GRAND', 'GRANT', 'GRASS', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN',
    'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY',
    'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE',
    'JAPAN', 'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER',
    'LAUGH', 'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEMON', 'LEVEL', 'LEWIS',
    'LIGHT', 'LIMIT', 'LINKS', 'LIVES', 'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH',
    'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT',
    'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL',
    'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT',
    'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER',
    'OTHER', 'OUGHT', 'PAINT', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE',
    'PHOTO', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT',
    'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF',
    'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID',
    'RATIO', 'REACH', 'READY', 'REFER', 'RIGHT', 'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN',
    'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE',
    'SERVE', 'SEVEN', 'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT',
    'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY',
    'SIZED', 'SKILL', 'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID',
    'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT',
    'SPLIT', 'SPOKE', 'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM',
    'STEEL', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP',
    'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN',
    'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME',
    'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW',
    'TIGHT', 'TIMES', 'TITLE', 'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK',
    'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIED', 'TRIES', 'TROOP', 'TRUCK', 'TRULY',
    'TRUST', 'TRUTH', 'TWICE', 'UNDER', 'UNDUE', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'URBAN',
    'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE',
    'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE',
    'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE',
    'WRONG', 'WROTE', 'YOUNG', 'YOUTH'
];

let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0
};

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('newGameBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeModal = document.querySelector('.close');

// Initialize game
function init() {
    loadStats();
    createBoard();
    createKeyboard();
    newGame();
    updateStatsDisplay();

    newGameBtn.addEventListener('click', newGame);
    helpBtn.addEventListener('click', () => helpModal.style.display = 'block');
    closeModal.addEventListener('click', () => helpModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.style.display = 'none';
    });

    document.addEventListener('keydown', handleKeyPress);
}

function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

function createKeyboard() {
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    keyboard.innerHTML = '';
    keys.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.forEach(key => {
            const keyBtn = document.createElement('button');
            keyBtn.classList.add('key');
            if (key === 'ENTER' || key === 'BACK') {
                keyBtn.classList.add('large');
            }
            keyBtn.textContent = key;
            keyBtn.id = `key-${key}`;
            keyBtn.addEventListener('click', () => handleKeyClick(key));
            rowDiv.appendChild(keyBtn);
        });
        keyboard.appendChild(rowDiv);
    });
}

function newGame() {
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    currentRow = 0;
    currentTile = 0;
    gameOver = false;
    message.textContent = '';
    message.className = 'message';

    // Clear board
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${i}-${j}`);
            tile.textContent = '';
            tile.className = 'tile';
        }
    }

    // Clear keyboard colors
    document.querySelectorAll('.key').forEach(key => {
        key.className = 'key';
        if (key.textContent === 'ENTER' || key.textContent === 'BACK') {
            key.classList.add('large');
        }
    });
}

function handleKeyPress(e) {
    if (gameOver) return;

    const key = e.key.toUpperCase();
    if (key === 'ENTER') {
        handleKeyClick('ENTER');
    } else if (key === 'BACKSPACE') {
        handleKeyClick('BACK');
    } else if (/^[A-Z]$/.test(key)) {
        handleKeyClick(key);
    }
}

function handleKeyClick(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACK') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentTile < WORD_LENGTH) {
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentTile++;
    }
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = '';
        tile.classList.remove('filled');
    }
}

function submitGuess() {
    if (currentTile !== WORD_LENGTH) {
        showMessage('Not enough letters', 'error');
        return;
    }

    const guess = getGuess();
    if (!WORDS.includes(guess)) {
        showMessage('Not in word list', 'error');
        return;
    }

    checkGuess(guess);
    currentRow++;
    currentTile = 0;

    if (guess === targetWord) {
        gameOver = true;
        stats.gamesPlayed++;
        stats.gamesWon++;
        stats.currentStreak++;
        saveStats();
        updateStatsDisplay();
        setTimeout(() => {
            showMessage(`Excellent! The word was ${targetWord}`, 'success');
        }, 1500);
    } else if (currentRow === MAX_GUESSES) {
        gameOver = true;
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        saveStats();
        updateStatsDisplay();
        setTimeout(() => {
            showMessage(`Game Over! The word was ${targetWord}`, 'error');
        }, 1500);
    }
}

function getGuess() {
    let guess = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        guess += tile.textContent;
    }
    return guess;
}

function checkGuess(guess) {
    const letterCount = {};
    for (let letter of targetWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    // First pass: mark correct positions
    const result = Array(WORD_LENGTH).fill('absent');
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === targetWord[i]) {
            result[i] = 'correct';
            letterCount[guess[i]]--;
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === 'absent' && letterCount[guess[i]] > 0) {
            result[i] = 'present';
            letterCount[guess[i]]--;
        }
    }

    // Apply colors with animation
    for (let i = 0; i < WORD_LENGTH; i++) {
        setTimeout(() => {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            tile.classList.add(result[i]);
            updateKeyboardColor(guess[i], result[i]);
        }, i * 300);
    }
}

function updateKeyboardColor(letter, status) {
    const key = document.getElementById(`key-${letter}`);
    if (!key) return;

    const currentStatus = key.classList.contains('correct') ? 'correct' :
                         key.classList.contains('present') ? 'present' : 'absent';

    if (status === 'correct' || (status === 'present' && currentStatus !== 'correct')) {
        key.classList.remove('absent', 'present', 'correct');
        key.classList.add(status);
    } else if (status === 'absent' && currentStatus === 'absent') {
        key.classList.add('absent');
    }
}

function showMessage(text, type = '') {
    message.textContent = text;
    message.className = `message ${type}`;
    setTimeout(() => {
        message.textContent = '';
        message.className = 'message';
    }, 2000);
}

function loadStats() {
    const saved = localStorage.getItem('wordleStats');
    if (saved) {
        stats = JSON.parse(saved);
    }
}

function saveStats() {
    localStorage.setItem('wordleStats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
    const winRate = stats.gamesPlayed > 0 ? 
        Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
    document.getElementById('streak').textContent = stats.currentStreak;
}

// Start game
init();
