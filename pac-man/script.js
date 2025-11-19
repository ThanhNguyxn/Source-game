﻿const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 31;

const maze = [
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#O####.#####.##.#####.####O#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.##### ## #####.######",
    "######.##### ## #####.######",
    "######.##          ##.######",
    "######.## ###  ### ##.######",
    "      .   #  GG  #   .      ",
    "######.## ######## ##.######",
    "######.##          ##.######",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#O..##.......  .......##..O#",
    "###.##.##.########.##.##.###",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#.##########.##.##########.#",
    "#..........................#",
    "############################"
];

let pacman = { x: 14, y: 23, dir: 0, nextDir: 0, mouthOpen: true };
let ghosts = [];
let dots = [];
let powerPellets = [];
let score = 0;
let lives = 3;
let level = 1;
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;

function initGame() {
    dots = [];
    powerPellets = [];
    ghosts = [];
    
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const char = maze[y][x];
            if (char === '.') {
                dots.push({ x, y });
            } else if (char === 'O') {
                powerPellets.push({ x, y });
            } else if (char === 'G') {
                ghosts.push({
                    x, y,
                    dir: Math.floor(Math.random() * 4),
                    color: ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'][ghosts.length % 4]
                });
            }
        }
    }
    
    pacman = { x: 14, y: 23, dir: 0, nextDir: 0, mouthOpen: true };
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2;
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === '#') {
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    
    // Draw dots
    ctx.fillStyle = '#ffb852';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x * TILE_SIZE + 10, dot.y * TILE_SIZE + 10, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw power pellets
    powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc(pellet.x * TILE_SIZE + 10, pellet.y * TILE_SIZE + 10, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw Pac-Man
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    const pacX = pacman.x * TILE_SIZE + 10;
    const pacY = pacman.y * TILE_SIZE + 10;
    const mouthAngle = pacman.mouthOpen ? 0.2 : 0;
    const startAngle = pacman.dir * Math.PI / 2 + mouthAngle;
    const endAngle = startAngle + (2 - 2 * mouthAngle) * Math.PI;
    ctx.arc(pacX, pacY, 8, startAngle, endAngle);
    ctx.lineTo(pacX, pacY);
    ctx.fill();
    
    // Draw ghosts
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        const gx = ghost.x * TILE_SIZE + 10;
        const gy = ghost.y * TILE_SIZE + 10;
        ctx.beginPath();
        ctx.arc(gx, gy - 3, 8, Math.PI, 0, false);
        ctx.lineTo(gx + 8, gy + 8);
        ctx.lineTo(gx + 4, gy + 4);
        ctx.lineTo(gx, gy + 8);
        ctx.lineTo(gx - 4, gy + 4);
        ctx.lineTo(gx - 8, gy + 8);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(gx - 4, gy - 4, 3, 4);
        ctx.fillRect(gx + 1, gy - 4, 3, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(gx - 3, gy - 2, 2, 2);
        ctx.fillRect(gx + 2, gy - 2, 2, 2);
    });
}

function update() {
    if (!isGameRunning || isPaused) return;
    
    // Move Pac-Man
    const dirs = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    const nextX = pacman.x + dirs[pacman.nextDir].x;
    const nextY = pacman.y + dirs[pacman.nextDir].y;
    
    if (maze[nextY] && maze[nextY][nextX] !== '#') {
        pacman.dir = pacman.nextDir;
    }
    
    const newX = pacman.x + dirs[pacman.dir].x;
    const newY = pacman.y + dirs[pacman.dir].y;
    
    if (maze[newY] && maze[newY][newX] !== '#') {
        pacman.x = newX;
        pacman.y = newY;
        pacman.mouthOpen = !pacman.mouthOpen;
    }
    
    // Wrap around
    if (pacman.x < 0) pacman.x = COLS - 1;
    if (pacman.x >= COLS) pacman.x = 0;
    
    // Eat dots
    dots = dots.filter(dot => {
        if (dot.x === pacman.x && dot.y === pacman.y) {
            score += 10;
            scoreElement.textContent = score;
            return false;
        }
        return true;
    });
    
    // Eat power pellets
    powerPellets = powerPellets.filter(pellet => {
        if (pellet.x === pacman.x && pellet.y === pacman.y) {
            score += 50;
            scoreElement.textContent = score;
            return false;
        }
        return true;
    });
    
    // Move ghosts
    ghosts.forEach(ghost => {
        if (Math.random() < 0.05) {
            ghost.dir = Math.floor(Math.random() * 4);
        }
        
        const gx = ghost.x + dirs[ghost.dir].x;
        const gy = ghost.y + dirs[ghost.dir].y;
        
        if (maze[gy] && maze[gy][gx] !== '#') {
            ghost.x = gx;
            ghost.y = gy;
        }
    });
    
    // Check collision with ghosts
    ghosts.forEach(ghost => {
        if (Math.abs(ghost.x - pacman.x) < 1 && Math.abs(ghost.y - pacman.y) < 1) {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                endGame();
            } else {
                pacman.x = 14;
                pacman.y = 23;
            }
        }
    });
    
    // Win condition
    if (dots.length === 0 && powerPellets.length === 0) {
        level++;
        levelElement.textContent = level;
        initGame();
    }
    
    draw();
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    initGame();
    gameLoop = setInterval(update, 150);
}

function pauseGame() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function endGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    alert(`Game Over! Final Score: ${score}`);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

document.addEventListener('keydown', (e) => {
    // Prevent page scroll
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D'].includes(e.key)) {
        e.preventDefault();
    }

    const key = e.key.toLowerCase();
    if (key === 'arrowright' || key === 'd') pacman.nextDir = 0;
    if (key === 'arrowdown' || key === 's') pacman.nextDir = 1;
    if (key === 'arrowleft' || key === 'a') pacman.nextDir = 2;
    if (key === 'arrowup' || key === 'w') pacman.nextDir = 3;
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
pauseBtn.disabled = true;

draw();
