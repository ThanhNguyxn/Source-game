const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const bestScoreElement = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const holes = document.querySelectorAll('.hole');

let score = 0;
let timeLeft = 30;
let bestScore = localStorage.getItem('whackMoleBestScore') || 0;
let gameActive = false;
let moleTimer;
let countdownTimer;

bestScoreElement.textContent = bestScore;

function startGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    startBtn.disabled = true;
    
    countdownTimer = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    popUpMole();
}

function popUpMole() {
    if (!gameActive) return;
    
    holes.forEach(hole => hole.classList.remove('up'));
    
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    randomHole.classList.add('up');
    
    const time = Math.random() * 1000 + 500;
    
    moleTimer = setTimeout(() => {
        randomHole.classList.remove('up');
        if (gameActive) {
            setTimeout(popUpMole, 300);
        }
    }, time);
}

function whackMole(e) {
    if (!gameActive) return;
    if (!e.target.classList.contains('up')) return;
    
    score++;
    scoreElement.textContent = score;
    e.target.classList.remove('up');
}

function endGame() {
    gameActive = false;
    clearTimeout(moleTimer);
    clearInterval(countdownTimer);
    startBtn.disabled = false;
    
    holes.forEach(hole => hole.classList.remove('up'));
    
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('whackMoleBestScore', bestScore);
        alert(`🎉 New Best Score: ${bestScore}!`);
    } else {
        alert(`Game Over! Final Score: ${score}`);
    }
}

holes.forEach(hole => {
    hole.addEventListener('click', whackMole);
});

startBtn.addEventListener('click', startGame);
