/* Battaglia Navale – Fase B: tre strategie IA senza conoscenza delle navi nascoste. */
(function(){
'use strict';
const root=document.getElementById('pavilionBattleship');
if(!root)return;
const $=id=>document.getElementById(id);
const ships=[{id:'galeazza',name:'Galeazza',length:5},{id:'galea-grossa',name:'Galea grossa',length:4},{id:'galea-guerra',name:'Galea da guerra',length:3},{id:'galeotta',name:'Galeotta',length:3},{id:'fusta',name:'Fusta',length:2}];
let board=null,phase='closed',selectedDifficulty='normale',matchId=0;
let deployment=null, selectedShipId='galeazza';
/* F1: un solo timer di combattimento, sospendibile e annullabile.
   Le azioni vengono risolte in sequenza e i 500 ms di ogni impatto
   sono conservati anche durante la pausa. */
const NAVAL_IMPACT_MS=500;
let combatTimer=null,combatAction=null,combatRemaining=0,combatStarted=0;
let combatStage=null,activeImpact=null;
function cancelCombat(){
 if(combatTimer!==null)clearTimeout(combatTimer);
 combatTimer=null;combatAction=null;combatStage=null;activeImpact=null;combatRemaining=0;combatStarted=0;
}
function scheduleCombat(action,delay=NAVAL_IMPACT_MS){
 if(combatTimer!==null)clearTimeout(combatTimer);
 combatAction=action;combatRemaining=delay;combatStarted=Date.now();
 const token=matchId;
 combatTimer=setTimeout(()=>{
   combatTimer=null;combatAction=null;combatRemaining=0;
   if(matchId!==token||phase!=='playing')return;
   action();
 },delay);
}
function suspendCombat(){
 if(combatTimer===null)return;
 clearTimeout(combatTimer);combatTimer=null;
 combatRemaining=Math.max(0,combatRemaining-(Date.now()-combatStarted));
}
function continueCombat(){
 if(combatAction&&combatTimer===null){const action=combatAction;scheduleCombat(action,combatRemaining);}
}
function animateShot(side,index,hit,sunk){
 activeImpact={side,index,kind:sunk?'sunk':hit?'hit':'water'};
 render(side==='enemy'?'Colpo della flotta genovese in corso…':'Attacco avversario in corso…');
}

/* Fase E: record locali per difficolta. Nessun collegamento a punti/lire. */
const navalRecordKey='esposizione1892.battagliaNavale.records.v1';
const navalDifficulties=['facile','normale','difficile'];
let navalRecords=loadNavalRecords();
function loadNavalRecords(){
 try{
  const raw=JSON.parse(localStorage.getItem(navalRecordKey)||'{}');
  if(!raw||typeof raw!=='object')return {};
  const clean={};
  for(const difficulty of navalDifficulties){
   const value=raw[difficulty];
   if(value&&Number.isInteger(value.score)&&value.score>=0&&value.score<=1000
     &&Number.isFinite(value.accuracy)&&value.accuracy>=0&&value.accuracy<=100
     &&typeof value.victory==='boolean')clean[difficulty]=value;
  }
  return clean;
 }catch{return {};}
}
function persistNavalRecords(){
 try{localStorage.setItem(navalRecordKey,JSON.stringify(navalRecords));return true;}
 catch{return false;}
}
function calculateNavalResult(victory){
 const fired=board.playerShots.size;
 const hits=[...board.playerShots].filter(i=>board.enemy.occupied[i]).length;
 const accuracy=fired?Math.round(hits/fired*100):0;
 const survivors=board.player.units.filter(u=>!isSunk(u,board.enemyShots)).length;
 const sunkEnemies=board.enemy.units.filter(u=>isSunk(u,board.playerShots)).length;
 // Massimo 1000: vittoria 400, precisione 300, superstiti 200, efficienza 100.
 // Anche in sconfitta punti parziali per premiare il progresso, senza stelle.
 const precisionScore=Math.round(300*hits/Math.max(1,fired));
 const survivalScore=Math.round(200*survivors/5);
 const efficiencyScore=victory?Math.round(100*Math.min(1,17/Math.max(17,fired))):Math.round(100*sunkEnemies/5);
 const score=Math.max(0,Math.min(1000,(victory?400:0)+precisionScore+survivalScore+efficiencyScore));
 const stars=!victory?0:score>=900?3:score>=750?2:score>=600?1:0;
 return {score,stars,victory,accuracy,fired,hits,survivors,sunkEnemies};
}
function renderNavalRecords(){
 const record=navalRecords[$('navalDifficulty').value];
 $('navalMenuRecord').textContent=record
   ?`Record: ${record.score} punti · ${record.stars||0} stelle · Precisione ${record.accuracy}%`
   :'Nessun risultato salvato per questa difficoltà.';
}
function saveNavalResult(result){
 const existing=navalRecords[selectedDifficulty];
 const isNew=!existing||result.score>existing.score||(result.score===existing.score&&result.accuracy>existing.accuracy);
 if(isNew){navalRecords[selectedDifficulty]={...result,recordedAt:new Date().toISOString()};}
 const saved=isNew?persistNavalRecords():true;
 return {isNew,saved};
}

/* Fase D: audio dedicato e indipendente dalle altre attivita dell'Esposizione.
   Le tracce sono opzionali. L'assenza di un file non interrompe la partita.
   Gli effetti sono riprodotti per ciascun colpo, senza bloccare l'interazione. */
const navalAudioRoot='games/04-teatro-battaglie/audio/battaglia-navale/';
const navalAudioPaths={
 facile:'musiche/facile.mp3',normale:'musiche/normale.mp3',difficile:'musiche/difficile.mp3',
 acqua:'effetti/colpo-acqua.ogg',colpita:'effetti/nave-colpita.ogg',affondata:'effetti/nave-affondata.ogg'
};
const navalMusic=new Audio();
navalMusic.loop=true;navalMusic.preload='none';navalMusic.volume=.36;
const navalSfx=Object.create(null);
const navalActiveSfx=new Set();
let navalMusicEnabled=true,navalEffectsEnabled=true;
function syncNavalAudioControls(){
 $('navalMusicEnabled').checked=navalMusicEnabled;
 $('navalEffectsEnabled').checked=navalEffectsEnabled;
}
function clearNavalEffects(){
 for(const sound of navalActiveSfx){sound.pause();sound.removeAttribute('src');sound.load();}
 navalActiveSfx.clear();
}
function stopNavalMusic(){navalMusic.pause();navalMusic.currentTime=0;}
function syncNavalMusic(){
 if(phase!=='playing'||!navalMusicEnabled){navalMusic.pause();return;}
 const src=navalAudioRoot+navalAudioPaths[selectedDifficulty];
 if(navalMusic.dataset.track!==src){navalMusic.pause();navalMusic.src=src;navalMusic.dataset.track=src;navalMusic.load();}
 const promise=navalMusic.play();if(promise?.catch)promise.catch(()=>{});
}
function playNavalEffect(type){
 if(!navalEffectsEnabled||phase!=='playing')return;
 const path=navalAudioPaths[type];if(!path)return;
 // Un nuovo elemento per ogni colpo permette sovrapposizioni su partite veloci.
 const sound=new Audio(navalAudioRoot+path);
 sound.preload='auto';sound.volume=type==='affondata'?.75:.65;
 navalActiveSfx.add(sound);
 const cleanup=()=>{navalActiveSfx.delete(sound);sound.removeEventListener('ended',cleanup);sound.removeEventListener('error',cleanup);};
 sound.addEventListener('ended',cleanup);sound.addEventListener('error',cleanup);
 const promise=sound.play();if(promise?.catch)promise.catch(cleanup);
}
$('navalMusicEnabled').addEventListener('change',event=>{navalMusicEnabled=event.target.checked;syncNavalMusic();});
$('navalEffectsEnabled').addEventListener('change',event=>{navalEffectsEnabled=event.target.checked;if(!navalEffectsEnabled)clearNavalEffects();});

/* Fase F2: nessuna coppia di navi puo occupare caselle confinanti,
   nemmeno in diagonale. La regola vale per giocatore e IA. */
function forbiddenAround(cells){
 const blocked=new Set();
 for(const cell of cells){
   const x=cell%10,y=Math.floor(cell/10);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     const nx=x+dx,ny=y+dy;
     if(nx>=0&&nx<10&&ny>=0&&ny<10)blocked.add(ny*10+nx);
   }
 }
 return blocked;
}
function conflictsWithFleet(cells,units,exceptId=null){
 const proposed=new Set(cells);
 for(const unit of units){
   if(unit.id===exceptId)continue;
   for(const forbidden of forbiddenAround(unit.cells))if(proposed.has(forbidden))return true;
 }
 return false;
}
function createFleet(){
 // Ricominciamo l'intera disposizione in caso di incastro improbabile.
 // Il limite evita che un generatore casuale resti in un ciclo infinito.
 for(let restart=0;restart<250;restart++){
   const units=[];
   let success=true;
   for(const template of ships){
     const placements=[];
     for(const horizontal of [true,false])for(let y=0;y<10;y++)for(let x=0;x<10;x++){
       const cells=placementCells(x,y,template.length,horizontal);
       if(cells&&!conflictsWithFleet(cells,units))placements.push(cells);
     }
     if(!placements.length){success=false;break;}
     const cells=placements[Math.floor(Math.random()*placements.length)];
     units.push({...template,cells});
   }
   if(success){
     const occupied=new Array(100).fill(false);
     for(const unit of units)for(const cell of unit.cells)occupied[cell]=true;
     return {occupied,units};
   }
 }
 throw Error('Impossibile generare una flotta con la distanza richiesta');
}
function show(screen){$('navalMenu').hidden=screen!=='menu';$('navalPlay').hidden=screen!=='play';}
function showBattleView(active){$('navalDeployment').hidden=active;$('navalBattleBody').hidden=!active;$('navalPause').hidden=!active;}
function updateState(phaseNext){phase=phaseNext;$('navalPauseOverlay').hidden=phaseNext!=='paused';$('navalResultOverlay').hidden=phaseNext!=='results';}
function stopFullscreen(){if(document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});}
function open(){stopNavalMusic();clearNavalEffects();syncNavalAudioControls();deployment=null;board=null;root.hidden=false;selectedDifficulty=$('navalDifficulty').value;updateState('menu');show('menu');renderNavalRecords();$('navalStart').focus();}
function close(){cancelCombat();stopNavalMusic();clearNavalEffects();matchId++;deployment=null;board=null;updateState('closed');root.hidden=true;show('menu');stopFullscreen();window.EsposizionePavilions?.dismissGameHistory?.();}
function backMenu(){cancelCombat();stopNavalMusic();clearNavalEffects();matchId++;deployment=null;board=null;updateState('menu');show('menu');stopFullscreen();renderNavalRecords();$('navalStart').focus();}
function isSunk(unit,shots){return unit.cells.every(i=>shots.has(i));}
/* Fase F1.3: cinque sagome compatte, senza informazioni sui danni parziali. */
function renderEnemyFleetCompact(out, units, shots){
 out.classList.add('naval-fleet-compact');
 out.setAttribute('aria-label','Flotta nemica: stato delle cinque navi');
 for(const unit of units){
   const sunk=isSunk(unit,shots);
   const slot=document.createElement('div');
   slot.className='naval-enemy-icon'+(sunk?' is-sunk':'');
   slot.setAttribute('role','img');
   slot.setAttribute('aria-label',`${unit.name}: ${sunk?'affondata':'ancora in gioco'}`);
   slot.title=`${unit.name} — ${sunk?'Affondata':'Da affondare'}`;
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 100 76');
   svg.setAttribute('preserveAspectRatio','xMidYMid meet');
   svg.setAttribute('aria-hidden','true');
   svg.classList.add('naval-enemy-icon-art');
   const make=(tag,attrs)=>{
     const e=document.createElementNS('http://www.w3.org/2000/svg',tag);
     for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));
     svg.appendChild(e);
   };
   const beam=unit.length===5?19:unit.length===4?17:unit.length===2?12:15;
   make('path',{d:`M 50 3 Q ${50+beam} 16 ${50+beam-2} 38 L ${50+beam-3} 58 Q 50 75 ${50-beam+3} 58 L ${50-beam+2} 38 Q ${50-beam} 16 50 3 Z`,class:'naval-icon-hull'});
   make('path',{d:'M 50 10 L 50 61',class:'naval-icon-keel'});
   for(const y of [28,40,52])make('path',{d:`M ${50-beam+5} ${y} L ${50+beam-5} ${y}`,class:'naval-icon-deck'});
   const remi=unit.length>=4?[24,33,43,53]:unit.length===2?[34,48]:[29,40,51];
   for(const y of remi){
     make('path',{d:`M ${50-beam+3} ${y} L ${50-beam-9} ${y+4} M ${50+beam-3} ${y} L ${50+beam+9} ${y+4}`,class:'naval-icon-oar'});
   }
   const masts=unit.length>=4?[26,48]:[37];
   masts.forEach(y=>{
     make('ellipse',{cx:50,cy:y,rx:beam*.45,ry:7,class:'naval-icon-sail'});
     make('circle',{cx:50,cy:y,r:2,class:'naval-icon-mast'});
   });
   make('path',{d:'M 46 13 h 8 M 50 9 v 9',class:'naval-icon-cross'});
   slot.appendChild(svg);
   out.appendChild(slot);
 }
}
function fleetStatus(side){
  const out=$(side==='enemy'?'navalEnemyFleet':'navalPlayerFleet');out.replaceChildren();
  const unitList=board[side].units, shots=side==='enemy'?board.playerShots:board.enemyShots;
  if(side==='enemy'){renderEnemyFleetCompact(out,unitList,shots);return;}
  out.classList.remove('naval-fleet-compact');
  for(const unit of unitList){
    const hits=unit.cells.filter(i=>shots.has(i)).length;
    const sunk=hits===unit.length;
    const row=document.createElement('div');row.className='naval-ship-row'+(sunk?' is-sunk':hits?' is-damaged':'');
    const title=document.createElement('span');title.className='naval-ship-name';
    // Evita di rivelare i danni di una nave nemica non ancora affondata.
    title.textContent=side==='enemy'&&!sunk?'Nave da individuare':unit.name;
    const silhouette=document.createElement('span');silhouette.className='naval-ship-length';
    for(let i=0;i<unit.length;i++){const segment=document.createElement('i');
      if(side==='player'&&shots.has(unit.cells[i])||side==='enemy'&&sunk)segment.className='damaged';
      silhouette.appendChild(segment);
    }
    const status=document.createElement('span');status.className='naval-ship-status';
    status.textContent=sunk?'Affondata':side==='enemy'?(hits?'Colpita':'?'):(hits?`Danneggiata (${hits}/${unit.length})`:'Integra');
    row.append(title,silhouette,status);out.appendChild(row);
  }
}
/* Fase C3: sprite storici stilizzati della flotta genovese.
   Ogni tipologia di nave usa una sagoma distinta, piu dettagliata e con
   elementi araldici della Repubblica di Genova, restando sempre in SVG
   vettoriale per mantenere leggerezza e adattabilita sulle griglie. */
