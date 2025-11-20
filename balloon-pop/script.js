const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let timeLeft = 60;
let combo = 1;
let comboTimer = 0;
let maxCombo = 1;
let balloonsPopped = 0;

let balloons = [];
let popEffects = [];
let clouds = [];

// Balloon types
const BALLOON_TYPES = {
    RED: { color: '#ff6b6b', points: 10, chance: 0.7 },
    BLUE: { color: '#4ecdc4', points: 15, chance: 0.15 },
    GOLD: { color: '#ffd700', points: 50, chance: 0.1 },
    BLACK: { color: '#2d3436', points: -20, chance: 0.05 }
};

// Initialize clouds
function initClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 200,
            speed: 0.2 + Math.random() * 0.3,
            width: 80 + Math.random() * 40
        });
    }
}

function createBalloon() {
    const rand = Math.random();
    let type = BALLOON_TYPES.RED;

    if (rand < 0.05) type = BALLOON_TYPES.BLACK;
    else if (rand < 0.15) type = BALLOON_TYPES.GOLD;
    else if (rand < 0.30) type = BALLOON_TYPES.BLUE;

    balloons.push({
        x: Math.random() * (canvas.width - 60) + 30,
        y: canvas.height + 50,
        width: 50,
        height: 70,
        speed: 1 + Math.random() * 1.5,
        sway: Math.random() * 2 - 1,
        swayOffset: Math.random() * Math.PI * 2,
        type: type,
        rotation: Math.random() * 0.2 - 0.1
    });
}

function drawBalloon(balloon) {
    ctx.save();
    ctx.translate(balloon.x, balloon.y);

    // String
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, balloon.height / 2);
    ctx.lineTo(0, balloon.height + 30);
    ctx.stroke();

    // Balloon body
    ctx.fillStyle = balloon.type.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, balloon.width / 2, balloon.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-balloon.width / 6, -balloon.height / 6, balloon.width / 6, balloon.height / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Balloon knot
    ctx.fillStyle = balloon.type.color;
    ctx.beginPath();
    ctx.ellipse(0, balloon.height / 2, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPopEffect(effect) {
    const progress = 1 - (effect.life / effect.maxLife);
    const radius = 30 * progress;

    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 5 * (1 - progress);
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Particles
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const distance = radius * 1.5;
        const x = effect.x + Math.cos(angle) * distance;
        const y = effect.y + Math.sin(angle) * distance;

        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(x, y, 3 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
    }
}

function update() {
    if (!gameRunning || paused) return;

    // Update timer
    if (Date.now() % 1000 < 17) { // Approximately every second
        timeLeft--;
        if (timeLeft <= 0) {
            gameOver();
            return;
        }
    }

    // Update combo timer
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) {
            combo = 1;
        }
    }

    // Spawn balloons
    if (Math.random() < 0.03) {
        createBalloon();
    }

    // Update clouds
    clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.width) {
            cloud.x = -cloud.width;
        }
    });

    // Update balloons
    balloons.forEach((balloon, index) => {
        balloon.y -= balloon.speed;
        balloon.x += Math.sin(balloon.swayOffset) * balloon.sway;
        balloon.swayOffset += 0.05;

        // Remove balloons that floated away
        if (balloon.y < -100) {
            balloons.splice(index, 1);
            if (combo > 1) {
                combo = Math.max(1, combo - 1);
            }
        }
    });

    // Update pop effects
    popEffects.forEach((effect, index) => {
        effect.life--;
        if (effect.life <= 0) {
            popEffects.splice(index, 1);
        }
    });

    updateDisplay();
}

function draw() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds();

    balloons.forEach(balloon => drawBalloon(balloon));
    popEffects.forEach(effect => drawPopEffect(effect));
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('combo').textContent = 'x' + combo;
}

function gameOver() {
    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalPopped').textContent = balloonsPopped;
    document.getElementById('maxCombo').textContent = 'x' + maxCombo;
    document.getElementById('gameOver').classList.remove('hidden');
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a balloon
    for (let i = balloons.length - 1; i >= 0; i--) {
        const balloon = balloons[i];
        const dx = x - balloon.x;
        const dy = y - balloon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < balloon.width / 2) {
            // Pop the balloon!
            const points = balloon.type.points * combo;
            score += points;
            balloonsPopped++;

            // Increase combo
            if (balloon.type.points > 0) {
                combo = Math.min(combo + 1, 10);
                maxCombo = Math.max(maxCombo, combo);
                comboTimer = 60; // 1 second to keep combo
            } else {
                combo = 1;
                comboTimer = 0;
            }

            // Create pop effect
            popEffects.push({
                x: balloon.x,
                y: balloon.y,
                color: balloon.type.color,
                life: 20,
                maxLife: 20
            });

            balloons.splice(i, 1);
            updateDisplay();
            break;
        }
    }
});

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
        timeLeft = 60;
        combo = 1;
        maxCombo = 1;
        balloonsPopped = 0;
        balloons = [];
        popEffects = [];

        initClouds();
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
    timeLeft = 60;
    combo = 1;
    maxCombo = 1;
    balloonsPopped = 0;
    balloons = [];
    popEffects = [];
    gameRunning = true;
    paused = false;

    document.getElementById('gameOver').classList.add('hidden');
    initClouds();
    updateDisplay();
});

updateDisplay();

