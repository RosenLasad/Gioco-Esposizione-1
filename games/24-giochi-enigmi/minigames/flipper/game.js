/* Rompicapi Meccanici v1 - motore 2D indipendente, dati tavola separati. */
(function(){'use strict';
const $=id=>document.getElementById(id),root=$('pavilionFlipper');if(!root)return;
const canvas=$('flipperCanvas'),ctx=canvas.getContext('2d');
const BOARD_W=440,BOARD_H=840; canvas.width=BOARD_W; canvas.height=BOARD_H;
// Scala uniforme: i cerchi del canvas rimangono cerchi su qualsiasi schermo.
const canvasBox=canvas.parentElement;
function resizePlayfield(){
  const w=canvasBox.clientWidth, h=canvasBox.clientHeight;
  if(w<=0||h<=0)return;
  const scale=Math.min(w/BOARD_W,h/BOARD_H);
  canvas.style.width=(BOARD_W*scale)+'px';
  canvas.style.height=(BOARD_H*scale)+'px';
}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(resizePlayfield).observe(canvasBox);
window.addEventListener('resize',resizePlayfield);

const TABLE={gravity:620,restitution:.87,wall:17,ballRadius:8,bumper:[{x:125,y:205,r:26,score:100},{x:299,y:210,r:26,score:100},{x:211,y:315,r:29,score:150}],posts:[{x:83,y:660,r:12},{x:356,y:660,r:12}],targets:[{x:76,y:335,w:17,h:64,score:50},{x:348,y:335,w:17,h:64,score:50}],leftPivot:{x:112,y:765},rightPivot:{x:328,y:765},flipperLength:108};
let phase='closed',score=0,remaining=3,ball=null,held={left:false,right:false},angles={left:0,right:0},last=0,raf=0,launchReady=false,hitTimes=new Map();
const recordKey='esposizione-flipper-record-v1';
// Salvataggio esclusivo del flipper: nessuna lettura o scrittura dei dati dell'Esposizione.
const saveKey='colombiadi1892.flipper.tavola1.partita.v1';
let lastSaveAt=0;
function readSave(){try{const v=JSON.parse(localStorage.getItem(saveKey)||'null');if(!v||v.version!==1||v.table!==1||!Number.isFinite(v.score)||!Number.isInteger(v.remaining)||v.remaining<1||v.remaining>3||!v.ball||!['ready','active'].includes(v.ballState))return null;for(const k of ['x','y','vx','vy'])if(!Number.isFinite(v.ball[k]))return null;return v;}catch(e){return null}}
function clearSave(){try{localStorage.removeItem(saveKey)}catch(e){}}
function saveGame(force=false){if(!['playing','paused'].includes(phase)||!ball)return;const now=performance.now();if(!force&&now-lastSaveAt<1000)return;lastSaveAt=now;try{localStorage.setItem(saveKey,JSON.stringify({version:1,table:1,score,remaining,ballState:launchReady?'ready':'active',boardHeight:BOARD_H,ball:{x:ball.x,y:ball.y,vx:ball.vx,vy:ball.vy,inLauncher:!!ball.inLauncher},savedAt:Date.now()}))}catch(e){}}
function updateContinueButton(){const btn=$('flipperContinue');if(btn)btn.hidden=!readSave()}
function continueGame(){const saved=readSave();if(!saved)return;score=Math.max(0,Math.floor(saved.score));remaining=saved.remaining;angles={left:0,right:0};held.left=held.right=false;hitTimes.clear();ball={x:saved.ball.x,y:Math.min(saved.boardHeight===BOARD_H?saved.ball.y:(saved.ball.y<=400?saved.ball.y:400+(saved.ball.y-400)*(BOARD_H-400)/360),BOARD_H-5),vx:saved.ball.vx,vy:saved.ball.vy,r:TABLE.ballRadius,trail:[],inLauncher:!!saved.ball.inLauncher};launchReady=saved.ballState==='ready';$('flipperMenu').hidden=true;$('flipperPlay').hidden=false;$('flipperOverlay').hidden=true;resizePlayfield();setHud();setStatus(launchReady?'Premi LANCIA o Spazio per lanciare.':'Partita ripresa: colpisci i bersagli!');phase='playing';last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function ensureContinueButton(){if($('flipperContinue'))return;const startButton=$('flipperStart');const button=document.createElement('button');button.type='button';button.id='flipperContinue';button.textContent='Continua partita';button.hidden=true;startButton.parentNode.insertBefore(button,startButton);button.addEventListener('click',continueGame)}
ensureContinueButton();
function record(){try{return Number(localStorage.getItem(recordKey))||0}catch(e){return 0}}
function saveRecord(){try{if(score>record())localStorage.setItem(recordKey,String(score))}catch(e){}}
function setStatus(t){$('flipperStatus').textContent=t}
function setHud(){$('flipperScore').textContent=score.toLocaleString('it-IT');$('flipperBalls').textContent='Palline: '+remaining}
function open(){root.hidden=false;phase='menu';showMenu();resizePlayfield()}
function showMenu(){saveGame(true);cancelAnimationFrame(raf);raf=0;phase='menu';$('flipperPlay').hidden=true;$('flipperMenu').hidden=false;$('flipperOverlay').hidden=true;$('flipperRecord').textContent='Record: '+record().toLocaleString('it-IT')+' punti';held.left=held.right=false;updateContinueButton()}
function close(){saveGame(true);cancelAnimationFrame(raf);raf=0;phase='closed';root.hidden=true;held.left=held.right=false;$('flipperOverlay').hidden=true}
function newBall(){ball={x:405,y:748,vx:0,vy:0,r:TABLE.ballRadius,trail:[],inLauncher:true};launchReady=true;setStatus('Premi LANCIA o Spazio per lanciare.')}
function start(){if(readSave()&&!confirm('Iniziare una nuova partita di flipper? Il salvataggio della partita precedente verrà sostituito. Il record personale rimarrà.'))return;clearSave();score=0;remaining=3;angles={left:0,right:0};hitTimes.clear();$('flipperMenu').hidden=true;$('flipperPlay').hidden=false;$('flipperOverlay').hidden=true;resizePlayfield();phase='playing';newBall();setHud();last=performance.now();cancelAnimationFrame(raf);saveGame(true);raf=requestAnimationFrame(loop)}
function launch(){if(phase==='playing'&&launchReady){launchReady=false;ball.vx=0;ball.vy=-950;setStatus('Colpisci i bersagli e salva la sfera!');saveGame(true)}}
function overlay(title,text,finished=false){$('flipperOverlayTitle').textContent=title;$('flipperOverlayText').textContent=text;$('flipperResume').hidden=finished;$('flipperOverlay').hidden=false;phase=finished?'over':'paused';held.left=held.right=false;if(finished){saveRecord();clearSave()}else saveGame(true)}
function pause(){if(phase==='playing')overlay('Partita in pausa','Puoi riprendere in qualsiasi momento.');else if(phase==='paused')resume()}
function resume(){if(phase!=='paused')return;phase='playing';$('flipperOverlay').hidden=true;last=performance.now();saveGame(true);if(!raf)raf=requestAnimationFrame(loop)}
function drain(){remaining--;setHud();if(remaining<=0){overlay('Partita terminata','Punteggio: '+score.toLocaleString('it-IT')+' · Record: '+Math.max(score,record()).toLocaleString('it-IT'),true);return}newBall();saveGame(true)}
function addPoints(n){score+=n;setHud()}
function bump(x,y,r,scoreValue,id){const dx=ball.x-x,dy=ball.y-y,d=Math.hypot(dx,dy)||1,min=r+ball.r;if(d>=min)return;const nx=dx/d,ny=dy/d;ball.x=x+nx*(min+.3);ball.y=y+ny*(min+.3);let impact=ball.vx*nx+ball.vy*ny;ball.vx-=(1+TABLE.restitution)*Math.min(impact,0)*nx;ball.vy-=(1+TABLE.restitution)*Math.min(impact,0)*ny;const speed=Math.max(240,Math.hypot(ball.vx,ball.vy));ball.vx+=nx*speed*.32;ball.vy+=ny*speed*.32;const now=performance.now();if(scoreValue&&now-(hitTimes.get(id)||0)>170){addPoints(scoreValue);hitTimes.set(id,now)}}
function segment(ax,ay,bx,by){let vx=bx-ax,vy=by-ay,t=Math.max(0,Math.min(1,((ball.x-ax)*vx+(ball.y-ay)*vy)/(vx*vx+vy*vy||1)));return {x:ax+vx*t,y:ay+vy*t}}
function flipperGeometry(side){const pivot=side==='left'?TABLE.leftPivot:TABLE.rightPivot;const active=angles[side],a=side==='left'?(-.30-active*.63):(Math.PI+.30+active*.63);return {x:pivot.x,y:pivot.y,tipx:pivot.x+TABLE.flipperLength*Math.cos(a),tipy:pivot.y+TABLE.flipperLength*Math.sin(a)}}
function flipperPhysics(side){const f=flipperGeometry(side),point=segment(f.x,f.y,f.tipx,f.tipy),dx=ball.x-point.x,dy=ball.y-point.y,d=Math.hypot(dx,dy)||1,min=ball.r+11;if(d>=min)return;const nx=dx/d,ny=dy/d;ball.x+=nx*(min-d+.5);ball.y+=ny*(min-d+.5);const moving=angles[side]>.2&&held[side];ball.vy=-Math.max(moving?720:350,Math.abs(ball.vy)*.8);ball.vx+=(side==='left'?1:-1)*(moving?200:70);if(ball.y>f.y+15)ball.y=f.y-15}
function update(dt){const smooth=Math.min(1,dt*19);for(const s of ['left','right'])angles[s]+=(Number(held[s])-angles[s])*smooth;
if(!ball||launchReady)return;const steps=4,h=dt/steps;for(let i=0;i<steps;i++){
ball.vy+=TABLE.gravity*h;if(ball.inLauncher && ball.y<150){ball.inLauncher=false;ball.vx=-230}ball.vx*=1-.055*h;ball.x+=ball.vx*h;ball.y+=ball.vy*h;
if(ball.y<32+ball.r){ball.y=32+ball.r;ball.vy=Math.abs(ball.vy)*.85}
if(ball.x<26+ball.r){ball.x=26+ball.r;ball.vx=Math.abs(ball.vx)*.86}
if(ball.x>414-ball.r){ball.x=414-ball.r;ball.vx=-Math.abs(ball.vx)*.86}
// Deflettori superiori: due guide inclinate.
for(const [ax,ay,bx,by] of [[26,145,95,98],[374,145,347,98],[26,680,112,766],[374,680,328,766]]){const p=segment(ax,ay,bx,by),dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy)||1;if(d<ball.r+5){const nx=dx/d,ny=dy/d;ball.x+=nx*(ball.r+5-d);ball.y+=ny*(ball.r+5-d);const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=vn*1.8*nx;ball.vy-=vn*1.8*ny}}}
TABLE.bumper.forEach((b,j)=>bump(b.x,b.y,b.r,b.score,'bumper'+j));TABLE.posts.forEach((b,j)=>bump(b.x,b.y,b.r,0,'post'+j));
TABLE.targets.forEach((t,j)=>{if(ball.x>t.x-ball.r&&ball.x<t.x+t.w+ball.r&&ball.y>t.y-ball.r&&ball.y<t.y+t.h+ball.r){ball.vx=(j===0?Math.abs(ball.vx):-Math.abs(ball.vx))*(.8)+ (j===0?170:-170);addTarget(j)}});
flipperPhysics('left');flipperPhysics('right');
if(ball.y>BOARD_H+10){drain();break}
}
if(ball)ball.trail.push({x:ball.x,y:ball.y});if(ball?.trail.length>9)ball.trail.shift();
}
function addTarget(i){const now=performance.now();if(now-(hitTimes.get('target'+i)||0)>300){addPoints(TABLE.targets[i].score);hitTimes.set('target'+i,now)}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke()}}
function draw(){const c=ctx;c.clearRect(0,0,BOARD_W,BOARD_H);let g=c.createLinearGradient(0,0,BOARD_W,BOARD_H);g.addColorStop(0,'#1b4e5e');g.addColorStop(.55,'#143544');g.addColorStop(1,'#0c1b29');c.fillStyle=g;c.fillRect(0,0,BOARD_W,BOARD_H);c.strokeStyle='#b88b44';c.lineWidth=10;c.strokeRect(15,14,410,812);c.strokeStyle='#d0a953';c.lineWidth=3;c.strokeRect(24,23,392,794);
c.fillStyle='#ddb76c';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('✦ COLOMBIADI 1892 ✦',220,67);c.font='13px Georgia';c.fillText('LE MACCHINE DELLE MERAVIGLIE',220,88);
for(let i=0;i<12;i++){const x=57+(i%6)*65,y=128+Math.floor(i/6)*510;circle(x,y,4,'#a17f4a')}
for(const b of TABLE.bumper){circle(b.x,b.y,b.r+7,'#624d2b','#d2a752');circle(b.x,b.y,b.r,'#b77a31','#fce2a2');circle(b.x,b.y,b.r*.52,'#f6d27c');for(let k=0;k<8;k++){const a=k*Math.PI/4;circle(b.x+Math.cos(a)*b.r*.72,b.y+Math.sin(a)*b.r*.72,3,'#5f3f1d')}}
for(const t of TABLE.targets){c.fillStyle='#b88c39';c.fillRect(t.x,t.y,t.w,t.h);c.fillStyle='#f2d181';c.fillRect(t.x+4,t.y+6,t.w-8,t.h-12)}
for(const p of TABLE.posts){circle(p.x,p.y,p.r,'#bca36f','#f2d793')}
c.strokeStyle='#b49a6c';c.lineWidth=8;c.lineCap='round';for(const [x,y,xx,yy] of [[26,145,95,98],[374,145,347,98],[26,680,112,766],[374,680,328,766]]){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke()}
// Canale di lancio sul lato destro.
c.strokeStyle='#d2a75c';c.lineWidth=4;c.beginPath();c.moveTo(385,810);c.lineTo(385,165);c.stroke();c.fillStyle='#dfbc78';c.font='11px Georgia';c.save();c.translate(402,455);c.rotate(-Math.PI/2);c.fillText('LANCIO',0,0);c.restore();
for(const side of ['left','right']){const f=flipperGeometry(side);c.strokeStyle='#4a251c';c.lineWidth=26;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tipx,f.tipy);c.stroke();c.strokeStyle='#e6a65b';c.lineWidth=18;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tipx,f.tipy);c.stroke();circle(f.x,f.y,11,'#edc985','#573b24')}
c.fillStyle='#bd9658';c.font='12px Georgia';c.fillText('◀ PALETTE ▶',220,800);
if(ball){for(let i=0;i<ball.trail.length;i++){const t=ball.trail[i];circle(t.x,t.y,2+i*.35,'rgba(220,228,211,'+(i/ball.trail.length*.25)+')')}const gr=c.createRadialGradient(ball.x-3,ball.y-4,1,ball.x,ball.y,ball.r);gr.addColorStop(0,'white');gr.addColorStop(.45,'#d6dce0');gr.addColorStop(1,'#596b76');circle(ball.x,ball.y,ball.r,gr,'#e8dbba')}
}
function loop(now){raf=0;if(phase!=='playing')return;const dt=Math.min(.035,Math.max(0,(now-last)/1000));last=now;update(dt);draw();if(phase==='playing'){saveGame();raf=requestAnimationFrame(loop)}}
$('flipperStart').addEventListener('click',start);$('flipperExit').addEventListener('click',close);$('flipperGameExit').addEventListener('click',()=>{pause();showMenu()});$('flipperPause').addEventListener('click',pause);$('flipperResume').addEventListener('click',resume);$('flipperRestart').addEventListener('click',start);$('flipperBackMenu').addEventListener('click',showMenu);$('flipperLaunch').addEventListener('click',launch);
for(const [side,id] of [['left','flipperLeft'],['right','flipperRight']]){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();held[side]=true;try{el.setPointerCapture(e.pointerId)}catch(ex){}});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>{held[side]=false})}
window.addEventListener('keydown',e=>{if(root.hidden||phase==='menu'||e.repeat&&e.code==='Space')return;if(['ArrowLeft','ArrowRight','Space','KeyP','Escape'].includes(e.code))e.preventDefault();if(e.code==='ArrowLeft')held.left=true;if(e.code==='ArrowRight')held.right=true;if(e.code==='Space')launch();if(e.code==='KeyP')pause();if(e.code==='Escape'&&phase==='playing')pause()});window.addEventListener('keyup',e=>{if(e.code==='ArrowLeft')held.left=false;if(e.code==='ArrowRight')held.right=false});window.addEventListener('blur',()=>{held.left=held.right=false;if(phase==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame(true)});window.addEventListener('pagehide',()=>saveGame(true));
window.EsposizioneMinigames.register('flipper',{start:open,close,isOpen:()=>!root.hidden,back(){if(phase==='menu'){close();return true}showMenu();return true}});
})();
