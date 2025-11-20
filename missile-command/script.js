const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
let wave = 1;
let citiesLeft = 6;
let missilesLeft = 30;
let gameRunning = true;
let paused = false;

// Cities
const cities = [];
const cityWidth = 40;
const cityHeight = 30;
const cityY = canvas.height - cityHeight - 10;

// Initialize cities
for (let i = 0; i < 6; i++) {
    const x = (i < 3)
        ? 100 + i * 100
        : 500 + (i - 3) * 100;
    cities.push({
        x: x,
        y: cityY,
        alive: true
    });
}

// Batteries (missile launchers)
const batteries = [
    { x: 100, y: canvas.height - 10, missiles: 10 },
    { x: canvas.width / 2, y: canvas.height - 10, missiles: 10 },
    { x: canvas.width - 100, y: canvas.height - 10, missiles: 10 }
];

// Enemy missiles
let enemyMissiles = [];

// Defensive missiles
let defensiveMissiles = [];

// Explosions
let explosions = [];

// Stars background
let stars = [];
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2
    });
}

// Spawn enemy missiles
function spawnEnemyMissiles() {
    const count = 5 + wave * 2;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const startX = Math.random() * canvas.width;
            const targetCity = cities.filter(c => c.alive)[Math.floor(Math.random() * cities.filter(c => c.alive).length)];

            if (targetCity) {
                enemyMissiles.push({
                    x: startX,
                    y: 0,
                    targetX: targetCity.x + cityWidth / 2,
                    targetY: cityY,
                    speed: 1 + wave * 0.2,
                    trail: []
                });
            }
        }, i * 500);
    }
}

// Draw functions
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawGround() {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

function drawCities() {
    cities.forEach(city => {
        if (city.alive) {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(city.x, city.y, cityWidth, cityHeight);

            // Windows
            ctx.fillStyle = '#ffff00';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    ctx.fillRect(city.x + 5 + i * 12, city.y + 5 + j * 12, 8, 8);
                }
            }
        }
    });
}

function drawBatteries() {
    batteries.forEach(battery => {
        if (battery.missiles > 0) {
            ctx.fillStyle = '#0080ff';
            ctx.beginPath();
            ctx.moveTo(battery.x, battery.y);
            ctx.lineTo(battery.x - 15, battery.y);
            ctx.lineTo(battery.x - 10, battery.y - 20);
            ctx.lineTo(battery.x + 10, battery.y - 20);
            ctx.lineTo(battery.x + 15, battery.y);
            ctx.closePath();
            ctx.fill();

            // Missile count
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(battery.missiles, battery.x - 10, battery.y - 25);
        }
    });
}

