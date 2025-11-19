const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let gameStarted = false;
let paused = false;
let lemmings = [];
let platforms = [];
let entrance = { x: 50, y: 50 };
let exit = { x: 700, y: 400 };
let spawnTimer = 0;
let lemmingsOut = 0;
let saved = 0;
let lost = 0;
let gameTime = 0;
let selectedTool = null;
const maxLemmings = 20;
const spawnRate = 100;

// Create level
function initLevel() {
    platforms = [
        { x: 0, y: 450, width: 200, height: 50 },
        { x: 250, y: 400, width: 150, height: 50 },
        { x: 450, y: 350, width: 150, height: 50 },
        { x: 650, y: 450, width: 150, height: 50 }
    ];

    lemmings = [];
    spawnTimer = 0;
    lemmingsOut = 0;
    saved = 0;
    lost = 0;
    gameTime = 0;
}

class Lemming {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 1;
        this.vy = 0;
        this.width = 8;
        this.height = 12;
        this.state = 'walking'; // walking, blocking, climbing, digging, falling, saved, dead
        this.direction = 1; // 1 = right, -1 = left
        this.digTimer = 0;
    }

    update() {
        if (this.state === 'saved' || this.state === 'dead') return;

        if (this.state === 'blocking') {
            return; // Blockers don't move
        }

        if (this.state === 'digging') {
            this.digTimer++;
            if (this.digTimer > 30) {
                this.digTimer = 0;
                // Remove platform below
                platforms.forEach((platform, index) => {
                    if (this.x > platform.x && this.x < platform.x + platform.width &&
                        this.y + this.height >= platform.y && this.y + this.height < platform.y + 20) {
                        platform.width -= 20;
                        if (platform.width <= 0) {
                            platforms.splice(index, 1);
                        }
                    }
                });
            }
        }

        // Apply gravity
        this.vy += 0.5;
        this.y += this.vy;

        // Check platform collision
        let onPlatform = false;
        platforms.forEach(platform => {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + 20 &&
                this.vy > 0) {
                this.y = platform.y - this.height;
                this.vy = 0;
                onPlatform = true;

                if (this.state === 'falling') {
                    this.state = 'walking';
                }
            }
        });

        // Walking
        if (this.state === 'walking' || this.state === 'digging') {
            if (onPlatform) {
                this.x += this.vx * this.direction;

                // Check wall collision
                let hitWall = false;
                platforms.forEach(platform => {
                    if (this.direction === 1 && this.x + this.width >= platform.x + platform.width) {
                        hitWall = true;
                    }
                    if (this.direction === -1 && this.x <= platform.x) {
                        hitWall = true;
                    }
                });

                if (hitWall) {
                    if (this.state === 'walking') {
                        this.direction *= -1;
                    }
                }
            } else if (!onPlatform && this.state !== 'climbing') {
                this.state = 'falling';
            }
        }

        // Climbing
        if (this.state === 'climbing') {
            this.y -= 2;
            // Check if reached top
            if (this.y < 100) {
                this.state = 'walking';
            }
        }

        // Check exit
        if (Math.abs(this.x - exit.x) < 20 && Math.abs(this.y - exit.y) < 20) {
            this.state = 'saved';
            saved++;
            updateDisplay();
        }

        // Check if fell off map
        if (this.y > canvas.height) {
            this.state = 'dead';
            lost++;
            updateDisplay();
        }
    }

    draw() {
        if (this.state === 'saved' || this.state === 'dead') return;

        // Body
        ctx.fillStyle = this.state === 'blocking' ? '#e74c3c' :
                        this.state === 'climbing' ? '#f39c12' :
                        this.state === 'digging' ? '#9b59b6' : '#3498db';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Face
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 2, this.y + 2, 2, 2);
        ctx.fillRect(this.x + 4, this.y + 2, 2, 2);
    }
}

function spawnLemming() {
    if (lemmingsOut < maxLemmings) {
        spawnTimer++;
        if (spawnTimer >= spawnRate) {
            lemmings.push(new Lemming(entrance.x, entrance.y));
            lemmingsOut++;
            spawnTimer = 0;
            updateDisplay();
        }
    }
}

function drawLevel() {
    // Platforms
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Entrance
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(entrance.x - 10, entrance.y - 10, 20, 20);
    ctx.fillText('IN', entrance.x - 8, entrance.y + 5);

    // Exit
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(exit.x - 10, exit.y - 10, 20, 20);
    ctx.fillText('OUT', exit.x - 12, exit.y + 5);
}

function updateDisplay() {
    document.getElementById('out').textContent = `${lemmingsOut}/${maxLemmings}`;
    document.getElementById('saved').textContent = saved;
    document.getElementById('lost').textContent = lost;

    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function checkGameOver() {
    if (lemmingsOut >= maxLemmings && lemmings.every(l => l.state === 'saved' || l.state === 'dead')) {
        gameStarted = false;
        const successRate = Math.floor((saved / maxLemmings) * 100);

        document.getElementById('resultTitle').textContent = successRate >= 50 ? 'Level Complete!' : 'Level Failed';
        document.getElementById('finalSaved').textContent = saved;
        document.getElementById('finalLost').textContent = lost;
        document.getElementById('successRate').textContent = successRate;
        document.getElementById('gameOver').classList.remove('hidden');
    }
}

function gameLoop() {
    if (gameStarted && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawLevel();

        spawnLemming();

        lemmings.forEach(lemming => {
            lemming.update();
            lemming.draw();
        });

        if (gameTime % 60 === 0) {
            updateDisplay();
        }
        gameTime++;

        checkGameOver();
    }

    requestAnimationFrame(gameLoop);
}

// Click to assign tool
canvas.addEventListener('click', (e) => {
    if (!gameStarted || !selectedTool) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lemmings.forEach(lemming => {
        if (lemming.state !== 'walking') return;

        if (x > lemming.x && x < lemming.x + lemming.width &&
            y > lemming.y && y < lemming.y + lemming.height) {
            lemming.state = selectedTool;
            selectedTool = null;
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        }
    });
});

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        selectedTool = selectedTool === tool ? null : tool;

        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        if (selectedTool) {
            btn.classList.add('active');
        }
    });
});

document.getElementById('startBtn').addEventListener('click', () => {
    gameStarted = true;
    initLevel();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    gameStarted = false;
});

updateDisplay();
gameLoop();

