const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 700;

// Game state
let score = 0;
let highScore = parseInt(localStorage.getItem('centipedeHighScore')) || 0;
let lives = 3;
let wave = 1;
let gameRunning = true;
let paused = false;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 20,
    height: 20,
    speed: 6
};

// Bullets
let bullets = [];
const bulletSpeed = 10;
let lastShot = 0;
const shootCooldown = 200;

// Mushrooms
let mushrooms = [];

// Centipede segments
let centipede = [];
const segmentSize = 20;

// Spiders
let spiders = [];

// Fleas
let fleas = [];

// Initialize mushrooms
function initMushrooms() {
    mushrooms = [];
    const mushroomCount = 30 + (wave * 5);
    for (let i = 0; i < mushroomCount; i++) {
        const x = Math.floor(Math.random() * (canvas.width / segmentSize)) * segmentSize;
        const y = Math.floor(Math.random() * (canvas.height - 100) / segmentSize) * segmentSize;

        if (!mushrooms.find(m => m.x === x && m.y === y)) {
            mushrooms.push({
                x: x,
                y: y,
                health: 4,
                size: segmentSize
            });
        }
    }
}

// Initialize centipede
function initCentipede() {
    centipede = [];
    const length = 10 + wave;
    for (let i = 0; i < length; i++) {
        centipede.push({
            x: i * segmentSize,
            y: 0,
            direction: 1, // 1 = right, -1 = left
            goingDown: false
        });
    }
}

// Initialize enemies
function initEnemies() {
    spiders = [];
    fleas = [];

    // Add spider
    if (Math.random() < 0.5) {
        spiders.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 200 + Math.random() * 100,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 2,
            size: 25
        });
    }
}

// Initialize wave
function initWave() {
    initMushrooms();
    initCentipede();
    initEnemies();
    bullets = [];
}

// Draw functions
function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

    // Gun
    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x - 3, player.y - player.height / 2 - 10, 6, 10);
}

function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
    });
}

function drawMushrooms() {
    mushrooms.forEach(mushroom => {
        const alpha = mushroom.health / 4;
        ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;

        // Mushroom cap
        ctx.beginPath();
        ctx.arc(mushroom.x + mushroom.size / 2, mushroom.y + mushroom.size / 2, mushroom.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Mushroom stem
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.fillRect(mushroom.x + mushroom.size / 3, mushroom.y + mushroom.size / 2, mushroom.size / 3, mushroom.size / 2);
    });
}

function drawCentipede() {
    centipede.forEach((segment, index) => {
        const hue = (index * 30) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

        ctx.beginPath();
        ctx.arc(segment.x + segmentSize / 2, segment.y + segmentSize / 2, segmentSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes for head
        if (index === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(segment.x + 5, segment.y + 5, 4, 4);
            ctx.fillRect(segment.x + segmentSize - 9, segment.y + 5, 4, 4);
        }
    });
}

function drawSpiders() {
    spiders.forEach(spider => {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(spider.x, spider.y, spider.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Spider legs
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(spider.x, spider.y);
            ctx.lineTo(
                spider.x + Math.cos(angle) * spider.size,
                spider.y + Math.sin(angle) * spider.size
            );
            ctx.stroke();
        }
    });
}

function drawFleas() {
    fleas.forEach(flea => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(flea.x - 5, flea.y - 10, 10, 20);
    });
}

// Update functions
function updatePlayer(mouseX) {
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, mouseX));
}

function shoot() {
    const now = Date.now();
    if (now - lastShot > shootCooldown) {
        bullets.push({
            x: player.x,
            y: player.y - player.height / 2
        });
        lastShot = now;
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;

        // Remove off-screen bullets
        if (bullet.y < 0) {
            bullets.splice(index, 1);
            return;
        }

        // Check mushroom collision
        mushrooms.forEach((mushroom, mIndex) => {
            if (bullet.x > mushroom.x && bullet.x < mushroom.x + mushroom.size &&
                bullet.y > mushroom.y && bullet.y < mushroom.y + mushroom.size) {
                mushroom.health--;
                bullets.splice(index, 1);

                if (mushroom.health <= 0) {
                    mushrooms.splice(mIndex, 1);
                    score += 1;
                }
            }
        });

        // Check centipede collision
        centipede.forEach((segment, sIndex) => {
            if (bullet.x > segment.x && bullet.x < segment.x + segmentSize &&
                bullet.y > segment.y && bullet.y < segment.y + segmentSize) {
                bullets.splice(index, 1);

                // Create mushroom at segment position
                mushrooms.push({
                    x: segment.x,
                    y: segment.y,
                    health: 4,
                    size: segmentSize
                });

                // Split centipede
                centipede.splice(sIndex, 1);
                score += 10;
                updateDisplay();
            }
        });

        // Check spider collision
        spiders.forEach((spider, sIndex) => {
            const dx = bullet.x - spider.x;
            const dy = bullet.y - spider.y;
            if (Math.sqrt(dx * dx + dy * dy) < spider.size / 2) {
                bullets.splice(index, 1);
                spiders.splice(sIndex, 1);
                score += 50;
                updateDisplay();
            }
        });
    });
}

