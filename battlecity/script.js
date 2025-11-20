const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let lives = 3;
let level = 1;
let coins = 0;

const player = {
    x: 50,
    y: canvas.height - 100,
    width: 30,
    height: 40,
    speed: 5,
    velocityY: 0,
    gravity: 0.8,
    jumpPower: -15,
    onGround: false,
    direction: 1
};

let enemies = [];
let platforms = [];
let coins_list = [];
let flag = null;

function initLevel() {
    platforms = [
        { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
        { x: 200, y: canvas.height - 150, width: 150, height: 20 },
        { x: 450, y: canvas.height - 200, width: 150, height: 20 },
        { x: 150, y: canvas.height - 280, width: 120, height: 20 }
    ];

    enemies = [];
    for (let i = 0; i < 3 + level; i++) {
        enemies.push({
            x: 250 + i * 150,
            y: canvas.height - 100,
            width: 30,
            height: 30,
            speed: 1 + level * 0.3,
            direction: 1,
            alive: true
        });
    }

    coins_list = [];
    for (let i = 0; i < 8; i++) {
        coins_list.push({
            x: 150 + i * 100,
            y: canvas.height - 180 - Math.random() * 100,
            collected: false
        });
    }

    flag = { x: canvas.width - 80, y: canvas.height - 150 };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 50);

    // Platforms
    ctx.fillStyle = '#8b4513';
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeStyle = '#654321';
        ctx.strokeRect(p.x, p.y, p.width, p.height);
    });

    // Coins
    coins_list.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff8c00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Flag
    ctx.fillStyle = '#000';
    ctx.fillRect(flag.x, flag.y, 5, 100);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(flag.x + 5, flag.y, 30, 20);

    // Player
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#ffcba4';
    ctx.fillRect(player.x + 8, player.y, 14, 14);

    // Enemies
    enemies.forEach(e => {
        if (e.alive) {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(e.x, e.y, e.width, e.height);
            ctx.fillStyle = '#654321';
            ctx.fillRect(e.x + 5, e.y - 8, e.width - 10, 8);
        }
    });
}

function update() {
    if (!gameRunning || paused) return;

    // Player physics
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    player.onGround = false;
    platforms.forEach(p => {
        if (player.x + player.width > p.x && player.x < p.x + p.width &&
            player.y + player.height > p.y && player.y + player.height < p.y + p.height + 10 &&
            player.velocityY > 0) {
            player.y = p.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        }
    });

    if (player.y > canvas.height) {
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

    // Enemies
    enemies.forEach((e, idx) => {
        if (!e.alive) return;

        e.x += e.speed * e.direction;
        if (e.x < 0 || e.x > canvas.width - e.width) e.direction *= -1;

        // Check collision with player
        if (player.x + player.width > e.x && player.x < e.x + e.width &&
            player.y + player.height > e.y && player.y < e.y + e.height) {
            // Jumping on enemy
            if (player.velocityY > 0 && player.y < e.y) {
                e.alive = false;
                score += 100;
                player.velocityY = -10;
                updateDisplay();
            } else {
                // Hit by enemy
                lives--;
                updateDisplay();
                if (lives <= 0) {
                    gameOver();
                } else {
                    player.x = 50;
                    player.y = canvas.height - 100;
                }
            }
        }
    });

    // Coins
    coins_list.forEach(coin => {
        if (!coin.collected && Math.abs(player.x - coin.x) < 20 && Math.abs(player.y - coin.y) < 20) {
            coin.collected = true;
            coins++;
            score += 50;
            updateDisplay();
        }
    });

    // Flag
    if (player.x + player.width > flag.x && player.x < flag.x + 35) {
        nextLevel();
    }
}

function nextLevel() {
    level++;
    score += 500;
    updateDisplay();
    initLevel();
    player.x = 50;
    player.y = canvas.height - 100;
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('coins').textContent = coins;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalCoins').textContent = coins;
    document.getElementById('gameOver').classList.remove('hidden');
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') && player.onGround) {
        e.preventDefault();
        player.velocityY = player.jumpPower;
    }
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function gameLoop() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
        player.direction = -1;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
        player.direction = 1;
    }
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;
        initLevel();
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
    coins = 0;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initLevel();
    updateDisplay();
});

updateDisplay();

