const levelElement = document.getElementById('level');
const bestScoreElement = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const simonBtns = document.querySelectorAll('.simon-btn');

let sequence = [];
let playerSequence = [];
let level = 0;
let bestScore = localStorage.getItem('simonBestScore') || 0;
let isPlaying = false;
let canClick = false;

bestScoreElement.textContent = bestScore;

const sounds = {
    green: 262,
    red: 330,
    yellow: 392,
    blue: 494
};

function playSound(frequency) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function startGame() {
    sequence = [];
    playerSequence = [];
    level = 0;
    isPlaying = true;
    startBtn.disabled = true;
    nextLevel();
}

function nextLevel() {
    level++;
    levelElement.textContent = level;
    playerSequence = [];
    
    const colors = ['green', 'red', 'yellow', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
    
    playSequence();
}

async function playSequence() {
    canClick = false;
    
    for (let color of sequence) {
        await new Promise(resolve => setTimeout(resolve, 500));
        activateButton(color);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    canClick = true;
}

function activateButton(color) {
    const btn = document.querySelector(`[data-color="${color}"]`);
    btn.classList.add('active');
    playSound(sounds[color]);
    
    setTimeout(() => {
        btn.classList.remove('active');
    }, 300);
}

function handlePlayerClick(color) {
    if (!canClick || !isPlaying) return;
    
    activateButton(color);
    playerSequence.push(color);
    
    const currentIndex = playerSequence.length - 1;
    
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver();
        return;
    }
    
    if (playerSequence.length === sequence.length) {
        canClick = false;
        setTimeout(nextLevel, 1000);
    }
}

function gameOver() {
    isPlaying = false;
    canClick = false;
    startBtn.disabled = false;
    
    if (level - 1 > bestScore) {
        bestScore = level - 1;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('simonBestScore', bestScore);
        alert(`🎉 New Best Score: ${bestScore}!`);
    } else {
        alert(`Game Over! Level reached: ${level - 1}`);
    }
}

simonBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handlePlayerClick(btn.dataset.color);
    });
});

startBtn.addEventListener('click', startGame);