function shipIsHorizontal(unit){return unit.cells.length<2||unit.cells[1]===unit.cells[0]+1;}
function placeOnGrid(el,unit){
 const horizontal=shipIsHorizontal(unit);
 const start=unit.cells[0],x=start%10,y=Math.floor(start/10);
 // Sovrapposizione assoluta: lo sprite non partecipa al posizionamento
 // automatico dei 100 pulsanti della griglia.
 el.style.left=`${x*10}%`;
 el.style.top=`${y*10}%`;
 el.style.width=`${(horizontal?unit.length:1)*10}%`;
 el.style.height=`${(horizontal?1:unit.length)*10}%`;
 return horizontal;
}
const shipProfiles={
 'galeazza':{beam:25,stern:28,bow:16,hull:'#865238',deck:'#d2ab73',trim:'#5a2f22',sail:'#efe1c5',accent:'#a12824',oars:8,masts:[.22,.47,.72],gunports:[.16,.28,.4,.56,.72,.86],castle:'grand',ram:18,flag:true},
 'galea-grossa':{beam:21,stern:24,bow:14,hull:'#9b623f',deck:'#d5b27f',trim:'#5c3724',sail:'#efdfc2',accent:'#962924',oars:7,masts:[.34,.66],gunports:[.18,.34,.5,.66,.82],castle:'merchant',ram:12,flag:true},
 'galea-guerra':{beam:18,stern:20,bow:13,hull:'#a66a43',deck:'#dcb886',trim:'#583422',sail:'#f0dfc0',accent:'#8f201d',oars:6,masts:[.38,.7],gunports:[.22,.42,.62,.8],castle:'war',ram:15,flag:true},
 'galeotta':{beam:15,stern:16,bow:11,hull:'#876447',deck:'#cfb282',trim:'#4f3323',sail:'#efe3c9',accent:'#9e2b26',oars:5,masts:[.55],gunports:[.3,.5,.7],castle:'light',ram:10,flag:false},
 'fusta':{beam:12,stern:14,bow:9,hull:'#785438',deck:'#c8a56f',trim:'#482b1d',sail:'#efe5cf',accent:'#8d231f',oars:4,masts:[.52],gunports:[.36,.64],castle:'light',ram:9,flag:false}
};
function svgNode(parent,tag,attrs){
 const ns='http://www.w3.org/2000/svg';
 const el=document.createElementNS(ns,tag);
 for(const [k,v] of Object.entries(attrs||{}))el.setAttribute(k,String(v));
 parent.appendChild(el);return el;
}
function buildHullPath(L,profile){
 const back=14,front=L-12,b=profile.beam,stern=profile.stern,bow=profile.bow;
 return `M ${back} 50 C ${back+8} ${50-b-stern*0.1}, ${L*.18} ${50-b}, ${L*.34} ${50-b+2} L ${L*.66} ${50-b+2} C ${L*.8} ${50-b+1}, ${front-16} ${50-bow}, ${front} 50 C ${front-16} ${50+bow}, ${L*.8} ${50+b-1}, ${L*.66} ${50+b-2} L ${L*.34} ${50+b-2} C ${L*.18} ${50+b}, ${back+8} ${50+b+stern*0.1}, ${back} 50 Z`;
}
function drawFlag(group,x,y,colorMain,colorCross,size=10){
 svgNode(group,'path',{d:`M ${x} ${y} l ${size*1.2} ${-size*0.45} l 0 ${size*0.9} Z`,class:'naval-art-flag',fill:colorMain,stroke:colorCross,'stroke-width':1.8});
 svgNode(group,'path',{d:`M ${x+size*.35} ${y-size*.28} v ${size*.56} M ${x+size*.05} ${y} h ${size*.6}`,class:'naval-art-flag-cross'});
}
function drawSail(group,cx,profile,L,index){
 const mastY=50;const height=profile.beam+8+(profile.id==='galeazza'?3:0);
 svgNode(group,'line',{x1:cx,y1:28,x2:cx,y2:72,class:'naval-art-mast'});
 const top=32,bottom=68;
 const lateen=index%2===0;
 if(lateen){
   svgNode(group,'path',{d:`M ${cx-4} ${mastY} C ${cx+7} ${top-8}, ${cx+18} ${top-8}, ${cx+22} ${top+2} C ${cx+10} ${top+10}, ${cx+6} ${bottom-6}, ${cx-3} ${bottom-1} C ${cx-7} ${bottom-5}, ${cx-10} ${mastY+5}, ${cx-4} ${mastY} Z`,class:'naval-art-sail'});
   svgNode(group,'line',{x1:cx-1,y1:50,x2:cx+17,y2:34,class:'naval-art-yard'});
 }else{
   svgNode(group,'ellipse',{cx:cx+5,cy:50,rx:16,ry:14,class:'naval-art-sail'});
   svgNode(group,'path',{d:`M ${cx-2} 38 Q ${cx+10} 50 ${cx-2} 62`,class:'naval-art-sail-seam'});
 }
 svgNode(group,'circle',{cx,cy:mastY,r:3.2,class:'naval-art-mast-ring'});
}
function drawHistoricalShip(unit,state={}){
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 const horizontal=shipIsHorizontal(unit);
 const length=unit.length;
 const w=horizontal?length*100:100,h=horizontal?100:length*100;
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
 svg.setAttribute('preserveAspectRatio','none');
 svg.setAttribute('aria-hidden','true');
 svg.classList.add('naval-ship-art',`naval-ship-art--${unit.id}`);
 if(state.revealed)svg.classList.add('is-revealed');
 if(state.hitCells?.length)svg.classList.add('is-damaged');
 if(state.sunk)svg.classList.add('is-sunk');
 placeOnGrid(svg,unit);
 svg.style.setProperty('--ship-units',String(length));
 const profile={id:unit.id,...shipProfiles[unit.id]};
 const group=document.createElementNS(ns,'g');
 if(!horizontal)group.setAttribute('transform',`translate(100 0) rotate(90)`);
 const L=length*100;
 svgNode(group,'path',{d:buildHullPath(L,profile),class:'naval-art-shadow'});
 svgNode(group,'path',{d:buildHullPath(L,profile),class:'naval-art-hull',fill:profile.hull});
 svgNode(group,'path',{d:`M 28 50 C 50 ${50-profile.beam+7}, ${L-44} ${50-profile.beam+7}, ${L-28} 50 C ${L-44} ${50+profile.beam-7}, 50 ${50+profile.beam-7}, 28 50 Z`,class:'naval-art-deck',fill:profile.deck});
 svgNode(group,'path',{d:`M 30 50 H ${L-34}`,class:'naval-art-keel'});
 for(let i=1;i<Math.max(2,Math.floor(L/48));i++){
   const x=28+i*(L-60)/Math.max(2,Math.floor(L/48));
   svgNode(group,'line',{x1:x,y1:50-profile.beam+9,x2:x,y2:50+profile.beam-9,class:'naval-art-plank'});
 }
 svgNode(group,'path',{d:`M 34 ${50-profile.beam+5} H ${L-38} M 34 ${50+profile.beam-5} H ${L-38}`,class:'naval-art-rail'});
 const oars=profile.oars;
 for(let i=0;i<oars;i++){
   const x=44+i*(L-88)/Math.max(1,oars-1);
   svgNode(group,'line',{x1:x,y1:50-profile.beam+7,x2:x+8,y2:8,class:'naval-art-oar'});
   svgNode(group,'line',{x1:x,y1:50+profile.beam-7,x2:x+8,y2:92,class:'naval-art-oar'});
 }
 for(const rel of profile.gunports||[]){
   const gx=L*rel;
   svgNode(group,'circle',{cx:gx,cy:50-profile.beam+6,r:2.6,class:'naval-art-gunport'});
   svgNode(group,'circle',{cx:gx,cy:50+profile.beam-6,r:2.6,class:'naval-art-gunport'});
 }
 // Castelli di poppa e prua
 const sternW=profile.castle==='grand'?28:profile.castle==='merchant'?24:profile.castle==='war'?22:18;
 const foreW=profile.castle==='grand'?20:profile.castle==='merchant'?17:14;
 svgNode(group,'path',{d:`M 18 ${50-sternW/2} Q 11 50 18 ${50+sternW/2} L 38 ${50+sternW/2-2} L 38 ${50-sternW/2+2} Z`,class:'naval-art-castle'});
 svgNode(group,'path',{d:`M ${L-40} ${50-foreW/2} L ${L-24} ${50-foreW/2+2} Q ${L-10} 50 ${L-24} ${50+foreW/2-2} L ${L-40} ${50+foreW/2} Z`,class:'naval-art-forecastle'});
 if(profile.ram){svgNode(group,'path',{d:`M ${L-24} 50 l ${profile.ram} -6 l -3 6 l 3 6 Z`,class:'naval-art-ram'});}
 // Masti e vele
 profile.masts.forEach((rel,idx)=>drawSail(group,L*rel,profile,L,idx));
 // Emblema genovese sul ponte centrale
 if(length>=3){
   const ex=L*.54, ey=50;
   svgNode(group,'circle',{cx:ex,cy:ey,r:length>=5?8.2:6.6,class:'naval-art-emblem-disc'});
   svgNode(group,'path',{d:`M ${ex} ${ey-5} v 10 M ${ex-5} ${ey} h 10`,class:'naval-art-cross'});
 }
 // bandiere / stendardi
 if(profile.flag){
   drawFlag(group,26,26,'#f4ecda','#972322',10);
   if(length>=4)drawFlag(group,L-48,28,'#f4ecda','#972322',9);
 }
 // dettagli specifici
 if(unit.id==='galeazza'){
   for(const y of [31,69])svgNode(group,'path',{d:`M ${L*.21} ${y} H ${L*.77}`,class:'naval-art-battery'});
 }
 if(unit.id==='galea-grossa'){
   svgNode(group,'rect',{x:L*.4,y:40,width:36,height:20,rx:4,class:'naval-art-cargo'});
 }
 if(unit.id==='galea-guerra'){
   svgNode(group,'path',{d:`M ${L*.36} 39 L ${L*.56} 50 L ${L*.36} 61`,class:'naval-art-insignia'});
 }
 if(unit.id==='galeotta'){
   svgNode(group,'path',{d:`M ${L*.46} 50 q 12 -12 24 0 q -12 12 -24 0`,class:'naval-art-insignia'});
 }
 if(unit.id==='fusta'){
   svgNode(group,'path',{d:`M ${L*.48} 43 L ${L*.58} 50 L ${L*.48} 57`,class:'naval-art-insignia'});
 }
 svg.appendChild(group);
 return svg;
}
function makeShipSilhouette(unit,state={}){return drawHistoricalShip(unit,state);}
function makeImpactMarker(cellIndex,kind='hit'){
 const marker=document.createElement('span');
 marker.className=`naval-impact naval-impact--${kind}`;
 marker.setAttribute('aria-hidden','true');
 marker.style.left=`${cellIndex%10*10}%`;
 marker.style.top=`${Math.floor(cellIndex/10)*10}%`;
 marker.style.width='10%';
 marker.style.height='10%';
 marker.innerHTML=kind==='sunk'?'<i></i><b></b>':'<i></i>';
 return marker;
}
function overlayFleetArtwork(grid,units,options={}){
 grid.classList.add('naval-grid-with-ships');
 const shots=options.shots||new Set();
 const revealSunkOnly=!!options.revealSunkOnly;
 for(const unit of units){
   const hitCells=unit.cells.filter(i=>shots.has(i));
   const sunk=hitCells.length===unit.length&&unit.length>0;
   const revealed=!revealSunkOnly||sunk;
   if(revealed)grid.appendChild(makeShipSilhouette(unit,{revealSunkOnly,revealed,hitCells,sunk}));
   // Sulla griglia nemica le celle mostrano già X rossa o puntino bianco:
   // niente secondo simbolo sovrapposto. Manteniamo gli effetti sulla flotta propria.
   if(!options.simpleEnemyMarkers){
     for(const cellIndex of hitCells)grid.appendChild(makeImpactMarker(cellIndex,sunk?'sunk':'hit'));
   }
  }
}
function won(fleet,shots){return fleet.occupied.every((hasShip,i)=>!hasShip||shots.has(i));}
function render(message){
 if(!board)return;
 $('battleshipMessage').textContent=message;
 $('navalTurn').textContent=phase==='paused'?'In pausa':phase==='results'?'Battaglia conclusa':combatStage==='player'?'Attacco genovese':combatStage==='enemy'?'Turno avversario':board.turn?'Il tuo turno':'Turno avversario';
 for(const side of ['enemy','player']){
   const area=$(side==='enemy'?'battleshipEnemy':'battleshipPlayer');area.replaceChildren();
   const targetShots=side==='enemy'?board.playerShots:board.enemyShots;
   const occupied=board[side].occupied;
   const units=board[side].units;
   for(let i=0;i<100;i++){
     const shot=targetShots.has(i),ship=occupied[i];
     const cell=document.createElement(side==='enemy'?'button':'span');cell.className='battle-cell';
     if(side==='player'&&ship)cell.classList.add('ship');
     if(shot){cell.classList.add(ship?'hit':'miss');cell.textContent=ship?'×':'•';
       if(ship&&units.some(unit=>unit.cells.includes(i)&&isSunk(unit,targetShots)))cell.classList.add('sunk');
     }
     if(side==='enemy'){
       cell.type='button';cell.setAttribute('aria-label',`Colonna ${i%10+1}, riga ${Math.floor(i/10)+1}${shot?', già bersagliata':''}`);
       cell.disabled=shot||!board.turn||phase!=='playing';cell.addEventListener('click',()=>fire(i));
     }
     area.appendChild(cell);
   }
 }
 overlayFleetArtwork($('battleshipEnemy'),board.enemy.units,{shots:board.playerShots,revealSunkOnly:true,simpleEnemyMarkers:true});
 overlayFleetArtwork($('battleshipPlayer'),board.player.units,{shots:board.enemyShots});
 if(activeImpact){
   const grid=$(activeImpact.side==='enemy'?'battleshipEnemy':'battleshipPlayer');
   const marker=document.createElement('span');
   marker.className='naval-shot-animation naval-shot-animation--'+activeImpact.kind;
   // Il marker vive esclusivamente dentro la casella colpita: non e un
   // elemento della griglia 10x10 e non puo spostare le altre celle.
   marker.setAttribute('aria-hidden','true');
   marker.innerHTML='<i></i><b></b><em></em>';
   const cell=grid.children[activeImpact.index];
   if(cell)cell.appendChild(marker);
 }

 fleetStatus('enemy');fleetStatus('player');
 const playerHits=[...board.playerShots].filter(i=>board.enemy.occupied[i]).length;
 const sunkEnemies=board.enemy.units.filter(unit=>isSunk(unit,board.playerShots)).length;
 $('battleshipStats').textContent=`Colpi: ${board.playerShots.size} · A segno: ${playerHits}/17 · Navi affondate: ${sunkEnemies}/5`;
}
/* L'IA decide esclusivamente dai colpi già effettuati, da quelli andati a segno
   e dalle navi dichiarate affondate. Mai consultare la posizione delle navi
   per la scelta della prossima casella. */
