const gameBoard = document.getElementById('gameBoard');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const bestTimeElement = document.getElementById('bestTime');
const newGameBtn = document.getElementById('newGameBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const winMessage = document.getElementById('winMessage');
const winStats = document.getElementById('winStats');
const playAgainBtn = document.getElementById('playAgainBtn');

const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎷'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timeInSeconds = 0;
let timerInterval;
let isGameActive = false;

const bestTime = localStorage.getItem('memoryGameBestTime');
if (bestTime) {
    bestTimeElement.textContent = formatTime(parseInt(bestTime));
}

function initGame() {
    cards = [...emojis, ...emojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            emoji: emoji,
            flipped: false,
            matched: false
        }));
    
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timeInSeconds = 0;
    isGameActive = false;
    
    movesElement.textContent = moves;
    timeElement.textContent = '0:00';
    
    clearInterval(timerInterval);
    winMessage.classList.remove('show');
    
    renderBoard();
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    cards.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '?';
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = card.emoji;
        
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        cardElement.addEventListener('click', () => flipCard(card, cardElement));
        
        gameBoard.appendChild(cardElement);
    });
}

function flipCard(card, cardElement) {
    if (!isGameActive) {
        isGameActive = true;
        startTimer();
    }
    
    if (flippedCards.length >= 2 || card.flipped || card.matched) {
        return;
    }
    
    card.flipped = true;
    cardElement.classList.add('flipped');
    flippedCards.push({ card, element: cardElement });
    
    if (flippedCards.length === 2) {
        moves++;
        movesElement.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [first, second] = flippedCards;
    
    if (first.card.emoji === second.card.emoji) {
        first.card.matched = true;
        second.card.matched = true;
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        matchedPairs++;
        
        flippedCards = [];
        
        if (matchedPairs === emojis.length) {
            setTimeout(() => endGame(), 500);
        }
    } else {
        setTimeout(() => {
            first.card.flipped = false;
            second.card.flipped = false;
            first.element.classList.remove('flipped');
            second.element.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeInSeconds++;
        timeElement.textContent = formatTime(timeInSeconds);
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function endGame() {
    clearInterval(timerInterval);
    isGameActive = false;
    
    const currentBestTime = localStorage.getItem('memoryGameBestTime');
    if (!currentBestTime || timeInSeconds < parseInt(currentBestTime)) {
        localStorage.setItem('memoryGameBestTime', timeInSeconds);
        bestTimeElement.textContent = formatTime(timeInSeconds);
        winStats.innerHTML = `🏆 New Best Time!<br>Time: ${formatTime(timeInSeconds)}<br>Moves: ${moves}`;
    } else {
        winStats.innerHTML = `Time: ${formatTime(timeInSeconds)}<br>Moves: ${moves}`;
    }
    
    winMessage.classList.add('show');
}

function resetStats() {
    if (confirm('Are you sure you want to reset your best time?')) {
        localStorage.removeItem('memoryGameBestTime');
        bestTimeElement.textContent = '--';
    }
}

newGameBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);
resetStatsBtn.addEventListener('click', resetStats);

initGame();
