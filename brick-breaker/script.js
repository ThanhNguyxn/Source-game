const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const bricksEl = document.getElementById('bricks');

let score=0,lives=3,level=1,difficulty='easy',isPaused=false,gameLoop=null;
const paddle={x:canvas.width/2-50,y:canvas.height-30,width:100,height:10,speed:7};
let balls=[],bricks=[];
const brickRowCount=5,brickColumnCount=10,brickWidth=75,brickHeight=20,brickPadding=5,brickOffsetTop=60,brickOffsetLeft=35;
const difficultySettings={easy:{ballSpeed:4,lives:3,multiBall:false},medium:{ballSpeed:6,lives:3,multiBall:false},hard:{ballSpeed:8,lives:2,multiBall:false},extreme:{ballSpeed:6,lives:3,multiBall:true}};

function startGame(diff){difficulty=diff;modeSelector.style.display='none';gameArea.style.display='block';initGame();gameLoop=requestAnimationFrame(update);}

function initGame(){const settings=difficultySettings[difficulty];score=0;lives=settings.lives;level=1;paddle.x=canvas.width/2-paddle.width/2;balls=[{x:canvas.width/2,y:canvas.height-50,dx:settings.ballSpeed,dy:-settings.ballSpeed,radius:8,launched:false}];if(settings.multiBall)balls.push({x:canvas.width/2+20,y:canvas.height-50,dx:-settings.ballSpeed,dy:-settings.ballSpeed,radius:8,launched:false});createBricks();updateDisplay();}

function createBricks(){bricks=[];const colors=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db'];for(let c=0;c<brickColumnCount;c++){bricks[c]=[];for(let r=0;r<brickRowCount;r++)bricks[c][r]={x:c*(brickWidth+brickPadding)+brickOffsetLeft,y:r*(brickHeight+brickPadding)+brickOffsetTop,status:1,color:colors[r]};}}

function update(){if(!isPaused){movePaddle();moveBalls();checkCollisions();checkWin();}draw();gameLoop=requestAnimationFrame(update);}

let keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' '&&balls.some(b=>!b.launched))balls.forEach(b=>b.launched=true);if(e.key==='p'||e.key==='P')togglePause();});
document.addEventListener('keyup',e=>keys[e.key]=false);
document.addEventListener('mousemove',e=>{const rect=canvas.getBoundingClientRect();paddle.x=e.clientX-rect.left-paddle.width/2;if(paddle.x<0)paddle.x=0;if(paddle.x+paddle.width>canvas.width)paddle.x=canvas.width-paddle.width;});

function movePaddle(){if(keys['ArrowLeft']&&paddle.x>0)paddle.x-=paddle.speed;if(keys['ArrowRight']&&paddle.x<canvas.width-paddle.width)paddle.x+=paddle.speed;}

function moveBalls(){balls.forEach(ball=>{if(!ball.launched){ball.x=paddle.x+paddle.width/2;ball.y=paddle.y-ball.radius;return;}ball.x+=ball.dx;ball.y+=ball.dy;if(ball.x+ball.radius>canvas.width||ball.x-ball.radius<0)ball.dx=-ball.dx;if(ball.y-ball.radius<0)ball.dy=-ball.dy;if(ball.y+ball.radius>paddle.y&&ball.x>paddle.x&&ball.x<paddle.x+paddle.width){ball.dy=-Math.abs(ball.dy);const hitPos=(ball.x-paddle.x)/paddle.width;ball.dx=(hitPos-0.5)*10;}if(ball.y+ball.radius>canvas.height)ball.lost=true;});balls=balls.filter(b=>!b.lost);if(balls.length===0){lives--;if(lives<=0)gameOver();else resetBall();}}

function checkCollisions(){balls.forEach(ball=>{for(let c=0;c<brickColumnCount;c++)for(let r=0;r<brickRowCount;r++){const brick=bricks[c][r];if(brick.status===1&&ball.x>brick.x&&ball.x<brick.x+brickWidth&&ball.y>brick.y&&ball.y<brick.y+brickHeight){ball.dy=-ball.dy;brick.status=0;score+=10;updateDisplay();}}});}

function checkWin(){if(bricks.every(col=>col.every(brick=>brick.status===0))){level++;balls.forEach(ball=>{ball.dx*=1.1;ball.dy*=1.1;});createBricks();resetBall();updateDisplay();}}

function resetBall(){const settings=difficultySettings[difficulty];balls=[{x:canvas.width/2,y:canvas.height-50,dx:settings.ballSpeed,dy:-settings.ballSpeed,radius:8,launched:false}];}

function draw(){ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,canvas.width,canvas.height);for(let c=0;c<brickColumnCount;c++)for(let r=0;r<brickRowCount;r++)if(bricks[c][r].status===1){ctx.fillStyle=bricks[c][r].color;ctx.fillRect(bricks[c][r].x,bricks[c][r].y,brickWidth,brickHeight);}ctx.fillStyle='#00ff88';ctx.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);balls.forEach(ball=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);ctx.fill();});}

function updateDisplay(){scoreEl.textContent=score;livesEl.textContent=lives;levelEl.textContent=level;bricksEl.textContent=bricks.flat().filter(b=>b.status===1).length;}

function gameOver(){cancelAnimationFrame(gameLoop);alert(`Game Over!\nScore: ${score}\nLevel: ${level}`);changeLevel();}

function togglePause(){isPaused=!isPaused;document.getElementById('pauseBtn').textContent=isPaused?'Resume':'Pause';}

function resetGame(){cancelAnimationFrame(gameLoop);initGame();gameLoop=requestAnimationFrame(update);}

function changeLevel(){cancelAnimationFrame(gameLoop);gameArea.style.display='none';modeSelector.style.display='block';}

document.getElementById('pauseBtn').addEventListener('click',togglePause);
document.getElementById('resetBtn').addEventListener('click',resetGame);
document.getElementById('changeLevelBtn').addEventListener('click',changeLevel);
