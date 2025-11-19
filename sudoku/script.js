const sudokuBoard = document.getElementById('sudokuBoard');
const difficultyElement = document.getElementById('difficulty');
const timeElement = document.getElementById('time');
const mistakesElement = document.getElementById('mistakes');
const newGameBtn = document.getElementById('newGameBtn');
const hintBtn = document.getElementById('hintBtn');
const checkBtn = document.getElementById('checkBtn');
const difficultyBtns = document.querySelectorAll('.diff-btn');
const numBtns = document.querySelectorAll('.num-btn');

let board = [];
let solution = [];
let selectedCell = null;
let currentDifficulty = 'easy';
let mistakes = 0;
let maxMistakes = 3;
let timer = 0;
let timerInterval = null;

const difficultyLevels = {
    easy: 40,
    medium: 50,
    hard: 60
};

function initGame() {
    mistakes = 0;
    timer = 0;
    mistakesElement.textContent = `${mistakes}/${maxMistakes}`;
    timeElement.textContent = '0:00';
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        const mins = Math.floor(timer / 60);
        const secs = timer % 60;
        timeElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
    
    generateSudoku();
    renderBoard();
}

function generateSudoku() {
    solution = [];
    board = [];
    
    for (let i = 0; i < 9; i++) {
        solution[i] = [];
        board[i] = [];
        for (let j = 0; j < 9; j++) {
            solution[i][j] = 0;
            board[i][j] = 0;
        }
    }
    
    fillBoard(solution);
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            board[i][j] = solution[i][j];
        }
    }
    
    const cellsToRemove = difficultyLevels[currentDifficulty];
    let removed = 0;
    
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
}

function fillBoard(board) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) {
                shuffleArray(numbers);
                for (let num of numbers) {
                    if (isValid(board, i, j, num)) {
                        board[i][j] = num;
                        if (fillBoard(board)) {
                            return true;
                        }
                        board[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) {
            return false;
        }
    }
    
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    
    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderBoard() {
    sudokuBoard.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const initialValue = board[i][j];
            
            if (initialValue !== 0) {
                cell.textContent = initialValue;
                cell.classList.add('fixed');
            }
            
            cell.addEventListener('click', () => selectCell(i, j));
            
            sudokuBoard.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => cell.classList.remove('selected'));
    
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (!cell.classList.contains('fixed')) {
        cell.classList.add('selected');
        selectedCell = { row, col };
    }
}

function placeNumber(num) {
    if (!selectedCell) {
        alert('Please select a cell first!');
        return;
    }
    
    const { row, col } = selectedCell;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.classList.contains('fixed')) return;
    
    cell.classList.remove('error', 'correct', 'user-input');
    
    if (num === 0) {
        cell.textContent = '';
        board[row][col] = 0;
        return;
    }
    
    board[row][col] = num;
    cell.textContent = num;
    cell.classList.add('user-input');
    
    if (num !== solution[row][col]) {
        cell.classList.add('error');
        mistakes++;
        mistakesElement.textContent = `${mistakes}/${maxMistakes}`;
        
        if (mistakes >= maxMistakes) {
            endGame(false);
        }
    } else {
        cell.classList.add('correct');
        checkWin();
    }
}

function giveHint() {
    if (!selectedCell) {
        alert('Please select a cell first!');
        return;
    }
    
    const { row, col } = selectedCell;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.classList.contains('fixed')) {
        alert('This cell is already filled!');
        return;
    }
    
    const correctNum = solution[row][col];
    board[row][col] = correctNum;
    cell.textContent = correctNum;
    cell.classList.remove('error', 'user-input');
    cell.classList.add('correct');
    
    checkWin();
}

function checkBoard() {
    let allCorrect = true;
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            
            if (board[i][j] !== 0 && board[i][j] !== solution[i][j]) {
                cell.classList.add('error');
                allCorrect = false;
            }
        }
    }
    
    if (allCorrect) {
        alert('All filled cells are correct! Keep going!');
    } else {
        alert('Some cells are incorrect. They are highlighted in red.');
    }
}

function checkWin() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== solution[i][j]) {
                return;
            }
        }
    }
    
    endGame(true);
}

function endGame(won) {
    clearInterval(timerInterval);
    
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    setTimeout(() => {
        if (won) {
            alert(`🎉 Congratulations! You solved it!\nTime: ${timeStr}\nMistakes: ${mistakes}`);
        } else {
            alert(`😞 Game Over! Too many mistakes.\nTime: ${timeStr}`);
        }
    }, 300);
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.level;
        difficultyElement.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
        initGame();
    });
});

numBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num);
        placeNumber(num);
    });
});

newGameBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', giveHint);
checkBtn.addEventListener('click', checkBoard);

initGame();
