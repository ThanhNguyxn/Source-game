const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

const BALL_RADIUS = 15;
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
const SHOOTER_X = canvas.width / 2;
const SHOOTER_Y = canvas.height - 50;

let gameRunning = false;
let score = 0;
let level = 1;
let ballChain = [];
let shotBalls = [];
let shooter = {
    x: SHOOTER_X,
    y: SHOOTER_Y,
    angle: -Math.PI / 2,
    currentBall: null,
    nextBall: null
};
let chainSpeed = 0.5;
let gameLoop = null;

// Path for balls to follow (spiral from outside to center)
function getPathPoint(progress) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const spirals = 2.5;
    const angle = progress * spirals * Math.PI * 2;
    const maxRadius = 220;
    const radius = maxRadius * (1 - progress);

    return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
    };
}

// Initialize level
function initLevel() {
    ballChain = [];
    shotBalls = [];
    chainSpeed = 0.3 + (level - 1) * 0.05; // Increase speed each level

    // Create initial chain of balls
    const ballCount = 15 + level * 3;
    for (let i = 0; i < ballCount; i++) {
        ballChain.push({
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            progress: i * -0.035 // Negative = not on path yet
        });
    }

    // Initialize shooter balls
    shooter.currentBall = COLORS[Math.floor(Math.random() * COLORS.length)];
    shooter.nextBall = COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Draw everything
function draw() {
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw path guide (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 30;
    ctx.beginPath();
    for (let i = 0; i <= 1; i += 0.01) {
        const point = getPathPoint(i);
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Draw end hole (center)
    const endPoint = getPathPoint(1);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball chain
    for (let i = 0; i < ballChain.length; i++) {
        const ball = ballChain[i];
        if (ball.progress >= 0 && ball.progress <= 1) {
            const pos = getPathPoint(ball.progress);

            // Draw ball
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            // Shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(pos.x - 5, pos.y - 5, BALL_RADIUS / 3, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Draw shot balls
    shotBalls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(ball.x - 5, ball.y - 5, BALL_RADIUS / 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw shooter base
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Draw aiming line
    ctx.save();
    ctx.translate(shooter.x, shooter.y);
    ctx.rotate(shooter.angle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -50);
    ctx.stroke();
    ctx.restore();

    // Draw current ball in shooter
    if (shooter.currentBall) {
        ctx.fillStyle = shooter.currentBall;
        ctx.beginPath();
        ctx.arc(shooter.x, shooter.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(shooter.x - 5, shooter.y - 5, BALL_RADIUS / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw next ball
    if (shooter.nextBall) {
        ctx.fillStyle = shooter.nextBall;
        ctx.beginPath();
        ctx.arc(shooter.x + 55, shooter.y, BALL_RADIUS - 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '14px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('NEXT', shooter.x + 55, shooter.y + 35);
    }
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Move chain forward
    for (let i = 0; i < ballChain.length; i++) {
        ballChain[i].progress += chainSpeed / 1000;
    }

    // Check if any ball reached the end
    const lastBall = ballChain[ballChain.length - 1];
    if (lastBall && lastBall.progress >= 1.0) {
        endGame();
        return;
    }

    // Update shot balls
    for (let i = shotBalls.length - 1; i >= 0; i--) {
        const ball = shotBalls[i];
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Check collision with chain
        let collided = false;
        for (let j = 0; j < ballChain.length; j++) {
            const chainBall = ballChain[j];
            if (chainBall.progress < 0 || chainBall.progress > 1) continue;

            const pos = getPathPoint(chainBall.progress);
            const dist = Math.sqrt((ball.x - pos.x) ** 2 + (ball.y - pos.y) ** 2);

            if (dist < BALL_RADIUS * 1.8) {
                // Insert ball into chain
                ballChain.splice(j, 0, {
                    color: ball.color,
                    progress: chainBall.progress - 0.001
                });
                shotBalls.splice(i, 1);
                checkMatches(j);
                collided = true;
                break;
            }
        }

        // Remove if out of bounds
        if (!collided && (ball.x < -50 || ball.x > canvas.width + 50 ||
                          ball.y < -50 || ball.y > canvas.height + 50)) {
            shotBalls.splice(i, 1);
        }
    }

    // Check win condition
    if (ballChain.length === 0 && shotBalls.length === 0) {
        levelComplete();
    }

    draw();
}

// Check for 3+ matching colors
function checkMatches(index) {
    if (index < 0 || index >= ballChain.length) return;

    const color = ballChain[index].color;
    let start = index;
    let end = index;

    // Find start of match (scan backwards)
    while (start > 0 && ballChain[start - 1].color === color) {
        start--;
    }

    // Find end of match (scan forwards)
    while (end < ballChain.length - 1 && ballChain[end + 1].color === color) {
        end++;
    }

    // If 3 or more, remove them
    const matchLength = end - start + 1;
    if (matchLength >= 3) {
        ballChain.splice(start, matchLength);
        score += matchLength * 10;
        document.getElementById('score').textContent = score;

        // Close the gap by adjusting progress
        if (start < ballChain.length && start > 0) {
            const gap = ballChain[start].progress - ballChain[start - 1].progress;
            if (gap > 0.04) {
                const adjustment = gap - 0.035;
                for (let i = start; i < ballChain.length; i++) {
                    ballChain[i].progress -= adjustment;
                }
            }
        }
    }
}

// Shoot a ball
function shoot() {
    if (!gameRunning || !shooter.currentBall) return;

    const speed = 7;
    const vx = Math.cos(shooter.angle) * speed;
    const vy = Math.sin(shooter.angle) * speed;

    shotBalls.push({
        x: shooter.x,
        y: shooter.y,
        vx: vx,
        vy: vy,
        color: shooter.currentBall
    });

    // Move next ball to current
    shooter.currentBall = shooter.nextBall;
    shooter.nextBall = COLORS[Math.floor(Math.random() * COLORS.length)];

    draw();
}

// Mouse move - aim shooter
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
    draw();
});

// Mouse click - shoot
canvas.addEventListener('click', () => {
    if (gameRunning) shoot();
});

// Level complete
function levelComplete() {
    gameRunning = false;
    level++;
    score += 100;

    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = score;

    setTimeout(() => {
        gameRunning = true;
        initLevel();
        draw();
    }, 1500);
}

// Start game
function startGame() {
    // Clear any existing game loop
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }

    gameRunning = true;
    score = 0;
    level = 1;

    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    canvas.style.display = 'block';

    initLevel();
    draw();

    // Start game loop
    gameLoop = setInterval(update, 1000 / 60);
}

// End game
function endGame() {
    gameRunning = false;

    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Prevent scrolling
document.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

