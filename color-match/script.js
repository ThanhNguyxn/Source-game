let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let timeLeft = 30;
let streak = 0;
let bestStreak = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let questionStartTime = 0;

const colors = [
    { name: 'RED', hex: '#ff0000' },
    { name: 'BLUE', hex: '#0000ff' },
    { name: 'GREEN', hex: '#00ff00' },
    { name: 'YELLOW', hex: '#ffff00' },
    { name: 'PURPLE', hex: '#9900ff' },
    { name: 'ORANGE', hex: '#ff6600' }
];

let currentCorrectColor = null;
let timer = null;

function generateQuestion() {
    if (!gameRunning || paused) return;

    // Pick random color name to display
    const textColor = colors[Math.floor(Math.random() * colors.length)];

    // Pick random color for the text itself
    const displayColor = colors[Math.floor(Math.random() * colors.length)];

    // The answer is the color NAME (not the display color)
    currentCorrectColor = textColor.name;

    const questionText = document.getElementById('questionText');
    questionText.textContent = textColor.name;
    questionText.style.color = displayColor.hex;

    // Generate 4 random circles
    generateCircles();

    questionStartTime = Date.now();
    totalQuestions++;
}

function generateCircles() {
    const container = document.getElementById('circlesContainer');
    container.innerHTML = '';

    // Shuffle colors and pick 4
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    const circleColors = shuffled.slice(0, 4);

    // Make sure correct answer is included
    if (!circleColors.find(c => c.name === currentCorrectColor)) {
        circleColors[Math.floor(Math.random() * 4)] = colors.find(c => c.name === currentCorrectColor);
    }

    // Shuffle again
    circleColors.sort(() => Math.random() - 0.5);

    circleColors.forEach(color => {
        const circle = document.createElement('div');
        circle.className = 'color-circle';
        circle.style.backgroundColor = color.hex;
        circle.dataset.color = color.name;
        circle.addEventListener('click', () => handleAnswer(color.name, circle));
        container.appendChild(circle);
    });
}

function handleAnswer(selectedColor, circleElement) {
    if (!gameRunning || paused) return;

    const isCorrect = selectedColor === currentCorrectColor;
    const timeTaken = (Date.now() - questionStartTime) / 1000; // seconds

    if (isCorrect) {
        correctAnswers++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);

        // Score based on speed and streak
        const speedBonus = Math.max(0, Math.floor((3 - timeTaken) * 10));
        const streakMultiplier = Math.min(streak, 10);
        const points = (10 + speedBonus) * streakMultiplier;
        score += points;

        circleElement.classList.add('correct');

        setTimeout(() => {
            generateQuestion();
        }, 300);
    } else {
        streak = 0;
        circleElement.classList.add('wrong');

        // Still generate new question
        setTimeout(() => {
            generateQuestion();
        }, 500);
    }

    updateDisplay();
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('streak').textContent = streak;
}

function startTimer() {
    timer = setInterval(() => {
        if (gameRunning && !paused) {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

function gameOver() {
    gameRunning = false;
    clearInterval(timer);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCorrect').textContent = correctAnswers;
    document.getElementById('finalTotal').textContent = totalQuestions;
    document.getElementById('finalStreak').textContent = bestStreak;
    document.getElementById('gameOver').classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('gameArea').classList.remove('hidden');
        document.getElementById('pauseBtn').disabled = false;

        score = 0;
        timeLeft = 30;
        streak = 0;
        bestStreak = 0;
        correctAnswers = 0;
        totalQuestions = 0;

        updateDisplay();
        generateQuestion();
        startTimer();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    timeLeft = 30;
    streak = 0;
    bestStreak = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    gameRunning = true;
    paused = false;

    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
    generateQuestion();
    startTimer();
});

updateDisplay();

