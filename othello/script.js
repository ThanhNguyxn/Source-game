const boardElement = document.getElementById('board');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficultySelect');
const blackScoreBox = document.querySelector('.score-box.black');
const whiteScoreBox = document.querySelector('.score-box.white');

const BOARD_SIZE = 8;
const BLACK = 1;
const WHITE = 2;
const EMPTY = 0;

let board = [];
let currentPlayer = BLACK;
let isGameActive = true;

// Initialize Game
function initGame() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));

    // Initial setup
    const mid = BOARD_SIZE / 2;
    board[mid - 1][mid - 1] = WHITE;
    board[mid][mid] = WHITE;
    board[mid - 1][mid] = BLACK;
    board[mid][mid - 1] = BLACK;

    currentPlayer = BLACK;
    isGameActive = true;

    renderBoard();
    updateScore();
    updateStatus();

    // Check if first player has moves (rare edge case but good practice)
    if (getValidMoves(BLACK).length === 0) {
        currentPlayer = WHITE;
        updateStatus();
        setTimeout(computerMove, 500);
    }
}

// Render Board
function renderBoard() {
    boardElement.innerHTML = '';
    const validMoves = getValidMoves(currentPlayer);

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (board[y][x] !== EMPTY) {
                const disc = document.createElement('div');
                disc.classList.add('disc');
                disc.classList.add(board[y][x] === BLACK ? 'black-disc' : 'white-disc');
                cell.appendChild(disc);
            } else if (currentPlayer === BLACK && validMoves.some(m => m.x === x && m.y === y)) {
                cell.classList.add('valid-move');
                cell.addEventListener('click', handleMove);
            }

            boardElement.appendChild(cell);
        }
    }
}

// Handle Player Move
function handleMove(e) {
    if (!isGameActive || currentPlayer !== BLACK) return;

    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);

    makeMove(x, y, BLACK);
}

// Make Move Logic
function makeMove(x, y, player) {
    const flipped = getFlippedDiscs(x, y, player);
    if (flipped.length === 0) return;

    board[y][x] = player;
    flipped.forEach(pos => {
        board[pos.y][pos.x] = player;
    });

    renderBoard();
    updateScore();

    // Switch turn
    currentPlayer = player === BLACK ? WHITE : BLACK;

    // Check if next player has moves
    const nextMoves = getValidMoves(currentPlayer);
    if (nextMoves.length === 0) {
        // No moves, switch back
        currentPlayer = player;
        const myMoves = getValidMoves(currentPlayer);
        if (myMoves.length === 0) {
            // Game Over
            endGame();
            return;
        }
        statusEl.textContent = `${currentPlayer === BLACK ? "Black" : "White"} has no moves! Pass.`;
    }

    updateStatus();

    if (isGameActive && currentPlayer === WHITE) {
        setTimeout(computerMove, 800);
    } else {
        renderBoard(); // Re-render to show valid moves for player
    }
}

// Get Valid Moves
function getValidMoves(player) {
    const moves = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === EMPTY && getFlippedDiscs(x, y, player).length > 0) {
                moves.push({ x, y });
            }
        }
    }
    return moves;
}

// Get Flipped Discs for a move
function getFlippedDiscs(x, y, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    const directions = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];
    const flipped = [];

    directions.forEach(([dx, dy]) => {
        let tempFlipped = [];
        let cx = x + dx;
        let cy = y + dy;

        while (cx >= 0 && cx < BOARD_SIZE && cy >= 0 && cy < BOARD_SIZE && board[cy][cx] === opponent) {
            tempFlipped.push({ x: cx, y: cy });
            cx += dx;
            cy += dy;
        }

        if (cx >= 0 && cx < BOARD_SIZE && cy >= 0 && cy < BOARD_SIZE && board[cy][cx] === player) {
            flipped.push(...tempFlipped);
        }
    });

    return flipped;
}

// Computer AI
function computerMove() {
    if (!isGameActive) return;

    const moves = getValidMoves(WHITE);
    if (moves.length === 0) return;

    const difficulty = difficultySelect.value;
    let bestMove;

    if (difficulty === 'easy') {
        // Random move
        bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (difficulty === 'medium') {
        // Maximize flipped discs
        bestMove = moves.reduce((best, move) => {
            const flipped = getFlippedDiscs(move.x, move.y, WHITE).length;
            return (flipped > best.flipped) ? { move, flipped } : best;
        }, { move: moves[0], flipped: -1 }).move;
    } else {
        // Hard: Prioritize corners and edges (Simple heuristic)
        bestMove = moves.reduce((best, move) => {
            let score = getFlippedDiscs(move.x, move.y, WHITE).length;

            // Corner bonus
            if ((move.x === 0 || move.x === BOARD_SIZE - 1) && (move.y === 0 || move.y === BOARD_SIZE - 1)) {
                score += 10;
            }
            // Edge bonus
            else if (move.x === 0 || move.x === BOARD_SIZE - 1 || move.y === 0 || move.y === BOARD_SIZE - 1) {
                score += 5;
            }

            return (score > best.score) ? { move, score } : best;
        }, { move: moves[0], score: -1 }).move;
    }

    makeMove(bestMove.x, bestMove.y, WHITE);
}

// Update Score
function updateScore() {
    let black = 0;
    let white = 0;
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === BLACK) black++;
            if (board[y][x] === WHITE) white++;
        }
    }
    blackScoreEl.textContent = black;
    whiteScoreEl.textContent = white;
}

// Update Status UI
function updateStatus() {
    if (!isGameActive) return;

    if (currentPlayer === BLACK) {
        statusEl.textContent = "Black's Turn (You)";
        blackScoreBox.classList.add('active');
        whiteScoreBox.classList.remove('active');
    } else {
        statusEl.textContent = "White's Turn (AI)";
        whiteScoreBox.classList.add('active');
        blackScoreBox.classList.remove('active');
    }
}

// End Game
function endGame() {
    isGameActive = false;
    const black = parseInt(blackScoreEl.textContent);
    const white = parseInt(whiteScoreEl.textContent);

    let msg;
    if (black > white) msg = "Black Wins!";
    else if (white > black) msg = "White Wins!";
    else msg = "It's a Draw!";

    statusEl.textContent = `Game Over! ${msg}`;
    alert(msg);
}

resetBtn.addEventListener('click', initGame);

// Start
initGame();
