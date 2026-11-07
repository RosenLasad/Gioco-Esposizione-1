/* Rompicapi Meccanici v1 - motore 2D indipendente, dati tavola separati. */
(function(){'use strict';
const $=id=>document.getElementById(id),root=$('pavilionFlipper');if(!root)return;
const canvas=$('flipperCanvas'),ctx=canvas.getContext('2d');
const BOARD_W=440,BOARD_H=840; canvas.width=BOARD_W; canvas.height=BOARD_H;
// Cornice sottile: proporzioni esterne invariate, piu' spazio effettivo per la pallina.
const PLAYFIELD={left:8,right:432,top:8,bottom:832};
const LAYOUT_VERSION=2,LAUNCHER_SHIFT=16;
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
const OBJECTS=[{"id":"B1","type":"bumper","label":"Bumper alto sinistra","x":125,"y":205,"r":26,"score":100},{"id":"B2","type":"bumper","label":"Bumper alto destra","x":299,"y":210,"r":26,"score":100},{"id":"B3","type":"bumper","label":"Bumper centrale","x":211.9,"y":335.1,"r":29,"score":150},{"id":"T1","type":"target","label":"Target sinistro","x":76,"y":335,"w":17,"h":64,"score":50},{"id":"T2","type":"target","label":"Target destro","x":348,"y":335,"w":17,"h":64,"score":50},{"id":"P1","type":"post","label":"Piolo sinistro","x":83,"y":660,"r":12},{"id":"P2","type":"post","label":"Piolo destro","x":356,"y":660,"r":12},{"id":"R1","type":"rail","label":"Tavola 1","x":78,"y":129.6,"x2":175.7,"y2":163.4},{"id":"R2","type":"rail","label":"Guida superiore destra","x":401.7,"y":147.9,"x2":363,"y2":98},{"id":"S1","type":"slingshot","label":"Slingshot sinistro","x":8,"y":680,"x2":112,"y2":766},{"id":"S2","type":"slingshot","label":"Slingshot destro","x":399.9,"y":681,"x2":328,"y2":766},{"id":"F1","type":"flipper","label":"Paletta sinistra","x":112,"y":765,"length":80,"angle":0.3141592653589793,"side":"left"},{"id":"F2","type":"flipper","label":"Paletta destra","x":328,"y":765,"length":80,"angle":2.827433388230814,"side":"right"},{"id":"L1","type":"launcher","label":"Canale di lancio","x":401,"y":165,"x2":401,"y2":810},{"id":"R2_copia","type":"rail","label":"Guida superiore destra copia","x":401.7,"y":814.3,"x2":401.7,"y2":146.1},{"id":"B3_copia","type":"bumper","label":"Bumper centrale copia","x":214.6,"y":497.5,"r":29,"score":150}];
// Manifest immagini. JSON esterno caricato su HTTP; mappa incorporata per file:// offline.
const assetRoot=new URL('./',document.currentScript?.src || location.href);
const assetFallback={"format":"colombiadi-flipper-assets","version":1,"table":1,"theme":"bombardamento-genova-1684","board":{"width":440,"height":840},"assets":{"ball":"assets/common/ball/cannonball.svg","B1":"assets/tavola-01-1684/bumpers/bumper_ship_large_01.svg","B2":"assets/tavola-01-1684/bumpers/bumper_ship_large_02.svg","B3":"assets/tavola-01-1684/bumpers/bumper_ship_large_03.svg","B3_copia":"assets/tavola-01-1684/bumpers/bumper_ship_large_04.svg","T1":"assets/tavola-01-1684/targets/target_ship_small_left.svg","T2":"assets/tavola-01-1684/targets/target_ship_small_right.svg","P1":"assets/tavola-01-1684/posts/post_rock_left.svg","P2":"assets/tavola-01-1684/posts/post_rock_right.svg","R1":"assets/tavola-01-1684/rails/rail_rock_upper_left.svg","R2":"assets/tavola-01-1684/rails/rail_rock_upper_right.svg","R2_copia":"assets/tavola-01-1684/rails/rail_rock_vertical_right.svg","S1":"assets/tavola-01-1684/slingshots/slingshot_wall_left.svg","S2":"assets/tavola-01-1684/slingshots/slingshot_wall_right.svg","F1":"assets/tavola-01-1684/flippers/flipper_left_wood.svg","F2":"assets/tavola-01-1684/flippers/flipper_right_wood.svg","L1":"assets/tavola-01-1684/shooter-lane/shooter_lane_wood_right.svg","background":"assets/tavola-01-1684/background/table_background.svg","inlane_left":"assets/tavola-01-1684/inlanes/inlane_left_wood.svg","inlane_right":"assets/tavola-01-1684/inlanes/inlane_right_wood.svg","outlane_left":"assets/tavola-01-1684/outlanes/outlane_left_wood.svg","outlane_right":"assets/tavola-01-1684/outlanes/outlane_right_wood.svg","launcherCannon":"assets/tavola-01-1684/shooter-lane/launcher_cannon.png"},"notes":"Indica i file .svg provvisori: il gioco cerca automaticamente prima il .png omonimo nella stessa cartella, poi ripiega sul .svg. Funziona anche offline con file://. Geometria e collisioni non cambiano."};
const imageAssets=new Map();
let activeTable={id:1,name:'Tavola 1684'};
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
function applyAssetManifest(data){if(!data||data.format!=='colombiadi-flipper-assets'||data.table!==activeTable.id||!data.assets)return;for(const [id,path] of Object.entries(data.assets))loadImageAsset(id,path);}
applyAssetManifest(assetFallback);

if(location.protocol!=='file:')fetch(new URL('manifest/tavola-01-assets.json',assetRoot)).then(r=>r.ok?r.json():null).then(v=>{if(v)applyAssetManifest(v)}).catch(()=>{});
function imageCentered(id,x,y,w,h,rotation=0){const a=imageAssets.get(id);if(!a?.ready)return false;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(a.img,-w/2,-h/2,w,h);ctx.restore();return true;}
function imageRail(o){
  const a=imageAssets.get(o.id);if(!a?.ready)return false;
  const dx=o.x2-o.x,dy=o.y2-o.y,l=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
  // Mantiene il disegno originale per gli SVG di riserva.
  if(/\.svg(?:[?#]|$)/i.test(a.img.src))return imageCentered(o.id,(o.x+o.x2)/2,(o.y+o.y2)/2,l+12,20,angle);
  const ratio=a.img.naturalWidth/a.img.naturalHeight;
  if(o.id==='R2_copia'){
    // Tratti a scala uniforme: niente rocce stirate lungo tutta la guida.
    // La scogliera e' sul lato del campo, accanto alla sponda in legno L1.
    const overlap=1,count=Math.max(1,Math.ceil(l/(20*ratio)));
    const w=(l+overlap*(count-1))/count,h=w/ratio;
    ctx.save();ctx.translate(o.x2,o.y2);ctx.rotate(Math.atan2(-dy,-dx));
    ctx.beginPath();ctx.rect(0,4,l,h);ctx.clip();
    for(let i=0;i<count;i++)ctx.drawImage(a.img,i*(w-overlap),4,w,h);
    ctx.restore();return true;
  }
  // Mare verso il basso anche per la guida destra, definita in senso inverso.
  return imageCentered(o.id,(o.x+o.x2)/2,(o.y+o.y2)/2,l+12,(l+12)/ratio,Math.cos(angle)<0?angle+Math.PI:angle);
}
// Sprite orizzontali dall'alto, scalati uniformemente lungo la sponda.
// A destra invertiamo l'asse: torre e scogli restano verso l'esterno della tavola.
function imageSlingshot(o){
  const a=imageAssets.get(o.id);if(!a?.ready)return false;
  const dx=o.x2-o.x,dy=o.y2-o.y,w=Math.hypot(dx,dy)+12;
  const rotation=Math.atan2(dy,dx)-(o.id==='S2'?Math.PI:0);
  return imageCentered(o.id,(o.x+o.x2)/2,(o.y+o.y2)/2,w,w*a.img.naturalHeight/a.img.naturalWidth,rotation);
}
// La sponda L1 e' gia' verticale nel PNG e nell'SVG: il suo asse lungo e' Y.
// Spessore 10 come la guida fisica R2_copia; il canale della pallina resta libero.
function imageLauncher(o){const dx=o.x2-o.x,dy=o.y2-o.y;return imageCentered(o.id,(o.x+o.x2)/2,(o.y+o.y2)/2,10,Math.hypot(dx,dy),Math.atan2(dy,dx)-Math.PI/2)}
const byType=type=>OBJECTS.filter(o=>o.type===type);
const TABLE={gravity:620,restitution:.87,wall:17,ballRadius:8,
 bumper:byType('bumper'),posts:byType('post'),targets:byType('target'),
 rails:byType('rail'),slingshots:byType('slingshot'),launcher:byType('launcher')[0],
 flippers:{left:OBJECTS.find(o=>o.type==='flipper'&&o.side==='left'),right:OBJECTS.find(o=>o.type==='flipper'&&o.side==='right')}};

// Audio esclusivo di Tavola 1. MP4 con traccia AAC, se supportato dal browser.
const audioFiles={music:'audio/tavola-01/music/battaglia_1684.mp3',launch:'audio/tavola-01/sfx/lancio.mp3',bumper:'audio/tavola-01/sfx/bumper.mp3',target:'audio/tavola-01/sfx/target.mp3'};
const audioSettingsKey='colombiadi1892.flipper.audio.preferences.v1';
let audioSettings={music:true,sfx:true};
try{const v=JSON.parse(localStorage.getItem(audioSettingsKey)||'null');if(v&&typeof v.music==='boolean'&&typeof v.sfx==='boolean')audioSettings={music:v.music,sfx:v.sfx};}catch(e){}
const audioUrl=name=>new URL(audioFiles[name],assetRoot).href;
const backgroundMusic=new Audio(audioUrl('music'));
backgroundMusic.loop=true;backgroundMusic.preload='none';backgroundMusic.volume=.38;
const sfxPlayers=new Map();
let lastAudioHit={bumper:0,target:0};
function playSound(kind){
  if(!audioSettings.sfx||phase!=='playing')return;
  const now=performance.now(),gap=kind==='launch'?0:85;
  if(gap&&now-(lastAudioHit[kind]||0)<gap)return;
  lastAudioHit[kind]=now;
  // Piccolo pool per riprodurre urti ravvicinati senza interrompere il precedente.
  let pool=sfxPlayers.get(kind);
  if(!pool){pool=Array.from({length:3},()=>{const a=new Audio(audioUrl(kind));a.preload='none';a.volume=.65;return a});sfxPlayers.set(kind,pool)}
  const player=pool.find(a=>a.paused||a.ended)||pool[0];
  try{player.pause();player.currentTime=0;const result=player.play();if(result?.catch)result.catch(()=>{});}catch(e){}
}
function syncMusic(){
  if(phase==='playing'&&audioSettings.music){
    const result=backgroundMusic.play();if(result?.catch)result.catch(()=>{});
  }else backgroundMusic.pause();
}
function setupAudioControls(){
  const targets=[[$('flipperMenu'),'menu'],[$('flipperOverlay')?.querySelector('.flipper-modal'),'pause']];
  for(const [container,section] of targets){
    if(!container||container.querySelector('.flipper-audio-options'))continue;
    const group=document.createElement('div');group.className='flipper-audio-options';
    for(const [key,label] of [['music','Musica'],['sfx','Suoni']]){
      const item=document.createElement('label');item.className='flipper-audio-toggle';
      const input=document.createElement('input');input.type='checkbox';input.checked=audioSettings[key];input.dataset.audio=key;
      const text=document.createElement('span');text.textContent=label;
      input.addEventListener('change',()=>{
        audioSettings[key]=input.checked;
        try{localStorage.setItem(audioSettingsKey,JSON.stringify(audioSettings))}catch(e){}
        root.querySelectorAll('.flipper-audio-options input[data-audio="'+key+'"]').forEach(other=>other.checked=input.checked);
        syncMusic();
      });
      item.append(input,text);group.appendChild(item);
    }
    if(section==='menu'){
      const anchor=$('flipperRecord');anchor?.parentElement?.insertBefore(group,anchor.nextSibling);
      if(!group.isConnected)container.appendChild(group);
    }else{
      const anchor=$('flipperResume');container.insertBefore(group,anchor);
    }
  }
}
setupAudioControls();
let phase='closed',score=0,remaining=3,ball=null,held={left:false,right:false},angles={left:0,right:0},last=0,raf=0,launchReady=false,hitTimes=new Map();
const launchEffects={age:Infinity};
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
const flipperKeys={left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD']};
const pressedFlipperKeys=new Set(),pointerFlippers={left:false,right:false};
function syncFlipperInput(){for(const side of ['left','right'])held[side]=pointerFlippers[side]||flipperKeys[side].some(key=>pressedFlipperKeys.has(key))}
function resetFlipperInput(){pressedFlipperKeys.clear();pointerFlippers.left=pointerFlippers.right=false;held.left=held.right=false}
let recordKey='esposizione-flipper-record-v1';
// Salvataggio esclusivo del flipper: nessuna lettura o scrittura dei dati dell'Esposizione.
let saveKey='colombiadi1892.flipper.tavola1.partita.v1';
let lastSaveAt=0;
function readSave(){try{const v=JSON.parse(localStorage.getItem(saveKey)||'null');if(!v||v.version!==1||v.table!==activeTable.id||!Number.isFinite(v.score)||!Number.isInteger(v.remaining)||v.remaining<1||v.remaining>3||!v.ball||!['ready','active'].includes(v.ballState))return null;for(const k of ['x','y','vx','vy'])if(!Number.isFinite(v.ball[k]))return null;return v;}catch(e){return null}}
function clearSave(){try{localStorage.removeItem(saveKey)}catch(e){}}
function saveGame(force=false){if(!['playing','paused'].includes(phase)||!ball)return;const now=performance.now();if(!force&&now-lastSaveAt<1000)return;lastSaveAt=now;try{localStorage.setItem(saveKey,JSON.stringify({version:1,table:activeTable.id,layoutVersion:LAYOUT_VERSION,score,remaining,ballState:launchReady?'ready':'active',boardHeight:BOARD_H,ball:{x:ball.x,y:ball.y,vx:ball.vx,vy:ball.vy,inLauncher:!!ball.inLauncher},savedAt:Date.now()}))}catch(e){}}
function updateContinueButton(){const btn=$('flipperContinue');if(btn)btn.hidden=!readSave()}
function continueGame(){const saved=readSave();if(!saved)return;score=Math.max(0,Math.floor(saved.score));remaining=saved.remaining;angles={left:0,right:0};resetFlipperInput();resetLaunchEffects();hitTimes.clear();ball=restoredBall(saved);launchReady=saved.ballState==='ready';$('flipperMenu').hidden=true;$('flipperPlay').hidden=false;$('flipperOverlay').hidden=true;resizePlayfield();setHud();setStatus(launchReady?'Premi LANCIA o Spazio per lanciare.':'Partita ripresa: colpisci i bersagli!');phase='playing';syncMusic();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function ensureContinueButton(){if($('flipperContinue'))return;const startButton=$('flipperStart');const button=document.createElement('button');button.type='button';button.id='flipperContinue';button.textContent='Continua partita';button.hidden=true;startButton.parentNode.insertBefore(button,startButton);button.addEventListener('click',continueGame)}
ensureContinueButton();
function record(){try{return Number(localStorage.getItem(recordKey))||0}catch(e){return 0}}
function saveRecord(){try{if(score>record())localStorage.setItem(recordKey,String(score))}catch(e){}}
function setStatus(t){$('flipperStatus').textContent=t}
function setHud(){$('flipperScore').textContent=score.toLocaleString('it-IT');$('flipperBalls').textContent='Palline: '+remaining}
function open(){root.hidden=false;phase='menu';showMenu();resizePlayfield()}
function showMenu(){resetLaunchEffects();backgroundMusic.pause();saveGame(true);cancelAnimationFrame(raf);raf=0;phase='menu';$('flipperPlay').hidden=true;$('flipperMenu').hidden=false;$('flipperOverlay').hidden=true;$('flipperRecord').textContent='Record: '+record().toLocaleString('it-IT')+' punti';resetFlipperInput();updateContinueButton()}
function close(){resetLaunchEffects();backgroundMusic.pause();saveGame(true);cancelAnimationFrame(raf);raf=0;phase='closed';root.hidden=true;resetFlipperInput();$('flipperOverlay').hidden=true}
function launcherPosition(){return {x:TABLE.launcher.x+20,y:748}}
function resetLaunchEffects(){launchEffects.age=Infinity;canvas.style.transform=''}
function advanceLaunchEffects(dt){
  if(!Number.isFinite(launchEffects.age))return;
  launchEffects.age+=dt;
  const t=launchEffects.age,strength=Math.max(0,1-t/.14);
  canvas.style.transform=!reducedMotion?.matches&&strength>0?
    'translate('+Math.sin(t*190)*1.4*strength+'px,'+Math.cos(t*155)*1.1*strength+'px)':'';
  if(t>=.65)resetLaunchEffects();
}
function drawLauncherCannon(){
  const c=ctx,p=launcherPosition(),a=imageAssets.get('launcherCannon');
  const t=launchEffects.age,recoil=!reducedMotion?.matches&&t<.22?5*Math.sin(Math.PI*t/.22):0;
  const h=a?.ready?22*a.img.naturalHeight/a.img.naturalWidth:48,top=p.y-8+recoil;
  if(!imageCentered('launcherCannon',p.x,top+h/2,22,h)){
    c.fillStyle='#9e642d';c.fillRect(p.x-9,top+10,18,38);
    c.fillStyle='#665137';c.fillRect(p.x-6,top+2,12,34);
    c.fillStyle='#1c1a17';c.beginPath();c.ellipse(p.x,top+3,6,3,0,0,Math.PI*2);c.fill();
  }
}
function drawLaunchSmoke(){
  const t=launchEffects.age;if(t>=.65)return;
  const c=ctx,p=launcherPosition();c.save();
  if(t<.07){
    c.globalAlpha=1-t/.07;
    const flare=c.createRadialGradient(p.x,p.y-9,0,p.x,p.y-9,13);
    flare.addColorStop(0,'#fff5bf');flare.addColorStop(.35,'#ffbe48');flare.addColorStop(1,'#ff7b1800');
    c.fillStyle=flare;c.beginPath();c.ellipse(p.x,p.y-12,11,17,0,0,Math.PI*2);c.fill();
  }
  for(let i=0;i<6;i++){
    const age=t-i*.025;if(age<0)continue;
    const life=Math.max(0,1-age/.48);if(!life)continue;
    c.globalAlpha=life*.32;
    c.fillStyle=i%2?'#dce0dc':'#9eaaa9';
    const x=p.x-2-Math.sin(i*2.4)*3-age*(5+i*2),y=p.y-13-age*(55+i*6);
    c.beginPath();c.arc(x,y,2.5+age*15,0,Math.PI*2);c.fill();
  }
  c.restore();
}
function restoredBall(saved){
  const b=saved.ball,ready=saved.ballState==='ready',position=launcherPosition();
  return {x:ready?position.x:b.x+(b.inLauncher&&saved.layoutVersion!==LAYOUT_VERSION?LAUNCHER_SHIFT:0),
    y:ready?position.y:Math.min(saved.boardHeight===BOARD_H?b.y:(b.y<=400?b.y:400+(b.y-400)*(BOARD_H-400)/360),BOARD_H-5),
    vx:ready?0:b.vx,vy:ready?0:b.vy,r:TABLE.ballRadius,trail:[],inLauncher:ready||!!b.inLauncher};
}
function newBall(){resetLaunchEffects();ball={...launcherPosition(),vx:0,vy:0,r:TABLE.ballRadius,trail:[],inLauncher:true};launchReady=true;setStatus('Premi LANCIA o Spazio per lanciare.')}
function start(){if(readSave()&&!confirm('Iniziare una nuova partita di flipper? Il salvataggio della partita precedente verrà sostituito. Il record personale rimarrà.'))return;clearSave();score=0;remaining=3;angles={left:0,right:0};hitTimes.clear();$('flipperMenu').hidden=true;$('flipperPlay').hidden=false;$('flipperOverlay').hidden=true;resizePlayfield();phase='playing';syncMusic();newBall();setHud();last=performance.now();cancelAnimationFrame(raf);saveGame(true);raf=requestAnimationFrame(loop)}
function launch(){if(phase==='playing'&&launchReady){launchReady=false;launchEffects.age=0;ball.vx=0;ball.vy=-950;playSound('launch');setStatus('Colpisci i bersagli e salva la sfera!');saveGame(true)}}
function overlay(title,text,finished=false){resetLaunchEffects();$('flipperOverlayTitle').textContent=title;$('flipperOverlayText').textContent=text;$('flipperResume').hidden=finished;$('flipperOverlay').hidden=false;phase=finished?'over':'paused';syncMusic();resetFlipperInput();if(finished){saveRecord();clearSave()}else saveGame(true)}
function pause(){if(phase==='playing')overlay('Partita in pausa','Puoi riprendere in qualsiasi momento.');else if(phase==='paused')resume()}
function resume(){if(phase!=='paused')return;phase='playing';syncMusic();$('flipperOverlay').hidden=true;last=performance.now();saveGame(true);if(!raf)raf=requestAnimationFrame(loop)}
function drain(){remaining--;setHud();if(remaining<=0){overlay('Partita terminata','Punteggio: '+score.toLocaleString('it-IT')+' · Record: '+Math.max(score,record()).toLocaleString('it-IT'),true);return}newBall();saveGame(true)}
function addPoints(n){score+=n;setHud()}
function bump(x,y,r,scoreValue,id){const dx=ball.x-x,dy=ball.y-y,d=Math.hypot(dx,dy)||1,min=r+ball.r;if(d>=min)return;const nx=dx/d,ny=dy/d;ball.x=x+nx*(min+.3);ball.y=y+ny*(min+.3);let impact=ball.vx*nx+ball.vy*ny;ball.vx-=(1+TABLE.restitution)*Math.min(impact,0)*nx;ball.vy-=(1+TABLE.restitution)*Math.min(impact,0)*ny;const speed=Math.max(240,Math.hypot(ball.vx,ball.vy));ball.vx+=nx*speed*.32;ball.vy+=ny*speed*.32;const now=performance.now();if(scoreValue&&now-(hitTimes.get(id)||0)>170){addPoints(scoreValue);playSound('bumper');hitTimes.set(id,now)}}
function segment(ax,ay,bx,by){let vx=bx-ax,vy=by-ay,t=Math.max(0,Math.min(1,((ball.x-ax)*vx+(ball.y-ay)*vy)/(vx*vx+vy*vy||1)));return {x:ax+vx*t,y:ay+vy*t}}
const FLIPPER_PHYSICS={stroke:.63,liftSpeed:8,returnSpeed:5,radius:11,restitution:.28,restSpeed:45,friction:.08};
function flipperGeometry(side){const f=TABLE.flippers[side];const a=f.angle+(side==='left'?-1:1)*angles[side]*FLIPPER_PHYSICS.stroke;return {x:f.x,y:f.y,tipx:f.x+f.length*Math.cos(a),tipy:f.y+f.length*Math.sin(a)}}
function moveFlippers(dt){
  const speeds={left:0,right:0};if(dt<=0)return speeds;
  for(const side of ['left','right']){
    const target=Number(held[side]),previous=angles[side];
    const step=(held[side]?FLIPPER_PHYSICS.liftSpeed:FLIPPER_PHYSICS.returnSpeed)*dt/FLIPPER_PHYSICS.stroke;
    angles[side]+=Math.sign(target-previous)*Math.min(Math.abs(target-previous),step);
    speeds[side]=(side==='left'?-1:1)*(angles[side]-previous)*FLIPPER_PHYSICS.stroke/dt;
  }
  return speeds;
}
function flipperPhysics(side,angularSpeed=0){
  const f=flipperGeometry(side),point=segment(f.x,f.y,f.tipx,f.tipy);
  const dx=ball.x-point.x,dy=ball.y-point.y,d=Math.hypot(dx,dy),min=ball.r+FLIPPER_PHYSICS.radius;
  if(d>=min)return;
  // Velocita' locale della paletta: cresce dal perno alla punta, e vale zero a fine corsa.
  const surfaceVx=-angularSpeed*(point.y-f.y),surfaceVy=angularSpeed*(point.x-f.x);
  const relativeVx=ball.vx-surfaceVx,relativeVy=ball.vy-surfaceVy;
  let nx,ny;
  if(d>1e-8){nx=dx/d;ny=dy/d}else{
    const length=Math.hypot(f.tipx-f.x,f.tipy-f.y);
    nx=(f.tipy-f.y)/length;ny=-(f.tipx-f.x)/length;
    if(relativeVx*nx+relativeVy*ny>0){nx=-nx;ny=-ny}
  }
  // Correzione lungo la normale anche sotto la paletta, senza teletrasportare la pallina sopra.
  ball.x+=nx*(min-d+.05);ball.y+=ny*(min-d+.05);
  const normalSpeed=relativeVx*nx+relativeVy*ny;
  if(normalSpeed>=0)return; // Un contatto che si sta separando non riceve un altro impulso.
  const restitution=-normalSpeed<FLIPPER_PHYSICS.restSpeed?0:FLIPPER_PHYSICS.restitution;
  const impulse=-(1+restitution)*normalSpeed;
  ball.vx+=nx*impulse;ball.vy+=ny*impulse;
  const tx=-ny,ty=nx,tangentSpeed=relativeVx*tx+relativeVy*ty;
  const friction=Math.sign(tangentSpeed)*Math.min(Math.abs(tangentSpeed)*FLIPPER_PHYSICS.friction,impulse*.12);
  ball.vx-=tx*friction;ball.vy-=ty*friction;
}
function update(dt){
if(!ball||launchReady){moveFlippers(dt);return}const steps=Math.max(1,Math.ceil(dt*480)),h=dt/steps;for(let i=0;i<steps;i++){
const flipperSpeeds=moveFlippers(h);
ball.vy+=TABLE.gravity*h;if(ball.inLauncher && ball.y<150){ball.inLauncher=false;ball.vx=-230}ball.vx*=1-.055*h;ball.x+=ball.vx*h;ball.y+=ball.vy*h;
if(ball.y<PLAYFIELD.top+ball.r){ball.y=PLAYFIELD.top+ball.r;ball.vy=Math.abs(ball.vy)*.85}
if(ball.x<PLAYFIELD.left+ball.r){ball.x=PLAYFIELD.left+ball.r;ball.vx=Math.abs(ball.vx)*.86}
if(ball.x>PLAYFIELD.right-ball.r){ball.x=PLAYFIELD.right-ball.r;ball.vx=-Math.abs(ball.vx)*.86}
// Deflettori superiori: due guide inclinate.
for(const obj of [...TABLE.rails,...TABLE.slingshots]){if(ball.inLauncher&&obj.id==='R2_copia')continue;const p=segment(obj.x,obj.y,obj.x2,obj.y2),dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy)||1;if(d<ball.r+5){const nx=dx/d,ny=dy/d;ball.x+=nx*(ball.r+5-d);ball.y+=ny*(ball.r+5-d);const vn=ball.vx*nx+ball.vy*ny;if(vn<0){ball.vx-=vn*1.8*nx;ball.vy-=vn*1.8*ny}}}
TABLE.bumper.forEach(b=>bump(b.x,b.y,b.r,b.score,b.id));TABLE.posts.forEach(b=>bump(b.x,b.y,b.r,0,b.id));
TABLE.targets.forEach((t,j)=>{if(ball.x>t.x-ball.r&&ball.x<t.x+t.w+ball.r&&ball.y>t.y-ball.r&&ball.y<t.y+t.h+ball.r){const dir=ball.x<t.x+t.w/2?-1:1;ball.vx=dir*(Math.abs(ball.vx)*.8+170);addTarget(j)}});
flipperPhysics('left',flipperSpeeds.left);flipperPhysics('right',flipperSpeeds.right);
if(ball.y>BOARD_H+10){drain();break}
}
if(ball)ball.trail.push({x:ball.x,y:ball.y});if(ball?.trail.length>9)ball.trail.shift();
}
function addTarget(i){const now=performance.now();if(now-(hitTimes.get(TABLE.targets[i].id)||0)>300){addPoints(TABLE.targets[i].score);playSound('target');hitTimes.set(TABLE.targets[i].id,now)}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke()}}
function draw(){const c=ctx;c.clearRect(0,0,BOARD_W,BOARD_H);let g=c.createLinearGradient(0,0,BOARD_W,BOARD_H);g.addColorStop(0,'#1b4e5e');g.addColorStop(.55,'#143544');g.addColorStop(1,'#0c1b29');c.fillStyle=g;c.fillRect(0,0,BOARD_W,BOARD_H);c.strokeStyle='#d0a953';c.lineWidth=2;c.strokeRect(PLAYFIELD.left-2,PLAYFIELD.top-2,PLAYFIELD.right-PLAYFIELD.left+4,PLAYFIELD.bottom-PLAYFIELD.top+4);
for(const b of TABLE.bumper){if(imageCentered(b.id,b.x,b.y,(b.r+7)*2,(b.r+7)*2))continue;circle(b.x,b.y,b.r+7,'#624d2b','#d2a752');circle(b.x,b.y,b.r,'#b77a31','#fce2a2');circle(b.x,b.y,b.r*.52,'#f6d27c');for(let k=0;k<8;k++){const a=k*Math.PI/4;circle(b.x+Math.cos(a)*b.r*.72,b.y+Math.sin(a)*b.r*.72,3,'#5f3f1d')}}
for(const t of TABLE.targets){if(imageCentered(t.id,t.x+t.w/2,t.y+t.h/2,t.w,t.h))continue;c.fillStyle='#b88c39';c.fillRect(t.x,t.y,t.w,t.h);c.fillStyle='#f2d181';c.fillRect(t.x+4,t.y+6,t.w-8,t.h-12)}
for(const p of TABLE.posts){if(!imageCentered(p.id,p.x,p.y,p.r*2,p.r*2))circle(p.x,p.y,p.r,'#bca36f','#f2d793')}
c.lineWidth=8;c.lineCap='round';for(const o of [...TABLE.rails,...TABLE.slingshots]){if(o.type==='slingshot'?imageSlingshot(o):imageRail(o))continue;c.strokeStyle=o.type==='slingshot'?'#e0b574':'#b49a6c';c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x2,o.y2);c.stroke()}
// Canale di lancio sul lato destro.
if(!imageLauncher(TABLE.launcher)){c.strokeStyle='#d2a75c';c.lineWidth=4;c.beginPath();c.moveTo(TABLE.launcher.x,TABLE.launcher.y);c.lineTo(TABLE.launcher.x2,TABLE.launcher.y2);c.stroke();}
drawLauncherCannon();
for(const side of ['left','right']){const f=flipperGeometry(side);if(imageCentered(TABLE.flippers[side].id,(f.x+f.tipx)/2,(f.y+f.tipy)/2,TABLE.flippers[side].length+25,29,Math.atan2(f.tipy-f.y,f.tipx-f.x)))continue;c.strokeStyle='#4a251c';c.lineWidth=26;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tipx,f.tipy);c.stroke();c.strokeStyle='#e6a65b';c.lineWidth=18;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tipx,f.tipy);c.stroke();circle(f.x,f.y,11,'#edc985','#573b24')}
drawLaunchSmoke();
if(ball){for(let i=0;i<ball.trail.length;i++){const t=ball.trail[i];circle(t.x,t.y,2+i*.35,'rgba(220,228,211,'+(i/ball.trail.length*.25)+')')}const gr=c.createRadialGradient(ball.x-3,ball.y-4,1,ball.x,ball.y,ball.r);gr.addColorStop(0,'white');gr.addColorStop(.45,'#d6dce0');gr.addColorStop(1,'#596b76');if(!imageCentered('ball',ball.x,ball.y,ball.r*2,ball.r*2))circle(ball.x,ball.y,ball.r,gr,'#e8dbba')}
}
function loop(now){raf=0;if(phase!=='playing')return;const dt=Math.min(.035,Math.max(0,(now-last)/1000));last=now;update(dt);advanceLaunchEffects(dt);draw();if(phase==='playing'){saveGame();raf=requestAnimationFrame(loop)}}
$('flipperStart').addEventListener('click',start);$('flipperExit').addEventListener('click',close);$('flipperGameExit').addEventListener('click',()=>{pause();showMenu()});$('flipperPause').addEventListener('click',pause);$('flipperResume').addEventListener('click',resume);$('flipperRestart').addEventListener('click',start);$('flipperBackMenu').addEventListener('click',showMenu);$('flipperLaunch').addEventListener('click',launch);
for(const [side,id] of [['left','flipperLeft'],['right','flipperRight']]){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();pointerFlippers[side]=true;syncFlipperInput();try{el.setPointerCapture(e.pointerId)}catch(ex){}});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>{pointerFlippers[side]=false;syncFlipperInput()})}
window.addEventListener('keydown',e=>{
  if(root.hidden||phase==='menu'||e.repeat&&e.code==='Space')return;
  const isFlipper=flipperKeys.left.includes(e.code)||flipperKeys.right.includes(e.code);
  if(isFlipper||['Space','KeyP','Escape'].includes(e.code))e.preventDefault();
  if(isFlipper&&phase==='playing'){pressedFlipperKeys.add(e.code);syncFlipperInput()}
  if(e.code==='Space')launch();if(e.code==='KeyP')pause();if(e.code==='Escape'&&phase==='playing')pause();
});
window.addEventListener('keyup',e=>{if(pressedFlipperKeys.delete(e.code))syncFlipperInput()});
window.addEventListener('blur',()=>{resetFlipperInput();if(phase==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame(true)});window.addEventListener('pagehide',()=>saveGame(true));
const tablePresets=[{
  id:1,name:'Tavola 1684',objects:OBJECTS,playfield:{...PLAYFIELD},manifest:assetFallback,
  manifestPath:'manifest/tavola-01-assets.json',audio:{...audioFiles},
  physics:{gravity:TABLE.gravity,restitution:TABLE.restitution,wall:TABLE.wall,ballRadius:TABLE.ballRadius},
  flipperPhysics:{...FLIPPER_PHYSICS}
},...(window.EsposizioneFlipperExtraTables||[])];
function selectTable(id){
  if(!['menu','closed'].includes(phase))return false;
  const preset=tablePresets.find(table=>table.id===id);if(!preset)return false;
  backgroundMusic.pause();cancelAnimationFrame(raf);raf=0;resetLaunchEffects();resetFlipperInput();
  for(const pool of sfxPlayers.values())for(const player of pool)player.pause();
  sfxPlayers.clear();lastAudioHit={bumper:0,target:0};
  activeTable=preset;
  recordKey=id===1?'esposizione-flipper-record-v1':'esposizione-flipper-tavola'+id+'-record-v1';
  saveKey='colombiadi1892.flipper.tavola'+id+'.partita.v1';lastSaveAt=0;
  const by=type=>preset.objects.filter(object=>object.type===type);
  Object.assign(TABLE,preset.physics,{bumper:by('bumper'),posts:by('post'),targets:by('target'),
    rails:by('rail'),slingshots:by('slingshot'),launcher:by('launcher')[0],
    flippers:{left:preset.objects.find(o=>o.type==='flipper'&&o.side==='left'),right:preset.objects.find(o=>o.type==='flipper'&&o.side==='right')}});
  Object.assign(PLAYFIELD,preset.playfield);Object.assign(FLIPPER_PHYSICS,preset.flipperPhysics);
  Object.assign(audioFiles,preset.audio);backgroundMusic.src=audioUrl('music');
  ball=null;score=0;remaining=3;launchReady=false;angles={left:0,right:0};hitTimes.clear();
  imageAssets.clear();applyAssetManifest(preset.manifest);
  if(location.protocol!=='file:')fetch(new URL(preset.manifestPath,assetRoot)).then(r=>r.ok?r.json():null).then(data=>{if(data)applyAssetManifest(data)}).catch(()=>{});
  $('flipperTableSelect').value=String(id);
  $('flipperTableName').textContent='Ingranaggi e Ottone · '+preset.name;
  $('flipperRecord').textContent='Record: '+record().toLocaleString('it-IT')+' punti';
  setHud();updateContinueButton();
  try{localStorage.setItem('colombiadi1892.flipper.selectedTable.v1',String(id))}catch(e){}
  return true;
}
function setupTableSelector(){
  const selector=$('flipperTableSelect');
  selector.addEventListener('change',()=>{if(!selectTable(Number(selector.value)))selector.value=String(activeTable.id)});
  let selected=1;try{selected=Number(localStorage.getItem('colombiadi1892.flipper.selectedTable.v1'))||1}catch(e){}
  if(!selectTable(selected))selectTable(1);
}
setupTableSelector();
window.EsposizioneMinigames.register('flipper',{start:open,close,isOpen:()=>!root.hidden,back(){if(phase==='menu'){close();return true}showMenu();return true}});
})();