function neighbors(i){
 const x=i%10,y=Math.floor(i/10),result=[];
 if(x>0)result.push(i-1);
 if(x<9)result.push(i+1);
 if(y>0)result.push(i-10);
 if(y<9)result.push(i+10);
 return result;
}
function randomChoice(list){return list[Math.floor(Math.random()*list.length)];}
function enemyAim(){
 const shots=board.enemyShots;
 const available=Array.from({length:100},(_,i)=>i).filter(i=>!shots.has(i));
 if(!available.length)return null;
 if(selectedDifficulty==='facile')return randomChoice(available);
 // Le caselle di una nave affondata non sono piu bersagli utili.
 const unresolved=[...board.aiHits].filter(i=>!board.aiSunkCells.has(i));
 const pending=new Set(available);
 const adjacent=new Set();
 unresolved.forEach(i=>neighbors(i).forEach(n=>{if(pending.has(n))adjacent.add(n);}));
 if(selectedDifficulty==='normale'){
   return adjacent.size?randomChoice([...adjacent]):randomChoice(available);
 }
 // Difficile: se ci sono due colpi allineati, continua lungo lo stesso asse.
 const aligned=new Set();
 for(const hit of unresolved){
   for(const other of unresolved){
     if(hit===other)continue;
     if(Math.floor(hit/10)===Math.floor(other/10)){
       const y=Math.floor(hit/10),lo=Math.min(hit%10,other%10),hi=Math.max(hit%10,other%10);
       for(const x of [lo-1,hi+1])if(x>=0&&x<10&&pending.has(y*10+x))aligned.add(y*10+x);
       for(let x=lo+1;x<hi;x++)if(pending.has(y*10+x))aligned.add(y*10+x);
     }
     if(hit%10===other%10){
       const x=hit%10,lo=Math.min(Math.floor(hit/10),Math.floor(other/10)),hi=Math.max(Math.floor(hit/10),Math.floor(other/10));
       for(const y of [lo-1,hi+1])if(y>=0&&y<10&&pending.has(y*10+x))aligned.add(y*10+x);
       for(let y=lo+1;y<hi;y++)if(pending.has(y*10+x))aligned.add(y*10+x);
     }
   }
 }
 if(aligned.size)return randomChoice([...aligned]);
 if(adjacent.size)return randomChoice([...adjacent]);
 // Caccia a scacchiera: utile per una flotta la cui nave minima occupa 2 caselle.
 const parity=available.filter(i=>((i%10+Math.floor(i/10))%2)===board.aiParity);
 return randomChoice(parity.length?parity:available);
}
function registerEnemyShot(target){
 board.enemyShots.add(target);
 if(board.player.occupied[target]){
   board.aiHits.add(target);
   const sunk=board.player.units.find(u=>u.cells.includes(target)&&isSunk(u,board.enemyShots));
   if(sunk)sunk.cells.forEach(i=>board.aiSunkCells.add(i));
   return sunk;
 }
 return null;
}
function getShip(id){return ships.find(s=>s.id===id);}
function placementCells(x,y,length,horizontal){
 if(x<0||y<0||x+(horizontal?length:1)>10||y+(horizontal?1:length)>10)return null;
 return Array.from({length},(_,i)=>(y+(horizontal?0:i))*10+x+(horizontal?i:0));
}
function makeDeployment(){
 const fleet=createFleet();
 return fleet.units.map(unit=>({...unit,cells:[...unit.cells],horizontal:unit.cells.length<2||unit.cells[1]===unit.cells[0]+1}));
}
function deploymentOccupied(exceptId=null){
 const occupied=new Set();
 for(const unit of deployment)if(unit.id!==exceptId)unit.cells.forEach(i=>occupied.add(i));
 return occupied;
}
function sayDeploy(message,invalid=false){const target=$('navalDeployFeedback');target.textContent=message;target.classList.toggle('is-error',invalid);}
function renderDeployment(){
 if(!deployment)return;
 const selected=deployment.find(u=>u.id===selectedShipId);
 const grid=$('navalDeployGrid');grid.replaceChildren();
 const cellShips=new Map();deployment.forEach(unit=>unit.cells.forEach(cell=>cellShips.set(cell,unit)));
 for(let i=0;i<100;i++){
   const unit=cellShips.get(i),cell=document.createElement('button');cell.type='button';cell.className='battle-cell naval-deploy-cell';
   if(unit){cell.classList.add('ship');if(unit.id===selectedShipId)cell.classList.add('naval-deploy-active');}
   cell.setAttribute('aria-label',`Colonna ${i%10+1}, riga ${Math.floor(i/10)+1}${unit?', '+unit.name:''}`);
   cell.title=unit?unit.name:`Posiziona ${selected.name}`;
   cell.addEventListener('click',()=>{
     // Toccare una nave diversa la seleziona; toccare una casella libera o la nave selezionata la sposta.
     if(unit&&unit.id!==selectedShipId){selectedShipId=unit.id;renderDeployment();sayDeploy(`${unit.name} selezionata. Tocca una casella per spostarla.`);return;}
     moveShipTo(i);
   });
   grid.appendChild(cell);
 }
 overlayFleetArtwork(grid,deployment,{preview:true});
 const list=$('navalDeployShips');list.replaceChildren();
 for(const unit of deployment){
   const button=document.createElement('button');button.type='button';button.className='naval-deploy-ship'+(unit.id===selectedShipId?' is-selected':'');
   button.setAttribute('aria-pressed',String(unit.id===selectedShipId));
   const name=document.createElement('span');name.textContent=unit.name;
   const length=document.createElement('small');length.textContent=`${unit.length} caselle · ${unit.horizontal?'Orizzontale':'Verticale'}`;
   button.append(name,length);button.addEventListener('click',()=>{selectedShipId=unit.id;renderDeployment();sayDeploy(`${unit.name} selezionata.`);});list.appendChild(button);
 }
 $('navalDeploySelected').textContent=`Selezionata: ${selected.name} (${selected.length} caselle) · ${selected.horizontal?'orizzontale':'verticale'}`;
 $('navalDeployRotate').setAttribute('aria-label',`Ruota ${selected.name}`);
}
function moveShipTo(index){
 const unit=deployment.find(u=>u.id===selectedShipId),x=index%10,y=Math.floor(index/10);
 const cells=placementCells(x,y,unit.length,unit.horizontal);
 if(!cells){sayDeploy('La nave non entra nella griglia in questa posizione.',true);return;}
 if(conflictsWithFleet(cells,deployment,unit.id)){sayDeploy('Posizione non valida: lascia almeno una casella libera tra le navi, anche in diagonale.',true);return;}
 unit.cells=cells;renderDeployment();sayDeploy(`${unit.name} posizionata correttamente.`);
}
function rotateShip(){
 const unit=deployment.find(u=>u.id===selectedShipId),start=unit.cells[0];
 const cells=placementCells(start%10,Math.floor(start/10),unit.length,!unit.horizontal);
 if(!cells||conflictsWithFleet(cells,deployment,unit.id)){sayDeploy('Rotazione impossibile: mantieni una casella libera anche in diagonale.',true);return;}
 unit.horizontal=!unit.horizontal;unit.cells=cells;renderDeployment();sayDeploy(`${unit.name}: orientamento ${unit.horizontal?'orizzontale':'verticale'}.`);
}
function prepareBattle(){
 cancelCombat();stopNavalMusic();clearNavalEffects();matchId++;board=null;selectedDifficulty=$('navalDifficulty').value;
 $('navalLevel').textContent=selectedDifficulty.charAt(0).toUpperCase()+selectedDifficulty.slice(1);
 deployment=makeDeployment();selectedShipId='galeazza';updateState('preparing');show('play');showBattleView(false);
 $('navalTurn').textContent='Preparazione';renderDeployment();sayDeploy('Le navi devono essere separate da almeno una casella d’acqua, anche in diagonale. Seleziona una nave per personalizzarla.');
}
function newBattle(){
 if(!deployment)return prepareBattle();
 cancelCombat();stopNavalMusic();clearNavalEffects();matchId++;
 const occupied=new Array(100).fill(false);
 const units=deployment.map(unit=>({...unit,cells:[...unit.cells]}));
 units.forEach(unit=>unit.cells.forEach(i=>occupied[i]=true));
 board={enemy:createFleet(),player:{occupied,units},enemyShots:new Set(),playerShots:new Set(),turn:true,aiHits:new Set(),aiSunkCells:new Set(),aiParity:Math.floor(Math.random()*2)};
 updateState('playing');show('play');showBattleView(true);render('Il tuo turno: seleziona una casella della flotta nemica.');syncNavalMusic();
}
function finish(victory,message){
 stopNavalMusic();clearNavalEffects();updateState('results');
 const result=calculateNavalResult(victory);
 const record=saveNavalResult(result);
 $('navalResultTitle').textContent=victory?'Vittoria!':'Sconfitta';
 $('navalResultText').textContent=`${message} · Difficoltà: ${selectedDifficulty}`;
 $('navalResultScore').textContent=`${result.score} / 1000 punti`;
 $('navalResultStars').textContent='★'.repeat(result.stars)+'☆'.repeat(3-result.stars);
 $('navalResultStars').setAttribute('aria-label',`${result.stars} stelle su 3`);
 $('navalResultDetails').textContent=`Precisione: ${result.accuracy}% · Colpi a segno: ${result.hits}/17 · Tiri effettuati: ${result.fired} · Navi superstiti: ${result.survivors}/5 · Navi nemiche affondate: ${result.sunkEnemies}/5`;
 $('navalResultRecord').textContent=record.isNew?(record.saved?'Nuovo record salvato su questo dispositivo!':'Nuovo record della sessione (salvataggio locale non disponibile).'):'Risultato completato: puoi rigiocare per migliorare il record.';
 renderNavalRecords();render(message);
}
function fire(i){
 if(!board||phase!=='playing'||!board.turn||board.playerShots.has(i)||combatStage)return;
 board.turn=false;combatStage='player';
 board.playerShots.add(i);
 const playerHit=board.enemy.occupied[i];
 const sunk=board.enemy.units.find(unit=>unit.cells.includes(i)&&isSunk(unit,board.playerShots));
 playNavalEffect(sunk?'affondata':playerHit?'colpita':'acqua');
 animateShot('enemy',i,playerHit,!!sunk);
 const opening=sunk?`Hai affondato ${sunk.name}!`:playerHit?'Colpito!':'Acqua!';
 scheduleCombat(()=>{
   activeImpact=null;
   if(won(board.enemy,board.playerShots)){
     combatStage=null;finish(true,'Hai affondato l’intera flotta nemica');return;
   }
   combatStage='enemy';
   const target=enemyAim();
   if(target===null){combatStage=null;finish(true,'Nessuna casella nemica disponibile');return;}
   const enemySunk=registerEnemyShot(target);
   playNavalEffect(enemySunk?'affondata':board.player.occupied[target]?'colpita':'acqua');
   animateShot('player',target,board.player.occupied[target],!!enemySunk);
   const reply=enemySunk?`Il nemico ha affondato ${enemySunk.name}.`:board.player.occupied[target]?'Il nemico ha colpito una tua nave.':'Il nemico ha mancato il bersaglio.';
   scheduleCombat(()=>{
     activeImpact=null;combatStage=null;
     if(won(board.player,board.enemyShots)){finish(false,'La tua flotta è stata affondata');return;}
     board.turn=true;render(`${opening} ${reply} Tocca a te.`);
   });
 });
}
function pause(){
 if(phase!=='playing')return;
 suspendCombat();navalMusic.pause();clearNavalEffects();updateState('paused');
 render('Partita in pausa.');$('navalResume').focus();
}
function resume(){
 if(phase!=='paused')return;
 updateState('playing');
 render(combatStage?'Attacco in corso…':'Partita ripresa: seleziona una casella nemica.');
 syncNavalMusic();continueCombat();
}
$('navalDifficulty').addEventListener('change',renderNavalRecords);
$('navalStart').addEventListener('click',prepareBattle);
$('navalDeployRotate').addEventListener('click',rotateShip);
$('navalDeployRandom').addEventListener('click',()=>{deployment=makeDeployment();renderDeployment();sayDeploy('Nuova disposizione casuale generata.');});
$('navalDeployConfirm').addEventListener('click',newBattle);
$('navalDeployMenu').addEventListener('click',backMenu);
$('navalRules').addEventListener('click',()=>{$('navalRulesText').hidden=!$('navalRulesText').hidden;});
$('battleshipClose').addEventListener('click',close);
$('navalPause').addEventListener('click',pause);
$('navalResume').addEventListener('click',resume);
$('battleshipNew').addEventListener('click',newBattle);
$('navalBackMenu').addEventListener('click',backMenu);
$('navalAgain').addEventListener('click',newBattle);
$('navalResultMenu').addEventListener('click',backMenu);
$('navalResultExit').addEventListener('click',close);
$('navalFullscreen').addEventListener('click',()=>{if(document.fullscreenElement===root)stopFullscreen();else root.requestFullscreen?.().catch(()=>{});});
window.EsposizioneMinigames.register('battleship',{start:open,close,isOpen:()=>!root.hidden,back(){if(phase==='playing'||phase==='paused'||phase==='results'||phase==='preparing'){backMenu();return true;}close();return true;}});
})();
