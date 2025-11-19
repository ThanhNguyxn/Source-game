const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const textDisplay = document.getElementById('textDisplay');
const inputArea = document.getElementById('inputArea');
const timeElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const results = document.getElementById('results');
const resetBtn = document.getElementById('resetBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

let timeLeft = 60;
let timer = null;
let difficulty = 'easy';
let testText = '';
let startTime = 0;
let isTestRunning = false;

// Text samples by difficulty
const textSamples = {
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "A journey of a thousand miles begins with a single step.",
        "Practice makes perfect when you never give up.",
        "Time flies when you are having fun with friends.",
        "Every cloud has a silver lining if you look close."
    ],
    medium: [
        "Success is not final, failure is not fatal, it is the courage to continue that counts. The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "The future belongs to those who believe in the beauty of their dreams. Life is what happens when you are busy making other plans and enjoying every moment.",
        "In the middle of difficulty lies opportunity. The only way to do great work is to love what you do and never stop learning new things every single day.",
        "Believe you can and you are halfway there. The secret of getting ahead is getting started with determination and passion for excellence in all endeavors."
    ],
    hard: [
        "The art of programming consists of organizing and mastering complexity through abstraction and decomposition. Good code is its own best documentation, as you are about to add a comment, ask yourself how can I improve the code so that this comment is not needed. Any fool can write code that a computer can understand, but good programmers write code that humans can understand and maintain over time.",
        "Technology is best when it brings people together and makes their lives better through innovation and creativity. The advance of technology is based on making it fit in so that you do not really notice it anymore. It has become an invisible yet indispensable part of our daily lives, transforming how we work, communicate, and solve complex problems in ways that seemed impossible just decades ago."
    ],
    expert: [
        "JavaScript's prototype-based inheritance, first-class functions, and dynamic typing make it uniquely flexible yet challenging. The event-driven, non-blocking I/O model makes Node.js lightweight and efficient, perfect for data-intensive real-time applications. Understanding closures, hoisting, and the 'this' keyword is essential for mastering JavaScript's nuances.",
        "Algorithm complexity analysis involves determining time and space requirements as input size grows. Big-O notation provides an upper bound on growth rate: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, and O(2ⁿ) exponential complexity classes."
    ]
};

const difficultySettings = {
    easy: { name: 'Easy', time: 60 },
    medium: { name: 'Medium', time: 60 },
    hard: { name: 'Hard', time: 60 },
    expert: { name: 'Expert', time: 60 }
};

// Start test
function startTest(diff) {
    difficulty = diff;
    modeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    difficultyDisplay.textContent = difficultySettings[diff].name;
    
    initTest();
}

// Initialize test
function initTest() {
    // Get random text for difficulty
    const texts = textSamples[difficulty];
    testText = texts[Math.floor(Math.random() * texts.length)];
    
    textDisplay.innerHTML = testText.split('').map(char => 
        `<span class="char">${char}</span>`
    ).join('');
    
    inputArea.value = '';
    inputArea.disabled = false;
    inputArea.focus();
    
    timeLeft = difficultySettings[difficulty].time;
    isTestRunning = false;
    results.style.display = 'none';
    
    updateDisplay();
}

// Start timer on first keypress
inputArea.addEventListener('input', () => {
    if (!isTestRunning) {
        startTimer();
        isTestRunning = true;
        startTime = Date.now();
    }
    checkText();
    updateStats();
});

// Start timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

// Check text
function checkText() {
    const typed = inputArea.value;
    const chars = textDisplay.querySelectorAll('.char');
    
    let correct = 0;
    let incorrect = 0;
    
    chars.forEach((char, index) => {
        if (index < typed.length) {
            if (typed[index] === char.textContent) {
                char.className = 'char correct';
                correct++;
            } else {
                char.className = 'char incorrect';
                incorrect++;
            }
        } else {
            char.className = 'char';
        }
    });
    
    // Check if completed
    if (typed === testText) {
        endTest();
    }
}

// Update stats
function updateStats() {
    const typed = inputArea.value;
    const words = typed.trim().split(/\s+/).length;
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    
    wpmElement.textContent = wpm;
    
    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === testText[i]) correct++;
    }
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    accuracyElement.textContent = accuracy;
}

// Update display
function updateDisplay() {
    timeElement.textContent = timeLeft;
}

// End test
function endTest() {
    clearInterval(timer);
    inputArea.disabled = true;
    isTestRunning = false;
    
    // Calculate final stats
    const typed = inputArea.value;
    const words = typed.trim().split(/\s+/);
    const testWords = testText.trim().split(/\s+/);
    
    let correctWords = 0;
    let wrongWords = 0;
    
    words.forEach((word, index) => {
        if (word === testWords[index]) {
            correctWords++;
        } else {
            wrongWords++;
        }
    });
    
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const finalWPM = elapsed > 0 ? Math.round(correctWords / elapsed) : 0;
    
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === testText[i]) correct++;
    }
    const finalAccuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0;
    
    // Show results
    document.getElementById('finalWPM').textContent = finalWPM;
    document.getElementById('finalAccuracy').textContent = finalAccuracy;
    document.getElementById('correctWords').textContent = correctWords;
    document.getElementById('wrongWords').textContent = wrongWords;
    
    results.style.display = 'block';
}

// Reset test
function resetTest() {
    clearInterval(timer);
    initTest();
}

// Change mode
function changeMode() {
    clearInterval(timer);
    gameArea.style.display = 'none';
    modeSelector.style.display = 'block';
}

resetBtn.addEventListener('click', resetTest);
changeModeBtn.addEventListener('click', changeMode);