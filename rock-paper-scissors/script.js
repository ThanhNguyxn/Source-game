const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');
const playerChoiceElement = document.getElementById('playerChoice');
const computerChoiceElement = document.getElementById('computerChoice');
const resultElement = document.getElementById('result');
const choiceBtns = document.querySelectorAll('.choice-btn');
const resetBtn = document.getElementById('resetBtn');

let playerScore = 0;
let computerScore = 0;

const choices = ['rock', 'paper', 'scissors'];
const emojis = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

function getComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}

function determineWinner(player, computer) {
    if (player === computer) {
        return 'draw';
    }
    
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')
    ) {
        return 'win';
    }
    
    return 'lose';
}

function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    
    playerChoiceElement.textContent = emojis[playerChoice];
    computerChoiceElement.textContent = '?';
    
    setTimeout(() => {
        computerChoiceElement.textContent = emojis[computerChoice];
        
        const result = determineWinner(playerChoice, computerChoice);
        
        resultElement.classList.remove('win', 'lose', 'draw');
        
        if (result === 'win') {
            playerScore++;
            playerScoreElement.textContent = playerScore;
            resultElement.textContent = 'You Win! 🎉';
            resultElement.classList.add('win');
        } else if (result === 'lose') {
            computerScore++;
            computerScoreElement.textContent = computerScore;
            resultElement.textContent = 'You Lose! 😢';
            resultElement.classList.add('lose');
        } else {
            resultElement.textContent = "It's a Draw! 🤝";
            resultElement.classList.add('draw');
        }
    }, 300);
}

function resetScore() {
    if (confirm('Reset scores to 0?')) {
        playerScore = 0;
        computerScore = 0;
        playerScoreElement.textContent = playerScore;
        computerScoreElement.textContent = computerScore;
        playerChoiceElement.textContent = '?';
        computerChoiceElement.textContent = '?';
        resultElement.textContent = 'Choose your weapon!';
        resultElement.classList.remove('win', 'lose', 'draw');
    }
}

choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playGame(btn.dataset.choice);
    });
});

resetBtn.addEventListener('click', resetScore);
