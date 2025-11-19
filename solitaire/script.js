const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

let deck = [];
let stock = [];
let waste = [];
let foundations = [[], [], [], []];
let tableau = [[], [], [], [], [], [], []];
let moves = 0;
let score = 0;
let timeSeconds = 0;
let timerInterval = null;

const stockEl = document.getElementById('stock');
const wasteEl = document.getElementById('waste');
const tableauEl = document.getElementById('tableau');
const movesEl = document.getElementById('moves');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const messageEl = document.getElementById('message');

document.getElementById('newGameBtn').addEventListener('click', initGame);
document.getElementById('undoBtn').addEventListener('click', () => messageEl.textContent = 'Undo coming soon!');
document.getElementById('hintBtn').addEventListener('click', () => messageEl.textContent = 'Try moving aces to foundations!');

function initGame() {
    // Create and shuffle deck
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value, faceUp: false });
        }
    }
    shuffleDeck();
    
    // Reset game state
    stock = [];
    waste = [];
    foundations = [[], [], [], []];
    tableau = [[], [], [], [], [], [], []];
    moves = 0;
    score = 0;
    timeSeconds = 0;
    
    // Deal cards to tableau
    for (let i = 0; i < 7; i++) {
        for (let j = i; j < 7; j++) {
            const card = deck.pop();
            if (i === j) card.faceUp = true;
            tableau[j].push(card);
        }
    }
    
    // Remaining cards to stock
    stock = deck;
    
    // Start timer
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeSeconds++;
        updateTimeDisplay();
    }, 1000);
    
    render();
    messageEl.textContent = '';
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function render() {
    // Render stock
    stockEl.innerHTML = '';
    if (stock.length > 0) {
        const cardEl = createCardElement(stock[stock.length - 1], false);
        stockEl.appendChild(cardEl);
        stockEl.onclick = drawCard;
    } else {
        stockEl.onclick = resetStock;
    }
    
    // Render waste
    wasteEl.innerHTML = '';
    if (waste.length > 0) {
        const cardEl = createCardElement(waste[waste.length - 1], true);
        wasteEl.appendChild(cardEl);
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', handleDragStart);
    }
    
    // Render tableau
    tableauEl.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const pileEl = document.createElement('div');
        pileEl.classList.add('tableau-pile');
        pileEl.dataset.pile = i;
        
        tableau[i].forEach((card, index) => {
            const cardEl = createCardElement(card, card.faceUp);
            cardEl.style.top = `${index * 30}px`;
            cardEl.dataset.pile = i;
            cardEl.dataset.index = index;
            
            if (card.faceUp) {
                cardEl.draggable = true;
                cardEl.addEventListener('dragstart', handleDragStart);
            } else {
                cardEl.addEventListener('click', flipCard);
            }
            
            pileEl.appendChild(cardEl);
        });
        
        pileEl.addEventListener('dragover', handleDragOver);
        pileEl.addEventListener('drop', handleDrop);
        tableauEl.appendChild(pileEl);
    }
    
    // Update stats
    movesEl.textContent = moves;
    scoreEl.textContent = score;
    
    checkWin();
}

function createCardElement(card, faceUp) {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    
    if (faceUp) {
        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        cardEl.classList.add(isRed ? 'red' : 'black');
        
        cardEl.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${suitSymbols[card.suit]}</div>
            <div class="card-value">${card.value}</div>
        `;
    } else {
        cardEl.classList.add('face-down');
    }
    
    return cardEl;
}

function drawCard() {
    if (stock.length > 0) {
        const card = stock.pop();
        card.faceUp = true;
        waste.push(card);
        moves++;
        render();
    }
}

function resetStock() {
    stock = waste.reverse();
    stock.forEach(card => card.faceUp = false);
    waste = [];
    render();
}

function flipCard(e) {
    const pile = parseInt(e.target.dataset.pile);
    const index = parseInt(e.target.dataset.index);
    
    if (index === tableau[pile].length - 1) {
        tableau[pile][index].faceUp = true;
        score += 5;
        render();
    }
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    
    if (e.target.parentElement.classList.contains('tableau-pile')) {
        const pile = parseInt(e.target.dataset.pile);
        const index = parseInt(e.target.dataset.index);
        e.dataTransfer.setData('source', `tableau-${pile}-${index}`);
    } else {
        e.dataTransfer.setData('source', 'waste');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const source = e.dataTransfer.getData('source');
    const targetPile = parseInt(e.currentTarget.dataset.pile);
    
    if (source.startsWith('tableau')) {
        const [, srcPile, srcIndex] = source.split('-').map(Number);
        moveTableauToTableau(srcPile, srcIndex, targetPile);
    } else if (source === 'waste') {
        moveWasteToTableau(targetPile);
    }
}

function moveTableauToTableau(srcPile, srcIndex, destPile) {
    const movingCards = tableau[srcPile].slice(srcIndex);
    const topCard = movingCards[0];
    const destTop = tableau[destPile][tableau[destPile].length - 1];
    
    if (canPlaceOnTableau(topCard, destTop)) {
        tableau[destPile].push(...movingCards);
        tableau[srcPile].splice(srcIndex);
        moves++;
        score += 5;
        render();
    }
}

function moveWasteToTableau(destPile) {
    if (waste.length === 0) return;
    
    const card = waste[waste.length - 1];
    const destTop = tableau[destPile][tableau[destPile].length - 1];
    
    if (canPlaceOnTableau(card, destTop)) {
        tableau[destPile].push(waste.pop());
        moves++;
        score += 5;
        render();
    }
}

function canPlaceOnTableau(card, onCard) {
    if (!onCard) {
        return card.value === 'K';
    }
    
    const cardColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
    const onCardColor = (onCard.suit === 'hearts' || onCard.suit === 'diamonds') ? 'red' : 'black';
    const cardVal = values.indexOf(card.value);
    const onCardVal = values.indexOf(onCard.value);
    
    return cardColor !== onCardColor && cardVal === onCardVal - 1;
}

function updateTimeDisplay() {
    const mins = Math.floor(timeSeconds / 60);
    const secs = timeSeconds % 60;
    timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function checkWin() {
    const totalCards = foundations.reduce((sum, pile) => sum + pile.length, 0);
    if (totalCards === 52) {
        clearInterval(timerInterval);
        messageEl.textContent = '🎉 Congratulations! You Won!';
    }
}

// Initialize game on load
initGame();
