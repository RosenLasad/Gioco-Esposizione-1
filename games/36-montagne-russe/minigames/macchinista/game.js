(function(){'use strict';
const gameId='macchinista', registry=window.EsposizioneMinigames;
if(!registry||registry.get(gameId))return;
const layer=document.createElement('div');layer.id='macchinistaLayer';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-label','La sfida del macchinista');
layer.innerHTML=`<section class="mac-shell"><header class="mac-top"><strong>⚙ LA SFIDA DEL MACCHINISTA</strong><small>Montagne Russe · Collaudo 1892</small><div class="mac-top-actions"><button class="mac-btn" id="macPauseBtn" type="button" hidden>Ⅱ Pausa</button><button class="mac-btn" id="macClose">Torna al padiglione</button></div></header><div class="mac-view"><canvas id="macchinistaCanvas"></canvas><div class="mac-hud"><span id="macDistance">Scambio 1/3</span><span id="macTime">00:00</span><span id="macErrors">Giri aggiuntivi: 0</span></div><div id="macPrompt" class="mac-prompt" hidden></div></div><div class="mac-controls"><div class="mac-lever-wrap"><span class="mac-lever-label">LEVA DEGLI SCAMBI</span><div id="macLever" class="mac-lever" role="group" aria-label="Leva degli scambi"><div class="mac-lever-track"></div><div id="macLeverHandle" class="mac-lever-handle"></div><button id="macLeft" class="mac-lever-zone mac-lever-left" aria-label="Scambio a sinistra" type="button">◀</button><button id="macRight" class="mac-lever-zone mac-lever-right" aria-label="Scambio a destra" type="button">▶</button></div></div><div class="mac-lever-hint" id="macLeverHint">Aziona la leva quando appare lo scambio<br>← / A &nbsp; oppure &nbsp; D / →</div></div><div class="mac-panel" id="macMenu"><div class="mac-card"><h2>La sfida del macchinista</h2><p>Guida il carrello lungo il circuito di collaudo. In prossimità dei tre scambi scegli Sinistra o Destra. Una scelta errata — o nessuna scelta — ti riporta al principio del percorso.</p><label for="macDifficulty">Difficoltà</label><select id="macDifficulty"><option value="easy">Facile · corsa lenta</option><option value="normal" selected>Normale · corsa sostenuta</option><option value="hard">Difficile · corsa rapida</option></select><p>Comandi: frecce ← →, A/D o leva centrale. La leva funziona mentre appaiono le frecce rosse sul binario; la direzione scelta diventa verde.</p><button class="mac-btn" id="macStart">Avvia collaudo</button><button class="mac-btn" id="macMenuExit">Indietro</button></div></div><div class="mac-panel" id="macResult" hidden><div class="mac-card"><h2 id="macResultTitle">Percorso completato!</h2><p id="macResultText"></p><button class="mac-btn" id="macRestart">Riprova</button><button class="mac-btn" id="macResultExit">Torna al padiglione</button></div></div><div class="mac-panel" id="macPausePanel" hidden><div class="mac-card"><h2>Partita in pausa</h2><div class="mac-pause-buttons"><button class="mac-btn" id="macResume" type="button">Riprendi</button><button class="mac-btn" id="macPauseRestart" type="button">Ricomincia</button><button class="mac-btn" id="macPauseMenu" type="button">Menu principale</button></div></div></div></section>`;
const pavilion=document.getElementById('pavilionView');(pavilion||document.body).appendChild(layer);
const $=id=>layer.querySelector('#'+id),canvas=$('macchinistaCanvas'),ctx=canvas.getContext('2d');
const settings={easy:{speed:15,window:1.9},normal:{speed:24,window:1.45},hard:{speed:36,window:1.05}};
let mode='closed',difficulty='normal',last=0,position=0,stage=0,extra=0,elapsed=0,selected=null,curve=0,curveDirection=1,curveDuration=.85,turnProgress=0,round=0,raf=0;
const choices=['left','right','left'];
const scriptBase=(()=>{try{return new URL('./',document.currentScript&&document.currentScript.src?document.currentScript.src:location.href).href}catch(_){return 'games/36-montagne-russe/minigames/macchinista/'}})();
const textures={wall:new Image(),ceiling:new Image()};
textures.wall.src=new URL('images/wall_scaffold_texture.png',scriptBase).href;
textures.ceiling.src=new URL('images/ceiling_scaffold_texture.png',scriptBase).href;
function viewSize(){const w=Math.max(2,canvas.clientWidth),h=Math.max(2,canvas.clientHeight),d=window.devicePixelRatio||1;if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);return{w,h}}
function start(){cancelAnimationFrame(raf);difficulty=$('macDifficulty').value;mode='run';$('macPausePanel').hidden=true;$('macPauseBtn').hidden=false;position=0;stage=0;extra=0;elapsed=0;selected=null;turnProgress=0;round=0;last=performance.now();$('macMenu').hidden=true;$('macResult').hidden=true;loop(last)}
function open(){if(mode!=='closed')return;mode='menu';$('macPauseBtn').hidden=true;$('macPausePanel').hidden=true;layer.hidden=false;$('macMenu').hidden=false;$('macResult').hidden=true;$('macStart').focus();render()}
function close(){mode='closed';layer.hidden=true;cancelAnimationFrame(raf);$('macPausePanel').hidden=true;$('macPauseBtn').hidden=true}
function menu(){cancelAnimationFrame(raf);mode='menu';$('macPausePanel').hidden=true;$('macPauseBtn').hidden=true;$('macResult').hidden=true;$('macMenu').hidden=false;render();$('macStart').focus()}
function pause(){if(mode!=='run')return;cancelAnimationFrame(raf);mode='pause';$('macPausePanel').hidden=false;$('macPauseBtn').hidden=true;render();$('macResume').focus()}
function resume(){if(mode!=='pause')return;mode='run';$('macPausePanel').hidden=true;$('macPauseBtn').hidden=false;last=performance.now();raf=requestAnimationFrame(loop)}
function back(){if(mode==='run'){pause();return true}if(mode==='pause'||mode==='result'){menu();return true}close();return true}
function switchActive(){return mode==='run'&&turnProgress===0&&position>=100-settings[difficulty].speed*settings[difficulty].window&&position<100}
function choose(value){if(!switchActive())return;selected=value;render()}
function leverUpdate(){const lever=$('macLever');lever.classList.toggle('mac-lever-ready',switchActive());lever.classList.toggle('mac-lever-left-selected',switchActive()&&selected==='left');lever.classList.toggle('mac-lever-right-selected',switchActive()&&selected==='right');lever.classList.toggle('mac-lever-locked',mode==='run'&&!switchActive())}
function project(x,z,w,h,lean=0){const f=290/Math.max(2,z+7),horizon=h*.43;return [w/2+x*f+lean*(1-z/145),horizon+80*f]}
function groundProject(x,z,w,h,lean=0){const p=project(0,z,w,h,lean);const groundBottom=h*.85;const t=Math.max(0,Math.min(1.2,(p[1]-h*.44)/Math.max(1,groundBottom-h*.44)));const half=w*(.012+.29*Math.pow(t,1.45));return [p[0]+(x/3.2)*half,p[1]]}
function topPoint(x,z,w,h,lean=0){const base=groundProject(x,z,w,h,lean);const distance=Math.max(0,Math.min(1,z/126));const roofY=h*(.17-.75*Math.pow(1-distance,1.5));return [base[0],roofY]}
function groundStroke(points,width,color,w,h,lean=0){ctx.beginPath();points.forEach((v,i)=>{const p=groundProject(v[0],v[1],w,h,lean);if(i===0)ctx.moveTo(...p);else ctx.lineTo(...p)});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
// Draw a textured quadrilateral as two affine-mapped triangles.
// Unlike drawImage into a clipped rectangle, the wood grain follows the depth.
function textureTriangle(img,src,dst){
 ctx.save();ctx.beginPath();ctx.moveTo(...dst[0]);ctx.lineTo(...dst[1]);ctx.lineTo(...dst[2]);ctx.closePath();ctx.clip();
 const [a,b,c]=src,[p,q,r]=dst;
 const den=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
 if(Math.abs(den)>0.001){
  const aa=((q[0]-p[0])*(c[1]-a[1])-(r[0]-p[0])*(b[1]-a[1]))/den;
  const cc=((r[0]-p[0])*(b[0]-a[0])-(q[0]-p[0])*(c[0]-a[0]))/den;
  const bb=((q[1]-p[1])*(c[1]-a[1])-(r[1]-p[1])*(b[1]-a[1]))/den;
  const dd=((r[1]-p[1])*(b[0]-a[0])-(q[1]-p[1])*(c[0]-a[0]))/den;
  ctx.transform(aa,bb,cc,dd,p[0]-aa*a[0]-cc*a[1],p[1]-bb*a[0]-dd*a[1]);
  ctx.drawImage(img,0,0);
 }
 ctx.restore();
}
function textureQuad(img,poly,fallback){
 if(!img.complete||!img.naturalWidth){ctx.fillStyle=fallback;ctx.beginPath();poly.forEach((pt,i)=>i?ctx.lineTo(...pt):ctx.moveTo(...pt));ctx.closePath();ctx.fill();return}
 const iw=img.naturalWidth,ih=img.naturalHeight;
 // TL TR BR BL in screen coordinates.
 textureTriangle(img,[[0,0],[iw,0],[iw,ih]],[poly[0],poly[1],poly[2]]);
 textureTriangle(img,[[0,0],[iw,ih],[0,ih]],[poly[0],poly[2],poly[3]]);
}
function draw(){const {w,h}=viewSize();const horizon=h*.44,lean=Math.sin(turnProgress*Math.PI)*curveDirection*w*.22,shake=mode==='run'?Math.sin(elapsed*31)*Math.min(2.5,settings[difficulty].speed/11):0;
ctx.fillStyle='#b9ad97';ctx.fillRect(0,0,w,horizon);ctx.fillStyle='#7f6347';ctx.fillRect(0,horizon,w,h-horizon);
const mist=ctx.createLinearGradient(0,horizon-60,0,horizon+130);mist.addColorStop(0,'#cac6b4');mist.addColorStop(.55,'#aea28d');mist.addColorStop(1,'#5f432a');ctx.fillStyle=mist;ctx.fillRect(0,horizon-60,w,190);
const corridorShift=Math.sin(turnProgress*Math.PI)*curveDirection*.85;
const innerWallHalf=5.35,railHalf=3.2,sleeperHalf=3.95;
// Side-wall continuations cover the exposed camera edges on sharp turns.
// They are textured in the same moving coordinate system and are drawn
// before the main perspective panels so the main walls mask their seams.
if(turnProgress>0){
 const near=2,far=140;
 const leftNear=groundProject(-innerWallHalf,near,w,h,lean);
 const leftTop=topPoint(-innerWallHalf,near,w,h,lean);
 const leftFar=groundProject(-innerWallHalf,far,w,h,lean);
 const leftFarTop=topPoint(-innerWallHalf,far,w,h,lean);
 const rightNear=groundProject(innerWallHalf,near,w,h,lean);
 const rightTop=topPoint(innerWallHalf,near,w,h,lean);
 const rightFar=groundProject(innerWallHalf,far,w,h,lean);
 const rightFarTop=topPoint(innerWallHalf,far,w,h,lean);
 const overflow=Math.abs(Math.sin(turnProgress*Math.PI))*w*.55;
 // Texture panels continue sideways, instead of showing the flat backdrop.
 textureQuad(textures.wall,[[leftTop[0]-overflow,-h*.9],leftFarTop,leftFar,[leftNear[0]-overflow,h*1.35]],'#94714d');
 textureQuad(textures.wall,[rightFarTop,[rightTop[0]+overflow,-h*.9],[rightNear[0]+overflow,h*1.35],rightFar],'#94714d');
 // Roof continuation covers top corners if the camera leans into the turn.
 textureQuad(textures.ceiling,[[leftTop[0]-overflow,-h*.9],[rightTop[0]+overflow,-h*.9],rightFarTop,leftFarTop],'#a27d55');
}
// Draw near/far wall and roof sections with moving perspective mapped textures.
// Subdividing into short panels allows depth and turning to animate together.
const phase=(position*2)%14;
for(let z=140-phase;z>0;z-=14){
 const far=Math.max(2,z),near=Math.max(2,z-14);
 if(far<=near)continue;
 const wLN=groundProject(-innerWallHalf,near,w,h,lean),wLF=groundProject(-innerWallHalf,far,w,h,lean);
 const wRN=groundProject(innerWallHalf,near,w,h,lean),wRF=groundProject(innerWallHalf,far,w,h,lean);
 const tLN=topPoint(-innerWallHalf,near,w,h,lean),tLF=topPoint(-innerWallHalf,far,w,h,lean);
 const tRN=topPoint(innerWallHalf,near,w,h,lean),tRF=topPoint(innerWallHalf,far,w,h,lean);
 textureQuad(textures.wall,[tLF,tLN,wLN,wLF],'#94714d');
 textureQuad(textures.wall,[tRN,tRF,wRF,wRN],'#94714d');
 textureQuad(textures.ceiling,[tLF,tRF,tRN,tLN],'#a27d55');
}
// No structural outline is drawn on top of the textures: walls and roof
// themselves now provide the timber construction appearance.
for(let z=145;z>1;z-=4){const depth=((z-position*2)%145+145)%145+1;const a=groundProject(-sleeperHalf,depth,w,h,lean),b=groundProject(sleeperHalf,depth,w,h,lean);ctx.strokeStyle='#4b301d';ctx.lineWidth=Math.max(1,15/(depth/20+3));ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
for(const x of [-railHalf,railHalf]){const pts=[];for(let z=2;z<150;z+=5)pts.push([x+Math.sin(turnProgress*Math.PI)*(z/100)*corridorShift,z]);groundStroke(pts,Math.max(2.2,w/180),'#171716',w,h,lean);groundStroke(pts,Math.max(1,w/380),'#b9b7aa',w,h,lean)}
if(mode==='run'&&turnProgress===0){const dist=100-position,reach=settings[difficulty].speed*settings[difficulty].window;if(dist>0&&dist<=reach){const approach=Math.max(0,Math.min(1,1-dist/reach));const eased=approach*approach*(3-2*approach);const py=horizon+(h*.84-horizon)*eased;const px=w*.5+lean*(.42+.18*approach);const size=Math.min(w*.19,h*.17)*(0.42+approach*.9);const thickness=Math.max(5,Math.min(16,size*.17));for(const [dir,sign] of [['left',-1],['right',1]]){const active=selected===dir;ctx.save();ctx.lineWidth=thickness;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=active?'#26ed64':'#f23838';ctx.shadowColor=active?'#12743c':'#721615';ctx.shadowBlur=8;const tipX=px+sign*size*.92,tipY=py-size*.62;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(tipX,tipY);ctx.stroke();ctx.beginPath();ctx.moveTo(tipX-sign*size*.4,tipY-size*.03);ctx.lineTo(tipX,tipY);ctx.lineTo(tipX-sign*size*.09,tipY+size*.4);ctx.stroke();ctx.restore()}}}
ctx.save();ctx.translate(shake+lean*.18,shake);ctx.fillStyle='#4b2c19';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.15,h*.85);ctx.lineTo(w*.85,h*.85);ctx.lineTo(w,h);ctx.fill();ctx.strokeStyle='#c99950';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(w*.15,h*.85);ctx.lineTo(w*.85,h*.85);ctx.stroke();ctx.restore()}
function finish(){mode='result';$('macPauseBtn').hidden=true;$('macResult').hidden=false;$('macResultText').textContent=`Hai raggiunto l’uscita in ${elapsed.toFixed(1)} secondi, con ${extra} ritorni al circuito. Prototipo: nessun premio o punto viene ancora assegnato.`;render()}
function update(dt){elapsed+=dt;if(turnProgress>0){turnProgress+=dt/curveDuration;if(turnProgress>=1){turnProgress=0;position=0;selected=null;if(stage>=3){finish();return}if(round){stage=0;extra++;round=0}}return}position+=settings[difficulty].speed*dt;if(position>=100){const good=selected===choices[stage];curveDirection=selected==='left'?1:-1;curveDuration=difficulty==='hard'?.34:difficulty==='normal'?.5:.76;turnProgress=.001;if(good){stage++;round=0}else{round=1}position=100;return}}
function render(){if(layer.hidden)return;draw();$('macDistance').textContent=`Scambio ${Math.min(stage+1,3)}/3`;$('macTime').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('macErrors').textContent=`Giri aggiuntivi: ${extra}`;const near=switchActive();$('macPrompt').hidden=!near;if(near)$('macPrompt').textContent=selected?`SCAMBIO IMPOSTATO: ${selected==='left'?'SINISTRA':'DESTRA'} ✓`:'SCAMBIO IN ARRIVO · AZIONA LA LEVA';leverUpdate()}
function loop(now){if(mode!=='run')return;const dt=Math.min(.05,(now-last)/1000||0);last=now;update(dt);render();if(mode==='run')raf=requestAnimationFrame(loop)}
$('macPauseBtn').onclick=pause;$('macResume').onclick=resume;$('macPauseRestart').onclick=start;$('macPauseMenu').onclick=menu;$('macStart').onclick=start;$('macRestart').onclick=()=>{mode='menu';start()};$('macClose').onclick=close;$('macMenuExit').onclick=close;$('macResultExit').onclick=close;$('macLeft').onclick=()=>choose('left');$('macRight').onclick=()=>choose('right');
const lever=$('macLever');
lever.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=lever.getBoundingClientRect();choose(e.clientX-r.left<r.width/2?'left':'right')});
lever.addEventListener('pointerup',e=>{if(e.target.closest('button'))return;const r=lever.getBoundingClientRect();choose(e.clientX-r.left<r.width/2?'left':'right')});
window.addEventListener('keydown',e=>{if(layer.hidden)return;if(e.key==='Escape'&&mode==='run'){e.preventDefault();e.stopImmediatePropagation();pause();return}if(e.key==='Escape'&&mode==='pause'){e.preventDefault();e.stopImmediatePropagation();resume();return}if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')choose('left');else choose('right')}},true);
window.addEventListener('resize',()=>{if(!layer.hidden)render()});
registry.register(gameId,{start:open,close,isOpen:()=>mode!=='closed',back});
})();
