const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const bestScoreElement = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const BUBBLE_RADIUS = 20;
const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#54a0ff'];
const ROWS = 8;
const COLS = 13;

let bubbles = [];
let currentBubble = null;
let nextBubble = null;
let score = 0;
let level = 1;
let bestScore = localStorage.getItem('bubbleShooterBest') || 0;
let isGameRunning = false;
let angle = 0;

bestScoreElement.textContent = bestScore;

function initGame() {
    bubbles = [];
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    
    for (let row = 0; row < 5; row++) {
        bubbles[row] = [];
        const offset = row % 2 === 0 ? 0 : BUBBLE_RADIUS;
        for (let col = 0; col < COLS - (row % 2); col++) {
            bubbles[row][col] = {
                x: col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + offset,
                y: row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                visible: true
            };
        }
    }
    
    currentBubble = createBubble(canvas.width / 2, canvas.height - 50);
    nextBubble = createBubble(canvas.width / 2 + 100, canvas.height - 50);
    
    draw();
}

function createBubble(x, y) {
    return {
        x: x,
        y: y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        dx: 0,
        dy: 0,
        visible: true
    };
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bubbles
    bubbles.forEach(row => {
        row.forEach(bubble => {
            if (bubble.visible) {
                drawBubble(bubble);
            }
        });
    });
    
    // Draw current bubble
    if (currentBubble) {
        drawBubble(currentBubble);
        
        // Draw aim line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentBubble.x, currentBubble.y);
        ctx.lineTo(currentBubble.x + Math.cos(angle) * 100, currentBubble.y + Math.sin(angle) * 100);
        ctx.stroke();
    }
    
    // Draw next bubble
    if (nextBubble) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(canvas.width / 2 + 60, canvas.height - 80, 80, 60);
        drawBubble(nextBubble);
    }
}

function drawBubble(bubble) {
    ctx.fillStyle = bubble.color;
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function shoot() {
    if (!isGameRunning || !currentBubble || currentBubble.dy !== 0) return;
    
    const speed = 8;
    currentBubble.dx = Math.cos(angle) * speed;
    currentBubble.dy = Math.sin(angle) * speed;
    
    const shootInterval = setInterval(() => {
        currentBubble.x += currentBubble.dx;
        currentBubble.y += currentBubble.dy;
        
        // Wall collision
        if (currentBubble.x - BUBBLE_RADIUS <= 0 || currentBubble.x + BUBBLE_RADIUS >= canvas.width) {
            currentBubble.dx = -currentBubble.dx;
        }
        
        // Check collision with other bubbles
        let collided = false;
        bubbles.forEach((row, rowIndex) => {
            row.forEach((bubble, colIndex) => {
                if (bubble.visible) {
                    const dist = Math.hypot(currentBubble.x - bubble.x, currentBubble.y - bubble.y);
                    if (dist < BUBBLE_RADIUS * 2) {
                        collided = true;
                        clearInterval(shootInterval);
                        snapBubble(currentBubble);
                    }
                }
            });
        });
        
        // Top collision
        if (currentBubble.y - BUBBLE_RADIUS <= 0) {
            clearInterval(shootInterval);
            snapBubble(currentBubble);
        }
        
        draw();
    }, 20);
}

function snapBubble(bubble) {
    // Find closest position in grid
    const row = Math.floor(bubble.y / (BUBBLE_RADIUS * 2));
    const offset = row % 2 === 0 ? 0 : BUBBLE_RADIUS;
    const col = Math.round((bubble.x - BUBBLE_RADIUS - offset) / (BUBBLE_RADIUS * 2));
    
    if (!bubbles[row]) bubbles[row] = [];
    
    bubbles[row][col] = {
        x: col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + offset,
        y: row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
        color: bubble.color,
        visible: true
    };
    
    checkMatches(row, col);
    
    currentBubble = nextBubble;
    currentBubble.x = canvas.width / 2;
    currentBubble.y = canvas.height - 50;
    currentBubble.dx = 0;
    currentBubble.dy = 0;
    
    nextBubble = createBubble(canvas.width / 2 + 100, canvas.height - 50);
    
    draw();
}

function checkMatches(row, col) {
    const color = bubbles[row][col].color;
    const toCheck = [[row, col]];
    const checked = new Set();
    const matching = [];
    
    while (toCheck.length > 0) {
        const [r, c] = toCheck.pop();
        const key = `${r},${c}`;
        
        if (checked.has(key)) continue;
        checked.add(key);
        
        if (bubbles[r] && bubbles[r][c] && bubbles[r][c].visible && bubbles[r][c].color === color) {
            matching.push([r, c]);
            
            // Check neighbors
            const neighbors = getNeighbors(r, c);
            neighbors.forEach(([nr, nc]) => {
                if (!checked.has(`${nr},${nc}`)) {
                    toCheck.push([nr, nc]);
                }
            });
        }
    }
    
    if (matching.length >= 3) {
        matching.forEach(([r, c]) => {
            bubbles[r][c].visible = false;
        });
        score += matching.length * 10;
        scoreElement.textContent = score;
        
        if (score > bestScore) {
            bestScore = score;
            bestScoreElement.textContent = bestScore;
            localStorage.setItem('bubbleShooterBest', bestScore);
        }
    }
}

function getNeighbors(row, col) {
    const neighbors = [];
    const isEvenRow = row % 2 === 0;
    
    const offsets = isEvenRow ? 
        [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] :
        [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    
    offsets.forEach(([dr, dc]) => {
        neighbors.push([row + dr, col + dc]);
    });
    
    return neighbors;
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    startBtn.disabled = true;
    initGame();
}

function resetGame() {
    isGameRunning = false;
    startBtn.disabled = false;
    score = 0;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    initGame();
}

canvas.addEventListener('mousemove', (e) => {
    if (!isGameRunning || !currentBubble) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    angle = Math.atan2(mouseY - currentBubble.y, mouseX - currentBubble.x);
    if (angle > 0) angle = 0; // Only allow upward shots
    if (angle < -Math.PI) angle = -Math.PI;
    
    draw();
});

canvas.addEventListener('click', shoot);
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

initGame();
