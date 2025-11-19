const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 8,
    dy: 0
};

let computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
let gameLoop;
let isGameRunning = false;
const winningScore = 5;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 2, i, 4, 10, '#444');
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, '#4CAF50');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff6b6b');
    drawBall(ball.x, ball.y, ball.size, '#fff');
}

function update() {
    if (!isGameRunning) return;
    
    // Player movement
    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    
    // Computer AI
    if (ball.y < computer.y + computer.height / 2) {
        computer.y -= computer.speed;
    } else if (ball.y > computer.y + computer.height / 2) {
        computer.y += computer.speed;
    }
    
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) computer.y = canvas.height - computer.height;
    
    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top and bottom
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
    }
    
    // Ball collision with paddles
    let paddle = (ball.x < canvas.width / 2) ? player : computer;
    
    if (ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height) {
        
        let collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint = collidePoint / (paddle.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        
        ball.speed += 0.2;
    }
    
    // Score points
    if (ball.x - ball.size < 0) {
        computerScore++;
        computerScoreElement.textContent = computerScore;
        resetBall();
        checkWin();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        playerScoreElement.textContent = playerScore;
        resetBall();
        checkWin();
    }
    
    draw();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speed = 5;
}

function checkWin() {
    if (playerScore === winningScore || computerScore === winningScore) {
        endGame();
    }
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    
    if (playerScore === winningScore) {
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 30);
    } else {
        ctx.fillText('Computer Wins!', canvas.width / 2, canvas.height / 2 - 30);
    }
    
    ctx.font = '24px Arial';
    ctx.fillText(`${playerScore} - ${computerScore}`, canvas.width / 2, canvas.height / 2 + 20);
    
    startBtn.disabled = false;
}

function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    startBtn.disabled = true;
    
    gameLoop = setInterval(update, 1000 / 60);
}

function resetGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    playerScore = 0;
    computerScore = 0;
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
    
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    
    startBtn.disabled = false;
    draw();
}

document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            player.dy = -player.speed;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            player.dy = player.speed;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'ArrowDown':
        case 's':
        case 'S':
            player.dy = 0;
            break;
    }
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

draw();
