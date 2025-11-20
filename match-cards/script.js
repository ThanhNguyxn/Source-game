const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 500;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let timeLeft = 60;
let matches = 0;

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];
let cards = [];
let selectedCards = [];

function initCards() {
    cards = [];
    const allCards = [];

    RANKS.forEach(rank => {
        SUITS.forEach(suit => {
            allCards.push({ rank, suit, color: (suit === '♥' || suit === '♦') ? '#ff0000' : '#000' });
        });
    });

    // Shuffle and pick 21 cards
    allCards.sort(() => Math.random() - 0.5);
    cards = allCards.slice(0, 21).map((card, i) => ({
        ...card,
        x: 50 + (i % 7) * 90,
        y: 50 + Math.floor(i / 7) * 130,
        width: 70,
        height: 100,
        selected: false,
        matched: false
    }));
}

function drawCard(card) {
    if (card.matched) return;

    ctx.fillStyle = card.selected ? '#ffd700' : '#fff';
    ctx.fillRect(card.x, card.y, card.width, card.height);
    ctx.strokeStyle = card.selected ? '#ff0000' : '#000';
    ctx.lineWidth = card.selected ? 3 : 2;
    ctx.strokeRect(card.x, card.y, card.width, card.height);

    ctx.fillStyle = card.color;
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(card.rank, card.x + card.width / 2, card.y + 40);
    ctx.font = '40px Arial';
    ctx.fillText(card.suit, card.x + card.width / 2, card.y + 80);
}

function draw() {
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    cards.forEach(card => drawCard(card));
}

function checkMatch() {
    if (selectedCards.length === 3) {
        const ranks = selectedCards.map(c => c.rank);
        if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
            selectedCards.forEach(c => c.matched = true);
            score += 100;
            matches++;
            updateDisplay();
        }
        selectedCards.forEach(c => c.selected = false);
        selectedCards = [];
    }
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    cards.forEach(card => {
        if (card.matched) return;
        if (x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) {
            if (card.selected) {
                card.selected = false;
                selectedCards = selectedCards.filter(c => c !== card);
            } else if (selectedCards.length < 3) {
                card.selected = true;
                selectedCards.push(card);
                checkMatch();
            }
        }
    });
    draw();
});

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('matches').textContent = matches;
}

function gameLoop() {
    if (gameRunning && !paused) {
        draw();
    }
    requestAnimationFrame(gameLoop);
}

let gameTimer;
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;

        score = 0;
        matches = 0;
        timeLeft = 60;
        initCards();
        updateDisplay();
        gameLoop();

        gameTimer = setInterval(() => {
            if (gameRunning && !paused) {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    gameRunning = false;
                    clearInterval(gameTimer);
                    document.getElementById('finalScore').textContent = score;
                    document.getElementById('finalMatches').textContent = matches;
                    document.getElementById('gameOver').classList.remove('hidden');
                }
            }
        }, 1000);
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    matches = 0;
    timeLeft = 60;
    gameRunning = true;
    paused = false;
    selectedCards = [];
    initCards();
    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (gameRunning && !paused) {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                gameRunning = false;
                clearInterval(gameTimer);
                document.getElementById('finalScore').textContent = score;
                document.getElementById('finalMatches').textContent = matches;
                document.getElementById('gameOver').classList.remove('hidden');
            }
        }
    }, 1000);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

updateDisplay();

