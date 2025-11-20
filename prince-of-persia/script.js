const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let level = 1;
let health = 3;
let timeRemaining = 60 * 60; // 60 minutes in seconds

const player = {
    x: 50,
    y: canvas.height - 150,
    width: 25,
    height: 40,
    speed: 3,
    velocityY: 0,
    jumping: false,
    gravity: 0.6,
    jumpPower: -12,
    onGround: false,
    direction: 1,
    attacking: false,
    attackTimer: 0
};

let platforms = [];
let enemies = [];
let spikes = [];
let doors = [];
let potions = [];
let particles = [];

function initLevel() {
    platforms = [
        { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
        { x: 150, y: canvas.height - 150, width: 200, height: 20 },
        { x: 450, y: canvas.height - 200, width: 200, height: 20 },
        { x: 200, y: canvas.height - 280, width: 150, height: 20 },
        { x: 500, y: canvas.height - 350, width: 150, height: 20 }
    ];

    spikes = [
        { x: 380, y: canvas.height - 70, width: 60, height: 20 },
        { x: 650, y: canvas.height - 220, width: 40, height: 20 }
    ];

    enemies = [];
    const enemyCount = 2 + level;
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: 200 + i * 200,
            y: canvas.height - 100,
            width: 25,
            height: 40,
            speed: 1,
            direction: 1,
            health: 2,
            attackTimer: 0
        });
    }

    potions = [
        { x: 250, y: canvas.height - 180, collected: false },
        { x: 550, y: canvas.height - 230, collected: false }
    ];

    doors = [{ x: canvas.width - 80, y: canvas.height - 140, width: 50, height: 90 }];
}

function drawPlayer() {
    // Body
    ctx.fillStyle = player.attacking ? '#ff6b6b' : '#e74c3c';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Head
    ctx.fillStyle = '#ffcba4';
    ctx.fillRect(player.x + 5, player.y - 10, 15, 15);

    // Sword
    if (player.attacking) {
        ctx.fillStyle = '#c0c0c0';
        const swordX = player.direction > 0 ? player.x + player.width : player.x - 20;
        ctx.fillRect(swordX, player.y + 10, 20, 3);
    }

    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.x + 5, player.y - 15, 15, 5);
}

function drawPlatforms() {
    ctx.fillStyle = '#8b4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        // Brick pattern
        ctx.strokeStyle = '#654321';
        for (let x = 0; x < platform.width; x += 40) {
            for (let y = 0; y < platform.height; y += 20) {
                ctx.strokeRect(platform.x + x, platform.y + y, 40, 20);
            }
        }
    });
}

function drawSpikes() {
    spikes.forEach(spike => {
        ctx.fillStyle = '#c0c0c0';
        for (let x = 0; x < spike.width; x += 10) {
            ctx.beginPath();
            ctx.moveTo(spike.x + x, spike.y + spike.height);
            ctx.lineTo(spike.x + x + 5, spike.y);
            ctx.lineTo(spike.x + x + 10, spike.y + spike.height);
            ctx.fill();
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.health > 0) {
            ctx.fillStyle = '#8b008b';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            ctx.fillStyle = '#ffcba4';
            ctx.fillRect(enemy.x + 5, enemy.y - 10, 15, 15);

            // Enemy sword
            ctx.fillStyle = '#c0c0c0';
            const swordX = enemy.direction > 0 ? enemy.x + enemy.width : enemy.x - 15;
            ctx.fillRect(swordX, enemy.y + 10, 15, 2);

            // Health bar
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x, enemy.y - 20, enemy.width, 3);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(enemy.x, enemy.y - 20, (enemy.width * enemy.health) / 2, 3);
        }
    });
}

function drawDoors() {
    doors.forEach(door => {
        ctx.fillStyle = '#654321';
        ctx.fillRect(door.x, door.y, door.width, door.height);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10);

        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(door.x + door.width - 15, door.y + door.height / 2, 5, 10);
    });
}

