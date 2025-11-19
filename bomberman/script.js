const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const TILE_SIZE = 40;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 13;
canvas.width = GRID_WIDTH * TILE_SIZE;
canvas.height = GRID_HEIGHT * TILE_SIZE;

// Game state
let score = 0;
let lives = 3;
let level = 1;
let maxBombs = 1;
let bombPower = 1;
let gameRunning = true;
let paused = false;

// Player
const player = {
    x: 1,
    y: 1,
    speed: 0.1
};

// Enemies
let enemies = [];

// Bombs and explosions
let bombs = [];
let explosions = [];

// Map
let map = [];

// Power-ups
let powerUps = [];

// Initialize map
function initMap() {
    map = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (x === 0 || y === 0 || x === GRID_WIDTH - 1 || y === GRID_HEIGHT - 1) {
                map[y][x] = 'wall'; // Border walls
            } else if (x % 2 === 0 && y % 2 === 0) {
                map[y][x] = 'wall'; // Fixed walls
            } else if (Math.random() < 0.5 && !(x <= 2 && y <= 2)) {
                map[y][x] = 'brick'; // Destructible bricks
            } else {
                map[y][x] = 'empty';
            }
        }
    }
}

// Initialize enemies
function initEnemies() {
    enemies = [];
    const enemyCount = 3 + level;
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
            y = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2;
        } while (map[y][x] !== 'empty' || (x <= 3 && y <= 3));

        enemies.push({
            x: x,
            y: y,
            speed: 0.02 + (level * 0.01),
            direction: Math.floor(Math.random() * 4),
            moveTimer: 0
        });
    }
}

// Initialize level
function initLevel() {
    initMap();
    initEnemies();
    player.x = 1;
    player.y = 1;
    bombs = [];
    explosions = [];
    powerUps = [];
}

// Draw functions
function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawMap() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (map[y][x] === 'wall') {
                drawTile(x, y, '#34495e');
            } else if (map[y][x] === 'brick') {
                drawTile(x, y, '#e67e22');
            } else {
                drawTile(x, y, '#27ae60');
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(
        player.x * TILE_SIZE + TILE_SIZE / 2,
        player.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Face
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2 - 8, player.y * TILE_SIZE + TILE_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2 + 8, player.y * TILE_SIZE + TILE_SIZE / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(
            enemy.x * TILE_SIZE + TILE_SIZE / 2,
            enemy.y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 2 - 5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

function drawBombs() {
    bombs.forEach(bomb => {
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(
            bomb.x * TILE_SIZE + TILE_SIZE / 2,
            bomb.y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 2 - 8,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Fuse
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bomb.x * TILE_SIZE + TILE_SIZE / 2, bomb.y * TILE_SIZE + 5);
        ctx.lineTo(bomb.x * TILE_SIZE + TILE_SIZE / 2, bomb.y * TILE_SIZE);
        ctx.stroke();
    });
}

function drawExplosions() {
    ctx.fillStyle = '#f39c12';
    explosions.forEach(exp => {
        exp.tiles.forEach(tile => {
            ctx.fillRect(tile.x * TILE_SIZE + 5, tile.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        });
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'bomb' ? '#9b59b6' : '#f1c40f';
        ctx.fillRect(
            powerUp.x * TILE_SIZE + 10,
            powerUp.y * TILE_SIZE + 10,
            TILE_SIZE - 20,
            TILE_SIZE - 20
        );
    });
}

// Game logic
function placeBomb() {
    const gridX = Math.floor(player.x);
    const gridY = Math.floor(player.y);

    if (bombs.length < maxBombs && !bombs.find(b => b.x === gridX && b.y === gridY)) {
        bombs.push({
            x: gridX,
            y: gridY,
            timer: 3000,
            power: bombPower
        });
    }
}

function updateBombs(deltaTime) {
    bombs.forEach((bomb, index) => {
        bomb.timer -= deltaTime;
        if (bomb.timer <= 0) {
            explode(bomb);
            bombs.splice(index, 1);
        }
    });
}

function explode(bomb) {
    const explosion = {
        tiles: [{x: bomb.x, y: bomb.y}],
        timer: 500
    };

    // Spread explosion in 4 directions
    const directions = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}];
    directions.forEach(dir => {
        for (let i = 1; i <= bomb.power; i++) {
            const x = bomb.x + dir.dx * i;
            const y = bomb.y + dir.dy * i;

            if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) break;
            if (map[y][x] === 'wall') break;

            explosion.tiles.push({x, y});

            if (map[y][x] === 'brick') {
                map[y][x] = 'empty';
                // Random power-up drop
                if (Math.random() < 0.3) {
                    powerUps.push({
                        x: x,
                        y: y,
                        type: Math.random() < 0.5 ? 'bomb' : 'power'
                    });
                }
                score += 10;
                break;
            }
        }
    });

    explosions.push(explosion);
    checkExplosionCollisions(explosion);
}

function checkExplosionCollisions(explosion) {
    // Check player
    explosion.tiles.forEach(tile => {
        if (Math.floor(player.x) === tile.x && Math.floor(player.y) === tile.y) {
            playerDie();
        }
    });

    // Check enemies
    enemies.forEach((enemy, index) => {
        explosion.tiles.forEach(tile => {
            if (Math.floor(enemy.x) === tile.x && Math.floor(enemy.y) === tile.y) {
                enemies.splice(index, 1);
                score += 100;
            }
        });
    });
}

function updateExplosions(deltaTime) {
    explosions.forEach((exp, index) => {
        exp.timer -= deltaTime;
        if (exp.timer <= 0) {
            explosions.splice(index, 1);
        }
    });
}

function movePlayer(dx, dy, deltaTime) {
    const newX = player.x + dx * player.speed;
    const newY = player.y + dy * player.speed;

    const gridX = Math.floor(newX);
    const gridY = Math.floor(newY);

    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        if (map[gridY][gridX] !== 'wall' && map[gridY][gridX] !== 'brick') {
            player.x = newX;
            player.y = newY;

            // Check power-up collection
            powerUps.forEach((powerUp, index) => {
                if (gridX === powerUp.x && gridY === powerUp.y) {
                    if (powerUp.type === 'bomb') {
                        maxBombs++;
                    } else {
                        bombPower++;
                    }
                    powerUps.splice(index, 1);
                    score += 50;
                }
            });
        }
    }
}

