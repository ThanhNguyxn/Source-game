const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
let fruits=[],score=0,lives=3,time=60,mode="classic",gameActive=false,interval,spawnInterval;
const fruitColors=["#ff6b6b","#feca57","#48dbfb","#ff9ff3","#54a0ff"];
function startGame(m){
    mode=m;
    time=m==="classic"?60:m==="zen"?90:45;
    lives=m==="zen"?999:3;
    const spawnSpeed=m==="arcade"?400:m==="classic"?800:1000;
    document.getElementById("modeSelector").style.display="none";
    document.getElementById("gameArea").style.display="block";
    init();animate();
    interval=setInterval(()=>{if(gameActive){time--;updateUI();if(time<=0){gameActive=false;endGame()}}},1000);
    spawnInterval=setInterval(()=>{if(gameActive)spawnFruit()},spawnSpeed);
}
function init(){fruits=[];score=0;gameActive=true;updateUI()}
function spawnFruit(){if(!gameActive)return;const isBomb=mode!=="zen"&&Math.random()<0.15;fruits.push({x:Math.random()*700+50,y:canvas.height,vx:(Math.random()-0.5)*6,vy:-18-Math.random()*4,size:30,isBomb,sliced:false,color:fruitColors[Math.floor(Math.random()*fruitColors.length)]})}
function animate(){if(gameActive){update();draw();requestAnimationFrame(animate)}}
function update(){fruits.forEach((f,i)=>{f.vy+=0.6;f.x+=f.vx;f.y+=f.vy;if(f.y>canvas.height+f.size)fruits.splice(i,1)})}
function draw(){ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);fruits.forEach(f=>{if(!f.sliced){ctx.fillStyle=f.isBomb?"#2c3e50":f.color;ctx.beginPath();ctx.arc(f.x,f.y,f.size,0,Math.PI*2);ctx.fill()}})}
function updateUI(){document.getElementById("score").textContent=score;document.getElementById("time").textContent=time;document.getElementById("lives").textContent=lives}
function endGame(){clearInterval(interval);clearInterval(spawnInterval);alert(`Time up! Final Score: ${score}`)}
let isSlicing=false;
canvas.addEventListener("mousedown",()=>isSlicing=true);
canvas.addEventListener("mousemove",e=>{if(!isSlicing||!gameActive)return;const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;fruits.forEach((f,i)=>{if(!f.sliced&&Math.hypot(x-f.x,y-f.y)<f.size){f.sliced=true;if(f.isBomb){lives--;updateUI();if(lives<=0){gameActive=false;clearInterval(interval);clearInterval(spawnInterval);alert(`Game Over! Score: ${score}`)}}else{score+=10;updateUI()}setTimeout(()=>fruits.splice(i,1),50)}})});
canvas.addEventListener("mouseup",()=>isSlicing=false);
document.getElementById("pauseBtn").addEventListener("click",()=>{gameActive=!gameActive;if(gameActive)animate()});
document.getElementById("restartBtn").addEventListener("click",()=>{clearInterval(interval);clearInterval(spawnInterval);startGame(mode)});
document.getElementById("changeModeBtn").addEventListener("click",()=>{gameActive=false;clearInterval(interval);clearInterval(spawnInterval);document.getElementById("gameArea").style.display="none";document.getElementById("modeSelector").style.display="block"});