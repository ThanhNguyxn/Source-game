const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('wordDisplay');
const hintElement = document.getElementById('hint');
const keyboard = document.getElementById('keyboard');
const scoreElement = document.getElementById('score');
const wrongElement = document.getElementById('wrong');
const bestScoreElement = document.getElementById('bestScore');
const newGameBtn = document.getElementById('newGameBtn');

const words = [
    { word: 'JAVASCRIPT', hint: 'Programming language' },
    { word: 'HANGMAN', hint: 'This game' },
    { word: 'COMPUTER', hint: 'Electronic device' },
    { word: 'KEYBOARD', hint: 'Input device' },
    { word: 'PYTHON', hint: 'Snake or language' },
    { word: 'GITHUB', hint: 'Code hosting platform' },
    { word: 'DEVELOPER', hint: 'Software creator' },
    { word: 'ALGORITHM', hint: 'Step-by-step procedure' },
    { word: 'DATABASE', hint: 'Data storage' },
    { word: 'FUNCTION', hint: 'Reusable code block' },
    { word: 'VARIABLE', hint: 'Data container' },
    { word: 'INTERNET', hint: 'Global network' },
    { word: 'BROWSER', hint: 'Web viewer' },
    { word: 'WEBSITE', hint: 'Online page' },
    { word: 'PROGRAM', hint: 'Set of instructions' }
];

let currentWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
let score = 0;
let bestScore = localStorage.getItem('hangmanBestScore') || 0;

bestScoreElement.textContent = bestScore;

function initGame() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentWord = randomWord.word;
    hintElement.textContent = randomWord.hint;
    guessedLetters = [];
    wrongGuesses = 0;
    wrongElement.textContent = `${wrongGuesses}/6`;
    
    createKeyboard();
    updateWordDisplay();
    drawHangman();
}

function createKeyboard() {
    keyboard.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = letter;
        key.addEventListener('click', () => guessLetter(letter, key));
        keyboard.appendChild(key);
    }
}

function updateWordDisplay() {
    const display = currentWord.split('').map(letter => 
        guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
    wordDisplay.textContent = display;
}

function guessLetter(letter, key) {
    if (guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    key.classList.add('used');
    
    if (currentWord.includes(letter)) {
        key.classList.add('correct');
        updateWordDisplay();
        checkWin();
    } else {
        key.classList.add('wrong');
        wrongGuesses++;
        wrongElement.textContent = `${wrongGuesses}/6`;
        drawHangman();
        
        if (wrongGuesses >= 6) {
            endGame(false);
        }
    }
}

function checkWin() {
    if (currentWord.split('').every(letter => guessedLetters.includes(letter))) {
        endGame(true);
    }
}

function endGame(won) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => key.disabled = true);
    
    setTimeout(() => {
        if (won) {
            score++;
            scoreElement.textContent = score;
            
            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = bestScore;
                localStorage.setItem('hangmanBestScore', bestScore);
            }
            
            alert(`🎉 You won! The word was: ${currentWord}`);
        } else {
            alert(`😞 Game Over! The word was: ${currentWord}`);
            score = 0;
            scoreElement.textContent = score;
        }
        initGame();
    }, 500);
}

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    
    // Base
    if (wrongGuesses >= 0) {
        ctx.beginPath();
        ctx.moveTo(20, 280);
        ctx.lineTo(180, 280);
        ctx.stroke();
    }
    
    // Pole
    if (wrongGuesses >= 1) {
        ctx.beginPath();
        ctx.moveTo(50, 280);
        ctx.lineTo(50, 20);
        ctx.stroke();
    }
    
    // Top beam
    if (wrongGuesses >= 2) {
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(150, 20);
        ctx.stroke();
    }
    
    // Rope
    if (wrongGuesses >= 3) {
        ctx.beginPath();
        ctx.moveTo(150, 20);
        ctx.lineTo(150, 50);
        ctx.stroke();
    }
    
    // Head
    if (wrongGuesses >= 4) {
        ctx.beginPath();
        ctx.arc(150, 70, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Body
    if (wrongGuesses >= 5) {
        ctx.beginPath();
        ctx.moveTo(150, 90);
        ctx.lineTo(150, 150);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(150, 110);
        ctx.lineTo(120, 130);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(150, 110);
        ctx.lineTo(180, 130);
        ctx.stroke();
    }
    
    // Legs
    if (wrongGuesses >= 6) {
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(130, 200);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(170, 200);
        ctx.stroke();
    }
}

newGameBtn.addEventListener('click', initGame);

initGame();
