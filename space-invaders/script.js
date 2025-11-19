const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 50,
    width: 40,
    height: 30,
    speed: 5
};

let bullets = [];
let aliens = [];
let alienBullets = [];
let score = 0;
let lives = 3;
let highScore = localStorage.getItem('spaceInvadersHighScore') || 0;
let gameLoop;
let isGameRunning = false;
let alienDirection = 1;
let alienSpeed = 1;

highScoreElement.textContent = highScore;

const keys = {
    left: false,
    right: false,
    space: false
};

function createAliens() {
    aliens = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            aliens.push({
                x: col * 50 + 30,
                y: row * 40 + 50,
                width: 30,
                height: 30,
                alive: true
            });
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 15, player.y - 10, 10, 10);
}

function drawAliens() {
    ctx.fillStyle = '#ff6b6b';
    aliens.forEach(alien => {
        if (alien.alive) {
            ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            ctx.fillStyle = '#fff';
            ctx.fillRect(alien.x + 5, alien.y + 5, 5, 5);
            ctx.fillRect(alien.x + 20, alien.y + 5, 5, 5);
            ctx.fillStyle = '#ff6b6b';
        }
    });
}

function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 3, 10);
    });
    
    ctx.fillStyle = '#ff00ff';
    alienBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 3, 10);
    });
}

function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= 5;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
    
    alienBullets.forEach((bullet, index) => {
        bullet.y += 3;
        if (bullet.y > canvas.height) {
            alienBullets.splice(index, 1);
        }
    });
}

function updateAliens() {
    let hitEdge = false;
    
    aliens.forEach(alien => {
        if (alien.alive) {
            alien.x += alienDirection * alienSpeed;
            if (alien.x <= 0 || alien.x >= canvas.width - alien.width) {
                hitEdge = true;
            }
        }
    });
    
    if (hitEdge) {
        alienDirection *= -1;
        aliens.forEach(alien => {
            if (alien.alive) {
                alien.y += 20;
            }
        });
    }
    
    if (Math.random() < 0.01) {
        const aliveAliens = aliens.filter(a => a.alive);
        if (aliveAliens.length > 0) {
            const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            alienBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height
            });
        }
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
            if (alien.alive &&
                bullet.x > alien.x &&
                bullet.x < alien.x + alien.width &&
                bullet.y > alien.y &&
                bullet.y < alien.y + alien.height) {
                alien.alive = false;
                bullets.splice(bulletIndex, 1);
                score += 10;
                scoreElement.textContent = score;
                
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('spaceInvadersHighScore', highScore);
                }
            }
        });
    });
    
    alienBullets.forEach((bullet, index) => {
        if (bullet.x > player.x &&
            bullet.x < player.x + player.width &&
            bullet.y > player.y &&
            bullet.y < player.y + player.height) {
            alienBullets.splice(index, 1);
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                gameOver();
            }
        }
    });
    
    if (aliens.some(alien => alien.alive && alien.y + alien.height >= player.y)) {
        gameOver();
    }
    
    if (aliens.every(alien => !alien.alive)) {
        nextLevel();
    }
}

function nextLevel() {
    alienSpeed += 0.5;
    createAliens();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    drawAliens();
    drawBullets();
}

function update() {
    if (!isGameRunning) return;
    
    updatePlayer();
    updateBullets();
    updateAliens();
    checkCollisions();
    draw();
}

function startGame() {
    if (isGameRunning) return;
    
    score = 0;
    lives = 3;
    alienSpeed = 1;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    player.x = canvas.width / 2 - 20;
    bullets = [];
    alienBullets = [];
    createAliens();
    
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
    score = 0;
    lives = 3;
    alienSpeed = 1;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    player.x = canvas.width / 2 - 20;
    bullets = [];
    alienBullets = [];
    createAliens();
    
    startBtn.disabled = false;
    draw();
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            keys.left = true;
            break;
        case 'ArrowRight':
            e.preventDefault();
            keys.right = true;
            break;
        case ' ':
            e.preventDefault();
            if (isGameRunning && !keys.space) {
                keys.space = true;
                bullets.push({
                    x: player.x + player.width / 2,
                    y: player.y
                });
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case ' ':
            keys.space = false;
            break;
    }
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

createAliens();
draw();
