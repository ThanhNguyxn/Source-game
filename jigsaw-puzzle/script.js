const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let placedPieces = 0;
let totalPieces = 16;
let startTime = 0;
let timer = null;

const GRID = 4; // 4x4 puzzle
const PIECE_SIZE = canvas.width / GRID;
let pieces = [];
let draggedPiece = null;
let offsetX = 0;
let offsetY = 0;

function generatePuzzle() {
    pieces = [];

    // Create pieces with gradient pattern
    for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
            pieces.push({
                id: row * GRID + col,
                targetRow: row,
                targetCol: col,
                currentX: Math.random() * (canvas.width - PIECE_SIZE),
                currentY: Math.random() * (canvas.height - PIECE_SIZE),
                placed: false,
                color: `hsl(${(row * GRID + col) * (360 / totalPieces)}, 70%, 60%)`
            });
        }
    }

    // Shuffle pieces
    pieces.sort(() => Math.random() - 0.5);
}

function drawPiece(piece) {
    const x = piece.placed ? piece.targetCol * PIECE_SIZE : piece.currentX;
    const y = piece.placed ? piece.targetRow * PIECE_SIZE : piece.currentY;

    // Create gradient for piece
    const gradient = ctx.createLinearGradient(x, y, x + PIECE_SIZE, y + PIECE_SIZE);
    gradient.addColorStop(0, piece.color);
    gradient.addColorStop(1, adjustColor(piece.color, -20));

    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, y + 2, PIECE_SIZE - 4, PIECE_SIZE - 4);

    // Border
    ctx.strokeStyle = piece.placed ? '#00ff00' : '#333';
    ctx.lineWidth = piece.placed ? 3 : 2;
    ctx.strokeRect(x + 2, y + 2, PIECE_SIZE - 4, PIECE_SIZE - 4);

    // Number (for debugging, can remove)
    if (!piece.placed) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(piece.id + 1, x + PIECE_SIZE / 2, y + PIECE_SIZE / 2);
    }

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 5, y + 5, PIECE_SIZE / 2, PIECE_SIZE / 4);
}

function adjustColor(color, amount) {
    const hsl = color.match(/\d+/g);
    const l = Math.max(0, Math.min(100, parseInt(hsl[2]) + amount));
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${l}%)`;
}

function drawBoard() {
    // Draw target grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * PIECE_SIZE, 0);
        ctx.lineTo(i * PIECE_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * PIECE_SIZE);
        ctx.lineTo(canvas.width, i * PIECE_SIZE);
        ctx.stroke();
    }
}

function draw() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#2c3e50');
    bgGradient.addColorStop(1, '#34495e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBoard();

    // Draw placed pieces first
    pieces.filter(p => p.placed).forEach(piece => drawPiece(piece));

    // Draw unplaced pieces
    pieces.filter(p => !p.placed && p !== draggedPiece).forEach(piece => drawPiece(piece));

    // Draw dragged piece last (on top)
    if (draggedPiece) {
        drawPiece(draggedPiece);
    }
}

function getPieceAt(x, y) {
    // Check from top to bottom (reverse order)
    for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        if (piece.placed) continue;

        const px = piece.currentX;
        const py = piece.currentY;

        if (x >= px && x <= px + PIECE_SIZE && y >= py && y <= py + PIECE_SIZE) {
            return piece;
        }
    }
    return null;
}

function snapToGrid(piece) {
    const targetX = piece.targetCol * PIECE_SIZE;
    const targetY = piece.targetRow * PIECE_SIZE;

    const dx = piece.currentX - targetX;
    const dy = piece.currentY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < PIECE_SIZE / 2) {
        piece.placed = true;
        placedPieces++;
        updateDisplay();

        if (placedPieces === totalPieces) {
            setTimeout(puzzleComplete, 500);
        }
        return true;
    }
    return false;
}

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    draggedPiece = getPieceAt(x, y);
    if (draggedPiece) {
        offsetX = x - draggedPiece.currentX;
        offsetY = y - draggedPiece.currentY;

        // Move to end of array (draw on top)
        pieces = pieces.filter(p => p !== draggedPiece);
        pieces.push(draggedPiece);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggedPiece || !gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    draggedPiece.currentX = Math.max(0, Math.min(canvas.width - PIECE_SIZE, x - offsetX));
    draggedPiece.currentY = Math.max(0, Math.min(canvas.height - PIECE_SIZE, y - offsetY));

    draw();
});

canvas.addEventListener('mouseup', () => {
    if (!draggedPiece) return;

    snapToGrid(draggedPiece);
    draggedPiece = null;
    draw();
});

canvas.addEventListener('mouseleave', () => {
    if (draggedPiece) {
        snapToGrid(draggedPiece);
        draggedPiece = null;
        draw();
    }
});

function updateTimer() {
    if (!gameRunning || paused) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('level').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    document.getElementById('score').textContent = `${placedPieces}/${totalPieces}`;
}

function puzzleComplete() {
    gameRunning = false;
    clearInterval(timer);

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('gameOver').classList.remove('hidden');
}

function gameLoop() {
    if (gameRunning && !paused) {
        draw();
    }
    requestAnimationFrame(gameLoop);
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

        placedPieces = 0;
        generatePuzzle();

        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);

        updateDisplay();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    placedPieces = 0;
    gameRunning = true;
    paused = false;
    draggedPiece = null;

    generatePuzzle();

    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);

    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
});

updateDisplay();

