const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let highScore = parseInt(localStorage.getItem('contraHighScore')) || 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let paused = false;

const player = {
    x: 50,
    y: canvas.height - 100,
    width: 30,
    height: 40,
    speed: 5,
    velocityY: 0,
    jumping: false,
    gravity: 0.8,
    jumpPower: -15,
    onGround: false,
    direction: 1
};

let bullets = [];
let enemies = [];
let platforms = [];
let particles = [];

function initLevel() {
    platforms = [
        { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
        { x: 200, y: canvas.height - 150, width: 200, height: 20 },
        { x: 500, y: canvas.height - 200, width: 200, height: 20 },
        { x: 100, y: canvas.height - 300, width: 150, height: 20 },
        { x: 600, y: canvas.height - 350, width: 150, height: 20 }
    ];

    enemies = [];
    const enemyCount = 5 + level * 2;
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: 200 + i * 120,
            y: canvas.height - 100,
            width: 30,
            height: 35,
            speed: 1 + level * 0.3,
            direction: Math.random() < 0.5 ? 1 : -1,
            shootTimer: Math.random() * 100
        });
    }
}

function drawPlayer() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#2980b9';
    ctx.fillRect(player.x + 10, player.y, 10, 15);

    ctx.fillStyle = '#e74c3c';
    const gunX = player.direction > 0 ? player.x + player.width : player.x;
    ctx.fillRect(gunX, player.y + 15, 10 * player.direction, 5);
}

function drawBullets() {
    ctx.fillStyle = '#f39c12';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 8, 4);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        ctx.fillStyle = '#c0392b';
        ctx.fillRect(enemy.x + 10, enemy.y, 10, 15);
    });
}

function drawPlatforms() {
    ctx.fillStyle = '#7f8c8d';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
}

function updatePlayer() {
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    player.onGround = false;
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 10 &&
            player.velocityY > 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
            player.onGround = true;
        }
    });

    if (player.y > canvas.height) {
        playerDie();
    }
}

function shoot() {
    bullets.push({
        x: player.direction > 0 ? player.x + player.width : player.x,
        y: player.y + 15,
        speed: 10 * player.direction
    });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed;

        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(index, 1);
            return;
        }

        enemies.forEach((enemy, eIndex) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                bullets.splice(index, 1);
                enemies.splice(eIndex, 1);
                score += 100;
                createExplosion(enemy.x, enemy.y);
                updateDisplay();
            }
        });
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x < 0 || enemy.x > canvas.width - enemy.width) {
            enemy.direction *= -1;
        }

        enemy.shootTimer++;
        if (enemy.shootTimer > 100) {
            enemy.shootTimer = 0;
            bullets.push({
                x: enemy.x,
                y: enemy.y + enemy.height / 2,
                speed: player.x > enemy.x ? 5 : -5,
                enemy: true
            });
        }

        if (Math.abs(enemy.x - player.x) < (enemy.width + player.width) / 2 &&
            Math.abs(enemy.y - player.y) < (enemy.height + player.height) / 2) {
            playerDie();
        }
    });
}

function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: `rgb(${255}, ${Math.random() * 200}, 0)`
        });
    }
}

function updateParticles() {
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });
}

function playerDie() {
    lives--;
    updateDisplay();
    if (lives <= 0) {
        gameOver();
    } else {
        player.x = 50;
        player.y = canvas.height - 100;
        player.velocityY = 0;
    }
}

function checkLevelComplete() {
    if (enemies.length === 0) {
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
        localStorage.setItem('contraHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

const keys = {};
window.addEventListener('keydown', (e) => {
    // Prevent default scrolling for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;

    if (e.key === ' ') {
        shoot();
    }
    if ((e.key === 'Shift' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') && player.onGround) {
        player.velocityY = player.jumpPower;
        player.jumping = true;
    }
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameLoop() {
    if (gameRunning && !paused) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            player.x -= player.speed;
            player.direction = -1;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            player.x += player.speed;
            player.direction = 1;
        }

        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateBullets();
        updateEnemies();
        updateParticles();
        checkLevelComplete();

        drawPlatforms();
        drawEnemies();
        drawBullets();
        drawPlayer();
        drawParticles();
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

// Start button
let gameStarted = false;

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        gameLoop();
    }
});

// Pause button
document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

updateDisplay();
initLevel();
// Don't auto-start

