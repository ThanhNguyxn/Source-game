const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let gameStarted = false;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let currentTeam = 0; // 0 = Team 1 (red/player), 1 = Team 2 (blue/AI or player2)
let angle = 45;
let power = 50;
let wind = 0;
let projectiles = [];
let explosions = [];
let terrain = [];

// Teams
const teams = [
    { name: 'Player', color: '#e74c3c', worms: [] },
    { name: 'AI', color: '#3498db', worms: [] }
];

let currentWormIndex = 0;

function startGame(mode) {
    gameMode = mode;
    if (mode === 'ai') {
        teams[1].name = 'AI';
    } else {
        teams[1].name = 'Player 2';
    }
    document.getElementById('modeSelector').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';

    gameStarted = true;
    currentTeam = 0;
    currentWormIndex = 0;
    projectiles = [];
    explosions = [];
    generateTerrain();
    initWorms();
    wind = Math.floor(Math.random() * 21) - 10;
    updateDisplay();
    document.getElementById('fireBtn').disabled = false;
}

// Generate terrain
function generateTerrain() {
    terrain = [];
    let y = canvas.height / 2;
    for (let x = 0; x < canvas.width; x += 5) {
        y += (Math.random() - 0.5) * 20;
        y = Math.max(canvas.height * 0.3, Math.min(canvas.height * 0.8, y));
        terrain.push({ x, y });
    }
}

// Initialize worms
function initWorms() {
    teams[0].worms = [];
    teams[1].worms = [];

    for (let i = 0; i < 3; i++) {
        const x1 = 100 + i * 100;
        const x2 = canvas.width - 100 - i * 100;

        teams[0].worms.push({
            x: x1,
            y: getTerrainHeight(x1) - 10,
            health: 100,
            alive: true
        });

        teams[1].worms.push({
            x: x2,
            y: getTerrainHeight(x2) - 10,
            health: 100,
            alive: true
        });
    }
}

function getTerrainHeight(x) {
    const index = Math.floor(x / 5);
    if (index >= 0 && index < terrain.length) {
        return terrain[index].y;
    }
    return canvas.height / 2;
}

