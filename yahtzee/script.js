let dice = [1, 1, 1, 1, 1];
let held = [false, false, false, false, false];
let rollsLeft = 3;
let round = 1;
let scores = {};
let totalScore = 0;

const categories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
                   'threeOfKind', 'fourOfKind', 'fullHouse', 'smallStraight',
                   'largeStraight', 'yahtzee', 'chance'];

function rollDice() {
    if (rollsLeft === 0) return;

    for (let i = 0; i < 5; i++) {
        if (!held[i]) {
            dice[i] = Math.floor(Math.random() * 6) + 1;
        }
    }

    rollsLeft--;
    updateDisplay();
    calculatePotentialScores();
}

function toggleHold(index) {
    if (rollsLeft < 3) {
        held[index] = !held[index];
        document.getElementById(`dice${index + 1}`).classList.toggle('held', held[index]);
    }
}

function calculatePotentialScores() {
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);

    // Number categories
    for (let i = 1; i <= 6; i++) {
        const category = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'][i-1];
        if (!scores[category]) {
            document.getElementById(`potential-${category}`).textContent =
                (counts[i] || 0) * i;
        }
    }

    // Three of a kind
    if (!scores.threeOfKind) {
        const hasThree = Object.values(counts).some(c => c >= 3);
        document.getElementById('potential-threeOfKind').textContent =
            hasThree ? dice.reduce((a, b) => a + b, 0) : 0;
    }

    // Four of a kind
    if (!scores.fourOfKind) {
        const hasFour = Object.values(counts).some(c => c >= 4);
        document.getElementById('potential-fourOfKind').textContent =
            hasFour ? dice.reduce((a, b) => a + b, 0) : 0;
    }

    // Full house
    if (!scores.fullHouse) {
        const values = Object.values(counts);
        const hasFullHouse = values.includes(3) && values.includes(2);
        document.getElementById('potential-fullHouse').textContent =
            hasFullHouse ? 25 : 0;
    }

    // Small straight
    if (!scores.smallStraight) {
        const sorted = [...new Set(dice)].sort();
        let hasSmall = false;
        for (let i = 0; i <= sorted.length - 4; i++) {
            if (sorted[i+3] - sorted[i] === 3) hasSmall = true;
        }
        document.getElementById('potential-smallStraight').textContent =
            hasSmall ? 30 : 0;
    }

    // Large straight
    if (!scores.largeStraight) {
        const sorted = [...new Set(dice)].sort();
        const hasLarge = sorted.length === 5 && sorted[4] - sorted[0] === 4;
        document.getElementById('potential-largeStraight').textContent =
            hasLarge ? 40 : 0;
    }

    // Yahtzee
    if (!scores.yahtzee) {
        const hasYahtzee = Object.values(counts).some(c => c === 5);
        document.getElementById('potential-yahtzee').textContent =
            hasYahtzee ? 50 : 0;
    }

    // Chance
    if (!scores.chance) {
        document.getElementById('potential-chance').textContent =
            dice.reduce((a, b) => a + b, 0);
    }
}

function selectScore(category) {
    const potential = parseInt(document.getElementById(`potential-${category}`).textContent);
    scores[category] = potential;
    totalScore += potential;

    document.querySelector(`[data-category="${category}"]`).classList.add('used');
    document.querySelector(`[data-category="${category}"] .score-btn`).disabled = true;
    document.getElementById(`potential-${category}`).textContent = potential;

    nextRound();
}

function nextRound() {
    round++;

    if (round > 13) {
        gameOver();
        return;
    }

    dice = [1, 1, 1, 1, 1];
    held = [false, false, false, false, false];
    rollsLeft = 3;

    document.querySelectorAll('.dice').forEach(d => d.classList.remove('held'));
    document.querySelectorAll('.dice-hold').forEach(h => h.checked = false);

    updateDisplay();
}

function gameOver() {
    document.getElementById('finalScore').textContent = totalScore;
    document.getElementById('gameOver').classList.remove('hidden');
}

function updateDisplay() {
    dice.forEach((d, i) => {
        document.querySelectorAll('.dice-value')[i].textContent = d;
    });

    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('rollsLeft').textContent = rollsLeft;
    document.getElementById('round').textContent = `${round} / 13`;
    document.getElementById('rollBtn').disabled = rollsLeft === 0;

    document.querySelectorAll('.score-btn').forEach(btn => {
        btn.disabled = rollsLeft === 3 || scores[btn.dataset.category] !== undefined;
    });
}

document.getElementById('rollBtn').addEventListener('click', rollDice);

document.querySelectorAll('.dice').forEach((dice, index) => {
    dice.addEventListener('click', () => toggleHold(index));
});

document.querySelectorAll('.dice-hold').forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => toggleHold(index));
});

document.querySelectorAll('.score-btn').forEach(btn => {
    btn.addEventListener('click', () => selectScore(btn.dataset.category));
});

document.getElementById('restartBtn').addEventListener('click', () => {
    dice = [1, 1, 1, 1, 1];
    held = [false, false, false, false, false];
    rollsLeft = 3;
    round = 1;
    scores = {};
    totalScore = 0;

    document.querySelectorAll('.score-item').forEach(item => {
        item.classList.remove('used');
        const category = item.dataset.category;
        document.getElementById(`potential-${category}`).textContent = '-';
    });

    document.querySelectorAll('.score-btn').forEach(btn => btn.disabled = false);
    document.getElementById('gameOver').classList.add('hidden');

    updateDisplay();
});

updateDisplay();

