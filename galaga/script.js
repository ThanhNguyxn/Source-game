const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 700;

// Game state
let score = 0;
let highScore = parseInt(localStorage.getItem('galagaHighScore')) || 0;
let lives = 3;
let wave = 1;
let gameRunning = true;
let paused = false;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 5,
    dx: 0
};

// Bullets
let bullets = [];
const bulletSpeed = 7;
const bulletCooldown = 300;
let lastShot = 0;

// Enemies
let enemies = [];
let enemyBullets = [];
const enemyRows = 4;
const enemyCols = 10;

// Stars background
let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 2
    });
}

// Initialize enemies
function initEnemies() {
    enemies = [];
    const spacing = 50;
    const offsetX = (canvas.width - (enemyCols - 1) * spacing) / 2;

    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: offsetX + col * spacing,
                y: -100 - row * spacing,
                width: 35,
                height: 35,
                speed: 0.5 + wave * 0.1,
                angle: 0,
                targetY: 100 + row * 60,
                state: 'entering', // entering, formation, diving
                formationX: offsetX + col * spacing,
                formationY: 100 + row * 60,
                type: row < 2 ? 'bee' : 'butterfly',
                diveTimer: Math.random() * 5000
            });
        }
    }
}

// Draw functions
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawPlayer() {
    // Player ship
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#0080ff';
    ctx.beginPath();
    ctx.arc(player.x, player.y + player.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 15);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);

        if (enemy.type === 'bee') {
            // Bee enemy (yellow)
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(0, 0, enemy.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Wings
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(-enemy.width / 2 - 5, -5, 5, 10);
            ctx.fillRect(enemy.width / 2, -5, 5, 10);
        } else {
            // Butterfly enemy (red)
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.moveTo(0, -enemy.height / 2);
            ctx.lineTo(-enemy.width / 2, enemy.height / 2);
            ctx.lineTo(enemy.width / 2, enemy.height / 2);
            ctx.closePath();
            ctx.fill();

            // Antennae
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -enemy.height / 2);
            ctx.lineTo(-15, -enemy.height / 2 - 10);
            ctx.moveTo(10, -enemy.height / 2);
            ctx.lineTo(15, -enemy.height / 2 - 10);
            ctx.stroke();
        }

        ctx.restore();
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = '#ff0000';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
    });
}

// Update functions
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function updatePlayer() {
    player.x += player.dx;

    // Boundaries
    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > canvas.width - player.width / 2) player.x = canvas.width - player.width / 2;
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (enemy.state === 'entering') {
            enemy.y += enemy.speed * 2;
            enemy.angle += 0.05;

            if (enemy.y >= enemy.targetY) {
                enemy.y = enemy.targetY;
                enemy.state = 'formation';
                enemy.angle = 0;
            }
        } else if (enemy.state === 'formation') {
            // Wobble in formation
            enemy.x = enemy.formationX + Math.sin(Date.now() / 1000 + index) * 10;

            // Random dive
            enemy.diveTimer -= 16;
            if (enemy.diveTimer <= 0 && Math.random() < 0.001) {
                enemy.state = 'diving';
                enemy.diveTimer = 5000 + Math.random() * 5000;
            }
        } else if (enemy.state === 'diving') {
            // Dive attack
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            enemy.x += (dx / distance) * enemy.speed * 3;
            enemy.y += (dy / distance) * enemy.speed * 3;
            enemy.angle += 0.1;

            // Random shoot during dive
            if (Math.random() < 0.02) {
                enemyBullets.push({
                    x: enemy.x,
                    y: enemy.y,
                    speed: 4
                });
            }

            // Return to formation or remove if off screen
            if (enemy.y > canvas.height + 50) {
                enemy.state = 'entering';
                enemy.y = -50;
                enemy.x = enemy.formationX;
            }
        }
    });
}

function updateEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
    });
}

function checkCollisions() {
    // Bullet-Enemy collisions
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x > enemy.x - enemy.width / 2 &&
                bullet.x < enemy.x + enemy.width / 2 &&
                bullet.y > enemy.y - enemy.height / 2 &&
                bullet.y < enemy.y + enemy.height / 2) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += enemy.type === 'bee' ? 100 : 50;
                updateDisplay();
            }
        });
    });

    // Enemy-Player collisions
    enemies.forEach((enemy) => {
        if (Math.abs(enemy.x - player.x) < (enemy.width + player.width) / 2 &&
            Math.abs(enemy.y - player.y) < (enemy.height + player.height) / 2) {
            playerHit();
        }
    });

    // Enemy bullet-Player collisions
    enemyBullets.forEach((bullet, index) => {
        if (Math.abs(bullet.x - player.x) < player.width / 2 &&
            bullet.y > player.y && bullet.y < player.y + player.height) {
            enemyBullets.splice(index, 1);
            playerHit();
        }
    });
}

function playerHit() {
    lives--;
    updateDisplay();

    if (lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        player.x = canvas.width / 2;
        enemyBullets = [];
    }
}

function checkWaveComplete() {
    if (enemies.length === 0) {
        wave++;
        updateDisplay();
        setTimeout(() => {
            initEnemies();
        }, 2000);
    }
}

function shoot() {
    const now = Date.now();
    if (now - lastShot > bulletCooldown) {
        bullets.push({
            x: player.x,
            y: player.y
        });
        lastShot = now;
    }
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('galagaHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalWave').textContent = wave;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ') {
        e.preventDefault();
        shoot();
    }

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        player.dx = -player.speed;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.dx = player.speed;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ||
        e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        player.dx = 0;
    }
});

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('wave').textContent = wave;
}

// Game loop
function gameLoop() {
    if (gameRunning && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateStars();
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateEnemyBullets();
        checkCollisions();
        checkWaveComplete();

        drawStars();
        drawPlayer();
        drawBullets();
        drawEnemies();
        drawEnemyBullets();
    }

    requestAnimationFrame(gameLoop);
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    lives = 3;
    wave = 1;
    bullets = [];
    enemyBullets = [];
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initEnemies();
    updateDisplay();
});

// Initialize game
updateDisplay();
initEnemies();
gameLoop();

