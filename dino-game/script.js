const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const gravity = 0.6;
const groundY = canvas.height - 50;

let dino = {
    x: 50,
    y: groundY,
    width: 40,
    height: 50,
    velocityY: 0,
    jumping: false,
    ducking: false
};

let obstacles = [];
let birds = [];
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let gameLoop;
let isGameRunning = false;
let gameSpeed = 5;
let frameCount = 0;

highScoreElement.textContent = highScore;

function drawDino() {
    ctx.fillStyle = '#535353';
    
    if (dino.ducking) {
        ctx.fillRect(dino.x, dino.y + 20, dino.width, 30);
        ctx.fillRect(dino.x + 35, dino.y + 15, 10, 10);
    } else {
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        ctx.fillRect(dino.x + 35, dino.y + 5, 10, 10);
        ctx.fillRect(dino.x - 5, dino.y + 45, 15, 5);
        ctx.fillRect(dino.x + 30, dino.y + 45, 15, 5);
    }
}

function drawGround() {
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.stroke();
}

function drawObstacles() {
    ctx.fillStyle = '#535353';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawBirds() {
    ctx.fillStyle = '#535353';
    birds.forEach(bird => {
        ctx.fillRect(bird.x, bird.y, 30, 20);
        ctx.fillRect(bird.x - 5, bird.y + 8, 10, 4);
        ctx.fillRect(bird.x + 30, bird.y + 8, 10, 4);
    });
}

function updateDino() {
    if (dino.jumping) {
        dino.velocityY += gravity;
        dino.y += dino.velocityY;
        
        if (dino.y >= groundY) {
            dino.y = groundY;
            dino.velocityY = 0;
            dino.jumping = false;
        }
    }
}

function updateObstacles() {
    if (frameCount % 100 === 0) {
        const height = Math.random() * 30 + 30;
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 40 - height,
            width: 20,
            height: height
        });
    }
    
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
            scoreElement.textContent = score;
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('dinoHighScore', highScore);
            }
        }
    });
}

function updateBirds() {
    if (frameCount % 150 === 0 && Math.random() > 0.5) {
        birds.push({
            x: canvas.width,
            y: groundY - 80
        });
    }
    
    birds.forEach((bird, index) => {
        bird.x -= gameSpeed + 2;
        if (bird.x + 30 < 0) {
            birds.splice(index, 1);
        }
    });
}

function checkCollision() {
    const dinoBox = {
        x: dino.x,
        y: dino.ducking ? dino.y + 20 : dino.y,
        width: dino.width,
        height: dino.ducking ? 30 : dino.height
    };
    
    for (let obstacle of obstacles) {
        if (dinoBox.x < obstacle.x + obstacle.width &&
            dinoBox.x + dinoBox.width > obstacle.x &&
            dinoBox.y < obstacle.y + obstacle.height &&
            dinoBox.y + dinoBox.height > obstacle.y) {
            return true;
        }
    }
    
    for (let bird of birds) {
        if (dinoBox.x < bird.x + 30 &&
            dinoBox.x + dinoBox.width > bird.x &&
            dinoBox.y < bird.y + 20 &&
            dinoBox.y + dinoBox.height > bird.y) {
            return true;
        }
    }
    
    return false;
}

function draw() {
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGround();
    drawDino();
    drawObstacles();
    drawBirds();
}

function update() {
    if (!isGameRunning) return;
    
    frameCount++;
    updateDino();
    updateObstacles();
    updateBirds();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    if (frameCount % 500 === 0) {
        gameSpeed += 0.5;
    }
    
    draw();
}

function jump() {
    if (!dino.jumping && !dino.ducking) {
        dino.jumping = true;
        dino.velocityY = -12;
    }
}

function duck(isDucking) {
    if (!dino.jumping) {
        dino.ducking = isDucking;
    }
}

function startGame() {
    if (isGameRunning) return;
    
    dino.y = groundY;
    dino.velocityY = 0;
    dino.jumping = false;
    dino.ducking = false;
    obstacles = [];
    birds = [];
    score = 0;
    gameSpeed = 5;
    frameCount = 0;
    scoreElement.textContent = score;
    
    isGameRunning = true;
    startBtn.disabled = true;
    
    gameLoop = setInterval(update, 1000 / 60);
}

function gameOver() {
    clearInterval(gameLoop);
    isGameRunning = false;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.disabled = false;
}

function resetGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    dino.y = groundY;
    dino.velocityY = 0;
    dino.jumping = false;
    dino.ducking = false;
    obstacles = [];
    birds = [];
    score = 0;
    gameSpeed = 5;
    frameCount = 0;
    scoreElement.textContent = score;
    startBtn.disabled = false;
    draw();
}

document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    switch (e.key) {
        case ' ':
        case 'ArrowUp':
            e.preventDefault();
            jump();
            break;
        case 'ArrowDown':
            e.preventDefault();
            duck(true);
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        duck(false);
    }
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

draw();
