// Chess pieces Unicode symbols
const PIECES = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

let board = [];
let selectedSquare = null;
let currentPlayer = 'white';
let gameOver = false;
let moveHistory = [];
let capturedPieces = { white: [], black: [] };

// DOM Elements
const chessBoard = document.getElementById('chessBoard');
const turnDisplay = document.getElementById('turnDisplay');
const checkDisplay = document.getElementById('checkDisplay');
const message = document.getElementById('message');
const newGameBtn = document.getElementById('newGameBtn');
const undoBtn = document.getElementById('undoBtn');
const hintBtn = document.getElementById('hintBtn');

// Initialize game
function init() {
    initBoard();
    renderBoard();
    
    newGameBtn.addEventListener('click', () => {
        initBoard();
        renderBoard();
        currentPlayer = 'white';
        gameOver = false;
        moveHistory = [];
        capturedPieces = { white: [], black: [] };
        updateDisplay();
        message.textContent = '';
    });

    undoBtn.addEventListener('click', undoMove);
    hintBtn.addEventListener('click', showHint);
}

function initBoard() {
    board = [
        [{piece: 'rook', color: 'black'}, {piece: 'knight', color: 'black'}, {piece: 'bishop', color: 'black'}, {piece: 'queen', color: 'black'}, {piece: 'king', color: 'black'}, {piece: 'bishop', color: 'black'}, {piece: 'knight', color: 'black'}, {piece: 'rook', color: 'black'}],
        [{piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}, {piece: 'pawn', color: 'black'}],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [{piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}, {piece: 'pawn', color: 'white'}],
        [{piece: 'rook', color: 'white'}, {piece: 'knight', color: 'white'}, {piece: 'bishop', color: 'white'}, {piece: 'queen', color: 'white'}, {piece: 'king', color: 'white'}, {piece: 'bishop', color: 'white'}, {piece: 'knight', color: 'white'}, {piece: 'rook', color: 'white'}]
    ];
}

function renderBoard() {
    chessBoard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.textContent = PIECES[piece.color][piece.piece];
                square.appendChild(pieceElement);
            }
            
            square.addEventListener('click', handleSquareClick);
            chessBoard.appendChild(square);
        }
    }
    updateDisplay();
}

function handleSquareClick(e) {
    if (gameOver) return;
    
    const square = e.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    if (selectedSquare) {
        // Try to move
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            clearHighlights();
            
            if (!gameOver) {
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                updateDisplay();
            }
        } else {
            // Select different piece
            const piece = board[row][col];
            if (piece && piece.color === currentPlayer) {
                selectSquare(row, col);
            } else {
                clearHighlights();
                selectedSquare = null;
            }
        }
    } else {
        // Select piece
        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
            selectSquare(row, col);
        }
    }
}

function selectSquare(row, col) {
    clearHighlights();
    selectedSquare = {row, col};
    
    const squares = document.querySelectorAll('.square');
    squares[row * 8 + col].classList.add('selected');
    
    // Highlight valid moves
    highlightValidMoves(row, col);
}

function highlightValidMoves(row, col) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (isValidMove(row, col, r, c)) {
                const square = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (board[r][c]) {
                    square.classList.add('capture-move');
                } else {
                    square.classList.add('valid-move');
                }
            }
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'valid-move', 'capture-move', 'in-check');
    });
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow === toRow && fromCol === toCol) return false;
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
    
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;
    
    const moves = getPossibleMoves(fromRow, fromCol, piece);
    return moves.some(move => move.row === toRow && move.col === toCol);
}

function getPossibleMoves(row, col, piece) {
    const moves = [];
    
    switch (piece.piece) {
        case 'pawn':
            const direction = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;
            
            // Forward move
            if (!board[row + direction]?.[col]) {
                moves.push({row: row + direction, col});
                // Double move from start
                if (row === startRow && !board[row + 2 * direction]?.[col]) {
                    moves.push({row: row + 2 * direction, col});
                }
            }
            
            // Captures
            [-1, 1].forEach(dc => {
                const targetPiece = board[row + direction]?.[col + dc];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({row: row + direction, col: col + dc});
                }
            });
            break;
            
        case 'rook':
            addLinearMoves(moves, row, col, piece, [[0,1], [0,-1], [1,0], [-1,0]]);
            break;
            
        case 'bishop':
            addLinearMoves(moves, row, col, piece, [[1,1], [1,-1], [-1,1], [-1,-1]]);
            break;
            
        case 'queen':
            addLinearMoves(moves, row, col, piece, [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]]);
            break;
            
        case 'knight':
            [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]].forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = board[newRow][newCol];
                    if (!target || target.color !== piece.color) {
                        moves.push({row: newRow, col: newCol});
                    }
                }
            });
            break;
            
        case 'king':
            [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]].forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = board[newRow][newCol];
                    if (!target || target.color !== piece.color) {
                        moves.push({row: newRow, col: newCol});
                    }
                }
            });
            break;
    }
    
    return moves;
}

function addLinearMoves(moves, row, col, piece, directions) {
    directions.forEach(([dr, dc]) => {
        let newRow = row + dr;
        let newCol = col + dc;
        
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (target) {
                if (target.color !== piece.color) {
                    moves.push({row: newRow, col: newCol});
                }
                break;
            }
            moves.push({row: newRow, col: newCol});
            newRow += dr;
            newCol += dc;
        }
    });
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    
    // Save move to history
    moveHistory.push({
        from: {row: fromRow, col: fromCol},
        to: {row: toRow, col: toCol},
        piece: piece,
        captured: capturedPiece
    });
    
    // Capture piece
    if (capturedPiece) {
        capturedPieces[currentPlayer].push(PIECES[capturedPiece.color][capturedPiece.piece]);
        updateCapturedDisplay();
    }
    
    // Move piece
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // Pawn promotion
    if (piece.piece === 'pawn' && (toRow === 0 || toRow === 7)) {
        board[toRow][toCol] = {piece: 'queen', color: piece.color};
    }
    
    // Check for checkmate
    if (capturedPiece && capturedPiece.piece === 'king') {
        gameOver = true;
        message.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} wins!`;
        message.className = 'message success';
    }
    
    renderBoard();
}

function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
    
    if (lastMove.captured) {
        capturedPieces[currentPlayer].pop();
        updateCapturedDisplay();
    }
    
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    gameOver = false;
    message.textContent = '';
    renderBoard();
}

function showHint() {
    if (gameOver) return;
    
    // Find a random valid move
    const pieces = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === currentPlayer) {
                pieces.push({row, col});
            }
        }
    }
    
    if (pieces.length > 0) {
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const moves = getPossibleMoves(randomPiece.row, randomPiece.col, board[randomPiece.row][randomPiece.col]);
        
        if (moves.length > 0) {
            selectSquare(randomPiece.row, randomPiece.col);
            message.textContent = `Hint: Try moving this ${board[randomPiece.row][randomPiece.col].piece}`;
            message.className = 'message info';
            setTimeout(() => {
                message.textContent = '';
            }, 3000);
        }
    }
}

function updateDisplay() {
    turnDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    turnDisplay.style.color = currentPlayer === 'white' ? '#333' : '#764ba2';
}

function updateCapturedDisplay() {
    document.getElementById('whiteCaptured').textContent = capturedPieces.white.join(' ');
    document.getElementById('blackCaptured').textContent = capturedPieces.black.join(' ');
}

// Start game
init();
