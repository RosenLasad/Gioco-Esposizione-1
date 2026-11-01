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

// Geometria importata dall'Editor Tavola 1, nelle stesse coordinate 440 x 840.
// ID e dati sono mantenuti come nel JSON, compresi gli oggetti duplicati.
const OBJECTS=[{"id":"B1","type":"bumper","label":"Bumper alto sinistra","x":125,"y":205,"r":26,"score":100},{"id":"B2","type":"bumper","label":"Bumper alto destra","x":299,"y":210,"r":26,"score":100},{"id":"B3","type":"bumper","label":"Bumper centrale","x":211.9,"y":335.1,"r":29,"score":150},{"id":"T1","type":"target","label":"Target sinistro","x":76,"y":335,"w":17,"h":64,"score":50},{"id":"T2","type":"target","label":"Target destro","x":348,"y":335,"w":17,"h":64,"score":50},{"id":"P1","type":"post","label":"Piolo sinistro","x":83,"y":660,"r":12},{"id":"P2","type":"post","label":"Piolo destro","x":356,"y":660,"r":12},{"id":"R1","type":"rail","label":"Tavola 1","x":78,"y":129.6,"x2":175.7,"y2":163.4},{"id":"R2","type":"rail","label":"Guida superiore destra","x":385.7,"y":147.9,"x2":347,"y2":98},{"id":"S1","type":"slingshot","label":"Slingshot sinistro","x":26,"y":680,"x2":112,"y2":766},{"id":"S2","type":"slingshot","label":"Slingshot destro","x":383.9,"y":681,"x2":328,"y2":766},{"id":"F1","type":"flipper","label":"Paletta sinistra","x":112,"y":765,"length":88.1,"angle":-0.4275806938920429,"side":"left"},{"id":"F2","type":"flipper","label":"Paletta destra","x":328,"y":765,"length":88.5,"angle":-2.7046226706966303,"side":"right"},{"id":"L1","type":"launcher","label":"Canale di lancio","x":385,"y":165,"x2":385,"y2":810},{"id":"R2_copia","type":"rail","label":"Guida superiore destra copia","x":385.7,"y":814.3,"x2":385.7,"y2":146.1},{"id":"B3_copia","type":"bumper","label":"Bumper centrale copia","x":214.6,"y":497.5,"r":29,"score":150}];
// Manifest immagini. JSON esterno caricato su HTTP; mappa incorporata per file:// offline.
const assetRoot=new URL('./',document.currentScript?.src || location.href);
const assetFallback={"format":"colombiadi-flipper-assets","version":1,"table":1,"theme":"bombardamento-genova-1684","board":{"width":440,"height":840},"assets":{"ball":"assets/common/ball/cannonball.svg","B1":"assets/tavola-01-1684/bumpers/bumper_ship_large_01.svg","B2":"assets/tavola-01-1684/bumpers/bumper_ship_large_02.svg","B3":"assets/tavola-01-1684/bumpers/bumper_ship_large_03.svg","B3_copia":"assets/tavola-01-1684/bumpers/bumper_ship_large_04.svg","T1":"assets/tavola-01-1684/targets/target_ship_small_left.svg","T2":"assets/tavola-01-1684/targets/target_ship_small_right.svg","P1":"assets/tavola-01-1684/posts/post_rock_left.svg","P2":"assets/tavola-01-1684/posts/post_rock_right.svg","R1":"assets/tavola-01-1684/rails/rail_rock_upper_left.svg","R2":"assets/tavola-01-1684/rails/rail_rock_upper_right.svg","R2_copia":"assets/tavola-01-1684/rails/rail_rock_vertical_right.svg","S1":"assets/tavola-01-1684/slingshots/slingshot_wall_left.svg","S2":"assets/tavola-01-1684/slingshots/slingshot_wall_right.svg","F1":"assets/tavola-01-1684/flippers/flipper_left_wood.svg","F2":"assets/tavola-01-1684/flippers/flipper_right_wood.svg","L1":"assets/tavola-01-1684/shooter-lane/shooter_lane_wood_right.svg","background":"assets/tavola-01-1684/background/table_background.svg","inlane_left":"assets/tavola-01-1684/inlanes/inlane_left_wood.svg","inlane_right":"assets/tavola-01-1684/inlanes/inlane_right_wood.svg","outlane_left":"assets/tavola-01-1684/outlanes/outlane_left_wood.svg","outlane_right":"assets/tavola-01-1684/outlanes/outlane_right_wood.svg"},"notes":"Indica i file .svg provvisori: il gioco cerca automaticamente prima il .png omonimo nella stessa cartella, poi ripiega sul .svg. Funziona anche offline con file://. Geometria e collisioni non cambiano."};
const imageAssets=new Map();
// Per ogni SVG provvisorio, cerca prima il PNG omonimo. Se manca, ripiega sull'SVG.
// Funziona anche con file://: il test di disponibilita' avviene tramite Image, non fetch.
function loadImageAsset(id,path){
  if(typeof path!=='string'||!path||path.includes('..')||/^[a-z]+:/i.test(path))return;
  const paths=/\.svg$/i.test(path)?[path.replace(/\.svg$/i,'.png'),path]:[path];
  const entry={img:null,ready:false};
  imageAssets.set(id,entry);
  function tryPath(index){
    if(imageAssets.get(id)!==entry)return; // ignora caricamenti precedenti al nuovo manifest
    if(index>=paths.length){entry.ready=false;return;}
    const img=new Image();
    img.onload=()=>{
      if(imageAssets.get(id)!==entry)return;
      entry.img=img;entry.ready=true;
      if(typeof draw==='function'&&phase!=='playing')draw();
    };
    img.onerror=()=>tryPath(index+1);
    img.src=new URL(paths[index],assetRoot).href;
  }
  tryPath(0);
}
function applyAssetManifest(data){if(!data||data.format!=='colombiadi-flipper-assets'||data.table!==1||!data.assets)return;for(const [id,path] of Object.entries(data.assets))loadImageAsset(id,path);}
applyAssetManifest(assetFallback);
if(location.protocol!=='file:')fetch(new URL('manifest/tavola-01-assets.json',assetRoot)).then(r=>r.ok?r.json():null).then(v=>{if(v)applyAssetManifest(v)}).catch(()=>{});
function imageCentered(id,x,y,w,h,rotation=0){const a=imageAssets.get(id);if(!a?.ready)return false;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(a.img,-w/2,-h/2,w,h);ctx.restore();return true;}
function imageRail(o){const dx=o.x2-o.x,dy=o.y2-o.y,l=Math.hypot(dx,dy);return imageCentered(o.id,(o.x+o.x2)/2,(o.y+o.y2)/2,l+12,20,Math.atan2(dy,dx))}
const byType=type=>OBJECTS.filter(o=>o.type===type);
const TABLE={gravity:620,restitution:.87,wall:17,ballRadius:8,
 bumper:byType('bumper'),posts:byType('post'),targets:byType('target'),
 rails:byType('rail'),slingshots:byType('slingshot'),launcher:byType('launcher')[0],
 flippers:{left:OBJECTS.find(o=>o.type==='flipper'&&o.side==='left'),right:OBJECTS.find(o=>o.type==='flipper'&&o.side==='right')}};

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
function flipperGeometry(side){const f=TABLE.flippers[side];const a=f.angle+(side==='left'?-1:1)*angles[side]*.63;return {x:f.x,y:f.y,tipx:f.x+f.length*Math.cos(a),tipy:f.y+f.length*Math.sin(a)}}
function flipperPhysics(side){const f=flipperGeometry(side),point=segment(f.x,f.y,f.tipx,f.tipy),dx=ball.x-point.x,dy=ball.y-point.y,d=Math.hypot(dx,dy)||1,min=ball.r+11;if(d>=min)return;const nx=dx/d,ny=dy/d;ball.x+=nx*(min-d+.5);ball.y+=ny*(min-d+.5);const moving=angles[side]>.2&&held[side];ball.vy=-Math.max(moving?720:350,Math.abs(ball.vy)*.8);ball.vx+=(side==='left'?1:-1)*(moving?200:70);if(ball.y>f.y+15)ball.y=f.y-15}
function update(dt){const smooth=Math.min(1,dt*19);for(const s of ['left','right'])angles[s]+=(Number(held[s])-angles[s])*smooth;
if(!ball||launchReady)return;const steps=4,h=dt/steps;for(let i=0;i<steps;i++){
ball.vy+=TABLE.gravity*h;if(ball.inLauncher && ball.y<150){ball.inLauncher=false;ball.vx=-230}ball.vx*=1-.055*h;ball.x+=ball.vx*h;ball.y+=ball.vy*h;
if(ball.y<32+ball.r){ball.y=32+ball.r;ball.vy=Math.abs(ball.vy)*.85}
if(ball.x<26+ball.r){ball.x=26+ball.r;ball.vx=Math.abs(ball.vx)*.86}
if(ball.x>414-ball.r){ball.x=414-ball.r;ball.vx=-Math.abs(ball.vx)*.86}
// Deflettori superiori: due guide inclinate.
for(const obj of [...TABLE.rails,...TABLE.slingshots]){if(ball.inLauncher&&obj.id==='R2_copia')continue;const p=segment(obj.x,obj.y,obj.x2,obj.y2),dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy)||1;if(d<ball.r+5){const nx=dx/d,ny=dy/d;ball.x+=nx*(ball.r+5-d);ball.y+=ny*(ball.r+5-d);const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=vn*1.8*nx;ball.vy-=vn*1.8*ny}}}
TABLE.bumper.forEach(b=>bump(b.x,b.y,b.r,b.score,b.id));TABLE.posts.forEach(b=>bump(b.x,b.y,b.r,0,b.id));
TABLE.targets.forEach((t,j)=>{if(ball.x>t.x-ball.r&&ball.x<t.x+t.w+ball.r&&ball.y>t.y-ball.r&&ball.y<t.y+t.h+ball.r){const dir=ball.x<t.x+t.w/2?-1:1;ball.vx=dir*(Math.abs(ball.vx)*.8+170);addTarget(j)}});
flipperPhysics('left');flipperPhysics('right');
if(ball.y>BOARD_H+10){drain();break}
}
if(ball)ball.trail.push({x:ball.x,y:ball.y});if(ball?.trail.length>9)ball.trail.shift();
}
function addTarget(i){const now=performance.now();if(now-(hitTimes.get(TABLE.targets[i].id)||0)>300){addPoints(TABLE.targets[i].score);hitTimes.set(TABLE.targets[i].id,now)}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke()}}
function draw(){const c=ctx;c.clearRect(0,0,BOARD_W,BOARD_H);let g=c.createLinearGradient(0,0,BOARD_W,BOARD_H);g.addColorStop(0,'#1b4e5e');g.addColorStop(.55,'#143544');g.addColorStop(1,'#0c1b29');c.fillStyle=g;c.fillRect(0,0,BOARD_W,BOARD_H);c.strokeStyle='#b88b44';c.lineWidth=10;c.strokeRect(15,14,410,812);c.strokeStyle='#d0a953';c.lineWidth=3;c.strokeRect(24,23,392,794);
c.fillStyle='#ddb76c';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('✦ COLOMBIADI 1892 ✦',220,67);c.font='13px Georgia';c.fillText('LE MACCHINE DELLE MERAVIGLIE',220,88);
for(let i=0;i<12;i++){const x=57+(i%6)*65,y=128+Math.floor(i/6)*510;circle(x,y,4,'#a17f4a')}
for(const b of TABLE.bumper){if(imageCentered(b.id,b.x,b.y,(b.r+7)*2,(b.r+7)*2))continue;circle(b.x,b.y,b.r+7,'#624d2b','#d2a752');circle(b.x,b.y,b.r,'#b77a31','#fce2a2');circle(b.x,b.y,b.r*.52,'#f6d27c');for(let k=0;k<8;k++){const a=k*Math.PI/4;circle(b.x+Math.cos(a)*b.r*.72,b.y+Math.sin(a)*b.r*.72,3,'#5f3f1d')}}
for(const t of TABLE.targets){if(imageCentered(t.id,t.x+t.w/2,t.y+t.h/2,t.w,t.h))continue;c.fillStyle='#b88c39';c.fillRect(t.x,t.y,t.w,t.h);c.fillStyle='#f2d181';c.fillRect(t.x+4,t.y+6,t.w-8,t.h-12)}
for(const p of TABLE.posts){if(!imageCentered(p.id,p.x,p.y,p.r*2,p.r*2))circle(p.x,p.y,p.r,'#bca36f','#f2d793')}
c.lineWidth=8;c.lineCap='round';for(const o of [...TABLE.rails,...TABLE.slingshots]){if(imageRail(o))continue;c.strokeStyle=o.type==='slingshot'?'#e0b574':'#b49a6c';c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x2,o.y2);c.stroke()}
// Canale di lancio sul lato destro.
if(!imageRail(TABLE.launcher)){c.strokeStyle='#d2a75c';c.lineWidth=4;c.beginPath();c.moveTo(TABLE.launcher.x,TABLE.launcher.y);c.lineTo(TABLE.launcher.x2,TABLE.launcher.y2);c.stroke();}c.fillStyle='#dfbc78';c.font='11px Georgia';c.save();c.translate(402,455);c.rotate(-Math.PI/2);c.fillText('LANCIO',0,0);c.restore();
for(const side of ['left','right']){const f=flipperGeometry(side);if(imageCentered(TABLE.flippers[side].id,(f.x+f.tipx)/2,(f.y+f.tipy)/2,TABLE.flippers[side].length+25,29,Math.atan2(f.tipy-f.y,f.tipx-f.x)))continue;c.strokeStyle='#4a251c';c.lineWidth=26;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tipx,f.tipy);c.stroke();c.strokeStyle='#e6a65b';c.lineWidth=18;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tipx,f.tipy);c.stroke();circle(f.x,f.y,11,'#edc985','#573b24')}
c.fillStyle='#bd9658';c.font='12px Georgia';c.fillText('◀ PALETTE ▶',220,800);
if(ball){for(let i=0;i<ball.trail.length;i++){const t=ball.trail[i];circle(t.x,t.y,2+i*.35,'rgba(220,228,211,'+(i/ball.trail.length*.25)+')')}const gr=c.createRadialGradient(ball.x-3,ball.y-4,1,ball.x,ball.y,ball.r);gr.addColorStop(0,'white');gr.addColorStop(.45,'#d6dce0');gr.addColorStop(1,'#596b76');if(!imageCentered('ball',ball.x,ball.y,ball.r*2,ball.r*2))circle(ball.x,ball.y,ball.r,gr,'#e8dbba')}
}
function loop(now){raf=0;if(phase!=='playing')return;const dt=Math.min(.035,Math.max(0,(now-last)/1000));last=now;update(dt);draw();if(phase==='playing'){saveGame();raf=requestAnimationFrame(loop)}}
$('flipperStart').addEventListener('click',start);$('flipperExit').addEventListener('click',close);$('flipperGameExit').addEventListener('click',()=>{pause();showMenu()});$('flipperPause').addEventListener('click',pause);$('flipperResume').addEventListener('click',resume);$('flipperRestart').addEventListener('click',start);$('flipperBackMenu').addEventListener('click',showMenu);$('flipperLaunch').addEventListener('click',launch);
for(const [side,id] of [['left','flipperLeft'],['right','flipperRight']]){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();held[side]=true;try{el.setPointerCapture(e.pointerId)}catch(ex){}});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>{held[side]=false})}
window.addEventListener('keydown',e=>{if(root.hidden||phase==='menu'||e.repeat&&e.code==='Space')return;if(['ArrowLeft','ArrowRight','Space','KeyP','Escape'].includes(e.code))e.preventDefault();if(e.code==='ArrowLeft')held.left=true;if(e.code==='ArrowRight')held.right=true;if(e.code==='Space')launch();if(e.code==='KeyP')pause();if(e.code==='Escape'&&phase==='playing')pause()});window.addEventListener('keyup',e=>{if(e.code==='ArrowLeft')held.left=false;if(e.code==='ArrowRight')held.right=false});window.addEventListener('blur',()=>{held.left=held.right=false;if(phase==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame(true)});window.addEventListener('pagehide',()=>saveGame(true));
window.EsposizioneMinigames.register('flipper',{start:open,close,isOpen:()=>!root.hidden,back(){if(phase==='menu'){close();return true}showMenu();return true}});
})();
