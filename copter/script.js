const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
let copter={x:100,y:200,vy:0,size:20},obstacles=[],score=0,best=localStorage.getItem("copterBest")||0,gameOver=false,difficulty="easy",speed=3,gapSize=150,isPaused=false;
document.getElementById("best").textContent=best;
function startGame(d){
    difficulty=d;
    speed=d==="easy"?3:d==="medium"?5:7;
    gapSize=d==="easy"?180:d==="medium"?140:110;
    document.getElementById("modeSelector").style.display="none";
    document.getElementById("gameArea").style.display="block";
    init();gameLoop();
}
function init(){copter={x:100,y:200,vy:0,size:20};obstacles=[];score=0;gameOver=false;isPaused=false;updateScore();}
function gameLoop(){if(!gameOver&&!isPaused){update();draw();requestAnimationFrame(gameLoop)}}
function update(){
    if(isUp)copter.vy-=0.6;else copter.vy+=0.4;
    copter.y+=copter.vy;
    if(copter.y<0||copter.y>canvas.height-copter.size){endGame();return}
    if(obstacles.length===0||obstacles[obstacles.length-1].x<canvas.width-250){
        let h=Math.random()*(canvas.height-gapSize-100)+50;
        obstacles.push({x:canvas.width,top:h,bottom:h+gapSize,scored:false});
    }
    obstacles.forEach((o,i)=>{
        o.x-=speed;
        if(o.x+20<copter.x&&!o.scored){score++;o.scored=true;updateScore()}
        if(o.x+20<0)obstacles.splice(i,1);
        if(copter.x+copter.size>o.x&&copter.x<o.x+20&&(copter.y<o.top||copter.y+copter.size>o.bottom)){endGame();return}
    });
}
function draw(){
    ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);
    obstacles.forEach(o=>{ctx.fillStyle="#2ecc71";ctx.fillRect(o.x,0,20,o.top);ctx.fillRect(o.x,o.bottom,20,canvas.height-o.bottom)});
    ctx.fillStyle="#e74c3c";ctx.fillRect(copter.x,copter.y,copter.size,copter.size);
}
function updateScore(){document.getElementById("score").textContent=score}
function endGame(){
    gameOver=true;
    if(score>best){best=score;localStorage.setItem("copterBest",best);document.getElementById("best").textContent=best}
    setTimeout(()=>alert("Game Over! Score: "+score),100);
}
let isUp=false;
document.addEventListener("mousedown",()=>isUp=true);
document.addEventListener("mouseup",()=>isUp=false);
document.addEventListener("keydown",e=>{if(e.key===" "){e.preventDefault();isUp=true}});
document.addEventListener("keyup",e=>{if(e.key===" ")isUp=false});
document.getElementById("restartBtn").addEventListener("click",()=>{if(gameOver){init();gameLoop()}});
document.getElementById("changeModeBtn").addEventListener("click",()=>{gameOver=true;document.getElementById("gameArea").style.display="none";document.getElementById("modeSelector").style.display="block"});