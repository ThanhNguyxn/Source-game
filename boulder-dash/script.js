const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 480;

const TILE_SIZE = 32;
const COLS = 20;
const ROWS = 15;

const TILES = { EMPTY: 0, DIRT: 1, WALL: 2, BOULDER: 3, DIAMOND: 4, PLAYER: 5, EXIT: 6 };

let gameRunning = false;
let level = 1;
let player = { x: 1, y: 1 };
let diamonds = 0;
let diamondsNeeded = 10;
let grid = [];

function initLevel() {
    grid = [];
    diamonds = 0;
    diamondsNeeded = 10 + level * 2;

    for (let y = 0; y < ROWS; y++) {
        grid[y] = [];
        for (let x = 0; x < COLS; x++) {
            if (y === 0 || y === ROWS-1 || x === 0 || x === COLS-1) {
                grid[y][x] = TILES.WALL;
            } else if (Math.random() < 0.3) {
                grid[y][x] = TILES.DIRT;
            } else if (Math.random() < 0.15) {
                grid[y][x] = TILES.BOULDER;
            } else if (Math.random() < 0.08) {
                grid[y][x] = TILES.DIAMOND;
            } else {
                grid[y][x] = TILES.EMPTY;
            }
        }
    }

    player = { x: 1, y: 1 };
    grid[player.y][player.x] = TILES.PLAYER;
    grid[ROWS-2][COLS-2] = TILES.EXIT;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = grid[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            switch(tile) {
                case TILES.DIRT:
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    break;
                case TILES.WALL:
                    ctx.fillStyle = '#555';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    break;
                case TILES.BOULDER:
                    ctx.fillStyle = '#888';
                    ctx.beginPath();
                    ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/2-2, 0, Math.PI*2);
                    ctx.fill();
                    break;
                case TILES.DIAMOND:
                    ctx.fillStyle = '#0FF';
                    ctx.beginPath();
                    ctx.moveTo(px + TILE_SIZE/2, py + 5);
                    ctx.lineTo(px + TILE_SIZE-5, py + TILE_SIZE/2);
                    ctx.lineTo(px + TILE_SIZE/2, py + TILE_SIZE-5);
                    ctx.lineTo(px + 5, py + TILE_SIZE/2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case TILES.PLAYER:
                    ctx.fillStyle = '#0F0';
                    ctx.fillRect(px + 4, py + 4, TILE_SIZE-8, TILE_SIZE-8);
                    break;
                case TILES.EXIT:
                    ctx.fillStyle = '#FF0';
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    break;
            }
        }
    }
}

function applyGravity() {
    for (let y = ROWS-2; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if ((grid[y][x] === TILES.BOULDER || grid[y][x] === TILES.DIAMOND) && grid[y+1][x] === TILES.EMPTY) {
                grid[y+1][x] = grid[y][x];
                grid[y][x] = TILES.EMPTY;
                if (y+1 === player.y && x === player.x) endGame();
            }
        }
    }
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) return;

    const target = grid[newY][newX];

    if (target === TILES.WALL) return;
    if (target === TILES.BOULDER && dy === 0) {
        const pushX = newX + dx;
        if (grid[newY][pushX] === TILES.EMPTY) {
            grid[newY][pushX] = TILES.BOULDER;
            grid[newY][newX] = TILES.EMPTY;
        } else return;
    } else if (target === TILES.BOULDER) return;

    if (target === TILES.DIAMOND) {
        diamonds++;
        document.getElementById('diamonds').textContent = diamonds + '/' + diamondsNeeded;
    }

    if (target === TILES.EXIT && diamonds >= diamondsNeeded) {
        level++;
        document.getElementById('level').textContent = level;
        initLevel();
        draw();
        return;
    }

    grid[player.y][player.x] = TILES.EMPTY;
    player.x = newX;
    player.y = newY;
    grid[player.y][player.x] = TILES.PLAYER;

    applyGravity();
    draw();
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); movePlayer(0, -1); }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); movePlayer(0, 1); }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); movePlayer(-1, 0); }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); movePlayer(1, 0); }
});

function startGame() {
    gameRunning = true;
    level = 1;
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('level').textContent = level;
    initLevel();
    document.getElementById('diamonds').textContent = diamonds + '/' + diamondsNeeded;
    draw();
}

function endGame() {
    gameRunning = false;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

