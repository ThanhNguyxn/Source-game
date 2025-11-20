const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('spaceRaceHighScore')) || 0;
let distance = 0;
let gameSpeed = 2;

// Player rocket
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    width: 40,
    height: 60,
    speed: 7
};

// Game objects
let asteroids = [];
let fuel = [];
let stars = [];
let particles = [];

// Initialize stars background
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 2 + 1
        });
    }
}

function createAsteroid() {
    const size = 30 + Math.random() * 30;
    asteroids.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: gameSpeed + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2
    });
}

function createFuel() {
    fuel.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 30,
        speed: gameSpeed
    });
}

function createParticle(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 30,
            color: color
        });
    }
}

function drawPlayer() {
    // Rocket body
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Rocket flame
    if (gameRunning && !paused) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ff6b6b' : '#ffd93d';
        ctx.beginPath();
        ctx.moveTo(player.x + 10, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y + player.height + 20);
        ctx.lineTo(player.x + player.width - 10, player.y + player.height);
        ctx.closePath();
        ctx.fill();
    }

    // Rocket window
    ctx.fillStyle = '#64ffda';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 20, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawAsteroids() {
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
        ctx.rotate(asteroid.rotation);

        // Draw irregular asteroid
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const radius = asteroid.width / 2 * (0.7 + Math.random() * 0.3);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    });
}

function drawFuel() {
    fuel.forEach(f => {
        // Fuel canister
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(f.x, f.y, f.width, f.height);

        ctx.fillStyle = '#00d4aa';
        ctx.fillRect(f.x + 3, f.y + 3, f.width - 6, f.height - 6);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('F', f.x + f.width / 2, f.y + f.height / 2 + 3);
    });
}

function drawStars() {
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawParticles() {
    particles.forEach((p, index) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });
}

function update() {
    if (!gameRunning || paused) return;

    distance += gameSpeed;
    score = Math.floor(distance / 10);

    // Increase difficulty over time
    if (distance % 500 === 0 && gameSpeed < 8) {
        gameSpeed += 0.2;
    }

    // Update stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // Spawn asteroids
    if (Math.random() < 0.02) {
        createAsteroid();
    }

    // Spawn fuel
    if (Math.random() < 0.01) {
        createFuel();
    }

    // Update asteroids
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroid.speed;
        asteroid.rotation += 0.05;

        // Remove off-screen asteroids
        if (asteroid.y > canvas.height) {
            asteroids.splice(index, 1);
        }

        // Check collision with player
        if (
            player.x < asteroid.x + asteroid.width &&
            player.x + player.width > asteroid.x &&
            player.y < asteroid.y + asteroid.height &&
            player.y + player.height > asteroid.y
        ) {
            gameOver();
        }
    });

    // Update fuel
    fuel.forEach((f, index) => {
        f.y += f.speed;

        // Remove off-screen fuel
        if (f.y > canvas.height) {
            fuel.splice(index, 1);
        }

        // Check collection
        if (
            player.x < f.x + f.width &&
            player.x + player.width > f.x &&
            player.y < f.y + f.height &&
            player.y + player.height > f.y
        ) {
            fuel.splice(index, 1);
            score += 50;
            createParticle(f.x + f.width / 2, f.y + f.height / 2, '#00ff88');
        }
    });

    updateDisplay();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawFuel();
    drawAsteroids();
    drawPlayer();
    drawParticles();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('speed').textContent = gameSpeed.toFixed(1);
}

function gameOver() {
    gameRunning = false;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceRaceHighScore', highScore);
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalDistance').textContent = Math.floor(distance);
    document.getElementById('gameOver').classList.remove('hidden');
}

const keys = {};
window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', ' ', 'a', 'A', 'd', 'D', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function movePlayer() {
    if (!gameRunning || paused) return;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
    }

    // Keep player in bounds
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    requestAnimationFrame(movePlayer);
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;

        score = 0;
        distance = 0;
        gameSpeed = 2;
        asteroids = [];
        fuel = [];
        particles = [];

        initStars();
        updateDisplay();
        gameLoop();
        movePlayer();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    distance = 0;
    gameSpeed = 2;
    asteroids = [];
    fuel = [];
    particles = [];
    gameRunning = true;
    paused = false;

    player.x = canvas.width / 2 - 20;

    document.getElementById('gameOver').classList.add('hidden');
    initStars();
    updateDisplay();
});

updateDisplay();

