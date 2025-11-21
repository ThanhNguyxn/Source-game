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
let chainProgress = 0;
let chainSpeed = 0.5;
let mouseX = 0;
let mouseY = 0;

// Path for balls to follow (spiral)
function getPathPoint(progress) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const spirals = 3;
    const angle = progress * spirals * Math.PI * 2;
    const radius = 200 - (progress * 150);

    return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
    };
}

// Initialize level
function initLevel() {
    ballChain = [];
    shotBalls = [];
    chainProgress = 0;
    chainSpeed = 0.5 + level * 0.1;

    // Create initial chain
    const ballCount = 20 + level * 5;
    for (let i = 0; i < ballCount; i++) {
        ballChain.push({
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            progress: -i * 0.04
        });
    }

    shooter.currentBall = COLORS[Math.floor(Math.random() * COLORS.length)];
    shooter.nextBall = COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Draw function
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw path guide
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 1; i += 0.01) {
        const point = getPathPoint(i);
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Draw end hole
    const endPoint = getPathPoint(1);
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball chain
    ballChain.forEach(ball => {
        if (ball.progress >= 0 && ball.progress <= 1) {
            const pos = getPathPoint(ball.progress);
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Draw shot balls
    shotBalls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw shooter
    ctx.save();
    ctx.translate(shooter.x, shooter.y);
    ctx.rotate(shooter.angle);

    // Shooter base
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Aim line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -40);
    ctx.stroke();

    ctx.restore();

    // Current ball
    ctx.fillStyle = shooter.currentBall;
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Next ball
    ctx.fillStyle = shooter.nextBall;
    ctx.beginPath();
    ctx.arc(shooter.x + 50, shooter.y, BALL_RADIUS - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Next', shooter.x + 50, shooter.y + 35);
}

// Update function
function update() {
    if (!gameRunning) return;

    // Move chain forward
    chainProgress += chainSpeed / 1000;
    ballChain.forEach(ball => {
        ball.progress += chainSpeed / 1000;
    });

    // Check if chain reached end
    if (ballChain.length > 0 && ballChain[ballChain.length - 1].progress >= 1) {
        endGame();
        return;
    }

    // Update shot balls
    shotBalls.forEach((ball, index) => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Check collision with chain
        for (let i = 0; i < ballChain.length; i++) {
            const chainBall = ballChain[i];
            const pos = getPathPoint(chainBall.progress);
            const dist = Math.sqrt((ball.x - pos.x) ** 2 + (ball.y - pos.y) ** 2);

            if (dist < BALL_RADIUS * 2) {
                // Insert ball into chain
                ballChain.splice(i, 0, { color: ball.color, progress: chainBall.progress });
                shotBalls.splice(index, 1);

                // Check for matches
                checkMatches(i);
                return;
            }
        }

        // Remove if out of bounds
        if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) {
            shotBalls.splice(index, 1);
        }
    });

    // Check win condition
    if (ballChain.length === 0 && shotBalls.length === 0) {
        levelComplete();
    }

    draw();
}

// Check for matches
function checkMatches(index) {
    const color = ballChain[index].color;
    let start = index;
    let end = index;

    // Find start of match
    while (start > 0 && ballChain[start - 1].color === color) {
        start--;
    }

    // Find end of match
    while (end < ballChain.length - 1 && ballChain[end + 1].color === color) {
        end++;
    }

    // If 3 or more matches, remove them
    if (end - start + 1 >= 3) {
        const removed = end - start + 1;
        ballChain.splice(start, removed);
        score += removed * 10;
        document.getElementById('score').textContent = score;

        // Close gap in chain
        if (start < ballChain.length) {
            const gap = ballChain[start].progress - (start > 0 ? ballChain[start - 1].progress : 0);
            if (gap > 0.08) {
                for (let i = start; i < ballChain.length; i++) {
                    ballChain[i].progress -= gap;
                }
            }
        }
    }
}

// Shoot ball
function shoot() {
    if (!gameRunning || !shooter.currentBall) return;

    const speed = 8;
    const vx = Math.cos(shooter.angle) * speed;
    const vy = Math.sin(shooter.angle) * speed;

    shotBalls.push({
        x: shooter.x,
        y: shooter.y,
        vx: vx,
        vy: vy,
        color: shooter.currentBall
    });

    shooter.currentBall = shooter.nextBall;
    shooter.nextBall = COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Mouse move handler
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
    draw();
});

// Mouse click handler
canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    shoot();
});

// Level complete
function levelComplete() {
    level++;
    document.getElementById('level').textContent = level;
    score += level * 100;
    document.getElementById('score').textContent = score;

    setTimeout(() => {
        initLevel();
    }, 1000);
}

// Start game
function startGame() {
    gameRunning = true;
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    canvas.style.display = 'block'; // Show canvas

    initLevel();
    draw();

    setInterval(update, 1000 / 60);
}

// End game
function endGame() {
    gameRunning = false;
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


