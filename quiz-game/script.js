const categorySelector = document.getElementById('categorySelector');
const gameScreen = document.getElementById('gameScreen');
const results = document.getElementById('results');
const scoreElement = document.getElementById('score');
const currentElement = document.getElementById('current');
const bestScoreElement = document.getElementById('bestScore');
const progressElement = document.getElementById('progress');
const categoryElement = document.getElementById('category');
const questionElement = document.getElementById('question');
const difficultyElement = document.getElementById('difficulty');
const optionsElement = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

const questions = {
    general: [
        { q: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2, difficulty: "Easy" },
        { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1, difficulty: "Easy" },
        { q: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, difficulty: "Easy" },
        { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, difficulty: "Medium" },
        { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Ernest Hemingway"], correct: 1, difficulty: "Medium" },
        { q: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2, difficulty: "Hard" },
        { q: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, difficulty: "Medium" },
        { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2, difficulty: "Medium" },
        { q: "How many bones are in the human body?", options: ["186", "206", "226", "246"], correct: 1, difficulty: "Hard" },
        { q: "What is the speed of light?", options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correct: 0, difficulty: "Hard" }
    ],
    science: [
        { q: "What is H2O?", options: ["Oxygen", "Hydrogen", "Water", "Carbon Dioxide"], correct: 2, difficulty: "Easy" },
        { q: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], correct: 2, difficulty: "Easy" },
        { q: "What planet is closest to the sun?", options: ["Venus", "Mars", "Mercury", "Earth"], correct: 2, difficulty: "Easy" },
        { q: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correct: 1, difficulty: "Medium" },
        { q: "What is the boiling point of water at sea level?", options: ["90°C", "95°C", "100°C", "105°C"], correct: 2, difficulty: "Easy" },
        { q: "What type of animal is a Komodo dragon?", options: ["Lizard", "Snake", "Crocodile", "Dinosaur"], correct: 0, difficulty: "Medium" },
        { q: "How many chromosomes do humans have?", options: ["23", "46", "92", "184"], correct: 1, difficulty: "Hard" },
        { q: "What is the symbol for potassium?", options: ["P", "Po", "K", "Pt"], correct: 2, difficulty: "Medium" },
        { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correct: 2, difficulty: "Medium" },
        { q: "What is the speed of sound in air?", options: ["243 m/s", "343 m/s", "443 m/s", "543 m/s"], correct: 1, difficulty: "Hard" }
    ],
    history: [
        { q: "Who was the first President of the United States?", options: ["John Adams", "George Washington", "Thomas Jefferson", "Benjamin Franklin"], correct: 1, difficulty: "Easy" },
        { q: "In which year did World War I begin?", options: ["1912", "1914", "1916", "1918"], correct: 1, difficulty: "Medium" },
        { q: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correct: 2, difficulty: "Easy" },
        { q: "What year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], correct: 2, difficulty: "Medium" },
        { q: "Who was the first man on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"], correct: 1, difficulty: "Easy" },
        { q: "What ancient wonder was located in Alexandria?", options: ["Colossus", "Lighthouse", "Hanging Gardens", "Mausoleum"], correct: 1, difficulty: "Hard" },
        { q: "Who discovered penicillin?", options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Albert Einstein"], correct: 1, difficulty: "Medium" },
        { q: "What year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2, difficulty: "Medium" },
        { q: "Who was the longest reigning British monarch?", options: ["Victoria", "Elizabeth I", "Elizabeth II", "George III"], correct: 2, difficulty: "Hard" },
        { q: "In which battle did Napoleon suffer his final defeat?", options: ["Austerlitz", "Trafalgar", "Leipzig", "Waterloo"], correct: 3, difficulty: "Hard" }
    ],
    geography: [
        { q: "What is the capital of Japan?", options: ["Seoul", "Tokyo", "Beijing", "Bangkok"], correct: 1, difficulty: "Easy" },
        { q: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1, difficulty: "Medium" },
        { q: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], correct: 3, difficulty: "Hard" },
        { q: "Which country has the most islands?", options: ["Philippines", "Indonesia", "Sweden", "Japan"], correct: 2, difficulty: "Hard" },
        { q: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correct: 2, difficulty: "Easy" },
        { q: "Which ocean is the deepest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, difficulty: "Medium" },
        { q: "What is the smallest ocean?", options: ["Indian", "Atlantic", "Arctic", "Southern"], correct: 2, difficulty: "Medium" },
        { q: "Which country has the longest coastline?", options: ["Australia", "Canada", "Russia", "Indonesia"], correct: 1, difficulty: "Hard" },
        { q: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2, difficulty: "Medium" },
        { q: "How many countries are in Africa?", options: ["48", "52", "54", "58"], correct: 2, difficulty: "Hard" }
    ],
    sports: [
        { q: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], correct: 2, difficulty: "Easy" },
        { q: "What sport is known as 'the beautiful game'?", options: ["Basketball", "Soccer", "Tennis", "Cricket"], correct: 1, difficulty: "Easy" },
        { q: "How many points is a touchdown in American football?", options: ["4", "5", "6", "7"], correct: 2, difficulty: "Easy" },
        { q: "What is the diameter of a basketball hoop in inches?", options: ["16", "18", "20", "22"], correct: 1, difficulty: "Hard" },
        { q: "How many Grand Slam tennis tournaments are there?", options: ["3", "4", "5", "6"], correct: 1, difficulty: "Medium" },
        { q: "In what year were the first modern Olympics held?", options: ["1892", "1896", "1900", "1904"], correct: 1, difficulty: "Medium" },
        { q: "What country has won the most FIFA World Cups?", options: ["Germany", "Italy", "Argentina", "Brazil"], correct: 3, difficulty: "Medium" },
        { q: "How long is a marathon?", options: ["26.2 miles", "24.5 miles", "28.1 miles", "25.0 miles"], correct: 0, difficulty: "Medium" },
        { q: "What is the national sport of Japan?", options: ["Karate", "Judo", "Sumo Wrestling", "Kendo"], correct: 2, difficulty: "Hard" },
        { q: "Who has won the most Olympic gold medals?", options: ["Usain Bolt", "Carl Lewis", "Michael Phelps", "Mark Spitz"], correct: 2, difficulty: "Hard" }
    ],
    tech: [
        { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Unit"], correct: 1, difficulty: "Easy" },
        { q: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"], correct: 1, difficulty: "Easy" },
        { q: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], correct: 2, difficulty: "Medium" },
        { q: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission Protocol", "High Text Transfer Protocol"], correct: 0, difficulty: "Medium" },
        { q: "What programming language is known for AI?", options: ["JavaScript", "Python", "C++", "Ruby"], correct: 1, difficulty: "Medium" },
        { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"], correct: 2, difficulty: "Hard" },
        { q: "What does RAM stand for?", options: ["Random Access Memory", "Read Access Memory", "Random Active Memory", "Read Active Memory"], correct: 0, difficulty: "Easy" },
        { q: "What is the binary code for the number 5?", options: ["0101", "0110", "0111", "1000"], correct: 0, difficulty: "Hard" },
        { q: "What company owns YouTube?", options: ["Facebook", "Microsoft", "Google", "Amazon"], correct: 2, difficulty: "Easy" },
        { q: "What does GPU stand for?", options: ["Graphics Processing Unit", "General Processing Unit", "Graphics Program Unit", "General Program Unit"], correct: 0, difficulty: "Medium" }
    ]
};

let currentCategory = '';
let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let bestScore = localStorage.getItem('quizBestScore') || 0;

bestScoreElement.textContent = bestScore;

const difficultyPoints = {
    Easy: 10,
    Medium: 20,
    Hard: 30
};

document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        startQuiz();
    });
});

