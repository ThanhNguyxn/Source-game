const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let combo = 1;
let maxCombo = 1;
let lives = 3;

let fruits = [];
let slashTrail = [];
let particles = [];

const FRUIT_TYPES = [
    { emoji: '🍎', color: '#ff0000', points: 10 },
    { emoji: '🍊', color: '#ff8800', points: 10 },
    { emoji: '🍋', color: '#ffff00', points: 10 },
    { emoji: '🍉', color: '#00ff00', points: 15 },
    { emoji: '🍇', color: '#9900ff', points: 15 },
    { emoji: '💣', color: '#333', points: -50, isBomb: true }
];

function createFruit() {
    const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    const x = 50 + Math.random() * (canvas.width - 100);
    const velocityX = (Math.random() - 0.5) * 8;
    const velocityY = -10 - Math.random() * 5;

    fruits.push({
        x: x,
        y: canvas.height,
        velocityX: velocityX,
        velocityY: velocityY,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        type: type,
        sliced: false,
        size: 30
    });
}

function drawFruit(fruit) {
    if (fruit.sliced) return;

    ctx.save();
    ctx.translate(fruit.x, fruit.y);
    ctx.rotate(fruit.rotation);

    // Draw fruit
    ctx.font = `${fruit.size * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruit.type.emoji, 0, 0);

    ctx.restore();
}

function drawSlashTrail() {
    if (slashTrail.length < 2) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(slashTrail[0].x, slashTrail[0].y);

    for (let i = 1; i < slashTrail.length; i++) {
        ctx.lineTo(slashTrail[i].x, slashTrail[i].y);
    }

    ctx.stroke();
}

function drawParticles() {
    particles.forEach((p, idx) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.life--;

        if (p.life <= 0) particles.splice(idx, 1);
    });
}

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: color,
            size: 3 + Math.random() * 3,
            life: 30,
            maxLife: 30
        });
    }
}

function draw() {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fruits.forEach(fruit => drawFruit(fruit));
    drawParticles();
    drawSlashTrail();

    // Combo display
    if (combo > 1) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`x${combo} COMBO!`, canvas.width / 2, 80);
    }
}

function update() {
    if (!gameRunning || paused) return;

    // Spawn fruits
    if (Math.random() < 0.02) {
        createFruit();
    }

    // Update fruits
    fruits.forEach((fruit, idx) => {
        fruit.velocityY += 0.4; // gravity
        fruit.x += fruit.velocityX;
        fruit.y += fruit.velocityY;
        fruit.rotation += fruit.rotationSpeed;

        // Remove if off screen
        if (fruit.y > canvas.height + 50 || fruit.x < -50 || fruit.x > canvas.width + 50) {
            if (!fruit.sliced && !fruit.type.isBomb) {
                lives--;
                combo = 1;
                updateDisplay();

                if (lives <= 0) {
                    gameOver();
                }
            }
            fruits.splice(idx, 1);
        }
    });

    // Fade slash trail
    slashTrail.forEach((point, idx) => {
        point.life--;
        if (point.life <= 0) {
            slashTrail.splice(idx, 1);
        }
    });
}

function checkSlash(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;

    fruits.forEach((fruit, idx) => {
        if (fruit.sliced) return;

        const dist = Math.sqrt(
            Math.pow(canvasX - fruit.x, 2) +
            Math.pow(canvasY - fruit.y, 2)
        );

        if (dist < fruit.size) {
            fruit.sliced = true;

            if (fruit.type.isBomb) {
                // Hit bomb - lose life
                lives--;
                combo = 1;
                createParticles(fruit.x, fruit.y, '#ff0000', 20);

                if (lives <= 0) {
                    gameOver();
                }
            } else {
                // Sliced fruit
                score += fruit.type.points * combo;
                combo = Math.min(combo + 1, 10);
                maxCombo = Math.max(maxCombo, combo);
                createParticles(fruit.x, fruit.y, fruit.type.color, 15);
            }

            fruits.splice(idx, 1);
            updateDisplay();
        }
    });
}

let isSlashing = false;
let lastSlashTime = 0;

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || paused) return;
    isSlashing = true;
    slashTrail = [];
    lastSlashTime = Date.now();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isSlashing || !gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    slashTrail.push({ x, y, life: 10 });

    if (slashTrail.length > 20) slashTrail.shift();

    checkSlash(e.clientX, e.clientY);
});

canvas.addEventListener('mouseup', () => {
    isSlashing = false;

    // Reset combo if no slash for 2 seconds
    if (Date.now() - lastSlashTime > 2000) {
        combo = 1;
    }
});

canvas.addEventListener('mouseleave', () => {
    isSlashing = false;
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = 'x' + combo;
    document.getElementById('target').textContent = lives;
}

function gameOver() {
    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCombo').textContent = 'x' + maxCombo;
    document.getElementById('gameOver').classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;

        score = 0;
        combo = 1;
        maxCombo = 1;
        lives = 3;
        fruits = [];
        slashTrail = [];
        particles = [];

        updateDisplay();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    combo = 1;
    maxCombo = 1;
    lives = 3;
    fruits = [];
    slashTrail = [];
    particles = [];
    gameRunning = true;
    paused = false;

    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
});

updateDisplay();

