const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
let fruits=[],score=0,lives=3,time=60,mode="classic",gameActive=false,interval;
const fruitColors=["#ff6b6b","#feca57","#48dbfb","#ff9ff3","#54a0ff"];
function startGame(m){mode=m;time=m==="classic"?60:m==="zen"?90:45;lives=m==="zen"?999:3;document.getElementById("modeSelector").style.display="none";document.getElementById("gameArea").style.display="block";init();animate();interval=setInterval(()=>{if(gameActive){time--;updateUI();if(time<=0){gameActive=false;alert("Time up! Score: "+score)}}},1000)}
function init(){fruits=[];score=0;gameActive=true;updateUI();spawnFruit()}
function spawnFruit(){if(!gameActive)return;const isBomb=mode!=="zen"&&Math.random()<0.2;fruits.push({x:Math.random()*700+50,y:canvas.height,vx:(Math.random()-0.5)*4,vy:-15-Math.random()*5,size:30,isBomb,sliced:false});setTimeout(spawnFruit,mode==="arcade"?500:1000)}
function animate(){if(gameActive){update();draw();requestAnimationFrame(animate)}}
function update(){fruits.forEach((f,i)=>{f.vy+=0.5;f.x+=f.vx;f.y+=f.vy;if(f.y>canvas.height+f.size)fruits.splice(i,1)})}
function draw(){ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);fruits.forEach(f=>{if(!f.sliced){ctx.fillStyle=f.isBomb?"#2c3e50":fruitColors[Math.floor(Math.random()*fruitColors.length)];ctx.beginPath();ctx.arc(f.x,f.y,f.size,0,Math.PI*2);ctx.fill()}})}
function updateUI(){document.getElementById("score").textContent=score;document.getElementById("time").textContent=time;document.getElementById("lives").textContent=lives}
let isSlicing=false,slicePath=[];
canvas.addEventListener("mousedown",e=>{isSlicing=true;slicePath=[]});
canvas.addEventListener("mousemove",e=>{if(!isSlicing)return;const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;slicePath.push({x,y});fruits.forEach((f,i)=>{if(!f.sliced&&Math.hypot(x-f.x,y-f.y)<f.size){f.sliced=true;if(f.isBomb){lives--;updateUI();if(lives<=0){gameActive=false;alert("Game Over! Score: "+score)}}else{score+=10;updateUI()}setTimeout(()=>fruits.splice(i,1),100)}})});
canvas.addEventListener("mouseup",()=>{isSlicing=false;slicePath=[]});
document.getElementById("pauseBtn").addEventListener("click",()=>{gameActive=!gameActive;if(gameActive)animate()});
document.getElementById("restartBtn").addEventListener("click",()=>{clearInterval(interval);init();interval=setInterval(()=>{if(gameActive){time--;updateUI();if(time<=0){gameActive=false;alert("Time up! Score: "+score)}}},1000)});