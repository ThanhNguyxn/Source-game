const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

const GRID_SIZE = 12;
const CELL_SIZE = canvas.width / GRID_SIZE;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let wordsFound = 0;
let startTime = 0;
let timer = null;

const WORDS = ['JAVASCRIPT', 'HTML', 'CSS', 'CODE', 'GAME', 'PLAY', 'FUN', 'PUZZLE', 'WORD', 'SEARCH'];
let grid = [];
let wordPositions = [];
let foundWords = [];
let selecting = false;
let selectedCells = [];

function createGrid() {
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
    }
}

function placeWord(word) {
    const directions = [
        {x: 1, y: 0},   // horizontal
        {x: 0, y: 1},   // vertical
        {x: 1, y: 1},   // diagonal down-right
        {x: 1, y: -1}   // diagonal up-right
    ];

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startX = Math.floor(Math.random() * GRID_SIZE);
        const startY = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(word, startX, startY, dir)) {
            const positions = [];
            for (let i = 0; i < word.length; i++) {
                const x = startX + dir.x * i;
                const y = startY + dir.y * i;
                grid[y][x] = word[i];
                positions.push({x, y});
            }
            wordPositions.push({word, positions});
            placed = true;
        }
        attempts++;
    }
}

function canPlaceWord(word, startX, startY, dir) {
    for (let i = 0; i < word.length; i++) {
        const x = startX + dir.x * i;
        const y = startY + dir.y * i;

        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
            return false;
        }
    }
    return true;
}

function drawGrid() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const x = j * CELL_SIZE;
            const y = i * CELL_SIZE;

            // Check if cell is in found word
            const isFound = wordPositions.some(wp =>
                foundWords.includes(wp.word) &&
                wp.positions.some(p => p.x === j && p.y === i)
            );

            // Check if cell is selected
            const isSelected = selectedCells.some(c => c.x === j && c.y === i);

            if (isFound) {
                ctx.fillStyle = '#a8e6cf';
            } else if (isSelected) {
                ctx.fillStyle = '#ffd3b6';
            } else {
                ctx.fillStyle = '#fff';
            }

            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            // Draw border
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            // Draw letter
            ctx.fillStyle = '#333';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(grid[i][j], x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }
    }

    // Draw word list
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    let yOffset = 10;
    WORDS.forEach((word, idx) => {
        const found = foundWords.includes(word);
        ctx.fillStyle = found ? '#00aa00' : '#333';
        if (found) ctx.font = 'bold 14px Arial';
        else ctx.font = '14px Arial';

        const text = found ? `✓ ${word}` : word;
        ctx.fillText(text, 10, canvas.height - 140 + yOffset);
        yOffset += 16;
    });
}

function getCellFromMouse(x, y) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    const col = Math.floor(mouseX / CELL_SIZE);
    const row = Math.floor(mouseY / CELL_SIZE);

    if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        return {x: col, y: row};
    }
    return null;
}

function getSelectedWord() {
    if (selectedCells.length < 2) return '';

    return selectedCells.map(c => grid[c.y][c.x]).join('');
}

function checkWord() {
    const word = getSelectedWord();

    if (WORDS.includes(word) && !foundWords.includes(word)) {
        foundWords.push(word);
        wordsFound++;
        updateDisplay();

        if (foundWords.length === WORDS.length) {
            setTimeout(gameOver, 500);
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || paused) return;

    selecting = true;
    selectedCells = [];
    const cell = getCellFromMouse(e.clientX, e.clientY);
    if (cell) selectedCells.push(cell);
    drawGrid();
});

canvas.addEventListener('mousemove', (e) => {
    if (!selecting || !gameRunning || paused) return;

    const cell = getCellFromMouse(e.clientX, e.clientY);
    if (cell) {
        const lastCell = selectedCells[selectedCells.length - 1];
        if (!lastCell || cell.x !== lastCell.x || cell.y !== lastCell.y) {
            // Check if cell is adjacent or in line
            if (selectedCells.length === 0 || isAdjacent(lastCell, cell)) {
                selectedCells.push(cell);
                drawGrid();
            }
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (!selecting) return;

    selecting = false;
    checkWord();
    selectedCells = [];
    drawGrid();
});

function isAdjacent(cell1, cell2) {
    const dx = Math.abs(cell1.x - cell2.x);
    const dy = Math.abs(cell1.y - cell2.y);
    return dx <= 1 && dy <= 1 && (dx + dy) > 0;
}

function updateTimer() {
    if (!gameRunning || paused) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('level').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    document.getElementById('score').textContent = `${wordsFound}/${WORDS.length}`;
}

function gameOver() {
    gameRunning = false;
    clearInterval(timer);

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('finalScore').textContent = `${wordsFound}/${WORDS.length}`;
    document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

        wordsFound = 0;
        foundWords = [];
        selectedCells = [];

        createGrid();
        WORDS.forEach(word => placeWord(word));

        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);

        updateDisplay();
        drawGrid();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    wordsFound = 0;
    foundWords = [];
    selectedCells = [];
    gameRunning = true;
    paused = false;

    createGrid();
    WORDS.forEach(word => placeWord(word));

    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);

    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
    drawGrid();
});

updateDisplay();

