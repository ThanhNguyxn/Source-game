const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
let ducks=[],score=0,bullets=3,round=1,difficulty="easy",speed=2,gameActive=false;
function startGame(d){difficulty=d;speed=d==="easy"?2:d==="medium"?4:6;document.getElementById("modeSelector").style.display="none";document.getElementById("gameArea").style.display="block";init();animate()}
function init(){ducks=[{x:100,y:300,vx:speed,vy:(Math.random()-0.5)*2,size:30,hit:false}];bullets=3;gameActive=true;updateUI()}
function animate(){if(gameActive){update();draw();requestAnimationFrame(animate)}}
function update(){ducks.forEach((d,i)=>{if(!d.hit){d.x+=d.vx;d.y+=d.vy;if(d.x<0||d.x>canvas.width-d.size)d.vx*=-1;if(d.y<0||d.y>canvas.height-d.size)d.vy*=-1;if(d.x>canvas.width){ducks.splice(i,1);if(ducks.length===0)nextRound()}}});if(bullets<=0&&ducks.length>0){gameActive=false;alert("Out of bullets! Score: "+score)}}
function draw(){ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#228B22";ctx.fillRect(0,canvas.height-100,canvas.width,100);ducks.forEach(d=>{if(!d.hit){ctx.fillStyle="#8B4513";ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill()}})}
function nextRound(){round++;ducks=[];for(let i=0;i<round;i++)ducks.push({x:Math.random()*700,y:Math.random()*400+50,vx:speed,vy:(Math.random()-0.5)*2,size:30,hit:false});bullets=3;updateUI()}
function updateUI(){document.getElementById("score").textContent=score;document.getElementById("bullets").textContent=bullets;document.getElementById("round").textContent=round}
canvas.addEventListener("click",e=>{if(!gameActive||bullets<=0)return;bullets--;updateUI();const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left;const y=e.clientY-rect.top;ducks.forEach((d,i)=>{if(!d.hit&&Math.hypot(x-d.x,y-d.y)<d.size){d.hit=true;score+=10;updateUI();setTimeout(()=>ducks.splice(i,1),100);if(ducks.length===0)nextRound()}})});
document.getElementById("reloadBtn").addEventListener("click",()=>{bullets=3;updateUI()});
document.getElementById("restartBtn").addEventListener("click",()=>{round=1;score=0;init()});