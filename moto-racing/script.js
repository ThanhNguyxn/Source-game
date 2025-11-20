const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let gameStarted = false;
let paused = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('motoRacingHighScore')) || 0;
let distance = 0;

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 100,
    width: 30,
    height: 60,
    speed: 5,
    maxSpeed: 10,
    currentSpeed: 5
};

let cars = [];
let roadLines = [];
let roadOffset = 0;

function initGame() {
    score = 0;
    distance = 0;
    player.x = canvas.width / 2 - 15;
    player.currentSpeed = 5;
    cars = [];
    roadLines = [];

    // Initialize road lines
    for (let i = 0; i < 10; i++) {
        roadLines.push({
            y: i * 80
        });
    }

    spawnCar();
}

function spawnCar() {
    const lanes = [60, 130, 200, 270, 340];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    cars.push({
        x: lane - 15,
        y: -80,
        width: 30,
        height: 60,
        speed: 3 + Math.random() * 2
    });
}

function drawRoad() {
    // Road background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grass sides
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 30, canvas.height);
    ctx.fillRect(canvas.width - 30, 0, 30, canvas.height);

    // Road
    ctx.fillStyle = '#555';
    ctx.fillRect(30, 0, canvas.width - 60, canvas.height);

    // Lane markers
    ctx.fillStyle = '#fff';
    roadLines.forEach(line => {
        ctx.fillRect(100, line.y, 5, 40);
        ctx.fillRect(170, line.y, 5, 40);
        ctx.fillRect(240, line.y, 5, 40);
        ctx.fillRect(310, line.y, 5, 40);
    });
}

function drawPlayer() {
    // Motorcycle body
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Wheels
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 5, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 5, player.y + 42, 8, 8);

    // Rider
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x + 10, player.y + 15, 15, 25);
}

function drawCars() {
    cars.forEach(car => {
        // Car body
        ctx.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        ctx.fillRect(car.x, car.y, car.width, car.height);

        // Windows
        ctx.fillStyle = '#333';
        ctx.fillRect(car.x + 5, car.y + 15, car.width - 10, 15);
    });
}

function updateRoad() {
    roadOffset += player.currentSpeed;
    roadLines.forEach(line => {
        line.y += player.currentSpeed;
        if (line.y > canvas.height) {
            line.y = -40;
        }
    });
}

function updateCars() {
    cars.forEach((car, index) => {
        car.y += car.speed + player.currentSpeed;

        // Remove off-screen cars
        if (car.y > canvas.height) {
            cars.splice(index, 1);
            score += 10;
            updateDisplay();
        }

        // Check collision
        if (checkCollision(player, car)) {
            gameOver();
        }
    });

    // Spawn new cars
    if (Math.random() < 0.02) {
        spawnCar();
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function gameOver() {
    gameStarted = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('motoRacingHighScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalDistance').textContent = distance;
    document.getElementById('gameOver').classList.remove('hidden');
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('speed').textContent = Math.floor(player.currentSpeed * 20);
    document.getElementById('distance').textContent = Math.floor(distance);
}

function gameLoop() {
    if (gameStarted && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawRoad();
        updateRoad();
        updateCars();
        drawCars();
        drawPlayer();

        distance += player.currentSpeed / 10;
        updateDisplay();
    }

    requestAnimationFrame(gameLoop);
}

// Controls
const keys = {};
window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','p','P'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;

    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

setInterval(() => {
    if (gameStarted && !paused) {
        if (keys['ArrowLeft']) {
            player.x = Math.max(40, player.x - player.speed);
        }
        if (keys['ArrowRight']) {
            player.x = Math.min(canvas.width - 70, player.x + player.speed);
        }
        if (keys['ArrowUp']) {
            player.currentSpeed = Math.min(player.maxSpeed, player.currentSpeed + 0.1);
        }
        if (keys['ArrowDown']) {
            player.currentSpeed = Math.max(3, player.currentSpeed - 0.2);
        }
    }
}, 16);

document.getElementById('startBtn').addEventListener('click', () => {
    gameStarted = true;
    initGame();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    gameStarted = false;
});

updateDisplay();
gameLoop();