function drawEnemyMissiles() {
    enemyMissiles.forEach(missile => {
        // Trail
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        missile.trail.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Missile head
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawDefensiveMissiles() {
    defensiveMissiles.forEach(missile => {
        // Trail
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(missile.startX, missile.startY);
        ctx.lineTo(missile.x, missile.y);
        ctx.stroke();

        // Missile head
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawExplosions() {
    explosions.forEach(explosion => {
        const alpha = explosion.life / explosion.maxLife;
        ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update functions
function updateEnemyMissiles() {
    enemyMissiles.forEach((missile, index) => {
        const dx = missile.targetX - missile.x;
        const dy = missile.targetY - missile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < missile.speed) {
            // Hit target
            checkCityHit(missile.targetX, missile.targetY);
            enemyMissiles.splice(index, 1);
        } else {
            missile.x += (dx / distance) * missile.speed;
            missile.y += (dy / distance) * missile.speed;

            // Add to trail
            missile.trail.push({ x: missile.x, y: missile.y });
            if (missile.trail.length > 20) {
                missile.trail.shift();
            }
        }
    });
}

function updateDefensiveMissiles() {
    defensiveMissiles.forEach((missile, index) => {
        const dx = missile.targetX - missile.x;
        const dy = missile.targetY - missile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < missile.speed) {
            // Create explosion
            explosions.push({
                x: missile.targetX,
                y: missile.targetY,
                radius: 0,
                maxRadius: 80,
                life: 60,
                maxLife: 60
            });
            defensiveMissiles.splice(index, 1);
        } else {
            missile.x += (dx / distance) * missile.speed;
            missile.y += (dy / distance) * missile.speed;
        }
    });
}

function updateExplosions() {
    explosions.forEach((explosion, index) => {
        explosion.life--;

        if (explosion.radius < explosion.maxRadius) {
            explosion.radius += 2;
        }

        if (explosion.life <= 0) {
            explosions.splice(index, 1);
        } else {
            // Check if explosion hits enemy missiles
            enemyMissiles.forEach((missile, mIndex) => {
                const dx = missile.x - explosion.x;
                const dy = missile.y - explosion.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < explosion.radius) {
                    enemyMissiles.splice(mIndex, 1);
                    score += 25;
                    updateDisplay();
                }
            });
        }
    });
}

function checkCityHit(x, y) {
    cities.forEach(city => {
        if (city.alive &&
            x > city.x && x < city.x + cityWidth &&
            y > city.y && y < city.y + cityHeight) {
            city.alive = false;
            citiesLeft--;
            updateDisplay();

            // Create explosion
            explosions.push({
                x: city.x + cityWidth / 2,
                y: city.y + cityHeight / 2,
                radius: 0,
                maxRadius: 60,
                life: 40,
                maxLife: 40
            });
        }
    });

    // Check if game over
    if (citiesLeft <= 0) {
        gameOver();
    }
}

function checkWaveComplete() {
    if (enemyMissiles.length === 0 && defensiveMissiles.length === 0 && explosions.length === 0) {
        wave++;
        score += citiesLeft * 100 + missilesLeft * 5;
        updateDisplay();

        setTimeout(() => {
            // Refill missiles
            batteries.forEach(b => b.missiles = 10);
            missilesLeft = 30;
            updateDisplay();
            spawnEnemyMissiles();
        }, 2000);
    }
}

function launchDefensiveMissile(targetX, targetY) {
    if (missilesLeft <= 0) return;

    // Find nearest battery with missiles
    let nearestBattery = null;
    let minDistance = Infinity;

    batteries.forEach(battery => {
        if (battery.missiles > 0) {
            const distance = Math.abs(battery.x - targetX);
            if (distance < minDistance) {
                minDistance = distance;
                nearestBattery = battery;
            }
        }
    });

    if (nearestBattery) {
        nearestBattery.missiles--;
        missilesLeft--;
        updateDisplay();

        defensiveMissiles.push({
            x: nearestBattery.x,
            y: nearestBattery.y,
            startX: nearestBattery.x,
            startY: nearestBattery.y,
            targetX: targetX,
            targetY: targetY,
            speed: 8
        });
    }
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalWave').textContent = wave;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Mouse control
canvas.addEventListener('click', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    launchDefensiveMissile(x, y);
});

// Keyboard control
window.addEventListener('keydown', (e) => {
    // Prevent default scrolling for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }
});

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('cities').textContent = citiesLeft;
    document.getElementById('wave').textContent = wave;
    document.getElementById('missiles').textContent = missilesLeft;
}

// Game loop
function gameLoop() {
    if (gameRunning && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateEnemyMissiles();
        updateDefensiveMissiles();
        updateExplosions();
        checkWaveComplete();

        drawStars();
        drawGround();
        drawCities();
        drawBatteries();
        drawEnemyMissiles();
        drawDefensiveMissiles();
        drawExplosions();
    }

    requestAnimationFrame(gameLoop);
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    wave = 1;
    citiesLeft = 6;
    missilesLeft = 30;
    gameRunning = true;
    paused = false;

    cities.forEach(city => city.alive = true);
    batteries.forEach(b => b.missiles = 10);
    enemyMissiles = [];
    defensiveMissiles = [];
    explosions = [];

    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
    spawnEnemyMissiles();
});

// Initialize game
updateDisplay();
spawnEnemyMissiles();
gameLoop();

