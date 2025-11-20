const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 700;

let gameStarted = false;
let paused = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('arkanoidHighScore')) || 0;
let lives = 3;
let level = 1;

const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 30,
    width: 120,
    height: 15,
    speed: 8
};

const ball = {
    x: canvas.width / 2,
    y: paddle.y - 10,
    radius: 8,
    dx: 4,
    dy: -4,
    launched: false
};

let bricks = [];
let powerups = [];
const brickRowCount = 8;
const brickColumnCount = 10;
const brickWidth = 55;
const brickHeight = 20;
const brickPadding = 5;
const brickOffsetTop = 50;
const brickOffsetLeft = 15;

const brickColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const hits = r < 2 ? 2 : 1; // Top 2 rows need 2 hits
            bricks[c][r] = {
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                status: hits,
                maxHits: hits,
                color: brickColors[r % brickColors.length]
            };
        }
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status > 0) {
                const opacity = brick.status / brick.maxHits;
                ctx.fillStyle = brick.color;
                ctx.globalAlpha = 0.5 + opacity * 0.5;
                ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
                ctx.globalAlpha = 1;

                // Border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(brick.x, brick.y, brickWidth, brickHeight);
            }
        }
    }
}

function drawPaddle() {
    const gradient = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.width, 0);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2ecc71');
    ctx.fillStyle = gradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, 5);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#f39c12');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

function drawPowerups() {
    powerups.forEach((powerup, index) => {
        powerup.y += 2;

        ctx.fillStyle = powerup.color;
        ctx.fillRect(powerup.x, powerup.y, 30, 15);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(powerup.type[0].toUpperCase(), powerup.x + 10, powerup.y + 12);

        // Check paddle collision
        if (powerup.y + 15 > paddle.y &&
            powerup.x > paddle.x && powerup.x < paddle.x + paddle.width) {
            activatePowerup(powerup.type);
            powerups.splice(index, 1);
        }

        // Remove if off screen
        if (powerup.y > canvas.height) {
            powerups.splice(index, 1);
        }
    });
}

function activatePowerup(type) {
    switch(type) {
        case 'expand':
            paddle.width = Math.min(200, paddle.width + 30);
            setTimeout(() => paddle.width = 120, 10000);
            break;
        case 'slow':
            const oldDx = ball.dx;
            const oldDy = ball.dy;
            ball.dx *= 0.5;
            ball.dy *= 0.5;
            setTimeout(() => {
                ball.dx = oldDx;
                ball.dy = oldDy;
            }, 8000);
            break;
        case 'life':
            lives++;
            updateDisplay();
            break;
    }
}

function updateBall() {
    if (!ball.launched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        return;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 10;
        ball.dy = -Math.abs(ball.dy);
    }

    // Bottom collision
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateDisplay();
        if (lives <= 0) {
            gameOver();
        } else {
            resetBall();
        }
    }

    // Brick collision
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status > 0) {
                if (ball.x > brick.x && ball.x < brick.x + brickWidth &&
                    ball.y > brick.y && ball.y < brick.y + brickHeight) {
                    ball.dy = -ball.dy;
                    brick.status--;

                    if (brick.status === 0) {
                        score += 10;
                        updateDisplay();

                        // Random powerup drop
                        if (Math.random() < 0.2) {
                            const types = ['expand', 'slow', 'life'];
                            const colors = ['#3498db', '#f39c12', '#e74c3c'];
                            const type = types[Math.floor(Math.random() * types.length)];
                            powerups.push({
                                x: brick.x + brickWidth / 2,
                                y: brick.y,
                                type: type,
                                color: colors[types.indexOf(type)]
                            });
                        }

                        checkLevelComplete();
                    }
                }
            }
        }
    }
}

function resetBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dx = 4;
    ball.dy = -4;
    ball.launched = false;
}

function checkLevelComplete() {
    let allBroken = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                allBroken = false;
                break;
            }
        }
    }

    if (allBroken) {
        level++;
        score += 100;
        updateDisplay();
        resetBall();
        initBricks();
        powerups = [];
    }
}

function gameOver() {
    gameStarted = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('arkanoidHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameLoop() {
    if (gameStarted && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBricks();
        drawPaddle();
        drawBall();
        drawPowerups();
        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;

    if (['ArrowLeft','ArrowRight',' ','p','P'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;

    if (e.key === ' ' && !ball.launched) {
        ball.launched = true;
    }

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
});

setInterval(() => {
    if (gameStarted && !paused) {
        if (keys['ArrowLeft']) {
            paddle.x = Math.max(0, paddle.x - paddle.speed);
        }
        if (keys['ArrowRight']) {
            paddle.x = Math.min(canvas.width - paddle.width, paddle.x + paddle.speed);
        }
    }
}, 16);

document.getElementById('startBtn').addEventListener('click', () => {
    gameStarted = true;
    score = 0;
    lives = 3;
    level = 1;
    initBricks();
    resetBall();
    powerups = [];
    updateDisplay();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    gameStarted = false;
});

updateDisplay();
gameLoop();

