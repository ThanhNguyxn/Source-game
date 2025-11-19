let board = [];
let selectedSquare = null;
let currentPlayer = 'red';
let gameOver = false;
let redPieces = 12;
let blackPieces = 12;
let gameMode = 'pvp';
let moveHistory = [];

const checkersBoard = document.getElementById('checkersBoard');
const turnDisplay = document.getElementById('turnDisplay');
const message = document.getElementById('message');
const gameModeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');

function startGame(mode) {
    gameMode = mode;
    gameModeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    initGame();
}

document.getElementById('newGameBtn').addEventListener('click', () => {
    gameArea.style.display = 'none';
    gameModeSelector.style.display = 'block';
});
document.getElementById('undoBtn').addEventListener('click', undoMove);

function initGame() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = { color: 'black', king: false };
            }
        }
    }
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = { color: 'red', king: false };
            }
        }
    }
    currentPlayer = 'red';
    gameOver = false;
    redPieces = 12;
    blackPieces = 12;
    selectedSquare = null;
    moveHistory = [];
    render();
    updateDisplay();
    message.textContent = '';
}

function render() {
    checkersBoard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            const piece = board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.classList.add('piece', piece.color);
                if (piece.king) pieceEl.classList.add('king');
                square.appendChild(pieceEl);
            }
            square.addEventListener('click', handleSquareClick);
            checkersBoard.appendChild(square);
        }
    }
}

function handleSquareClick(e) {
    if (gameOver) return;
    if (gameMode !== 'pvp' && currentPlayer === 'black') return;
    const square = e.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    if (selectedSquare) {
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            clearHighlights();
            if (!gameOver) {
                currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
                updateDisplay();
                if (gameMode !== 'pvp' && currentPlayer === 'black') {
                    setTimeout(() => makeAIMove(), 500);
                }
            }
        } else {
            const piece = board[row][col];
            if (piece && piece.color === currentPlayer) {
                selectSquare(row, col);
            } else {
                clearHighlights();
                selectedSquare = null;
            }
        }
    } else {
        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
            selectSquare(row, col);
        }
    }
}

function selectSquare(row, col) {
    clearHighlights();
    selectedSquare = { row, col };
    const squares = document.querySelectorAll('.square');
    squares[row * 8 + col].classList.add('selected');
    highlightValidMoves(row, col);
}

function highlightValidMoves(row, col) {
    const moves = getValidMoves(row, col);
    moves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        square.classList.add('valid-move');
    });
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'valid-move');
    });
}

function getValidMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    if (!piece) return moves;
    const directions = piece.king ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
                       piece.color === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            if (!board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol, capture: null });
            } else if (board[newRow][newCol].color !== piece.color) {
                const jumpRow = newRow + dr;
                const jumpCol = newCol + dc;
                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 && !board[jumpRow][jumpCol]) {
                    moves.push({ row: jumpRow, col: jumpCol, capture: { row: newRow, col: newCol } });
                }
            }
        }
    });
    return moves;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const moves = getValidMoves(fromRow, fromCol);
    return moves.some(move => move.row === toRow && move.col === toCol);
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    const moves = getValidMoves(fromRow, fromCol);
    const move = moves.find(m => m.row === toRow && m.col === toCol);
    moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: JSON.parse(JSON.stringify(board[fromRow][fromCol])),
        captured: move && move.capture ? JSON.parse(JSON.stringify(board[move.capture.row][move.capture.col])) : null,
        capturePos: move ? move.capture : null
    });
    if (move && move.capture) {
        const capturedPiece = board[move.capture.row][move.capture.col];
        board[move.capture.row][move.capture.col] = null;
        if (capturedPiece.color === 'red') {
            redPieces--;
        } else {
            blackPieces--;
        }
    }
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = null;
    if ((toRow === 0 && board[toRow][toCol].color === 'red') ||
        (toRow === 7 && board[toRow][toCol].color === 'black')) {
        board[toRow][toCol].king = true;
    }
    if (redPieces === 0) {
        gameOver = true;
        message.textContent = gameMode === 'pvp' ? '🎉 Black Wins!' : '😢 AI Wins!';
    } else if (blackPieces === 0) {
        gameOver = true;
        message.textContent = '🎉 Red Wins!';
    }
    render();
}

function undoMove() {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory.pop();
    board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    board[lastMove.to.row][lastMove.to.col] = null;
    if (lastMove.captured && lastMove.capturePos) {
        board[lastMove.capturePos.row][lastMove.capturePos.col] = lastMove.captured;
        if (lastMove.captured.color === 'red') {
            redPieces++;
        } else {
            blackPieces++;
        }
    }
    currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
    gameOver = false;
    message.textContent = '';
    render();
    updateDisplay();
}

function makeAIMove() {
    if (gameOver) return;
    let move = null;
    if (gameMode === 'ai-easy') {
        move = getRandomAIMove();
    } else if (gameMode === 'ai-medium') {
        move = getMediumAIMove();
    } else if (gameMode === 'ai-hard') {
        move = getBestAIMove();
    }
    if (move) {
        makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
        currentPlayer = 'red';
        updateDisplay();
    }
}

function getRandomAIMove() {
    const allMoves = getAllPossibleMoves('black');
    if (allMoves.length === 0) return null;
    return allMoves[Math.floor(Math.random() * allMoves.length)];
}

function getMediumAIMove() {
    const allMoves = getAllPossibleMoves('black');
    if (allMoves.length === 0) return null;
    const captureMoves = allMoves.filter(m => m.capture);
    if (captureMoves.length > 0) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return allMoves[Math.floor(Math.random() * allMoves.length)];
}

function getBestAIMove() {
    const allMoves = getAllPossibleMoves('black');
    if (allMoves.length === 0) return null;
    let bestMove = null;
    let bestScore = -Infinity;
    allMoves.forEach(move => {
        const score = evaluateMove(move);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    return bestMove;
}

function getAllPossibleMoves(color) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === color) {
                const pieceMoves = getValidMoves(row, col);
                pieceMoves.forEach(move => {
                    moves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        capture: move.capture
                    });
                });
            }
        }
    }
    return moves;
}

function evaluateMove(move) {
    let score = 0;
    if (move.capture) {
        score += 10;
        const capturedPiece = board[move.capture.row][move.capture.col];
        if (capturedPiece && !capturedPiece.king) score += 5;
    }
    score += (7 - move.to.row);
    if (move.to.row === 7) score += 15;
    return score;
}

function updateDisplay() {
    const displayPlayer = (gameMode !== 'pvp' && currentPlayer === 'black') ? '🤖 AI' : currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
    turnDisplay.textContent = `${displayPlayer}'s Turn`;
    document.getElementById('redPieces').textContent = redPieces;
    document.getElementById('blackPieces').textContent = blackPieces;
}
