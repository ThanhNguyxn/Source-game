const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

let bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    gravity: 0.5,
    velocity: 0,
    jump: -8
};

let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
let gameLoop;
let isGameRunning = false;
let frameCount = 0;

highScoreElement.textContent = highScore;

function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height / 2);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height / 2 - 5);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height / 2 + 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
        
        ctx.strokeStyle = '#1a6b1a';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    if (bird.y + bird.height > canvas.height - 100) {
        bird.y = canvas.height - 100 - bird.height;
        gameOver();
    }
    
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    if (frameCount % 100 === 0) {
        const gap = 150;
        const minHeight = 50;
        const maxHeight = canvas.height - gap - 150;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            width: 50,
            top: topHeight,
            bottom: canvas.height - topHeight - gap - 100,
            passed: false
        });
    }
    
    pipes.forEach((pipe, index) => {
        pipe.x -= 3;
        
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
        
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('flappyBirdHighScore', highScore);
            }
        }
        
        if (checkCollision(pipe)) {
            gameOver();
        }
    });
}

function checkCollision(pipe) {
    if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
        if (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom - 100) {
            return true;
        }
    }
    return false;
}

function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 100);
    
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
}

function gameLoop() {
    drawBackground();
    
    updateBird();
    updatePipes();
    
    drawPipes();
    drawBird();
    
    frameCount++;
}

function startGame() {
    if (isGameRunning) return;
    
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    scoreElement.textContent = score;
    
    isGameRunning = true;
    startBtn.disabled = true;
    
    gameLoop = setInterval(() => {
        if (isGameRunning) {
            gameLoop();
        }
    }, 1000 / 60);
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.disabled = false;
}

function resetGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    scoreElement.textContent = score;
    startBtn.disabled = false;
    drawBackground();
    drawBird();
}

function flap() {
    if (isGameRunning) {
        bird.velocity = bird.jump;
    }
}

canvas.addEventListener('click', flap);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        flap();
    }
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

drawBackground();
drawBird();
