const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let level = 1;
let targetPercent = 75;
let filledPercent = 0;

let paintDrops = [];
let obstacles = [];
let filledCells = new Set();

const GRID_COLS = 50;
const GRID_ROWS = 60;
const CELL_SIZE = canvas.width / GRID_COLS;

function createObstacles() {
    obstacles = [];
    const numObstacles = 2 + level;
    
    for (let i = 0; i < numObstacles; i++) {
        obstacles.push({
            x: Math.random() * canvas.width,
            y: 100 + Math.random() * 300,
            width: 60 + Math.random() * 40,
            height: 20,
            speedX: (Math.random() - 0.5) * 3,
            speedY: (Math.random() - 0.5) * 2
        });
    }
}

function drawGrid() {
    // Draw filled cells
    filledCells.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = '#333';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function drawPaintDrops() {
    paintDrops.forEach(drop => {
        ctx.fillStyle = drop.color;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(drop.x - drop.radius/3, drop.y - drop.radius/3, drop.radius/3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawContainer() {
    // Container walls
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 8;
    
    // Left wall
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    
    // Right wall
    ctx.beginPath();
    ctx.moveTo(canvas.width, 100);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    
    // Bottom
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
}

function draw() {
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawContainer();
    drawObstacles();
    drawPaintDrops();
    
    // Fill percentage display
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${filledPercent.toFixed(1)}%`, canvas.width/2, 50);
}

function update() {
    if (!gameRunning || paused) return;
    
    // Update paint drops
    paintDrops.forEach((drop, idx) => {
        drop.velocityY += 0.5; // gravity
        drop.y += drop.velocityY;
        drop.x += drop.velocityX;
        
        // Bounce off walls
        if (drop.x - drop.radius < 0 || drop.x + drop.radius > canvas.width) {
            drop.velocityX *= -0.8;
            drop.x = Math.max(drop.radius, Math.min(canvas.width - drop.radius, drop.x));
        }
        
        // Check collision with obstacles
        obstacles.forEach(obs => {
            if (drop.x + drop.radius > obs.x && 
                drop.x - drop.radius < obs.x + obs.width &&
                drop.y + drop.radius > obs.y && 
                drop.y - drop.radius < obs.y + obs.height) {
                
                // Remove drop
                paintDrops.splice(idx, 1);
            }
        });
        
        // Check if landed
        if (drop.y + drop.radius >= canvas.height) {
            drop.y = canvas.height - drop.radius;
            drop.velocityY = 0;
            drop.velocityX *= 0.9;
            
            // Fill cells
            fillCellsAround(drop.x, drop.y, drop.radius);
            
            if (Math.abs(drop.velocityX) < 0.1) {
                paintDrops.splice(idx, 1);
            }
        }
    });
    
    // Update obstacles
    obstacles.forEach(obs => {
        obs.x += obs.speedX;
        obs.y += obs.speedY;
        
        // Bounce
        if (obs.x < 0 || obs.x + obs.width > canvas.width) {
            obs.speedX *= -1;
        }
        if (obs.y < 100 || obs.y + obs.height > canvas.height - 100) {
            obs.speedY *= -1;
        }
    });
    
    // Calculate filled percentage
    const totalCells = GRID_COLS * (GRID_ROWS - 10); // Exclude top area
    filledPercent = (filledCells.size / totalCells) * 100;
    
    updateDisplay();
    
    // Check win condition
    if (filledPercent >= targetPercent) {
        setTimeout(levelComplete, 500);
    }
}

function fillCellsAround(x, y, radius) {
    const cellX = Math.floor(x / CELL_SIZE);
    const cellY = Math.floor(y / CELL_SIZE);
    const cellRadius = Math.ceil(radius / CELL_SIZE);
    
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        for (let dy = -cellRadius; dy <= cellRadius; dy++) {
            const cx = cellX + dx;
            const cy = cellY + dy;
            
            if (cx >= 0 && cx < GRID_COLS && cy >= 10 && cy < GRID_ROWS) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= cellRadius) {
                    filledCells.add(`${cx},${cy}`);
                }
            }
        }
    }
}

function dropPaint(x) {
    if (!gameRunning || paused) return;
    
    const colors = ['#ff69b4', '#ff1493', '#ff6ec7', '#ffc0cb'];
    
    paintDrops.push({
        x: x,
        y: 20,
        radius: 8 + Math.random() * 4,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    dropPaint(x);
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateDisplay() {
    document.getElementById('score').textContent = level;
    document.getElementById('level').textContent = filledPercent.toFixed(1) + '%';
    document.getElementById('target').textContent = targetPercent + '%';
}

function levelComplete() {
    gameRunning = false;
    
    document.getElementById('resultTitle').textContent = '🎉 Level Complete!';
    document.getElementById('finalScore').textContent = level;
    document.getElementById('finalFilled').textContent = filledPercent.toFixed(1);
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
        
        level = 1;
        targetPercent = 75;
        filledCells.clear();
        paintDrops = [];
        
        createObstacles();
        updateDisplay();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    level++;
    targetPercent = Math.min(95, 70 + level * 5);
    filledCells.clear();
    paintDrops = [];
    gameRunning = true;
    paused = false;
    
    createObstacles();
    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
});

updateDisplay();

