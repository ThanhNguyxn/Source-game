const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 600;

let score = 0;
let highScore = parseInt(localStorage.getItem('qbertHighScore')) || 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let paused = false;

const cubeSize = 60;
const player = {
    row: 0,
    col: 0,
    jumping: false,
    jumpProgress: 0
};

let cubes = [];
let enemies = [];
const TARGET_COLOR = '#FF6B6B';

function initPyramid() {
    cubes = [];
    for (let row = 0; row < 7; row++) {
        cubes[row] = [];
        for (let col = 0; col <= row; col++) {
            cubes[row][col] = {
                color: '#9b59b6',
                changed: false
            };
        }
    }
}

function initEnemies() {
    enemies = [];
    const count = 2 + level;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            enemies.push({
                row: 0,
                col: 0,
                type: Math.random() < 0.5 ? 'coily' : 'ugg',
                jumping: false,
                jumpProgress: 0
            });
        }, i * 2000);
    }
}

function initLevel() {
    initPyramid();
    initEnemies();
    player.row = 0;
    player.col = 0;
    player.jumping = false;
}

function getCubePosition(row, col) {
    const startX = canvas.width / 2;
    const startY = 100;
    const x = startX + (col - row / 2) * cubeSize;
    const y = startY + row * cubeSize * 0.7;
    return { x, y };
}

function drawCube(row, col, color) {
    const pos = getCubePosition(row, col);
    const x = pos.x;
    const y = pos.y;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cubeSize / 2, y + cubeSize / 3);
    ctx.lineTo(x, y + cubeSize * 2 / 3);
    ctx.lineTo(x - cubeSize / 2, y + cubeSize / 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color === TARGET_COLOR ? '#e74c3c' : '#8e44ad';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cubeSize / 2, y + cubeSize / 3);
    ctx.lineTo(x + cubeSize / 2, y + cubeSize);
    ctx.lineTo(x, y + cubeSize * 2 / 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawPlayer() {
    const pos = getCubePosition(player.row, player.col);
    let x = pos.x;
    let y = pos.y - 30;

    if (player.jumping) {
        y -= Math.sin(player.jumpProgress * Math.PI) * 40;
    }

    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 5, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 7, y - 5, 3, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 5, 8, 0, Math.PI);
    ctx.stroke();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const pos = getCubePosition(enemy.row, enemy.col);
        let x = pos.x;
        let y = pos.y - 25;

        if (enemy.jumping) {
            y -= Math.sin(enemy.jumpProgress * Math.PI) * 30;
        }

        ctx.fillStyle = enemy.type === 'coily' ? '#9b59b6' : '#e67e22';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

function movePlayer(dRow, dCol) {
    if (player.jumping) return;

    const newRow = player.row + dRow;
    const newCol = player.col + dCol;

    if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol <= newRow) {
        player.jumping = true;
        player.jumpProgress = 0;

        const jumpInterval = setInterval(() => {
            player.jumpProgress += 0.1;

            if (player.jumpProgress >= 1) {
                player.row = newRow;
                player.col = newCol;
                player.jumping = false;
                player.jumpProgress = 0;
                clearInterval(jumpInterval);

                if (!cubes[player.row][player.col].changed) {
                    cubes[player.row][player.col].color = TARGET_COLOR;
                    cubes[player.row][player.col].changed = true;
                    score += 25;
                    updateDisplay();
                    checkLevelComplete();
                }

                checkEnemyCollision();
            }
        }, 30);
    } else {
        playerDie();
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!enemy.jumping && Math.random() < 0.02) {
            const moves = [];
            if (enemy.row < 6) {
                moves.push({ dRow: 1, dCol: 0 });
                moves.push({ dRow: 1, dCol: 1 });
            }
            if (enemy.row > 0) {
                moves.push({ dRow: -1, dCol: 0 });
                moves.push({ dRow: -1, dCol: -1 });
            }

            const move = moves[Math.floor(Math.random() * moves.length)];
            const newRow = enemy.row + move.dRow;
            const newCol = enemy.col + move.dCol;

            if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol <= newRow) {
                enemy.jumping = true;
                enemy.jumpProgress = 0;

                const jumpInterval = setInterval(() => {
                    enemy.jumpProgress += 0.1;

                    if (enemy.jumpProgress >= 1) {
                        enemy.row = newRow;
                        enemy.col = newCol;
                        enemy.jumping = false;
                        enemy.jumpProgress = 0;
                        clearInterval(jumpInterval);
                        checkEnemyCollision();
                    }
                }, 40);
            } else {
                enemies.splice(index, 1);
            }
        }
    });
}

function checkEnemyCollision() {
    enemies.forEach(enemy => {
        if (enemy.row === player.row && enemy.col === player.col && !enemy.jumping) {
            playerDie();
        }
    });
}

function playerDie() {
    lives--;
    updateDisplay();

    if (lives <= 0) {
        gameOver();
    } else {
        player.row = 0;
        player.col = 0;
        player.jumping = false;
    }
}

function checkLevelComplete() {
    let allChanged = true;
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col <= row; col++) {
            if (!cubes[row][col].changed) {
                allChanged = false;
                break;
            }
        }
        if (!allChanged) break;
    }

    if (allChanged) {
        level++;
        score += 500;
        updateDisplay();
        setTimeout(() => initLevel(), 1500);
    }
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('qbertHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (paused || !gameRunning) return;

    switch(e.key) {
        case 'q':
        case 'Q':
            movePlayer(-1, 0);
            break;
        case 'w':
        case 'W':
            movePlayer(-1, -1);
            break;
        case 'e':
        case 'E':
            movePlayer(-1, 0);
            break;
        case 'a':
        case 'A':
            movePlayer(1, 0);
            break;
        case 'd':
        case 'D':
            movePlayer(1, 1);
            break;
        case 'ArrowUp':
            movePlayer(-1, -1);
            break;
        case 'ArrowDown':
            movePlayer(1, 1);
            break;
        case 'p':
        case 'P':
            paused = !paused;
            break;
    }
});

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameLoop() {
    if (gameRunning && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < 7; row++) {
            for (let col = 0; col <= row; col++) {
                drawCube(row, col, cubes[row][col].color);
            }
        }

        drawPlayer();
        drawEnemies();
        updateEnemies();
    }

    requestAnimationFrame(gameLoop);
}

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initLevel();
    updateDisplay();
});

updateDisplay();
initLevel();
gameLoop();

