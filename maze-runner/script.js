const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let level = 1;
let moves = 0;
let startTime = 0;
let timer = null;

const CELL_SIZE = 30;
let mazeSize = 15;
let maze = [];
let player = { x: 1, y: 1 };
let exit = {};

function generateMaze() {
    mazeSize = 15 + level * 2;
    const size = mazeSize;
    maze = Array(size).fill().map(() => Array(size).fill(1));

    // Simple DFS maze generation
    const stack = [];
    const start = { x: 1, y: 1 };
    maze[start.y][start.x] = 0;
    stack.push(start);

    const directions = [
        { dx: 0, dy: -2 }, { dx: 2, dy: 0 },
        { dx: 0, dy: 2 }, { dx: -2, dy: 0 }
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        directions.forEach(dir => {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;

            if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny, dx: dir.dx, dy: dir.dy });
            }
        });

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[next.y][next.x] = 0;
            maze[current.y + next.dy / 2][current.x + next.dx / 2] = 0;
            stack.push({ x: next.x, y: next.y });
        } else {
            stack.pop();
        }
    }

    // Set player and exit
    player = { x: 1, y: 1 };
    exit = { x: size - 2, y: size - 2 };
    maze[exit.y][exit.x] = 2; // Exit marker
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - mazeSize * CELL_SIZE) / 2;
    const offsetY = (canvas.height - mazeSize * CELL_SIZE) / 2;

    // Draw maze
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x] === 1) {
                // Wall
                ctx.fillStyle = '#2d4059';
                ctx.fillRect(offsetX + x * CELL_SIZE, offsetY + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = '#1a1a2e';
                ctx.strokeRect(offsetX + x * CELL_SIZE, offsetY + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
                // Path
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(offsetX + x * CELL_SIZE, offsetY + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }

            // Exit
            if (maze[y][x] === 2) {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(offsetX + x * CELL_SIZE + 2, offsetY + y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🚪', offsetX + x * CELL_SIZE + CELL_SIZE/2, offsetY + y * CELL_SIZE + CELL_SIZE/2 + 6);
            }
        }
    }

    // Draw player
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        offsetX + player.x * CELL_SIZE + CELL_SIZE / 2,
        offsetY + player.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function movePlayer(dx, dy) {
    if (!gameRunning || paused) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] !== 1) {
        player.x = newX;
        player.y = newY;
        moves++;
        updateDisplay();

        // Check if reached exit
        if (player.x === exit.x && player.y === exit.y) {
            levelComplete();
        }

        draw();
    }
}

window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') movePlayer(0, -1);
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') movePlayer(0, 1);
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') movePlayer(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') movePlayer(1, 0);

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }

    if (e.key === 'r' || e.key === 'R') {
        restartCurrentLevel();
    }
});

function updateTimer() {
    if (!gameRunning || paused) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    document.getElementById('time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    document.getElementById('level').textContent = level;
    document.getElementById('moves').textContent = moves;
}

function levelComplete() {
    gameRunning = false;
    clearInterval(timer);

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    document.getElementById('finalTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('gameOver').classList.remove('hidden');
}

function restartCurrentLevel() {
    moves = 0;
    startTime = Date.now();
    generateMaze();
    updateDisplay();
    draw();
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('restartLevel').disabled = false;

        level = 1;
        moves = 0;
        generateMaze();
        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);

        updateDisplay();
        draw();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartLevel').addEventListener('click', restartCurrentLevel);

document.getElementById('nextLevel').addEventListener('click', () => {
    level++;
    moves = 0;
    gameRunning = true;
    paused = false;

    generateMaze();
    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);

    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
    draw();
});

updateDisplay();

