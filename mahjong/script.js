const symbols = ['🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', '🀐', '🀑'];
let tiles = [];
let selectedTile = null;
let matches = 0;
let tilesLeft = 0;
let timeSeconds = 0;
let timerInterval = null;

const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');

document.getElementById('newGameBtn').addEventListener('click', initGame);
document.getElementById('hintBtn').addEventListener('click', showHint);
document.getElementById('shuffleBtn').addEventListener('click', shuffleTiles);

function initGame() {
    tiles = [];
    selectedTile = null;
    matches = 0;
    timeSeconds = 0;
    
    // Create 144 tiles (8 sets of 18 symbols)
    for (let i = 0; i < 8; i++) {
        symbols.forEach(symbol => {
            tiles.push({ symbol, matched: false, id: Math.random() });
        });
    }
    
    shuffleArray(tiles);
    tilesLeft = tiles.length;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeSeconds++;
        updateTimeDisplay();
    }, 1000);
    
    render();
    messageEl.textContent = '';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function render() {
    boardEl.innerHTML = '';
    tiles.forEach((tile, index) => {
        if (tile.matched) return;
        
        const tileEl = document.createElement('div');
        tileEl.classList.add('tile');
        tileEl.textContent = tile.symbol;
        tileEl.dataset.index = index;
        tileEl.addEventListener('click', () => handleTileClick(index));
        boardEl.appendChild(tileEl);
    });
    
    updateStats();
}

function handleTileClick(index) {
    if (tiles[index].matched) return;
    
    if (selectedTile === null) {
        selectedTile = index;
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    } else if (selectedTile === index) {
        document.querySelector(`[data-index="${index}"]`).classList.remove('selected');
        selectedTile = null;
    } else {
        if (tiles[selectedTile].symbol === tiles[index].symbol) {
            tiles[selectedTile].matched = true;
            tiles[index].matched = true;
            matches++;
            tilesLeft -= 2;
            
            document.querySelectorAll('.tile').forEach(el => {
                if (el.dataset.index == selectedTile || el.dataset.index == index) {
                    el.classList.add('matched');
                }
            });
            
            setTimeout(() => {
                render();
                if (tilesLeft === 0) {
                    clearInterval(timerInterval);
                    messageEl.textContent = '🎉 You Won!';
                }
            }, 500);
        } else {
            document.querySelector(`[data-index="${selectedTile}"]`).classList.remove('selected');
        }
        selectedTile = null;
    }
}

function showHint() {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].matched) continue;
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[j].matched) continue;
            if (tiles[i].symbol === tiles[j].symbol) {
                messageEl.textContent = `Hint: Look for ${tiles[i].symbol}`;
                setTimeout(() => messageEl.textContent = '', 2000);
                return;
            }
        }
    }
    messageEl.textContent = 'No matches available!';
}

function shuffleTiles() {
    const unmatchedTiles = tiles.filter(t => !t.matched);
    shuffleArray(unmatchedTiles);
    let unmatchedIndex = 0;
    tiles = tiles.map(t => t.matched ? t : unmatchedTiles[unmatchedIndex++]);
    render();
}

function updateStats() {
    document.getElementById('tilesLeft').textContent = tilesLeft;
    document.getElementById('matches').textContent = matches;
}

function updateTimeDisplay() {
    const mins = Math.floor(timeSeconds / 60);
    const secs = timeSeconds % 60;
    document.getElementById('time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

initGame();
