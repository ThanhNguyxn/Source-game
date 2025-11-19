const puzzle = {
    grid: [
        ['C', 'A', 'T', 'S', null, 'D', 'O', 'G', 'S', null],
        ['O', null, null, 'T', null, 'A', null, 'A', null, null],
        ['D', null, null, 'A', null, 'T', null, 'M', null, null],
        ['E', 'A', 'G', 'L', 'E', 'A', null, 'E', null, null],
        [null, null, null, null, null, null, null, null, null, null],
        ['H', 'O', 'U', 'S', 'E', null, 'T', 'R', 'E', 'E'],
        ['A', null, null, 'U', null, null, 'I', null, null, 'A'],
        ['N', null, null, 'N', null, null, 'G', null, null, 'R'],
        ['D', null, null, null, null, null, 'E', null, null, 'T'],
        ['S', 'T', 'A', 'R', 'S', null, 'R', null, null, 'H']
    ],
    clues: {
        across: [
            { num: 1, clue: 'Feline pets (4)', answer: 'CATS', row: 0, col: 0 },
            { num: 2, clue: 'Canine pets (4)', answer: 'DOGS', row: 0, col: 5 },
            { num: 3, clue: 'Large bird of prey (5)', answer: 'EAGLE', row: 3, col: 0 },
            { num: 4, clue: 'Place to live (5)', answer: 'HOUSE', row: 5, col: 0 },
            { num: 5, clue: 'Celestial objects (5)', answer: 'STARS', row: 9, col: 0 }
        ],
        down: [
            { num: 1, clue: 'Computer instructions (4)', answer: 'CODE', row: 0, col: 0 },
            { num: 6, clue: 'Information (4)', answer: 'DATA', row: 0, col: 5 },
            { num: 7, clue: 'Video or board (4)', answer: 'GAME', row: 0, col: 7 },
            { num: 8, clue: 'Woody plant (4)', answer: 'TREE', row: 5, col: 6 },
            { num: 9, clue: 'Bengal cat big cousin (5)', answer: 'TIGER', row: 5, col: 6 },
            { num: 10, clue: 'Our planet (5)', answer: 'EARTH', row: 5, col: 9 }
        ]
    }
};

let timeSeconds = 0;
let timerInterval = null;
let userGrid = [];

const gridEl = document.getElementById('grid');
const messageEl = document.getElementById('message');

document.getElementById('checkBtn').addEventListener('click', checkAnswers);
document.getElementById('revealBtn').addEventListener('click', revealAnswers);
document.getElementById('clearBtn').addEventListener('click', clearAll);

function initGame() {
    userGrid = puzzle.grid.map(row => row.map(cell => cell === null ? null : ''));
    
    renderGrid();
    renderClues();
    
    timerInterval = setInterval(() => {
        timeSeconds++;
        updateTimeDisplay();
    }, 1000);
}

function renderGrid() {
    gridEl.innerHTML = '';
    puzzle.grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            
            if (cell === null) {
                cellEl.classList.add('black');
            } else {
                const input = document.createElement('input');
                input.maxLength = 1;
                input.dataset.row = i;
                input.dataset.col = j;
                input.value = userGrid[i][j];
                input.addEventListener('input', handleInput);
                cellEl.appendChild(input);
                
                const clueNum = getClueNumber(i, j);
                if (clueNum) {
                    const numEl = document.createElement('div');
                    numEl.classList.add('cell-number');
                    numEl.textContent = clueNum;
                    cellEl.appendChild(numEl);
                }
            }
            
            gridEl.appendChild(cellEl);
        });
    });
}

function renderClues() {
    const acrossEl = document.getElementById('acrossClues');
    const downEl = document.getElementById('downClues');
    
    acrossEl.innerHTML = '';
    puzzle.clues.across.forEach(clue => {
        const clueEl = document.createElement('div');
        clueEl.classList.add('clue');
        clueEl.textContent = `${clue.num}. ${clue.clue}`;
        acrossEl.appendChild(clueEl);
    });
    
    downEl.innerHTML = '';
    puzzle.clues.down.forEach(clue => {
        const clueEl = document.createElement('div');
        clueEl.classList.add('clue');
        clueEl.textContent = `${clue.num}. ${clue.clue}`;
        downEl.appendChild(clueEl);
    });
}

function getClueNumber(row, col) {
    let num = null;
    puzzle.clues.across.forEach(clue => {
        if (clue.row === row && clue.col === col) num = clue.num;
    });
    puzzle.clues.down.forEach(clue => {
        if (clue.row === row && clue.col === col) num = clue.num;
    });
    return num;
}

function handleInput(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    userGrid[row][col] = e.target.value.toUpperCase();
    updateCompletion();
}

function checkAnswers() {
    let correct = 0;
    let total = 0;
    
    puzzle.grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== null) {
                total++;
                const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                const cellEl = input.parentElement;
                
                if (userGrid[i][j] === cell) {
                    correct++;
                    cellEl.classList.add('correct');
                    cellEl.classList.remove('wrong');
                } else if (userGrid[i][j] !== '') {
                    cellEl.classList.add('wrong');
                    cellEl.classList.remove('correct');
                }
            }
        });
    });
    
    if (correct === total) {
        clearInterval(timerInterval);
        messageEl.textContent = '🎉 Perfect! You solved it!';
    } else {
        messageEl.textContent = `${correct} out of ${total} correct`;
        setTimeout(() => messageEl.textContent = '', 3000);
    }
}

function revealAnswers() {
    puzzle.grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== null) {
                userGrid[i][j] = cell;
                const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                if (input) input.value = cell;
            }
        });
    });
    updateCompletion();
}

function clearAll() {
    userGrid = puzzle.grid.map(row => row.map(cell => cell === null ? null : ''));
    document.querySelectorAll('.cell input').forEach(input => {
        input.value = '';
        input.parentElement.classList.remove('correct', 'wrong');
    });
    messageEl.textContent = '';
    updateCompletion();
}

function updateCompletion() {
    let filled = 0;
    let total = 0;
    puzzle.grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== null) {
                total++;
                if (userGrid[i][j] !== '') filled++;
            }
        });
    });
    const percentage = Math.round((filled / total) * 100);
    document.getElementById('completed').textContent = `${percentage}%`;
}

function updateTimeDisplay() {
    const mins = Math.floor(timeSeconds / 60);
    const secs = timeSeconds % 60;
    document.getElementById('time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

initGame();
