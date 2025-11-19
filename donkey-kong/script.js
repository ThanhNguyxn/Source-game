const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
let highScore = parseInt(localStorage.getItem('donkeyKongHighScore')) || 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let paused = false;

// Player (Mario)
const player = {
    x: 50,
    y: canvas.height - 100,
    width: 30,
    height: 40,
    speed: 4,
    velocityY: 0,
    jumping: false,
    gravity: 0.6,
    jumpPower: -12,
    onPlatform: false
};

// Platforms
const platforms = [
    { x: 0, y: canvas.height - 50, width: canvas.width, height: 20 },
    { x: 100, y: canvas.height - 150, width: 600, height: 20 },
    { x: 50, y: canvas.height - 250, width: 600, height: 20 },
    { x: 150, y: canvas.height - 350, width: 500, height: 20 },
    { x: 100, y: canvas.height - 450, width: 600, height: 20 },
    { x: 50, y: canvas.height - 550, width: 200, height: 20 } // Top platform with princess
];

// Ladders
const ladders = [
    { x: 150, y: canvas.height - 150, width: 30, height: 100 },
    { x: 600, y: canvas.height - 250, width: 30, height: 100 },
    { x: 200, y: canvas.height - 350, width: 30, height: 100 },
    { x: 550, y: canvas.height - 450, width: 30, height: 100 },
    { x: 150, y: canvas.height - 550, width: 30, height: 100 }
];

// Barrels
let barrels = [];
const barrelSpawnRate = 2000 - (level * 200);
let lastBarrelSpawn = 0;

// Donkey Kong
const donkeyKong = {
    x: 50,
    y: canvas.height - 580,
    width: 60,
    height: 60
};

// Princess
const princess = {
    x: 150,
    y: canvas.height - 590,
    width: 30,
    height: 40
};

// Keys
const keys = {};

// Draw functions
function drawPlayer() {
    // Mario body
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Hat
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(player.x, player.y, player.width, 10);

    // Face
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15);
}

function drawPlatforms() {
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Platform detail
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < platform.width; i += 40) {
            ctx.strokeRect(platform.x + i, platform.y, 40, platform.height);
        }
    });
}

function drawLadders() {
    ctx.fillStyle = '#DAA520';
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 3;

    ladders.forEach(ladder => {
        // Vertical rails
        ctx.fillRect(ladder.x, ladder.y, 5, ladder.height);
        ctx.fillRect(ladder.x + ladder.width - 5, ladder.y, 5, ladder.height);

        // Rungs
        for (let y = ladder.y; y < ladder.y + ladder.height; y += 15) {
            ctx.strokeStyle = '#B8860B';
            ctx.beginPath();
            ctx.moveTo(ladder.x, y);
            ctx.lineTo(ladder.x + ladder.width, y);
            ctx.stroke();
        }
    });
}

function drawBarrels() {
    barrels.forEach(barrel => {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(barrel.x, barrel.y, barrel.radius, 0, Math.PI * 2);
        ctx.fill();

        // Barrel bands
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(barrel.x, barrel.y, barrel.radius - 3, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawDonkeyKong() {
    // Body
    ctx.fillStyle = '#654321';
    ctx.fillRect(donkeyKong.x, donkeyKong.y, donkeyKong.width, donkeyKong.height);

    // Face
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(donkeyKong.x + 10, donkeyKong.y + 10, donkeyKong.width - 20, 30);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(donkeyKong.x + 15, donkeyKong.y + 20, 10, 10);
    ctx.fillRect(donkeyKong.x + 35, donkeyKong.y + 20, 10, 10);
}

function drawPrincess() {
    // Body
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(princess.x, princess.y, princess.width, princess.height);

    // Head
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(princess.x + 5, princess.y - 10, princess.width - 10, 10);

    // Crown
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(princess.x + 8, princess.y - 15, princess.width - 16, 5);
}

// Update functions
function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
    }

    // Jumping
    if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && !player.jumping) {
        if (player.onPlatform) {
            player.velocityY = player.jumpPower;
            player.jumping = true;
            player.onPlatform = false;
        }
    }

    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Check platform collisions
    player.onPlatform = false;
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 10 &&
            player.velocityY > 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
            player.onPlatform = true;
        }
    });

    // Ladder climbing
    ladders.forEach(ladder => {
        if (player.x + player.width > ladder.x &&
            player.x < ladder.x + ladder.width) {
            if ((keys['ArrowUp'] || keys['w'] || keys['W']) &&
                player.y + player.height > ladder.y &&
                player.y < ladder.y + ladder.height) {
                player.y -= 3;
                player.velocityY = 0;
                player.jumping = false;
            }
            if ((keys['ArrowDown'] || keys['s'] || keys['S']) &&
                player.y > ladder.y &&
                player.y < ladder.y + ladder.height) {
                player.y += 3;
                player.velocityY = 0;
            }
        }
    });

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height) {
        playerDie();
    }

    // Check win condition
    if (Math.abs(player.x - princess.x) < 30 &&
        Math.abs(player.y - princess.y) < 40) {
        levelComplete();
    }
}

function spawnBarrel() {
    const now = Date.now();
    if (now - lastBarrelSpawn > barrelSpawnRate) {
        barrels.push({
            x: donkeyKong.x + 30,
            y: donkeyKong.y + 60,
            radius: 12,
            velocityX: 2 + level * 0.5,
            velocityY: 0,
            onPlatform: false
        });
        lastBarrelSpawn = now;
    }
}

function updateBarrels() {
    barrels.forEach((barrel, index) => {
        barrel.x += barrel.velocityX;
        barrel.velocityY += 0.5;
        barrel.y += barrel.velocityY;

        // Platform collision
        barrel.onPlatform = false;
        platforms.forEach(platform => {
            if (barrel.x > platform.x &&
                barrel.x < platform.x + platform.width &&
                barrel.y + barrel.radius > platform.y &&
                barrel.y + barrel.radius < platform.y + 30 &&
                barrel.velocityY > 0) {
                barrel.y = platform.y - barrel.radius;
                barrel.velocityY = -2;
                barrel.onPlatform = true;
            }
        });

        // Remove off-screen barrels
        if (barrel.x > canvas.width || barrel.y > canvas.height) {
            barrels.splice(index, 1);
        }

        // Check collision with player
        const dx = barrel.x - (player.x + player.width / 2);
        const dy = barrel.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < barrel.radius + 20) {
            playerDie();
            barrels.splice(index, 1);
        }
    });
}

function playerDie() {
    lives--;
    updateDisplay();

    if (lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        player.x = 50;
        player.y = canvas.height - 100;
        player.velocityY = 0;
        player.jumping = false;
        barrels = [];
    }
}

function levelComplete() {
    level++;
    score += 1000 * level;
    updateDisplay();

    // Reset for next level
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.jumping = false;
    barrels = [];
    lastBarrelSpawn = 0;
}

function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('donkeyKongHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Controls
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// Game loop
function gameLoop() {
    if (gameRunning && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawPlatforms();
        drawLadders();
        drawDonkeyKong();
        drawPrincess();
        drawBarrels();
        drawPlayer();

        updatePlayer();
        spawnBarrel();
        updateBarrels();
    }

    requestAnimationFrame(gameLoop);
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    lives = 3;
    level = 1;
    barrels = [];
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.jumping = false;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
});

// Initialize
updateDisplay();
gameLoop();