function drawTerrain() {
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    terrain.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

function drawWorms() {
    teams.forEach((team, teamIndex) => {
        team.worms.forEach((worm, wormIndex) => {
            if (!worm.alive) return;

            const isActive = teamIndex === currentTeam && wormIndex === currentWormIndex;

            // Body
            ctx.fillStyle = team.color;
            ctx.beginPath();
            ctx.arc(worm.x, worm.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Health bar
            ctx.fillStyle = '#000';
            ctx.fillRect(worm.x - 15, worm.y - 20, 30, 5);
            ctx.fillStyle = worm.health > 50 ? '#0f0' : worm.health > 25 ? '#ff0' : '#f00';
            ctx.fillRect(worm.x - 15, worm.y - 20, 30 * (worm.health / 100), 5);

            // Active indicator
            if (isActive) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(worm.x, worm.y, 12, 0, Math.PI * 2);
                ctx.stroke();

                // Aim line
                const radians = (angle * Math.PI) / 180;
                const aimLength = power;
                ctx.strokeStyle = team.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(worm.x, worm.y);
                ctx.lineTo(
                    worm.x + Math.cos(radians) * aimLength,
                    worm.y - Math.sin(radians) * aimLength
                );
                ctx.stroke();
            }
        });
    });
}

function drawProjectiles() {
    projectiles.forEach(p => {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawExplosions() {
    explosions.forEach((exp, index) => {
        ctx.fillStyle = `rgba(255, ${100 - exp.life * 2}, 0, ${exp.life / 50})`;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();

        exp.life--;
        if (exp.life <= 0) {
            explosions.splice(index, 1);
        }
    });
}

function updateProjectiles() {
    projectiles.forEach((p, index) => {
        p.vx += wind * 0.01;
        p.vy += 0.5; // gravity
        p.x += p.vx;
        p.y += p.vy;

        // Check terrain collision
        const terrainY = getTerrainHeight(p.x);
        if (p.y >= terrainY || p.x < 0 || p.x > canvas.width || p.y > canvas.height) {
            explode(p.x, p.y);
            projectiles.splice(index, 1);
        }
    });
}

function explode(x, y) {
    explosions.push({ x, y, radius: 30, life: 50 });

    // Damage worms in blast radius
    teams.forEach(team => {
        team.worms.forEach(worm => {
            if (!worm.alive) return;

            const dx = worm.x - x;
            const dy = worm.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 50) {
                const damage = Math.floor(50 * (1 - distance / 50));
                worm.health -= damage;

                if (worm.health <= 0) {
                    worm.health = 0;
                    worm.alive = false;
                }
            }
        });
    });

    // Destroy terrain
    for (let i = 0; i < terrain.length; i++) {
        const dx = terrain[i].x - x;
        const dy = terrain[i].y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 30) {
            terrain[i].y += 10;
        }
    }
}

function fire() {
    if (projectiles.length > 0) return;

    const worm = teams[currentTeam].worms[currentWormIndex];
    const radians = (angle * Math.PI) / 180;
    const speed = power / 10;

    projectiles.push({
        x: worm.x,
        y: worm.y,
        vx: Math.cos(radians) * speed,
        vy: -Math.sin(radians) * speed
    });

    document.getElementById('fireBtn').disabled = true;

    setTimeout(() => {
        if (projectiles.length === 0) {
            nextTurn();
        }
    }, 5000);
}

function nextTurn() {
    currentTeam = 1 - currentTeam;

    // Find next alive worm
    let found = false;
    for (let i = 0; i < teams[currentTeam].worms.length; i++) {
        currentWormIndex = (currentWormIndex + 1) % teams[currentTeam].worms.length;
        if (teams[currentTeam].worms[currentWormIndex].alive) {
            found = true;
            break;
        }
    }

    if (!found) {
        currentTeam = 1 - currentTeam;
    }

    wind = Math.floor(Math.random() * 21) - 10;
    updateDisplay();
    document.getElementById('fireBtn').disabled = false;

    checkGameOver();

    // AI turn
    if (gameMode === 'ai' && currentTeam === 1 && gameStarted) {
        setTimeout(aiTurn, 1000);
    }
}

function aiTurn() {
    if (!gameStarted || currentTeam !== 1) return;

    const aiWorm = teams[1].worms[currentWormIndex];
    const targetWorms = teams[0].worms.filter(w => w.alive);

    if (targetWorms.length === 0) return;

    // Choose closest enemy worm
    let closestWorm = targetWorms[0];
    let minDist = Infinity;

    targetWorms.forEach(worm => {
        const dist = Math.abs(worm.x - aiWorm.x);
        if (dist < minDist) {
            minDist = dist;
            closestWorm = worm;
        }
    });

    // Calculate shot
    const dx = closestWorm.x - aiWorm.x;
    const dy = aiWorm.y - closestWorm.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Estimate angle and power
    angle = Math.max(20, Math.min(160, 45 + (dy / distance) * 45));
    power = Math.min(100, Math.max(30, distance / 5));

    // Add some randomness to make AI not perfect
    angle += (Math.random() - 0.5) * 15;
    power += (Math.random() - 0.5) * 20;

    angle = Math.max(0, Math.min(180, angle));
    power = Math.max(10, Math.min(100, power));

    updateDisplay();

    setTimeout(() => {
        fire();
    }, 500);
}

function checkGameOver() {
    const team1Alive = teams[0].worms.some(w => w.alive);
    const team2Alive = teams[1].worms.some(w => w.alive);

    if (!team1Alive || !team2Alive) {
        gameStarted = false;
        const winner = team1Alive ? teams[0].name : teams[1].name;
        document.getElementById('winner').textContent = winner;
        document.getElementById('gameOver').classList.remove('hidden');
    }
}

function updateDisplay() {
    document.getElementById('currentTeam').textContent = teams[currentTeam].name;
    document.getElementById('wind').textContent = wind > 0 ? `→ ${wind}` : wind < 0 ? `← ${-wind}` : '0';
    document.getElementById('power').textContent = power;
    document.getElementById('angle').textContent = angle + '°';
}

function gameLoop() {
    if (gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawTerrain();
        drawWorms();
        drawProjectiles();
        drawExplosions();
        updateProjectiles();
    }

    requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;

    // Disable controls during AI turn
    if (gameMode === 'ai' && currentTeam === 1) return;

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','a','A','d','D'].includes(e.key)) {
        e.preventDefault();
    }

    const worm = teams[currentTeam].worms[currentWormIndex];

    if (e.key === 'ArrowLeft') {
        angle = Math.min(180, angle + 2);
    }
    if (e.key === 'ArrowRight') {
        angle = Math.max(0, angle - 2);
    }
    if (e.key === 'ArrowUp') {
        power = Math.min(100, power + 2);
    }
    if (e.key === 'ArrowDown') {
        power = Math.max(10, power - 2);
    }
    if (e.key === 'a' || e.key === 'A') {
        worm.x = Math.max(10, worm.x - 5);
        worm.y = getTerrainHeight(worm.x) - 10;
    }
    if (e.key === 'd' || e.key === 'D') {
        worm.x = Math.min(canvas.width - 10, worm.x + 5);
        worm.y = getTerrainHeight(worm.x) - 10;
    }
    if (e.key === ' ') {
        fire();
    }

    updateDisplay();
});

document.getElementById('startBtn').addEventListener('click', () => {
    gameStarted = true;
    currentTeam = 0;
    currentWormIndex = 0;
    projectiles = [];
    explosions = [];
    generateTerrain();
    initWorms();
    wind = Math.floor(Math.random() * 21) - 10;
    updateDisplay();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('fireBtn').disabled = false;
});

document.getElementById('fireBtn').addEventListener('click', fire);

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('fireBtn').disabled = true;
    gameStarted = false;
});

updateDisplay();
gameLoop();

