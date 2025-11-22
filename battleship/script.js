const playerBoard = document.getElementById('playerBoard');
const computerBoard = document.getElementById('computerBoard');
const rotateBtn = document.getElementById('rotateBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameStatus = document.getElementById('gameStatus');

const BOARD_SIZE = 10;
const SHIPS = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Cruiser', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Destroyer', length: 2 }
];

let isHorizontal = true;
let playerShips = [];
let computerShips = [];
let playerHits = [];
let computerHits = [];
let playerMisses = [];
let computerMisses = [];
let isGameActive = false;
let isPlayerTurn = true;
let currentShipIndex = 0; // For placement phase

// Initialize Boards
function createBoard(boardElement, isPlayer) {
    boardElement.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        if (isPlayer) {
            cell.addEventListener('mouseover', handlePlacementHover);
            cell.addEventListener('click', handlePlacementClick);
        } else {
            cell.addEventListener('click', handleAttackClick);
        }
        boardElement.appendChild(cell);
    }
}

// Helper: Get coordinates from index
function getCoords(index) {
    return { x: index % BOARD_SIZE, y: Math.floor(index / BOARD_SIZE) };
}

// Helper: Get index from coordinates
function getIndex(x, y) {
    return y * BOARD_SIZE + x;
}

// Ship Placement Logic
function handlePlacementHover(e) {
    if (isGameActive || currentShipIndex >= SHIPS.length) return;

    const index = parseInt(e.target.dataset.index);
    const ship = SHIPS[currentShipIndex];
    const { x, y } = getCoords(index);

    // Clear previous previews
    document.querySelectorAll('.player-preview').forEach(el => el.classList.remove('player-preview', 'invalid'));

    const cellsToHighlight = [];
    let isValid = true;

    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x + i : x;
        const targetY = isHorizontal ? y : y + i;

        if (targetX >= BOARD_SIZE || targetY >= BOARD_SIZE) {
            isValid = false;
            continue;
        }

        const targetIndex = getIndex(targetX, targetY);
        const cell = playerBoard.children[targetIndex];
        
        // Check if already occupied
        if (cell.classList.contains('ship')) {
            isValid = false;
        }
        
        cellsToHighlight.push(cell);
    }

    cellsToHighlight.forEach(cell => {
        if (cell) {
            cell.classList.add('player-preview');
            if (!isValid) cell.classList.add('invalid');
        }
    });
}

function handlePlacementClick(e) {
    if (isGameActive || currentShipIndex >= SHIPS.length) return;

    const previewCells = document.querySelectorAll('.player-preview');
    const invalidCells = document.querySelectorAll('.player-preview.invalid');

    if (invalidCells.length === 0 && previewCells.length > 0) {
        // Place ship
        const shipIndices = [];
        previewCells.forEach(cell => {
            cell.classList.remove('player-preview');
            cell.classList.add('ship');
            shipIndices.push(parseInt(cell.dataset.index));
        });

        playerShips.push({
            name: SHIPS[currentShipIndex].name,
            indices: shipIndices,
            hits: 0
        });

        currentShipIndex++;
        
        if (currentShipIndex < SHIPS.length) {
            gameStatus.textContent = `Place your ${SHIPS[currentShipIndex].name} (${SHIPS[currentShipIndex].length})`;
        } else {
            gameStatus.textContent = "Fleet Ready! Press Start.";
            startBtn.disabled = false;
            // Remove placement listeners
            Array.from(playerBoard.children).forEach(cell => {
                cell.removeEventListener('mouseover', handlePlacementHover);
                cell.removeEventListener('click', handlePlacementClick);
            });
        }
    }
}

// Computer Ship Placement
function placeComputerShips() {
    computerShips = [];
    SHIPS.forEach(ship => {
        let placed = false;
        while (!placed) {
            const horizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * BOARD_SIZE);
            const y = Math.floor(Math.random() * BOARD_SIZE);
            
            const indices = [];
            let valid = true;

            for (let i = 0; i < ship.length; i++) {
                const tx = horizontal ? x + i : x;
                const ty = horizontal ? y : y + i;

                if (tx >= BOARD_SIZE || ty >= BOARD_SIZE) {
                    valid = false;
                    break;
                }

                const idx = getIndex(tx, ty);
                // Check overlap
                if (computerShips.some(s => s.indices.includes(idx))) {
                    valid = false;
                    break;
                }
                indices.push(idx);
            }

            if (valid) {
                computerShips.push({
                    name: ship.name,
                    indices: indices,
                    hits: 0
                });
                placed = true;
            }
        }
    });
}

