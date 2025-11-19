const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const player1ScoreEl = document.getElementById('player1Score');
const player2ScoreEl = document.getElementById('player2Score');
const player2Label = document.getElementById('player2Label');
const player2Controls = document.getElementById('player2Controls');
const gameStatus = document.getElementById('gameStatus');
const newGameBtn = document.getElementById('newGameBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

let gameMode = 'pvp';
let gameRunning = false;
let gamePaused = false;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 5,
    speedY: 5,
    speed: 5
};

const paddle = {
    width: 10,
    height: 80,
    speed: 8
};

const player1 = {
    x: 10,
    y: canvas.height / 2 - paddle.height / 2,
    score: 0,
    upPressed: false,
    downPressed: false
};

const player2 = {
    x: canvas.width - 10 - paddle.width,
    y: canvas.height / 2 - paddle.height / 2,
    score: 0,
    upPressed: false,
    downPressed: false
};

// Start game with mode
function startGame(mode) {
    gameMode = mode;
    modeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    
    if (gameMode !== 'pvp') {
        player2Label.textContent = 'AI';
        player2Controls.style.display = 'none';
    } else {
        player2Label.textContent = 'Player 2';
        player2Controls.style.display = 'block';
    }
    
    resetGame();
    gameLoop();
}

function resetGame() {
    player1.score = 0;
    player2.score = 0;
    player1ScoreEl.textContent = 0;
    player2ScoreEl.textContent = 0;
    resetBall();
    gameRunning = false;
    gamePaused = false;
    gameStatus.textContent = 'Press Space to Start';
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.speedY = (Math.random() * 2 - 1) * ball.speed;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning) {
            gameRunning = true;
            gamePaused = false;
            gameStatus.textContent = '';
        } else {
            gamePaused = !gamePaused;
            gameStatus.textContent = gamePaused ? 'Paused' : '';
        }
    }
    
    // Player 1 controls
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        player1.upPressed = true;
    }
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault();
        player1.downPressed = true;
    }
    
    // Player 2 controls (only in PvP mode)
    if (gameMode === 'pvp') {
        if (e.key === 'ArrowUp') {
            player2.upPressed = true;
        }
        if (e.key === 'ArrowDown') {
            player2.downPressed = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        player1.upPressed = false;
    }
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        player1.downPressed = false;
    }
    
    if (gameMode === 'pvp') {
        if (e.key === 'ArrowUp') {
            player2.upPressed = false;
        }
        if (e.key === 'ArrowDown') {
            player2.downPressed = false;
        }
    }
});

// Update game state
function update() {
    if (!gameRunning || gamePaused) return;
    
    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball collision with top/bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
    }
    
    // Ball collision with paddles
    if (ball.x - ball.radius < player1.x + paddle.width &&
        ball.y > player1.y && ball.y < player1.y + paddle.height) {
        ball.speedX = Math.abs(ball.speedX) * 1.05;
        ball.speedY += (ball.y - (player1.y + paddle.height / 2)) * 0.1;
    }
    
    if (ball.x + ball.radius > player2.x &&
        ball.y > player2.y && ball.y < player2.y + paddle.height) {
        ball.speedX = -Math.abs(ball.speedX) * 1.05;
        ball.speedY += (ball.y - (player2.y + paddle.height / 2)) * 0.1;
    }
    
    // Score points
    if (ball.x < 0) {
        player2.score++;
        player2ScoreEl.textContent = player2.score;
        if (player2.score >= 5) {
            endGame('Player 2' + (gameMode !== 'pvp' ? ' (AI)' : ''));
            return;
        }
        resetBall();
    }
    
    if (ball.x > canvas.width) {
        player1.score++;
        player1ScoreEl.textContent = player1.score;
        if (player1.score >= 5) {
            endGame('Player 1');
            return;
        }
        resetBall();
    }
    
    // Move player 1
    if (player1.upPressed && player1.y > 0) {
        player1.y -= paddle.speed;
    }
    if (player1.downPressed && player1.y < canvas.height - paddle.height) {
        player1.y += paddle.speed;
    }
    
    // Move player 2 (AI or human)
    if (gameMode !== 'pvp') {
        moveAI();
    } else {
        if (player2.upPressed && player2.y > 0) {
            player2.y -= paddle.speed;
        }
        if (player2.downPressed && player2.y < canvas.height - paddle.height) {
            player2.y += paddle.speed;
        }
    }
}

// AI movement
function moveAI() {
    const paddleCenter = player2.y + paddle.height / 2;
    const ballCenter = ball.y;
    
    let aiSpeed = paddle.speed;
    let tolerance = 20;
    
    // Adjust difficulty
    if (gameMode === 'ai-easy') {
        aiSpeed = paddle.speed * 0.5;
        tolerance = 40;
    } else if (gameMode === 'ai-medium') {
        aiSpeed = paddle.speed * 0.75;
        tolerance = 25;
    } else if (gameMode === 'ai-hard') {
        aiSpeed = paddle.speed * 0.95;
        tolerance = 10;
    }
    
    // Only move if ball is coming towards AI
    if (ball.speedX > 0) {
        if (paddleCenter < ballCenter - tolerance && player2.y < canvas.height - paddle.height) {
            player2.y += aiSpeed;
        } else if (paddleCenter > ballCenter + tolerance && player2.y > 0) {
            player2.y -= aiSpeed;
        }
    } else {
        // Return to center when ball is away
        const center = canvas.height / 2 - paddle.height / 2;
        if (Math.abs(player2.y - center) > 5) {
            if (player2.y < center) {
                player2.y += aiSpeed * 0.3;
            } else {
                player2.y -= aiSpeed * 0.3;
            }
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player1.x, player1.y, paddle.width, paddle.height);
    
    ctx.fillStyle = gameMode !== 'pvp' ? '#ff0055' : '#00ff88';
    ctx.fillRect(player2.x, player2.y, paddle.width, paddle.height);
    
    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// End game
function endGame(winner) {
    gameRunning = false;
    gameStatus.textContent = `🏆 ${winner} Wins!`;
    setTimeout(() => {
        if (confirm(`${winner} wins! Play again?`)) {
            resetGame();
        } else {
            changeMode();
        }
    }, 500);
}

// Change mode
function changeMode() {
    gameArea.style.display = 'none';
    modeSelector.style.display = 'block';
    gameRunning = false;
}

// Event listeners
newGameBtn.addEventListener('click', resetGame);
changeModeBtn.addEventListener('click', changeMode);