const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let height = 0;
let perfectCount = 0;

let currentBlock = null;
let stackedBlocks = [];
let movingDirection = 1;
let blockSpeed = 3;

const BLOCK_HEIGHT = 30;
const INITIAL_WIDTH = 200;

function createBlock() {
    const lastBlock = stackedBlocks[stackedBlocks.length - 1];
    const startX = movingDirection > 0 ? 0 : canvas.width;

    currentBlock = {
        x: startX,
        y: canvas.height - (stackedBlocks.length + 1) * BLOCK_HEIGHT - 50,
        width: lastBlock ? lastBlock.width : INITIAL_WIDTH,
        height: BLOCK_HEIGHT,
        color: `hsl(${(stackedBlocks.length * 30) % 360}, 70%, 60%)`
    };
}

function drawBlock(block) {
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
}

function draw() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw stacked blocks
    stackedBlocks.forEach(block => drawBlock(block));

    // Draw current moving block
    if (currentBlock) {
        drawBlock(currentBlock);
    }

    // Draw score
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Height: ${height}`, 10, 55);
}

function update() {
    if (!gameRunning || paused || !currentBlock) return;

    currentBlock.x += blockSpeed * movingDirection;

    // Bounce at edges
    if (currentBlock.x <= 0 || currentBlock.x + currentBlock.width >= canvas.width) {
        movingDirection *= -1;
    }
}

function dropBlock() {
    if (!currentBlock || !gameRunning) return;

    const lastBlock = stackedBlocks[stackedBlocks.length - 1];

    if (!lastBlock) {
        // First block
        stackedBlocks.push({...currentBlock});
        height++;
        score += 10;
        movingDirection *= -1;
        createBlock();
    } else {
        // Check overlap
        const overlapLeft = Math.max(currentBlock.x, lastBlock.x);
        const overlapRight = Math.min(currentBlock.x + currentBlock.width, lastBlock.x + lastBlock.width);
        const overlapWidth = overlapRight - overlapLeft;

        if (overlapWidth <= 0) {
            // Miss - Game Over
            gameOver();
            return;
        }

        // Check for perfect drop
        const tolerance = 5;
        const isPerfect = Math.abs(currentBlock.x - lastBlock.x) <= tolerance;

        if (isPerfect) {
            perfectCount++;
            score += 20; // Bonus for perfect
        } else {
            score += 10;
        }

        // Create new block with overlap width
        const newBlock = {
            x: overlapLeft,
            y: currentBlock.y,
            width: overlapWidth,
            height: BLOCK_HEIGHT,
            color: currentBlock.color
        };

        stackedBlocks.push(newBlock);
        height++;

        // Increase difficulty
        if (height % 5 === 0) {
            blockSpeed += 0.5;
        }

        // Scroll down if too high
        if (stackedBlocks.length > 15) {
            stackedBlocks.shift();
            stackedBlocks.forEach(block => block.y += BLOCK_HEIGHT);
        }

        movingDirection *= -1;
        createBlock();
    }

    updateDisplay();
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('height').textContent = height;
    document.getElementById('perfect').textContent = perfectCount;
}

function gameOver() {
    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHeight').textContent = height;
    document.getElementById('finalPerfect').textContent = perfectCount;
    document.getElementById('gameOver').classList.remove('hidden');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', dropBlock);

window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        dropBlock();
    }

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

        score = 0;
        height = 0;
        perfectCount = 0;
        stackedBlocks = [];
        blockSpeed = 3;
        movingDirection = 1;

        // Create base block
        stackedBlocks.push({
            x: canvas.width / 2 - INITIAL_WIDTH / 2,
            y: canvas.height - 80,
            width: INITIAL_WIDTH,
            height: BLOCK_HEIGHT,
            color: 'hsl(0, 70%, 60%)'
        });

        createBlock();
        updateDisplay();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    height = 0;
    perfectCount = 0;
    stackedBlocks = [];
    blockSpeed = 3;
    movingDirection = 1;
    gameRunning = true;
    paused = false;

    stackedBlocks.push({
        x: canvas.width / 2 - INITIAL_WIDTH / 2,
        y: canvas.height - 80,
        width: INITIAL_WIDTH,
        height: BLOCK_HEIGHT,
        color: 'hsl(0, 70%, 60%)'
    });

    createBlock();
    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
});

updateDisplay();

