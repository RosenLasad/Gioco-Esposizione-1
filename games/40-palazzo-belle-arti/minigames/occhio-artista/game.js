(function(){
'use strict';
const ID='occhio-artista', KEY='esposizione-occhio-artista-v1', catalog=window.OcchioArtistaQuadri||[];
const tiers=['facile','media','difficile'];
let root,run=null,settings={music:false,effects:true,timer:false},screen='menu',paused=false,started=0,elapsed=0,zoom=false,noticeTimer=0,zoomFactor=1,baseFrameWidth=0,gesture=null,suppressClicksUntil=0,touchStartPoint=null;
const $=(id)=>root.querySelector('#'+id);
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v.settings)settings={...settings,...v.settings};if(validRun(v.run))run=v.run;}catch(e){}}
function validRun(r){return !!r&&Array.isArray(r.sequence)&&r.sequence.length===15&&r.sequence.every(id=>catalog.some(c=>c.id===id))&&Number.isInteger(r.position)&&r.position>=0&&r.position<=15&&Array.isArray(r.found);}
function save(){try{localStorage.setItem(KEY,JSON.stringify({settings,run}));}catch(e){message('Salvataggio non disponibile su questo browser.');}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function createRun(){const ordered=[];for(const t of tiers){const options=shuffle(catalog.filter(c=>c.difficulty===t).map(c=>c.id));if(options.length<5){message('Servono almeno cinque coppie per ogni difficoltà.');return;}ordered.push(...options.slice(0,5));}run={sequence:ordered,position:0,found:[],seconds:0,completed:false};save();play();}
function current(){return catalog.find(c=>c.id===run?.sequence[run.position]);}
function syncTime(){if(screen==='play'&&!paused&&settings.timer){run.seconds=(run.seconds||0)+Math.max(0,Math.floor((Date.now()-started)/1000));started=Date.now();save();}}
function stop(){gesture=null;syncTime();screen='menu';paused=false;root.hidden=true;root.classList.remove('oa-playing');document.removeEventListener('keydown',onKey);}
function showMenu(){syncTime();screen='menu';paused=false;render();}
function message(s){if(!root)return;const el=$('oaMessage');if(el)el.textContent=s;}
function play(){if(!run||run.position>=15){showMenu();return;}screen='play';paused=false;zoom=false;zoomFactor=1;baseFrameWidth=0;gesture=null;started=Date.now();render();}

// Ingrandimento reale: le cornici crescono nel layout, senza sovrapporsi.
function setZoomFactor(value, keepScroll=false){
 const gallery=root.querySelector('.oa-gallery');
 if(!gallery)return;
 const factor=Math.max(1,Math.min(3,value));
 if(!baseFrameWidth){baseFrameWidth=$('oaFrame1').getBoundingClientRect().width;}
 zoomFactor=factor;zoom=factor>1.001;
 gallery.classList.toggle('oa-gallery-zoom',zoom);
 for(const id of ['oaFrame1','oaFrame2']){
  const frame=$(id);frame.classList.toggle('oa-zoom',zoom);
  frame.style.width=zoom?(baseFrameWidth*factor)+'px':'';
 }
 if(!keepScroll)gallery.scrollTo(0,0);
 $('oaZoom').setAttribute('aria-label',zoom?'Riduci i quadri':'Ingrandisci i quadri');
 $('oaZoom').title=zoom?'Riduci i quadri':'Ingrandisci i quadri';
 $('oaZoom').setAttribute('aria-pressed',String(zoom));
}
function fingerDistance(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);}
function pinchStart(e){
 if(screen!=='play'||paused)return;
 if(e.touches.length===1){touchStartPoint={x:e.touches[0].clientX,y:e.touches[0].clientY};return;}
 if(e.touches.length!==2)return;
 const gallery=root.querySelector('.oa-gallery');
 const r=gallery.getBoundingClientRect();
 gesture={distance:Math.max(1,fingerDistance(e.touches[0],e.touches[1])),startFactor:zoomFactor,
  x:(e.touches[0].clientX+e.touches[1].clientX)/2-r.left,
  y:(e.touches[0].clientY+e.touches[1].clientY)/2-r.top};
 touchStartPoint=null;suppressClicksUntil=Date.now()+800;
 if(e.cancelable)e.preventDefault();
}
function pinchMove(e){
 if(screen!=='play'||paused)return;
 if(gesture&&e.touches.length>=2){
  if(e.cancelable)e.preventDefault();
  const gallery=root.querySelector('.oa-gallery');
  const prev=zoomFactor, next=Math.max(1,Math.min(3,gesture.startFactor*fingerDistance(e.touches[0],e.touches[1])/gesture.distance));
  const oldX=gallery.scrollLeft,oldY=gallery.scrollTop;
  setZoomFactor(next,true);
  const ratio=next/prev;
  // Mantiene il dettaglio vicino al centro del gesto durante l'ingrandimento.
  gallery.scrollLeft=(oldX+gesture.x)*ratio-gesture.x;
  gallery.scrollTop=(oldY+gesture.y)*ratio-gesture.y;
  suppressClicksUntil=Date.now()+800;
 }else if(touchStartPoint&&e.touches.length===1){
  const t=e.touches[0];
  if(Math.hypot(t.clientX-touchStartPoint.x,t.clientY-touchStartPoint.y)>8)suppressClicksUntil=Date.now()+500;
 }
}
function pinchEnd(e){
 if(gesture){suppressClicksUntil=Date.now()+650;if(e.cancelable)e.preventDefault();}
 if(e.touches.length<2)gesture=null;
 if(e.touches.length===0)touchStartPoint=null;
}
function mark(x,y){const c=current();if(!c)return;const found=new Set(run.found);let hit=null;for(const d of c.differences){if(found.has(d.id))continue;const dx=(x-d.x)/d.rx,dy=(y-d.y)/d.ry;if(dx*dx+dy*dy<=1){hit=d;break;}}if(!hit){message('Osserva ancora: qui non c’è una differenza.');return;}run.found.push(hit.id);save();if(settings.effects)beep();renderMarkers();message('Differenza trovata!');if(run.found.length>=c.differences.length){syncTime();paused=true;$('oaResultText').textContent='Hai trovato tutte le '+c.differences.length+' differenze!';$('oaResult').hidden=false;}}
let audio;function beep(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=680;g.gain.value=.025;o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.1);}catch(e){}}
function next(){if(!run)return;run.position++;run.found=[];run.seconds=0;run.completed=run.position===15;save();if(run.completed){showMenu();message('Complimenti! Hai completato tutti i quindici livelli.');}else play();}
function renderMarkers(){const layer=$('oaHitlayer');if(!layer||!run)return;layer.replaceChildren();for(const d of current().differences.filter(d=>run.found.includes(d.id))){const mark=document.createElement('span');mark.className='oa-found';mark.style.left=d.x+'%';mark.style.top=d.y+'%';mark.style.width=d.rx*2+'%';mark.style.height=d.ry*2+'%';layer.append(mark);} $('oaCounter').textContent=run.found.length+' / '+current().differences.length+' differenze';}
function render(){if(!root)return;const menu=$('oaMenu'),game=$('oaPlay');menu.hidden=screen!=='menu';game.hidden=screen!=='play';$('oaSettings').hidden=true;$('oaPause').hidden=true;$('oaResult').hidden=true;
 if(screen==='menu'){$('oaContinue').disabled=!run||run.completed;$('oaProgress').textContent=run?(run.completed?'Percorso completato: 15/15 livelli.':`Partita salvata · ${tiers[Math.floor(run.position/5)].toUpperCase()} · livello ${run.position%5+1}/5 · ${run.position}/15 completati`):'Nessuna partita salvata.';return;}
const c=current();if(!c)return;$('oaStage').textContent=tiers[Math.floor(run.position/5)].toUpperCase()+' · '+(run.position%5+1)+'/5';$('oaTitle').textContent=c.title;$('oaOriginal').src=path(c.original);$('oaModified').src=path(c.modified);$('oaZoom').setAttribute('aria-label','Ingrandisci i quadri');$('oaZoom').title='Ingrandisci i quadri';$('oaZoom').setAttribute('aria-pressed','false');$('oaFrame1').classList.remove('oa-zoom');$('oaFrame2').classList.remove('oa-zoom');root.querySelector('.oa-gallery').classList.remove('oa-gallery-zoom');for(const id of ['oaFrame1','oaFrame2'])$(id).style.width='';$('oaMessage').textContent='Trova le differenze nel quadro di destra (o in basso).';renderMarkers();}
function path(p){return 'games/40-palazzo-belle-arti/minigames/occhio-artista/'+p;}
function onKey(e){if(e.key==='Escape'&&screen==='play'){e.preventDefault();back();}}
function back(){if(screen==='play'){syncTime();paused=true;$('oaPause').hidden=false;}else stop();}
function init(){if(root)return;root=document.createElement('section');root.id='occhioArtista';root.hidden=true;root.innerHTML=`<div class="oa-menu" id="oaMenu"><div>PALAZZO DELLE BELLE ARTI · 1892</div><h2>L’Occhio dell’Artista</h2><p>Osserva due dipinti e scopri i particolari cambiati. Cinque livelli per ogni difficoltà.</p><p id="oaProgress"></p><div class="oa-actions"><button id="oaNew">Nuova partita</button><button id="oaContinue">Continua partita</button><button id="oaOptions">Impostazioni e guida</button><button id="oaExit">Torna all’ingresso</button></div><section id="oaSettings" hidden><div class="oa-settings"><label><input type="checkbox" id="oaMusic" disabled> Musica (predisposta, non ancora disponibile)</label><label><input type="checkbox" id="oaEffects"> Effetti sonori</label><label><input type="checkbox" id="oaTimer"> Cronometro facoltativo</label></div><p>Trova tutte le differenze cliccando sul secondo quadro. Ogni partita contiene 5 livelli Facili, poi 5 Medi e 5 Difficili. I progressi vengono salvati automaticamente sul dispositivo. Premi Pausa per tornare al menu senza perdere il livello.</p><button id="oaSaveOptions">Salva impostazioni</button></section></div><div class="oa-play" id="oaPlay" hidden><header class="oa-hud"><strong>L’OCCHIO DELL’ARTISTA</strong><span id="oaStage"></span><span id="oaCounter"></span><div class="oa-hud-actions"><button id="oaZoom" class="oa-zoom-button" type="button" aria-label="Ingrandisci i quadri" aria-pressed="false" title="Ingrandisci i quadri"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></button><button id="oaPauseBtn">Pausa</button></div></header><div class="oa-gallery"><figure class="oa-frame" id="oaFrame1"><img id="oaOriginal" alt="Quadro originale" draggable="false"></figure><figure class="oa-frame" id="oaFrame2"><img id="oaModified" alt="Quadro modificato" draggable="false"><div id="oaHitlayer" class="oa-hitlayer" role="group" aria-label="Individua le differenze"></div></figure></div><footer class="oa-footer"><span id="oaTitle"></span> · <span id="oaMessage" class="oa-notice" aria-live="polite"></span></footer></div><div class="oa-overlay" id="oaPause" hidden><div class="oa-menu"><h2>Partita in pausa</h2><p>Il livello è salvato automaticamente.</p><div class="oa-actions"><button id="oaResume">Riprendi</button><button id="oaBackMenu">Torna al menu</button><button id="oaPauseExit">Torna all’ingresso</button></div></div></div><div class="oa-overlay" id="oaResult" hidden><div class="oa-menu"><h2>Quadro completato!</h2><p id="oaResultText"></p><button id="oaNext">Prossimo livello</button></div></div>`;
 document.body.append(root);$('oaNew').onclick=()=>{if(run&&!run.completed&&!confirm('Iniziare una nuova partita? Il progresso precedente sarà sostituito.'))return;createRun();};$('oaContinue').onclick=()=>play();$('oaExit').onclick=stop;$('oaOptions').onclick=()=>{$('oaSettings').hidden=!$('oaSettings').hidden;$('oaMusic').checked=settings.music;$('oaEffects').checked=settings.effects;$('oaTimer').checked=settings.timer;};$('oaSaveOptions').onclick=()=>{settings={music:false,effects:$('oaEffects').checked,timer:$('oaTimer').checked};save();$('oaSettings').hidden=true;};$('oaPauseBtn').onclick=back;$('oaResume').onclick=()=>{$('oaPause').hidden=true;paused=false;started=Date.now();};$('oaBackMenu').onclick=showMenu;$('oaPauseExit').onclick=stop;$('oaNext').onclick=next;$('oaZoom').onclick=()=>setZoomFactor(zoom?1:1.6);const gallery=root.querySelector('.oa-gallery');gallery.addEventListener('touchstart',pinchStart,{passive:false});gallery.addEventListener('touchmove',pinchMove,{passive:false});gallery.addEventListener('touchend',pinchEnd,{passive:false});gallery.addEventListener('touchcancel',pinchEnd,{passive:false});$('oaHitlayer').addEventListener('click',e=>{if(paused||Date.now()<suppressClicksUntil){e.preventDefault();return;}const r=e.currentTarget.getBoundingClientRect();mark((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);});load();}
function start(){init();root.hidden=false;screen='menu';document.addEventListener('keydown',onKey);render();}
window.EsposizioneMinigames?.register(ID,{start,close:stop,isOpen:()=>!!root&&!root.hidden,back});
})();