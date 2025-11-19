const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
let copter={x:100,y:200,vy:0,size:20},obstacles=[],score=0,best=localStorage.getItem("copterBest")||0,gameOver=false,difficulty="easy",speed=3;
document.getElementById("best").textContent=best;
function startGame(d){difficulty=d;speed=d==="easy"?2:d==="medium"?3:4;document.getElementById("modeSelector").style.display="none";document.getElementById("gameArea").style.display="block";init();gameLoop()}
function init(){copter={x:100,y:200,vy:0,size:20};obstacles=[];score=0;gameOver=false;updateScore()}
function gameLoop(){if(!gameOver){update();draw();requestAnimationFrame(gameLoop)}}
function update(){if(isUp)copter.vy-=0.5;else copter.vy+=0.3;copter.y+=copter.vy;if(copter.y<0||copter.y>canvas.height-copter.size){gameOver=true;if(score>best){best=score;localStorage.setItem("copterBest",best);document.getElementById("best").textContent=best}alert("Game Over! Score: "+score);return}
if(obstacles.length===0||obstacles[obstacles.length-1].x<canvas.width-300){let gap=difficulty==="easy"?150:difficulty==="medium"?120:100;let h=Math.random()*(canvas.height-gap-100)+50;obstacles.push({x:canvas.width,top:h,bottom:h+gap})}
obstacles.forEach((o,i)=>{o.x-=speed;if(o.x+20<copter.x&&!o.scored){score++;o.scored=true;updateScore()}
if(o.x+20<0)obstacles.splice(i,1);
if(copter.x+copter.size>o.x&&copter.x<o.x+20&&(copter.y<o.top||copter.y+copter.size>o.bottom)){gameOver=true;if(score>best){best=score;localStorage.setItem("copterBest",best);document.getElementById("best").textContent=best}alert("Game Over! Score: "+score)}})}
function draw(){ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);obstacles.forEach(o=>{ctx.fillStyle="#8B4513";ctx.fillRect(o.x,0,20,o.top);ctx.fillRect(o.x,o.bottom,20,canvas.height-o.bottom)});ctx.fillStyle="#FF6347";ctx.fillRect(copter.x,copter.y,copter.size,copter.size)}
function updateScore(){document.getElementById("score").textContent=score}
let isUp=false;
document.addEventListener("mousedown",()=>isUp=true);
document.addEventListener("mouseup",()=>isUp=false);
document.addEventListener("keydown",e=>{if(e.key===" "){e.preventDefault();isUp=true}});
document.addEventListener("keyup",e=>{if(e.key===" ")isUp=false});
document.getElementById("restartBtn").addEventListener("click",()=>{init();if(gameOver){gameOver=false;gameLoop()}});