function updateEnemies(deltaTime) {
    enemies.forEach(enemy => {
        enemy.moveTimer += deltaTime;

        if (enemy.moveTimer > 100) {
            enemy.moveTimer = 0;

            // Random direction change
            if (Math.random() < 0.1) {
                enemy.direction = Math.floor(Math.random() * 4);
            }

            let dx = 0, dy = 0;
            switch (enemy.direction) {
                case 0: dy = -enemy.speed; break;
                case 1: dx = enemy.speed; break;
                case 2: dy = enemy.speed; break;
                case 3: dx = -enemy.speed; break;
            }

            const newX = enemy.x + dx;
            const newY = enemy.y + dy;
            const gridX = Math.floor(newX);
            const gridY = Math.floor(newY);

            if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
                if (map[gridY][gridX] !== 'wall' && map[gridY][gridX] !== 'brick') {
                    enemy.x = newX;
                    enemy.y = newY;
                } else {
                    enemy.direction = Math.floor(Math.random() * 4);
                }
            }

            // Check collision with player
            if (Math.abs(enemy.x - player.x) < 0.5 && Math.abs(enemy.y - player.y) < 0.5) {
                playerDie();
            }
        }
    });
}

function playerDie() {
    lives--;
    updateDisplay();

    if (lives <= 0) {
        gameOver();
    } else {
        player.x = 1;
        player.y = 1;
    }
}

function checkLevelComplete() {
    if (enemies.length === 0) {
        level++;
        updateDisplay();
        setTimeout(() => {
            initLevel();
        }, 1000);
    }
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    // Prevent page scroll
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','w','W','a','A','s','S','d','D'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;

    if (e.key === ' ') {
        placeBomb();
    }

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('bombs').textContent = maxBombs;
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (gameRunning && !paused) {
        // Handle player movement
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            movePlayer(0, -1, deltaTime);
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            movePlayer(0, 1, deltaTime);
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            movePlayer(-1, 0, deltaTime);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            movePlayer(1, 0, deltaTime);
        }

        updateBombs(deltaTime);
        updateExplosions(deltaTime);
        updateEnemies(deltaTime);
        checkLevelComplete();

        // Draw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawPowerUps();
        drawBombs();
        drawExplosions();
        drawPlayer();
        drawEnemies();
    }

    requestAnimationFrame(gameLoop);
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    lives = 3;
    level = 1;
    maxBombs = 1;
    bombPower = 1;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initLevel();
    updateDisplay();
});

// Initialize game
initLevel();
updateDisplay();
requestAnimationFrame(gameLoop);

