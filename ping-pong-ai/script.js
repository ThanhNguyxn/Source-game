const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('playerScore');
const aiScoreElement = document.getElementById('aiScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const difficultyBtns = document.querySelectorAll('.diff-btn');

const paddleWidth = 15;
const paddleHeight = 100;
const ballSize = 12;

let difficulty = 'easy';
let aiSpeeds = {
    easy: 3,
    medium: 5,
    hard: 7,
    impossible: 10
};
let aiAccuracy = {
    easy: 0.7,
    medium: 0.85,
    hard: 0.95,
    impossible: 1.0
};

let player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 8
};

let ai = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: aiSpeeds[difficulty],
    accuracy: aiAccuracy[difficulty]
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    spinX: 0,
    spinY: 0
};

let playerScore = 0;
let aiScore = 0;
let gameLoop;
let isGameRunning = false;
const winningScore = 10;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add spin indicator
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size - 3, 0, Math.PI * 2);
    ctx.stroke();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 2, i, 4, 10, '#444');
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, '#4CAF50');
    drawRect(ai.x, ai.y, ai.width, ai.height, '#ff6b6b');
    drawBall(ball.x, ball.y, ball.size, '#fff');
    
    // Draw speed indicators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '14px Arial';
    ctx.fillText(`Speed: ${Math.round(Math.hypot(ball.dx, ball.dy))}`, 10, 20);
}

function update() {
    if (!isGameRunning) return;
    
    // AI Movement with difficulty
    const targetY = ball.y - ai.height / 2;
    const diff = targetY - ai.y;
    
    // Add randomness based on difficulty
    if (Math.random() > ai.accuracy) {
        // Miss intentionally on easier difficulties
        ai.y += (Math.random() - 0.5) * ai.speed * 2;
    } else {
        if (Math.abs(diff) > ai.speed) {
            ai.y += Math.sign(diff) * ai.speed;
        } else {
            ai.y = targetY;
        }
    }
    
    // Keep AI paddle in bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
    
    // Ball movement with spin
    ball.x += ball.dx + ball.spinX;
    ball.y += ball.dy + ball.spinY;
    
    // Ball collision with top and bottom
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.spinY = -ball.spinY * 0.8;
    }
    
    // Ball collision with paddles
    let paddle = (ball.x < canvas.width / 2) ? player : ai;
    
    if (ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height) {
        
        // Calculate spin based on where ball hits paddle
        let collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint = collidePoint / (paddle.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        
        // Add spin effect
        ball.spinY = collidePoint * 2;
        ball.spinX = direction * 0.5;
        
        // Increase speed
        ball.speed += 0.3;
        if (ball.speed > 12) ball.speed = 12;
    }
    
    // Score points
    if (ball.x - ball.size < 0) {
        aiScore++;
        aiScoreElement.textContent = aiScore;
        resetBall();
        checkWin();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        playerScoreElement.textContent = playerScore;
        resetBall();
        checkWin();
    }
    
    draw();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speed = 5;
    ball.spinX = 0;
    ball.spinY = 0;
}

function checkWin() {
    if (playerScore === winningScore || aiScore === winningScore) {
        endGame();
    }
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    
    if (playerScore === winningScore) {
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 30);
    } else {
        ctx.fillText('AI Wins!', canvas.width / 2, canvas.height / 2 - 30);
    }
    
    ctx.font = '24px Arial';
    ctx.fillText(`${playerScore} - ${aiScore}`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.disabled = false;
}

function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    startBtn.disabled = true;
    
    ai.speed = aiSpeeds[difficulty];
    ai.accuracy = aiAccuracy[difficulty];
    
    gameLoop = setInterval(update, 1000 / 60);
}

function resetGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    playerScore = 0;
    aiScore = 0;
    playerScoreElement.textContent = playerScore;
    aiScoreElement.textContent = aiScore;
    
    player.y = canvas.height / 2 - paddleHeight / 2;
    ai.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    
    startBtn.disabled = false;
    draw();
}

canvas.addEventListener('mousemove', (e) => {
    if (!isGameRunning) return;
    const rect = canvas.getBoundingClientRect();
    player.y = e.clientY - rect.top - player.height / 2;
    
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
    });
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

draw();