function startQuiz() {
    categorySelector.style.display = 'none';
    gameScreen.style.display = 'block';
    results.style.display = 'none';
    
    currentQuestions = [...questions[currentCategory]].sort(() => Math.random() - 0.5);
    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    
    scoreElement.textContent = score;
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuestions[currentQuestion];
    
    currentElement.textContent = currentQuestion + 1;
    progressElement.style.width = ((currentQuestion + 1) / 10 * 100) + '%';
    
    categoryElement.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    questionElement.textContent = q.q;
    difficultyElement.textContent = q.difficulty;
    difficultyElement.className = 'difficulty ' + q.difficulty;
    
    optionsElement.innerHTML = '';
    feedbackElement.className = 'feedback';
    feedbackElement.style.display = 'none';
    nextBtn.style.display = 'none';
    
    q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = opt;
        div.onclick = () => checkAnswer(i, div, q);
        optionsElement.appendChild(div);
    });
}

function checkAnswer(selected, div, question) {
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => {
        opt.classList.add('disabled');
    });
    
    const correct = question.correct;
    const isCorrect = selected === correct;
    
    if (isCorrect) {
        div.classList.add('correct');
        const points = difficultyPoints[question.difficulty];
        score += points;
        correctAnswers++;
        scoreElement.textContent = score;
        
        feedbackElement.className = 'feedback correct show';
        feedbackElement.textContent = `✅ Correct! +${points} points`;
    } else {
        div.classList.add('wrong');
        allOptions[correct].classList.add('correct');
        
        feedbackElement.className = 'feedback wrong show';
        feedbackElement.textContent = `❌ Wrong! The correct answer is: ${question.options[correct]}`;
    }
    
    nextBtn.style.display = 'block';
}

nextBtn.onclick = () => {
    currentQuestion++;
    if (currentQuestion < 10) {
        loadQuestion();
    } else {
        showResults();
    }
};

function showResults() {
    gameScreen.style.display = 'none';
    results.style.display = 'block';
    
    const accuracy = Math.round((correctAnswers / 10) * 100);
    let grade = 'F';
    
    if (accuracy >= 90) grade = 'A+';
    else if (accuracy >= 80) grade = 'A';
    else if (accuracy >= 70) grade = 'B';
    else if (accuracy >= 60) grade = 'C';
    else if (accuracy >= 50) grade = 'D';
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('correctCount').textContent = `${correctAnswers}/10`;
    document.getElementById('accuracy').textContent = accuracy + '%';
    document.getElementById('grade').textContent = grade;
    
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('quizBestScore', bestScore);
    }
}

playAgainBtn.onclick = () => {
    results.style.display = 'none';
    categorySelector.style.display = 'block';
};
