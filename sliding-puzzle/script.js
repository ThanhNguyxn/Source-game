const puzzleBoard = document.getElementById('puzzleBoard');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const bestMovesElement = document.getElementById('bestMoves');
const shuffleBtn = document.getElementById('shuffleBtn');
const solveBtn = document.getElementById('solveBtn');

let tiles = [];
let moves = 0;
let timer = 0;
let timerInterval;
let bestMoves = localStorage.getItem('slidingPuzzleBest') || null;

if (bestMoves) {
    bestMovesElement.textContent = bestMoves;
}

function initGame() {
    tiles = Array.from({length: 16}, (_, i) => i);
    moves = 0;
    timer = 0;
    movesElement.textContent = moves;
    timeElement.textContent = '0:00';
    clearInterval(timerInterval);
    renderBoard();
}

function renderBoard() {
    puzzleBoard.innerHTML = '';
    tiles.forEach((num, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        
        if (num === 0) {
            tile.classList.add('empty');
        } else {
            tile.textContent = num;
            if (num === index + 1 && num !== 0) {
                tile.classList.add('correct');
            }
        }
        
        tile.addEventListener('click', () => moveTile(index));
        puzzleBoard.appendChild(tile);
    });
}

function moveTile(index) {
    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex);
    
    if (validMoves.includes(index)) {
        if (moves === 0) {
            startTimer();
        }
        
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        moves++;
        movesElement.textContent = moves;
        renderBoard();
        checkWin();
    }
}

function getValidMoves(emptyIndex) {
    const validMoves = [];
    const row = Math.floor(emptyIndex / 4);
    const col = emptyIndex % 4;
    
    if (row > 0) validMoves.push(emptyIndex - 4);
    if (row < 3) validMoves.push(emptyIndex + 4);
    if (col > 0) validMoves.push(emptyIndex - 1);
    if (col < 3) validMoves.push(emptyIndex + 1);
    
    return validMoves;
}

function shuffle() {
    clearInterval(timerInterval);
    moves = 0;
    timer = 0;
    movesElement.textContent = moves;
    timeElement.textContent = '0:00';
    
    for (let i = 0; i < 500; i++) {
        const emptyIndex = tiles.indexOf(0);
        const validMoves = getValidMoves(emptyIndex);
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        [tiles[randomMove], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[randomMove]];
    }
    
    renderBoard();
}

function solve() {
    tiles = Array.from({length: 16}, (_, i) => i);
    renderBoard();
    clearInterval(timerInterval);
    moves = 0;
    timer = 0;
    movesElement.textContent = moves;
    timeElement.textContent = '0:00';
}

function checkWin() {
    const solved = tiles.every((num, index) => num === index);
    
    if (solved) {
        clearInterval(timerInterval);
        
        if (!bestMoves || moves < parseInt(bestMoves)) {
            bestMoves = moves;
            bestMovesElement.textContent = bestMoves;
            localStorage.setItem('slidingPuzzleBest', bestMoves);
            alert(`🎉 New Best! Solved in ${moves} moves!`);
        } else {
            alert(`✅ Solved in ${moves} moves!`);
        }
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        const mins = Math.floor(timer / 60);
        const secs = timer % 60;
        timeElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

shuffleBtn.addEventListener('click', shuffle);
solveBtn.addEventListener('click', solve);

initGame();
