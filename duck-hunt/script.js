const canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d");
let ducks=[],score=0,bullets=3,round=1,difficulty="easy",speed=2,duckCount=2,gameActive=true;
function startGame(d){
    difficulty=d;
    speed=d==="easy"?2:d==="medium"?4:6;
    duckCount=d==="easy"?2:d==="medium"?3:4;
    document.getElementById("modeSelector").style.display="none";
    document.getElementById("gameArea").style.display="block";
    init();animate();
}
function init(){
    ducks=[];score=0;bullets=3;round=1;gameActive=true;
    for(let i=0;i<duckCount;i++){
        ducks.push({x:Math.random()*700,y:Math.random()*400+50,vx:speed*(Math.random()>0.5?1:-1),vy:(Math.random()-0.5)*2,size:30,hit:false});
    }
    updateUI();
}
function animate(){if(gameActive){update();draw();requestAnimationFrame(animate)}}
function update(){
    ducks.forEach((d,i)=>{
        if(!d.hit){
            d.x+=d.vx;d.y+=d.vy;
            if(d.x<0||d.x>canvas.width-d.size)d.vx*=-1;
            if(d.y<0||d.y>canvas.height-d.size)d.vy*=-1;
        }
    });
    if(bullets<=0&&ducks.some(d=>!d.hit)){gameActive=false;alert("Out of bullets! Score: "+score);document.getElementById("gameArea").style.display="none";document.getElementById("modeSelector").style.display="block"}
}
function draw(){
    ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#228B22";ctx.fillRect(0,canvas.height-100,canvas.width,100);
    ducks.forEach(d=>{if(!d.hit){ctx.fillStyle="#8B4513";ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill()}});
}
function nextRound(){
    round++;ducks=[];bullets=3;
    for(let i=0;i<duckCount+round;i++){
        ducks.push({x:Math.random()*700,y:Math.random()*400+50,vx:speed*(Math.random()>0.5?1:-1),vy:(Math.random()-0.5)*2,size:30,hit:false});
    }
    updateUI();
}
function updateUI(){document.getElementById("score").textContent=score;document.getElementById("bullets").textContent=bullets;document.getElementById("round").textContent=round}
canvas.addEventListener("click",e=>{
    if(!gameActive||bullets<=0)return;
    bullets--;updateUI();
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left,y=e.clientY-rect.top;
    ducks.forEach((d,i)=>{
        if(!d.hit&&Math.hypot(x-d.x,y-d.y)<d.size){
            d.hit=true;score+=10;updateUI();
            setTimeout(()=>ducks.splice(i,1),100);
            if(ducks.filter(duck=>!duck.hit).length===0)nextRound();
        }
    });
});
document.getElementById("reloadBtn").addEventListener("click",()=>{bullets=3;updateUI()});
document.getElementById("restartBtn").addEventListener("click",()=>{init();if(!gameActive){gameActive=true;animate()}});
document.getElementById("changeModeBtn").addEventListener("click",()=>{gameActive=false;document.getElementById("gameArea").style.display="none";document.getElementById("modeSelector").style.display="block"});