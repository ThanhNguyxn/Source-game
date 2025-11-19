const gridContainer = document.getElementById('gridContainer');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('bestScore');
const newGameBtn = document.getElementById('newGameBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const gameMessage = document.getElementById('gameMessage');
const messageText = document.getElementById('messageText');

let grid = [];
let score = 0;
let bestScore = localStorage.getItem('2048BestScore') || 0;

bestScoreElement.textContent = bestScore;

function initGame() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    scoreElement.textContent = score;
    gameMessage.classList.remove('show');
    addNewTile();
    addNewTile();
    renderGrid();
}

function renderGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            const value = grid[i][j];
            if (value > 0) {
                tile.textContent = value;
                tile.setAttribute('data-value', value);
                tile.classList.add('new');
            }
            gridContainer.appendChild(tile);
        }
    }
}

function addNewTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ i, j });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move(direction) {
    let moved = false;
    const oldGrid = grid.map(row => [...row]);
    
    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            let row = grid[i].filter(val => val !== 0);
            if (direction === 'right') row.reverse();
            
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            
            while (row.length < 4) row.push(0);
            if (direction === 'right') row.reverse();
            grid[i] = row;
        }
    } else {
        for (let j = 0; j < 4; j++) {
            let col = [];
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== 0) col.push(grid[i][j]);
            }
            
            if (direction === 'down') col.reverse();
            
            for (let i = 0; i < col.length - 1; i++) {
                if (col[i] === col[i + 1]) {
                    col[i] *= 2;
                    score += col[i];
                    col.splice(i + 1, 1);
                }
            }
            
            while (col.length < 4) col.push(0);
            if (direction === 'down') col.reverse();
            
            for (let i = 0; i < 4; i++) {
                grid[i][j] = col[i];
            }
        }
    }
    
    moved = JSON.stringify(oldGrid) !== JSON.stringify(grid);
    
    if (moved) {
        scoreElement.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            bestScoreElement.textContent = bestScore;
            localStorage.setItem('2048BestScore', bestScore);
        }
        addNewTile();
        renderGrid();
        
        if (checkWin()) {
            showMessage('You Win! 🎉');
        } else if (checkGameOver()) {
            showMessage('Game Over! 😢');
        }
    }
}

function checkWin() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 2048) return true;
        }
    }
    return false;
}

function checkGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) return false;
            if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    return true;
}

function showMessage(text) {
    messageText.textContent = text;
    gameMessage.classList.add('show');
}

document.addEventListener('keydown', (e) => {
    if (gameMessage.classList.contains('show')) return;
    
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            move('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            move('down');
            break;
        case 'ArrowLeft':
            e.preventDefault();
            move('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            move('right');
            break;
    }
});

newGameBtn.addEventListener('click', initGame);
tryAgainBtn.addEventListener('click', initGame);

initGame();
