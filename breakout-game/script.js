﻿const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

let paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    width: 100,
    height: 15,
    speed: 8
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 8,
    dx: 4,
    dy: -4,
    speed: 4
};

let bricks = [];
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 52;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 20;

let score = 0;
let lives = 3;
let level = 1;
let gameLoop;
let isGameRunning = false;
let isPaused = false;

const brickColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.fillStyle = brickColors[r % brickColors.length];
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth &&
                    ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    scoreElement.textContent = score;
                    
                    if (score === brickRowCount * brickColumnCount * 10 * level) {
                        levelUp();
                    }
                }
            }
        }
    }
}

function levelUp() {
    level++;
    levelElement.textContent = level;
    ball.speed += 0.5;
    ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    ball.dy = -ball.speed;
    initBricks();
    resetBallAndPaddle();
}

function resetBallAndPaddle() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    paddle.x = canvas.width / 2 - paddle.width / 2;
}

function draw() {
    if (isPaused) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawPaddle();
    drawBall();
    collisionDetection();
    
    // Ball collision with walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            const hitPos = (ball.x - paddle.x) / paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            ball.dx = ball.speed * Math.sin(angle);
            ball.dy = -ball.speed * Math.cos(angle);
        } else {
            lives--;
            livesElement.textContent = lives;
            if (lives === 0) {
                gameOver();
                return;
            } else {
                resetBallAndPaddle();
            }
        }
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoop = setInterval(draw, 1000 / 60);
}

function pauseGame() {
    if (!isGameRunning) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    isPaused = false;
    score = 0;
    lives = 3;
    level = 1;
    ball.speed = 4;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    initBricks();
    resetBallAndPaddle();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
}

function gameOver() {
    clearInterval(gameLoop);
    isGameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 50);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Mouse control
canvas.addEventListener('mousemove', (e) => {
    if (!isGameRunning) return;
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
});

// Keyboard control
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        e.preventDefault();
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        e.preventDefault();
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

setInterval(() => {
    if (!isGameRunning || isPaused) return;
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
}, 1000 / 60);

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

pauseBtn.disabled = true;
initBricks();
drawBricks();
drawPaddle();
drawBall();