// Game Logic
function startGame() {
    isGameActive = true;
    startBtn.disabled = true;
    rotateBtn.disabled = true;
    placeComputerShips();
    gameStatus.textContent = "Your Turn! Attack enemy waters.";
}

function handleAttackClick(e) {
    if (!isGameActive || !isPlayerTurn) return;

    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

    // Check hit
    let hitShip = null;
    for (const ship of computerShips) {
        if (ship.indices.includes(index)) {
            hitShip = ship;
            break;
        }
    }

    if (hitShip) {
        cell.classList.add('hit');
        hitShip.hits++;
        gameStatus.textContent = "HIT! Take another shot!";
        if (hitShip.hits === SHIPS.find(s => s.name === hitShip.name).length) {
            gameStatus.textContent = `You sunk the enemy ${hitShip.name}!`;
            checkWin(true);
        }
    } else {
        cell.classList.add('miss');
        gameStatus.textContent = "MISS! Enemy turn...";
        isPlayerTurn = false;
        setTimeout(computerTurn, 1000);
    }
}

// Computer AI
function computerTurn() {
    if (!isGameActive) return;

    let index;
    let validShot = false;

    // Simple AI: Random shot (can be improved to target adjacent hits)
    // Improvement: Target mode if there's a hit but not sunk
    
    // Find potential targets (adjacent to hits)
    const potentialTargets = [];
    // ... (Simple implementation for now: Random unshot cell)
    
    while (!validShot) {
        index = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        const cell = playerBoard.children[index];
        if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
            validShot = true;
        }
    }

    // Execute Shot
    const cell = playerBoard.children[index];
    let hitShip = null;
    for (const ship of playerShips) {
        if (ship.indices.includes(index)) {
            hitShip = ship;
            break;
        }
    }

    if (hitShip) {
        cell.classList.add('hit');
        hitShip.hits++;
        gameStatus.textContent = `Enemy hit your ${hitShip.name}!`;
        if (hitShip.hits === SHIPS.find(s => s.name === hitShip.name).length) {
            gameStatus.textContent = `Enemy sunk your ${hitShip.name}!`;
            cell.classList.add('sunk'); // Visual indicator for sunk ship
            // Mark all parts as sunk
            hitShip.indices.forEach(idx => playerBoard.children[idx].classList.add('sunk'));
        }
        checkWin(false);
        if (isGameActive) setTimeout(computerTurn, 1000); // AI shoots again on hit
    } else {
        cell.classList.add('miss');
        gameStatus.textContent = "Enemy Missed! Your turn.";
        isPlayerTurn = true;
    }
}

function checkWin(isPlayer) {
    const ships = isPlayer ? computerShips : playerShips;
    const allSunk = ships.every(ship => ship.hits === SHIPS.find(s => s.name === ship.name).length);

    if (allSunk) {
        isGameActive = false;
        gameStatus.textContent = isPlayer ? "VICTORY! You destroyed the enemy fleet!" : "DEFEAT! Your fleet was destroyed.";
        alert(gameStatus.textContent);
    }
}

// Controls
rotateBtn.addEventListener('click', () => {
    isHorizontal = !isHorizontal;
});

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && !isGameActive) {
        isHorizontal = !isHorizontal;
        // Trigger hover update if mouse is over board
        // (Requires tracking last hover event, simplified here)
    }
});

resetBtn.addEventListener('click', initGame);

function initGame() {
    isGameActive = false;
    isPlayerTurn = true;
    currentShipIndex = 0;
    playerShips = [];
    computerShips = [];
    startBtn.disabled = true;
    rotateBtn.disabled = false;
    gameStatus.textContent = "Place your Carrier (5)";
    
    createBoard(playerBoard, true);
    createBoard(computerBoard, false);
}

// Start
initGame();
