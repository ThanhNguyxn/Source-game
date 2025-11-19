let board = [];
let selectedSquare = null;
let currentPlayer = 'red';
let gameOver = false;
let redPieces = 12;
let blackPieces = 12;

const boardEl = document.getElementById('board');
const turnDisplay = document.getElementById('turnDisplay');
const message = document.getElementById('message');

document.getElementById('newGameBtn').addEventListener('click', initGame);
document.getElementById('undoBtn').addEventListener('click', () => message.textContent = 'Undo coming soon!');

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
    
    render();
    updateDisplay();
    message.textContent = '';
}

function render() {
    boardEl.innerHTML = '';
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
            boardEl.appendChild(square);
        }
    }
}

function handleSquareClick(e) {
    if (gameOver) return;
    
    const square = e.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    if (selectedSquare) {
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            clearHighlights();
            currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
            updateDisplay();
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
        message.textContent = 'Black Wins!';
    } else if (blackPieces === 0) {
        gameOver = true;
        message.textContent = 'Red Wins!';
    }
    
    render();
}

function updateDisplay() {
    turnDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    document.getElementById('redPieces').textContent = redPieces;
    document.getElementById('blackPieces').textContent = blackPieces;
}

initGame();
