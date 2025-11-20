const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 600;

const TILE_SIZE = 35;
const GRID_WIDTH = Math.floor(canvas.width / TILE_SIZE);
const GRID_HEIGHT = Math.floor(canvas.height / TILE_SIZE);

// Game state
let score = 0;
let highScore = parseInt(localStorage.getItem('digDugHighScore')) || 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let paused = false;

// Player
const player = {
    x: 1,
    y: 1,
    speed: 0.15,
    pumpRange: 2,
    pumping: false,
    pumpTarget: null
};

// Map (0 = dug, 1 = dirt)
let map = [];

// Enemies
let enemies = [];

// Rocks
let rocks = [];

// Air pump lines
let pumpLines = [];

// Initialize map
function initMap() {
    map = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (y === 0) {
                map[y][x] = 0; // Top row always dug
            } else {
                map[y][x] = 1; // Dirt
            }
        }
    }

    // Create initial path for player
    for (let x = 0; x < 5; x++) {
        map[1][x] = 0;
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
            y = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 3;
        } while (Math.abs(x - player.x) < 3 && Math.abs(y - player.y) < 3);

        enemies.push({
            x: x,
            y: y,
            speed: 0.05 + level * 0.01,
            type: i % 3 === 0 ? 'dragon' : 'monster',
            inflated: 0,
            maxInflation: 4,
            chasing: false
        });
    }
}

// Initialize rocks
function initRocks() {
    rocks = [];
    for (let i = 0; i < 5 + level; i++) {
        const x = Math.floor(Math.random() * GRID_WIDTH);
        const y = Math.floor(Math.random() * (GRID_HEIGHT - 3)) + 2;

        if (map[y][x] === 1) {
            rocks.push({
                x: x,
                y: y,
                falling: false,
                fallSpeed: 0
            });
        }
    }
}

// Initialize level
function initLevel() {
    initMap();
    initEnemies();
    initRocks();
    player.x = 1;
    player.y = 1;
    player.pumping = false;
    player.pumpTarget = null;
    pumpLines = [];
}

