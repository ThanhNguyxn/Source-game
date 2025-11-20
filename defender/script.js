const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let highScore = parseInt(localStorage.getItem('defenderHighScore')) || 0;
let lives = 3;
let wave = 1;
let gameRunning = true;
let paused = false;
let smartBombs = 3;

const player = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 25,
    speed: 5,
    dx: 0,
    dy: 0
};

let bullets = [];
let enemies = [];
let humans = [];
let particles = [];

const WORLD_WIDTH = 2400;
let cameraX = 0;

function initHumans() {
    humans = [];
    for (let i = 0; i < 10; i++) {
        humans.push({
            x: Math.random() * WORLD_WIDTH,
            y: canvas.height - 30,
            width: 10,
            height: 20,
            alive: true,
            captured: false,
            captor: null
        });
    }
}

function initEnemies() {
    enemies = [];
    const count = 8 + wave * 2;
    for (let i = 0; i < count; i++) {
        enemies.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * (canvas.height - 100) + 50,
            width: 30,
            height: 25,
            speed: 1 + wave * 0.2,
            type: Math.random() < 0.7 ? 'lander' : 'mutant',
            direction: Math.random() < 0.5 ? 1 : -1,
            capturing: false,
            capturedHuman: null
        });
    }
}

function initWave() {
    initHumans();
    initEnemies();
    bullets = [];
    particles = [];
}

function drawPlayer() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y + player.height / 2);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawBullets() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y - 2, 8, 4);
    });

    ctx.restore();
}

function drawEnemies() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.type === 'lander' ? '#ff0000' : '#ff00ff';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        if (enemy.type === 'lander') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
            ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
        }
    });

    ctx.restore();
}

function drawHumans() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    humans.forEach(human => {
        if (human.alive) {
            ctx.fillStyle = human.captured ? '#ffff00' : '#00ffff';
            ctx.fillRect(human.x, human.y, human.width, human.height);
        }
    });

    ctx.restore();
}

function drawParticles() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    });

    ctx.restore();
}

function drawMinimap() {
    const minimapHeight = 40;
    const minimapY = canvas.height - minimapHeight;
    const scale = canvas.width / WORLD_WIDTH;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, minimapY, canvas.width, minimapHeight);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x * scale, minimapY + 15, 3, 10);

    enemies.forEach(enemy => {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x * scale, minimapY + 15, 2, 10);
    });

    humans.forEach(human => {
        if (human.alive) {
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(human.x * scale, minimapY + 20, 2, 8);
        }
    });
}

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) player.x = 0;
    if (player.x > WORLD_WIDTH) player.x = WORLD_WIDTH;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;

    cameraX = player.x - canvas.width / 2;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > WORLD_WIDTH - canvas.width) cameraX = WORLD_WIDTH - canvas.width;
}

function shoot() {
    bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        speed: 8
    });
}

function useSmartBomb() {
    if (smartBombs > 0) {
        smartBombs--;
        enemies.forEach(enemy => createExplosion(enemy.x, enemy.y));
        enemies = [];
        score += 100;
        updateDisplay();
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed;

        if (bullet.x > WORLD_WIDTH || bullet.x < 0) {
            bullets.splice(index, 1);
            return;
        }

        enemies.forEach((enemy, eIndex) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                bullets.splice(index, 1);
                enemies.splice(eIndex, 1);
                score += enemy.type === 'lander' ? 150 : 200;
                createExplosion(enemy.x, enemy.y);
                updateDisplay();
            }
        });
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (enemy.type === 'lander' && !enemy.capturing) {
            const nearestHuman = humans.filter(h => h.alive && !h.captured)
                .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];

            if (nearestHuman) {
                const dx = nearestHuman.x - enemy.x;
                const dy = nearestHuman.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                    enemy.x += (dx / dist) * enemy.speed;
                    enemy.y += (dy / dist) * enemy.speed;

                    if (dist < 30) {
                        enemy.capturing = true;
                        enemy.capturedHuman = nearestHuman;
                        nearestHuman.captured = true;
                        nearestHuman.captor = enemy;
                    }
                }
            }
        }

        if (enemy.capturing && enemy.capturedHuman) {
            enemy.y -= 1;
            enemy.capturedHuman.x = enemy.x;
            enemy.capturedHuman.y = enemy.y + enemy.height;

            if (enemy.y < 50) {
                enemy.capturedHuman.alive = false;
                enemy.type = 'mutant';
                enemy.capturing = false;
                enemy.capturedHuman = null;
            }
        }

        if (enemy.type === 'mutant') {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            enemy.x += (dx / dist) * enemy.speed * 1.5;
            enemy.y += (dy / dist) * enemy.speed * 1.5;
        }

        if (Math.abs(enemy.x - player.x) < (enemy.width + player.width) / 2 &&
            Math.abs(enemy.y - player.y) < (enemy.height + player.height) / 2) {
            playerDie();
        }
    });
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            color: `rgb(${255}, ${Math.random() * 255}, 0)`
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
        player.x = 100;
        player.y = canvas.height / 2;
    }
}

function checkWaveComplete() {
    if (enemies.length === 0) {
        wave++;
        score += 500;
        smartBombs = Math.min(smartBombs + 1, 5);
        updateDisplay();
        setTimeout(() => initWave(), 2000);
    }
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('defenderHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalWave').textContent = wave;
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
    if (e.key === 's' || e.key === 'S') {
        useSmartBomb();
    }
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('wave').textContent = wave;
}

function gameLoop() {
    if (gameRunning && !paused) {
        player.dx = 0;
        player.dy = 0;

        if (keys['ArrowLeft']) player.dx = -player.speed;
        if (keys['ArrowRight']) player.dx = player.speed;
        if (keys['ArrowUp']) player.dy = -player.speed;
        if (keys['ArrowDown']) player.dy = player.speed;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateBullets();
        updateEnemies();
        updateParticles();
        checkWaveComplete();

        drawHumans();
        drawEnemies();
        drawBullets();
        drawPlayer();
        drawParticles();
        drawMinimap();
    }

    requestAnimationFrame(gameLoop);
}

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    lives = 3;
    wave = 1;
    smartBombs = 3;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initWave();
    updateDisplay();
});

updateDisplay();
initWave();
gameLoop();

