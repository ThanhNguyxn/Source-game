﻿﻿const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let obstacles = [];
let dx = 0;
let dy = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let gameLoop;
let isPaused = false;
let difficulty = 'easy';
let gameSpeed = 150;

highScoreElement.textContent = highScore;

// Difficulty settings
const difficultySettings = {
    easy: { speed: 200, obstacles: false, name: 'Easy' },
    medium: { speed: 130, obstacles: false, name: 'Medium' },
    hard: { speed: 80, obstacles: false, name: 'Hard' },
    extreme: { speed: 60, obstacles: true, name: 'Extreme' }
};

// Start game with difficulty
function startGame(diff) {
    difficulty = diff;
    const settings = difficultySettings[diff];
    gameSpeed = settings.speed;
    
    modeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    difficultyDisplay.textContent = settings.name;
    
    initGame();
    gameLoop = setInterval(update, gameSpeed);
}

// Initialize game
function initGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    isPaused = false;
    scoreElement.textContent = score;
    generateFood();
    
    // Generate obstacles for extreme mode
    obstacles = [];
    if (difficultySettings[difficulty].obstacles) {
        generateObstacles();
    }
}

// Generate obstacles
function generateObstacles() {
    const obstacleCount = 10;
    for (let i = 0; i < obstacleCount; i++) {
        let obstacle;
        do {
            obstacle = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (
            isOnSnake(obstacle) ||
            (obstacle.x === food.x && obstacle.y === food.y) ||
            obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y)
        );
        obstacles.push(obstacle);
    }
}

// Generate food
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        isOnSnake(food) || 
        obstacles.some(obs => obs.x === food.x && obs.y === food.y)
    );
}

// Check if position is on snake
function isOnSnake(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

// Update game state
function update() {
    if (isPaused) return;
    
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (isOnSnake(head)) {
        gameOver();
        return;
    }
    
    // Check obstacle collision
    if (obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw obstacles
    ctx.fillStyle = '#e74c3c';
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#00ff88';
        } else {
            ctx.fillStyle = '#00d4aa';
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    alert(`Game Over! Score: ${score}\nHigh Score: ${highScore}`);
    initGame();
    gameLoop = setInterval(update, gameSpeed);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent default scrolling behavior for arrow keys and WASD
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' '].includes(e.key)) {
        e.preventDefault();
    }

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
        case ' ':
            e.preventDefault();
            togglePause();
            break;
    }
});

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

// Reset game
function resetGame() {
    clearInterval(gameLoop);
    initGame();
    gameLoop = setInterval(update, gameSpeed);
}

// Change mode
function changeMode() {
    clearInterval(gameLoop);
    gameArea.style.display = 'none';
    modeSelector.style.display = 'block';
}

// Event listeners
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
changeModeBtn.addEventListener('click', changeMode);