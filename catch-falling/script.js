const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 700;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let lives = 3;
let level = 1;

const basket = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 80,
    width: 100,
    height: 30,
    speed: 8
};

const ITEM_TYPES = [
    { emoji: '🍎', points: 10, isBad: false },
    { emoji: '🍊', points: 15, isBad: false },
    { emoji: '🍋', points: 12, isBad: false },
    { emoji: '🍉', points: 20, isBad: false },
    { emoji: '🍇', points: 18, isBad: false },
    { emoji: '⭐', points: 50, isBad: false },
    { emoji: '💣', points: 0, isBad: true }
];

let fallingItems = [];
let particles = [];

function createFallingItem() {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    fallingItems.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -50,
        width: 40,
        height: 40,
        speed: 2 + level * 0.3 + Math.random(),
        type: type
    });
}

function drawBasket() {
    // Basket body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);

    // Basket pattern
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(basket.x + i * 20, basket.y);
        ctx.lineTo(basket.x + i * 20, basket.y + basket.height);
        ctx.stroke();
    }

    // Handle
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(basket.x + basket.width / 2, basket.y - 10, 30, 0, Math.PI, true);
    ctx.stroke();
}

function drawFallingItem(item) {
    ctx.font = '35px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.type.emoji, item.x + item.width / 2, item.y + item.height / 2);
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
        p.vy += 0.2;
        p.life--;

        if (p.life <= 0) particles.splice(idx, 1);
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: color,
            size: 3 + Math.random() * 4,
            life: 40,
            maxLife: 40
        });
    }
}

function draw() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    fallingItems.forEach(item => drawFallingItem(item));
    drawParticles();
    drawBasket();

    // Level indicator
    if (level > 1) {
        ctx.fillStyle = '#FF6347';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${level}`, 10, 30);
    }
}

function update() {
    if (!gameRunning || paused) return;

    // Spawn items
    if (Math.random() < 0.02 + level * 0.005) {
        createFallingItem();
    }

    // Update falling items
    fallingItems.forEach((item, idx) => {
        item.y += item.speed;

        // Check catch
        if (item.y + item.height >= basket.y &&
            item.y <= basket.y + basket.height &&
            item.x + item.width >= basket.x &&
            item.x <= basket.x + basket.width) {

            if (item.type.isBad) {
                lives--;
                createParticles(item.x + item.width / 2, item.y + item.height / 2, '#ff0000');
                updateDisplay();
                if (lives <= 0) {
                    gameOver();
                }
            } else {
                score += item.type.points;
                createParticles(item.x + item.width / 2, item.y + item.height / 2, '#00ff00');
                updateDisplay();

                // Level up
                if (score > level * 200) {
                    level++;
                    updateDisplay();
                }
            }

            fallingItems.splice(idx, 1);
        }

        // Remove if off screen
        if (item.y > canvas.height) {
            if (!item.type.isBad) {
                lives--;
                updateDisplay();
                if (lives <= 0) {
                    gameOver();
                }
            }
            fallingItems.splice(idx, 1);
        }
    });
}

const keys = {};
window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D', 'p', 'P'].includes(e.key)) {
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

canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    basket.x = Math.max(0, Math.min(canvas.width - basket.width, mouseX - basket.width / 2));
});

function moveBasket() {
    if (!gameRunning || paused) return;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        basket.x -= basket.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        basket.x += basket.speed;
    }

    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
}

function gameLoop() {
    moveBasket();
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;

        score = 0;
        lives = 3;
        level = 1;
        fallingItems = [];
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
    lives = 3;
    level = 1;
    fallingItems = [];
    particles = [];
    gameRunning = true;
    paused = false;

    basket.x = canvas.width / 2 - 50;
    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
});

updateDisplay();

