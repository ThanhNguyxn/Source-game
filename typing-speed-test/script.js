const textDisplay = document.getElementById('textDisplay');
const inputArea = document.getElementById('inputArea');
const timeElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const startBtn = document.getElementById('startBtn');
const results = document.getElementById('results');

const texts = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Programming is the art of telling another human what one wants the computer to do. Code is like humor. When you have to explain it, it's bad.",
    "The best way to predict the future is to invent it. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
    "Life is what happens when you're busy making other plans. The only way to do great work is to love what you do. Keep moving forward.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Believe you can and you're halfway there."
];

let currentText = '';
let timeLeft = 60;
let timerInterval;
let isPlaying = false;
let correctChars = 0;
let wrongChars = 0;
let totalChars = 0;

function startTest() {
    currentText = texts[Math.floor(Math.random() * texts.length)];
    timeLeft = 60;
    correctChars = 0;
    wrongChars = 0;
    totalChars = 0;
    isPlaying = true;
    
    textDisplay.innerHTML = currentText.split('').map(char => 
        `<span>${char}</span>`
    ).join('');
    
    inputArea.value = '';
    inputArea.disabled = false;
    inputArea.focus();
    startBtn.disabled = true;
    results.style.display = 'none';
    
    timeElement.textContent = timeLeft;
    wpmElement.textContent = 0;
    accuracyElement.textContent = 100;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function updateDisplay() {
    const inputText = inputArea.value;
    const spans = textDisplay.querySelectorAll('span');
    
    correctChars = 0;
    wrongChars = 0;
    
    spans.forEach((span, index) => {
        span.classList.remove('correct', 'wrong', 'current');
        
        if (index < inputText.length) {
            if (inputText[index] === currentText[index]) {
                span.classList.add('correct');
                correctChars++;
            } else {
                span.classList.add('wrong');
                wrongChars++;
            }
        } else if (index === inputText.length) {
            span.classList.add('current');
        }
    });
    
    totalChars = inputText.length;
    
    const accuracy = totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
    accuracyElement.textContent = accuracy;
    
    const wordsTyped = inputText.trim().split(/\s+/).length;
    const timeElapsed = (60 - timeLeft) / 60;
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    wpmElement.textContent = wpm;
    
    if (inputText === currentText) {
        endTest();
    }
}

function endTest() {
    isPlaying = false;
    clearInterval(timerInterval);
    inputArea.disabled = true;
    startBtn.disabled = false;
    
    const timeElapsed = (60 - timeLeft) / 60;
    const wordsTyped = inputArea.value.trim().split(/\s+/).length;
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    const cpm = Math.round(correctChars / timeElapsed);
    const accuracy = totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
    
    document.getElementById('finalWpm').textContent = wpm;
    document.getElementById('finalCpm').textContent = cpm;
    document.getElementById('finalAccuracy').textContent = accuracy;
    document.getElementById('correctChars').textContent = correctChars;
    document.getElementById('wrongChars').textContent = wrongChars;
    
    results.style.display = 'block';
}

inputArea.addEventListener('input', () => {
    if (isPlaying) {
        updateDisplay();
    }
});

startBtn.addEventListener('click', startTest);
