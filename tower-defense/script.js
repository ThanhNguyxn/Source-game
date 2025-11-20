const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const TILE_SIZE = 50;
const TOWER_COST = 50;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let gold = 100;
let lives = 20;
let wave = 1;
let kills = 0;
let waveActive = false;

const path = [
    {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3},
    {x: 4, y: 4}, {x: 4, y: 5}, {x: 4, y: 6}, {x: 4, y: 7},
    {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7},
    {x: 8, y: 8}, {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11},
    {x: 9, y: 11}, {x: 10, y: 11}, {x: 11, y: 11}, {x: 12, y: 11},
    {x: 13, y: 11}, {x: 14, y: 11}, {x: 15, y: 11}
];

let towers = [];
let enemies = [];
let projectiles = [];

function drawPath() {
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = TILE_SIZE * 0.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    path.forEach((p, i) => {
        const x = p.x * TILE_SIZE + TILE_SIZE / 2;
        const y = p.y * TILE_SIZE + TILE_SIZE / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawTower(tower) {
    const x = tower.x * TILE_SIZE + TILE_SIZE / 2;
    const y = tower.y * TILE_SIZE + TILE_SIZE / 2;

    // Tower base
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(tower.x * TILE_SIZE + 10, tower.y * TILE_SIZE + 10, 30, 30);

    // Tower top
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Range circle
    if (tower.showRange) {
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawEnemy(enemy) {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const barWidth = 20;
    const barHeight = 4;
    const healthPercent = enemy.health / enemy.maxHealth;

    ctx.fillStyle = '#000';
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth, barHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth * healthPercent, barHeight);
}

function drawProjectile(proj) {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawPath();

    towers.forEach(tower => drawTower(tower));
    enemies.forEach(enemy => drawEnemy(enemy));
    projectiles.forEach(proj => drawProjectile(proj));
}

function spawnWave() {
    waveActive = true;
    const enemyCount = 5 + wave * 2;

    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            enemies.push({
                pathIndex: 0,
                x: path[0].x * TILE_SIZE + TILE_SIZE / 2,
                y: path[0].y * TILE_SIZE + TILE_SIZE / 2,
                health: 50 + wave * 10,
                maxHealth: 50 + wave * 10,
                speed: 1 + wave * 0.1,
                reward: 10 + wave * 2
            });
        }, i * 1000);
    }
}

function update() {
    if (!gameRunning || paused) return;

    // Update enemies
    enemies.forEach((enemy, eIdx) => {
        if (enemy.pathIndex >= path.length - 1) {
            enemies.splice(eIdx, 1);
            lives--;
            updateDisplay();
            if (lives <= 0) gameOver();
            return;
        }

        const target = path[enemy.pathIndex + 1];
        const targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
        const targetY = target.y * TILE_SIZE + TILE_SIZE / 2;

        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.speed) {
            enemy.pathIndex++;
        } else {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
    });

    // Towers shoot
    towers.forEach(tower => {
        if (tower.cooldown > 0) {
            tower.cooldown--;
            return;
        }

        enemies.forEach(enemy => {
            const dx = enemy.x - (tower.x * TILE_SIZE + TILE_SIZE / 2);
            const dy = enemy.y - (tower.y * TILE_SIZE + TILE_SIZE / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= tower.range) {
                projectiles.push({
                    x: tower.x * TILE_SIZE + TILE_SIZE / 2,
                    y: tower.y * TILE_SIZE + TILE_SIZE / 2,
                    targetEnemy: enemy,
                    speed: 5,
                    damage: 25
                });
                tower.cooldown = 30;
            }
        });
    });

    // Update projectiles
    projectiles.forEach((proj, pIdx) => {
        if (!proj.targetEnemy || enemies.indexOf(proj.targetEnemy) === -1) {
            projectiles.splice(pIdx, 1);
            return;
        }

        const dx = proj.targetEnemy.x - proj.x;
        const dy = proj.targetEnemy.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < proj.speed) {
            proj.targetEnemy.health -= proj.damage;
            if (proj.targetEnemy.health <= 0) {
                gold += proj.targetEnemy.reward;
                kills++;
                enemies.splice(enemies.indexOf(proj.targetEnemy), 1);
                updateDisplay();
            }
            projectiles.splice(pIdx, 1);
        } else {
            proj.x += (dx / dist) * proj.speed;
            proj.y += (dy / dist) * proj.speed;
        }
    });

    // Check wave complete
    if (waveActive && enemies.length === 0) {
        waveActive = false;
        wave++;
        gold += 50;
        updateDisplay();
        document.getElementById('nextWaveBtn').disabled = false;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    // Check if on path
    if (path.some(p => p.x === x && p.y === y)) return;

    // Check if tower exists
    if (towers.some(t => t.x === x && t.y === y)) return;

    // Build tower
    if (gold >= TOWER_COST) {
        towers.push({
            x: x,
            y: y,
            range: 100,
            cooldown: 0,
            showRange: false
        });
        gold -= TOWER_COST;
        updateDisplay();
    }
});

function updateDisplay() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('lives').textContent = lives;
    document.getElementById('wave').textContent = wave;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalWave').textContent = wave;
    document.getElementById('finalKills').textContent = kills;
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
        document.getElementById('nextWaveBtn').disabled = false;

        updateDisplay();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('nextWaveBtn').addEventListener('click', () => {
    if (!waveActive) {
        spawnWave();
        document.getElementById('nextWaveBtn').disabled = true;
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    gold = 100;
    lives = 20;
    wave = 1;
    kills = 0;
    waveActive = false;
    towers = [];
    enemies = [];
    projectiles = [];
    gameRunning = true;
    paused = false;

    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('nextWaveBtn').disabled = false;
    updateDisplay();
});

updateDisplay();