function drawPotions() {
    potions.forEach(potion => {
        if (!potion.collected) {
            ctx.fillStyle = '#ff1493';
            ctx.fillRect(potion.x, potion.y, 15, 20);
            ctx.fillStyle = '#ff69b4';
            ctx.fillRect(potion.x + 3, potion.y, 9, 15);
        }
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
        takeDamage();
    }

    // Check spikes
    spikes.forEach(spike => {
        if (player.x + player.width > spike.x &&
            player.x < spike.x + spike.width &&
            player.y + player.height > spike.y &&
            player.y < spike.y + spike.height) {
            takeDamage();
        }
    });

    // Check potions
    potions.forEach(potion => {
        if (!potion.collected &&
            Math.abs(player.x - potion.x) < 20 &&
            Math.abs(player.y - potion.y) < 30) {
            potion.collected = true;
            if (health < 3) health++;
            updateDisplay();
            createParticles(potion.x, potion.y, '#ff69b4');
        }
    });

    // Check door
    doors.forEach(door => {
        if (player.x + player.width > door.x &&
            player.x < door.x + door.width &&
            player.y + player.height > door.y &&
            player.y < door.y + door.height) {
            nextLevel();
        }
    });

    if (player.attackTimer > 0) {
        player.attackTimer--;
        if (player.attackTimer === 0) player.attacking = false;
    }
}

function updateEnemies() {
    enemies.forEach((enemy, eIndex) => {
        if (enemy.health <= 0) return;

        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x < 0 || enemy.x > canvas.width - enemy.width) {
            enemy.direction *= -1;
        }

        enemy.direction = player.x > enemy.x ? 1 : -1;

        // Check collision with player
        if (Math.abs(enemy.x - player.x) < 30 &&
            Math.abs(enemy.y - player.y) < 40) {
            if (player.attacking && player.attackTimer > 10) {
                enemy.health--;
                createParticles(enemy.x, enemy.y, '#8b008b');
                if (enemy.health <= 0) {
                    createParticles(enemy.x, enemy.y, '#ffd700');
                }
            } else if (!player.attacking) {
                takeDamage();
            }
        }
    });
}

function createParticles(x, y, color) {
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

function attack() {
    if (!player.attacking) {
        player.attacking = true;
        player.attackTimer = 20;
    }
}

function takeDamage() {
    health--;
    updateDisplay();
    createParticles(player.x, player.y, '#ff0000');

    if (health <= 0) {
        gameOver();
    } else {
        player.x = 50;
        player.y = canvas.height - 150;
        player.velocityY = 0;
    }
}

function nextLevel() {
    level++;
    updateDisplay();
    initLevel();
    player.x = 50;
    player.y = canvas.height - 150;
}

function updateDisplay() {
    document.getElementById('health').textContent = '❤️'.repeat(health);
    document.getElementById('level').textContent = level;

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('time').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function gameOver() {
    gameRunning = false;
    const minutes = Math.floor((60 * 60 - timeRemaining) / 60);
    const seconds = (60 * 60 - timeRemaining) % 60;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalTime').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('gameOver').classList.remove('hidden');
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ') {
        e.preventDefault();
        attack();
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

        timeRemaining--;
        if (timeRemaining <= 0) {
            gameOver();
        }

        if (timeRemaining % 60 === 0) {
            updateDisplay();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateEnemies();

        drawPlatforms();
        drawSpikes();
        drawDoors();
        drawPotions();
        drawEnemies();
        drawPlayer();
        drawParticles();
    }

    requestAnimationFrame(gameLoop);
}

document.getElementById('restartBtn').addEventListener('click', () => {
    level = 1;
    health = 3;
    timeRemaining = 60 * 60;
    gameRunning = true;
    paused = false;
    document.getElementById('gameOver').classList.add('hidden');
    initLevel();
    updateDisplay();
});

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

updateDisplay();

