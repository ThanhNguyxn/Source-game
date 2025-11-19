const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let chips = 1000;
let currentBet = 0;
let wins = 0;
let gameActive = false;

const chipsElement = document.getElementById('chips');
const betElement = document.getElementById('bet');
const winsElement = document.getElementById('wins');
const dealerCardsElement = document.getElementById('dealerCards');
const playerCardsElement = document.getElementById('playerCards');
const dealerScoreElement = document.getElementById('dealerScore');
const playerScoreElement = document.getElementById('playerScore');
const messageElement = document.getElementById('message');
const bettingElement = document.getElementById('betting');
const actionsElement = document.getElementById('actions');
const newGameBtn = document.getElementById('newGameBtn');

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function drawCard(hand) {
    if (deck.length > 0) {
        hand.push(deck.pop());
    }
}

function renderCard(card, hidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    if (hidden) {
        cardDiv.classList.add('hidden');
        cardDiv.textContent = '🂠';
    } else {
        const color = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
        cardDiv.classList.add(color);
        cardDiv.innerHTML = `<div>${card.value}</div><div style="text-align:center;">${card.suit}</div><div style="text-align:right;">${card.value}</div>`;
    }
    
    return cardDiv;
}

function renderHands(hideDealer = true) {
    dealerCardsElement.innerHTML = '';
    playerCardsElement.innerHTML = '';
    
    dealerHand.forEach((card, index) => {
        dealerCardsElement.appendChild(renderCard(card, hideDealer && index === 0));
    });
    
    playerHand.forEach(card => {
        playerCardsElement.appendChild(renderCard(card));
    });
    
    const playerScore = calculateScore(playerHand);
    playerScoreElement.textContent = playerScore;
    
    if (hideDealer) {
        dealerScoreElement.textContent = '?';
    } else {
        dealerScoreElement.textContent = calculateScore(dealerHand);
    }
}

function placeBet(amount) {
    if (chips >= amount) {
        currentBet = amount;
        chips -= amount;
        chipsElement.textContent = chips;
        betElement.textContent = currentBet;
        startRound();
    } else {
        alert('Not enough chips!');
    }
}

function startRound() {
    gameActive = true;
    createDeck();
    playerHand = [];
    dealerHand = [];
    
    drawCard(playerHand);
    drawCard(dealerHand);
    drawCard(playerHand);
    drawCard(dealerHand);
    
    renderHands();
    
    bettingElement.style.display = 'none';
    actionsElement.style.display = 'flex';
    messageElement.textContent = '';
    messageElement.className = 'message';
    
    if (calculateScore(playerHand) === 21) {
        stand();
    }
}

function hit() {
    drawCard(playerHand);
    renderHands();
    
    const score = calculateScore(playerHand);
    if (score > 21) {
        endRound('bust');
    } else if (score === 21) {
        stand();
    }
}

function stand() {
    renderHands(false);
    
    while (calculateScore(dealerHand) < 17) {
        drawCard(dealerHand);
    }
    
    renderHands(false);
    
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    
    if (dealerScore > 21 || playerScore > dealerScore) {
        endRound('win');
    } else if (playerScore < dealerScore) {
        endRound('lose');
    } else {
        endRound('push');
    }
}

function doubleDown() {
    if (chips >= currentBet) {
        chips -= currentBet;
        currentBet *= 2;
        chipsElement.textContent = chips;
        betElement.textContent = currentBet;
        
        drawCard(playerHand);
        renderHands();
        
        if (calculateScore(playerHand) > 21) {
            endRound('bust');
        } else {
            stand();
        }
    } else {
        alert('Not enough chips to double down!');
    }
}

function endRound(result) {
    gameActive = false;
    actionsElement.style.display = 'none';
    newGameBtn.style.display = 'block';
    
    messageElement.className = 'message';
    
    if (result === 'win') {
        chips += currentBet * 2;
        wins++;
        messageElement.textContent = '🎉 You Win!';
        messageElement.classList.add('win');
    } else if (result === 'lose' || result === 'bust') {
        messageElement.textContent = result === 'bust' ? '💥 Bust! You Lose!' : '😞 You Lose!';
        messageElement.classList.add('lose');
    } else if (result === 'push') {
        chips += currentBet;
        messageElement.textContent = '🤝 Push! Tie!';
        messageElement.classList.add('push');
    }
    
    chipsElement.textContent = chips;
    winsElement.textContent = wins;
    
    if (chips === 0) {
        messageElement.textContent = '💸 Out of chips! Game Over!';
        newGameBtn.textContent = 'Restart Game';
    }
}

function newRound() {
    if (chips === 0) {
        chips = 1000;
        wins = 0;
        chipsElement.textContent = chips;
        winsElement.textContent = wins;
    }
    
    currentBet = 0;
    betElement.textContent = currentBet;
    bettingElement.style.display = 'block';
    newGameBtn.style.display = 'none';
    messageElement.textContent = '';
    messageElement.className = 'message';
    newGameBtn.textContent = 'New Round';
}

document.getElementById('hitBtn').addEventListener('click', hit);
document.getElementById('standBtn').addEventListener('click', stand);
document.getElementById('doubleBtn').addEventListener('click', doubleDown);
newGameBtn.addEventListener('click', newRound);