// Draw functions
function drawMap() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (map[y][x] === 1) {
                // Dirt
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                // Dirt texture
                ctx.fillStyle = '#654321';
                for (let i = 0; i < 3; i++) {
                    const px = x * TILE_SIZE + Math.random() * TILE_SIZE;
                    const py = y * TILE_SIZE + Math.random() * TILE_SIZE;
                    ctx.fillRect(px, py, 2, 2);
                }
            } else {
                // Dug area
                ctx.fillStyle = '#000';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;

    // Body
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(px, py, TILE_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 5, py - 5, 4, 4);
    ctx.fillRect(px + 1, py - 5, 4, 4);

    // Pump
    if (player.pumping && player.pumpTarget) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(
            player.pumpTarget.x * TILE_SIZE + TILE_SIZE / 2,
            player.pumpTarget.y * TILE_SIZE + TILE_SIZE / 2
        );
        ctx.stroke();
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const ex = enemy.x * TILE_SIZE + TILE_SIZE / 2;
        const ey = enemy.y * TILE_SIZE + TILE_SIZE / 2;

        const size = TILE_SIZE / 3 + (enemy.inflated * 5);

        // Enemy body
        ctx.fillStyle = enemy.type === 'dragon' ? '#e74c3c' : '#9b59b6';
        ctx.beginPath();
        ctx.arc(ex, ey, size, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(ex - size/2, ey - size/3, size/3, size/3);
        ctx.fillRect(ex + size/6, ey - size/3, size/3, size/3);

        // Inflation indicator
        if (enemy.inflated > 0) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ex, ey, size, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

function drawRocks() {
    rocks.forEach(rock => {
        const rx = rock.x * TILE_SIZE;
        const ry = rock.y * TILE_SIZE;

        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(rx + 5, ry + 5, TILE_SIZE - 10, TILE_SIZE - 10);

        // Rock detail
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(rx + 8, ry + 8, TILE_SIZE - 16, TILE_SIZE - 16);
    });
}

// Update functions
function movePlayer(dx, dy) {
    const newX = player.x + dx * player.speed;
    const newY = player.y + dy * player.speed;

    const gridX = Math.floor(newX);
    const gridY = Math.floor(newY);

    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        player.x = newX;
        player.y = newY;

        // Dig through dirt
        map[gridY][gridX] = 0;

        // Check if rock should fall
        checkRockFall(gridX, gridY);
    }
}

function checkRockFall(x, y) {
    rocks.forEach(rock => {
        if (rock.x === x && rock.y === y - 1 && !rock.falling) {
            // Check if space below is dug
            if (y < GRID_HEIGHT && map[y][x] === 0) {
                rock.falling = true;
            }
        }
    });
}

function updateRocks() {
    rocks.forEach((rock, index) => {
        if (rock.falling) {
            rock.fallSpeed += 0.1;
            rock.y += rock.fallSpeed;

            const gridY = Math.floor(rock.y);

            // Check if hit ground or dirt
            if (gridY >= GRID_HEIGHT - 1 ||
                (gridY + 1 < GRID_HEIGHT && map[gridY + 1][rock.x] === 1)) {
                rock.falling = false;
                rock.y = gridY;
                rock.fallSpeed = 0;

                // Check if crushed enemies
                enemies.forEach((enemy, eIndex) => {
                    if (Math.floor(enemy.x) === rock.x &&
                        Math.floor(enemy.y) === gridY) {
                        enemies.splice(eIndex, 1);
                        score += 500;
                        updateDisplay();
                    }
                });

                // Check if crushed player
                if (Math.floor(player.x) === rock.x &&
                    Math.floor(player.y) === gridY) {
                    playerDie();
                }
            }
        }
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Deflate over time
        if (enemy.inflated > 0 && !player.pumping) {
            enemy.inflated -= 0.05;
            if (enemy.inflated < 0) enemy.inflated = 0;
        }

        // Explode if fully inflated
        if (enemy.inflated >= enemy.maxInflation) {
            enemies.splice(index, 1);
            score += 200;
            updateDisplay();
            return;
        }

        // Move enemy
        if (enemy.inflated === 0) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                enemy.chasing = true;
            }

            if (enemy.chasing && distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            } else {
                // Random movement
                if (Math.random() < 0.02) {
                    const directions = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}];
                    const dir = directions[Math.floor(Math.random() * directions.length)];

                    const newX = enemy.x + dir.dx * enemy.speed * 3;
                    const newY = enemy.y + dir.dy * enemy.speed * 3;
                    const gridX = Math.floor(newX);
                    const gridY = Math.floor(newY);

                    if (gridX >= 0 && gridX < GRID_WIDTH &&
                        gridY >= 0 && gridY < GRID_HEIGHT) {
                        enemy.x = newX;
                        enemy.y = newY;

                        // Can move through dirt
                        map[gridY][gridX] = 0;
                    }
                }
            }

            // Check collision with player
            if (Math.abs(enemy.x - player.x) < 0.7 &&
                Math.abs(enemy.y - player.y) < 0.7) {
                playerDie();
            }
        }
    });
}

function usePump() {
    if (player.pumping && player.pumpTarget) {
        player.pumpTarget.inflated += 0.1;
    } else {
        // Find nearest enemy in range
        let nearest = null;
        let minDist = Infinity;

        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < player.pumpRange && dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });

        if (nearest) {
            player.pumping = true;
            player.pumpTarget = nearest;
        }
    }
}

function playerDie() {
    lives--;
    updateDisplay();

    if (lives <= 0) {
        gameOver();
    } else {
        player.x = 1;
        player.y = 1;
        player.pumping = false;
        player.pumpTarget = null;
    }
}

function checkLevelComplete() {
    if (enemies.length === 0) {
        level++;
        score += 1000;
        updateDisplay();
        setTimeout(() => {
            initLevel();
        }, 1000);
    }
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('digDugHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    // Prevent default scrolling for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;

    if (e.key === ' ') {
        usePump();
    }

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;

    if (e.key === ' ') {
        player.pumping = false;
        player.pumpTarget = null;
    }
});

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// Game loop
function gameLoop() {
    if (gameRunning && !paused) {
        // Handle player movement
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            movePlayer(0, -1);
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            movePlayer(0, 1);
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            movePlayer(-1, 0);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            movePlayer(1, 0);
        }

        updateEnemies();
        updateRocks();
        checkLevelComplete();

        // Draw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawRocks();
        drawEnemies();
        drawPlayer();
    }

    requestAnimationFrame(gameLoop);
}

// Restart button
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

// Initialize game
initLevel();
updateDisplay();
gameLoop();