function updateCentipede() {
    centipede.forEach((segment, index) => {
        if (segment.goingDown) {
            segment.y += segmentSize;
            segment.goingDown = false;
            segment.direction *= -1;
        } else {
            segment.x += segment.direction * segmentSize;

            // Check boundaries and mushrooms
            if (segment.x < 0 || segment.x >= canvas.width ||
                mushrooms.find(m => m.x === segment.x && m.y === segment.y + segmentSize)) {
                segment.goingDown = true;
            }
        }

        // Check if reached bottom
        if (segment.y >= canvas.height - 100) {
            segment.y = 0;
        }

        // Check collision with player
        if (Math.abs(segment.x - player.x) < segmentSize &&
            Math.abs(segment.y - player.y) < segmentSize) {
            playerDie();
        }
    });
}

function updateSpiders() {
    spiders.forEach((spider, index) => {
        spider.x += spider.vx;
        spider.y += spider.vy;

        // Bounce off edges
        if (spider.x < 0 || spider.x > canvas.width) {
            spider.vx *= -1;
        }
        if (spider.y < canvas.height - 250 || spider.y > canvas.height - 50) {
            spider.vy *= -1;
        }

        // Check player collision
        const dx = spider.x - player.x;
        const dy = spider.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < spider.size) {
            playerDie();
            spiders.splice(index, 1);
        }

        // Eat mushrooms
        mushrooms.forEach((mushroom, mIndex) => {
            if (Math.abs(spider.x - mushroom.x) < spider.size &&
                Math.abs(spider.y - mushroom.y) < spider.size) {
                mushrooms.splice(mIndex, 1);
            }
        });
    });
}

function spawnFlea() {
    if (Math.random() < 0.001 && mushrooms.filter(m => m.y > canvas.height - 200).length < 5) {
        fleas.push({
            x: Math.random() * canvas.width,
            y: 0,
            speed: 3 + wave * 0.5
        });
    }
}

function updateFleas() {
    fleas.forEach((flea, index) => {
        flea.y += flea.speed;

        // Drop mushrooms
        if (Math.random() < 0.1) {
            const x = Math.floor(flea.x / segmentSize) * segmentSize;
            const y = Math.floor(flea.y / segmentSize) * segmentSize;
            if (!mushrooms.find(m => m.x === x && m.y === y)) {
                mushrooms.push({ x, y, health: 4, size: segmentSize });
            }
        }

        // Remove if off screen
        if (flea.y > canvas.height) {
            fleas.splice(index, 1);
        }

        // Check player collision
        if (Math.abs(flea.x - player.x) < 10 && Math.abs(flea.y - player.y) < 15) {
            playerDie();
            fleas.splice(index, 1);
        }
    });
}

function playerDie() {
    lives--;
    updateDisplay();

    if (lives <= 0) {
        gameOver();
    }
}

function checkWaveComplete() {
    if (centipede.length === 0) {
        wave++;
        score += 100;
        updateDisplay();
        setTimeout(() => {
            initWave();
        }, 2000);
    }
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('centipedeHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalWave').textContent = wave;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Mouse controls
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    updatePlayer(mouseX);
});

canvas.addEventListener('click', () => {
    if (gameRunning && !paused) {
        shoot();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        shoot();
    }
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
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

        updateBullets();
        updateCentipede();
        updateSpiders();
        spawnFlea();
        updateFleas();
        checkWaveComplete();

        drawMushrooms();
        drawCentipede();
        drawSpiders();
        drawFleas();
        drawBullets();
        drawPlayer();
    }

    requestAnimationFrame(gameLoop);
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    lives = 3;
    wave = 1;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initWave();
    updateDisplay();
});

// Initialize
updateDisplay();
initWave();
gameLoop();

