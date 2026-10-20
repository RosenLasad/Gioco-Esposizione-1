/* Telegrafo Impazzito v1 - nastro Morse, tap a tempo, risultati solo in sessione. */
(function(){
'use strict';
const root=document.getElementById('pavilionTelegraph');
if(!root)return;
const $=id=>document.getElementById(id);
const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
const telegrams={
 facile:[
  {title:'Il primo segnale',text:'GENOVA RISPONDE AL SEGNALE'},
  {title:'Il porto di Genova',text:'LA NAVE ENTRA IN PORTO'},
  {title:'Il grande pallone',text:'IL PALLONE SI ALZA IN VOLO'},
  {title:'La nuova macchina',text:'LA MACCHINA E PRONTA'},
  {title:'Le luci della Fiera',text:'LE LUCI SONO ACCESE'}
 ],
 normale:[
  {title:'Il nuovo telegrafo',text:'IL NUOVO TELEGRAFO TRASMETTE I PRIMI SEGNALI ALLA FIERA'},
  {title:'Una nave americana',text:'UNA NAVE GIUNTA DALL AMERICA HA ATTRACCATO NEL PORTO DI GENOVA'},
  {title:'La prova elettrica',text:'GLI INVENTORI PREPARANO UNA DIMOSTRAZIONE DELLA LUCE ELETTRICA'},
  {title:'Notizie dalla Fiera',text:'IL GIORNALE ANNUNCIA NUOVE ATTRAZIONI PER I VISITATORI DELLA ESPOSIZIONE'},
  {title:'Il pallone in volo',text:'DAL GRANDE PALLONE SI AMMIRANO I TETTI DI GENOVA E IL MARE'}
 ],
 difficile:[
  {title:'Collegamento internazionale',text:'LA STAZIONE TELEGRAFICA DI GENOVA INVIA UN MESSAGGIO AI CORRISPONDENTI OLTRE OCEANO PER ANNUNCIARE LE MERAVIGLIE DELLA ESPOSIZIONE'},
  {title:'La macchina straordinaria',text:'IL PROFESSORE PRESENTA UNA NUOVA MACCHINA A VAPORE MA DURANTE LA DIMOSTRAZIONE GLI INGRANAGGI COMINCIANO A GIRARE SENZA CONTROLLO'},
  {title:'Notizie dal porto',text:'DAL PORTO DI GENOVA GIUNGE NOTIZIA DI UN PIROSCAFO CARICO DI MERCI E PASSEGGERI IN ARRIVO PER VISITARE LA GRANDE ESPOSIZIONE'},
  {title:'Il mistero dei segnali',text:'DALLA SALA DELLE INVENZIONI ARRIVANO SEGNALI IRREGOLARI GLI OPERATORI CERCANO DI COMPRENDERE IL MESSAGGIO PRIMA CHE LA LINEA SI INTERROMPA'},
  {title:'Il telegramma della sera',text:'MENTRE LE LUCI ILLUMINANO I PADIGLIONI DELLA FIERA UN ULTIMO TELEGRAMMA PARTE DA GENOVA E RACCONTA AL MONDO LE INVENZIONI DEL NUOVO SECOLO'}
 ]
};
const profiles={facile:{label:'Facile',speed:110,min:85,max:145,rate:.2},normale:{label:'Normale',speed:155,min:95,max:225,rate:.3},difficile:{label:'Difficile',speed:190,min:85,max:315,rate:.4}};
const selectedTelegram=()=>telegrams[difficulty][levelIndex];
const currentProfile=()=>profiles[difficulty];
const levelFactor=()=>1+levelIndex*.075;
// Record in memoria della sessione: il salvataggio persistente arrivera nella fase dedicata.
const records={facile:{},normale:{},difficile:{}};
const contact=tapeContact();
function tapeContact(){return root.querySelector('.tele-contact');}
const instrument=$('teleInstrument'),baseSprite=$('teleInstrumentBaseSprite'),sprite=$('teleInstrumentSprite'),content=$('teleContent');
const SPRITE_BASE='games/16-padiglione-invenzioni/minigames/telegrafo/images/';
const NORMAL_SPRITE=SPRITE_BASE+'telegrafo-normale.png';
const PRESSED_SPRITE=SPRITE_BASE+'telegrafo-meccanismo-premuto.png';
const REST_SPRITE=SPRITE_BASE+'telegrafo-meccanismo-normale.png';
// Precarica e, quando supportato, decodifica entrambi i fotogrammi prima del gioco.
// Il colpo viene registrato subito: questa preparazione riguarda solo la grafica.
const mechanismFrames=[REST_SPRITE,PRESSED_SPRITE].map(src=>{
 const img=new Image();img.src=src;
 if(typeof img.decode==='function')img.decode().catch(()=>{});
 return img;
});
const MIN_PRESS_MS=130;
let pressTimer=0,releaseRequested=false,feedbackTimer=0;
const name=$('telePlayerName'),intro=$('teleIntroStats'),menu=$('teleMenu'),play=$('telePlay'),results=$('teleResults'),pause=$('telePauseOverlay'),tape=$('teleTape'),track=$('teleTrack'),key=$('teleKey'),info=$('teleLevel'),stats=$('teleLiveStats'),typed=$('teleTranscription'),resultStats=$('teleResultsStats'),resultText=$('teleResultText');
let phase='closed',difficulty='facile',levelIndex=0,state=null,raf=0,last=0,pressed=false,statsSession={played:0,correct:0,errors:0},result=null,fullscreenPending=false;
const sampleName='Operatore';
let lastTranscribedIndex=-1;
function show(screen){menu.hidden=screen!=='menu';play.hidden=screen!=='play';results.hidden=screen!=='results';root.classList.toggle('tele-is-playing',screen==='play');}
function stopClock(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
function clearFeedback(){clearTimeout(feedbackTimer);feedbackTimer=0;tape.classList.remove('tele-hit-feedback');contact.classList.remove('tele-hit-flash');instrument.classList.remove('tele-hit-feedback');}
function reset(){stopClock();state=null;pressed=false;releaseInstrument(true);clearFeedback();pause.hidden=true;lastTranscribedIndex=-1;tape.style.setProperty('--paper-offset','0px');tape.style.setProperty('--paper-offset-fine','0px');}
function close(){reset();root.hidden=true;phase='closed';show('menu');if(document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});}
function introText(){intro.textContent=`Partite: ${statsSession.played} · Simboli colpiti: ${statsSession.correct} · Errori: ${statsSession.errors} (solo questa sessione)`;}
function starsString(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function scoring(targets,correct,errors){
 const missed=targets-correct;
 const extra=Math.max(0,errors-missed);
 const attempts=targets+extra;
 const accuracy=attempts?Math.round(100*correct/attempts):0;
 const score=attempts?Math.round(1000*correct/attempts):0;
 const stars=accuracy>=95?3:accuracy>=80?2:accuracy>=60?1:0;
 return {missed,extra,accuracy,score,stars};
}
function renderLevelMenu(){
 const select=$('teleMessage');
 select.replaceChildren();
 telegrams[difficulty].forEach((message,index)=>{
  const option=document.createElement('option');
  option.value=String(index);
  const record=records[difficulty][index];
  option.textContent=`${index+1}. ${message.title}${record?' · '+starsString(record.stars)+' · '+record.score+' pt':''}`;
  select.appendChild(option);
 });
 select.value=String(levelIndex);
 updateLevelSummary();
}
function updateLevelSummary(){
 const message=selectedTelegram();const record=records[difficulty][levelIndex];
 $('teleMessageDescription').textContent=`Messaggio ${levelIndex+1} di 5 - ${message.title}`;
 $('teleMessageRecord').textContent=record?`Record sessione: ${starsString(record.stars)} · ${record.score} punti · ${record.accuracy}% di precisione`:'Nessun record in questa sessione';
}
function open(){reset();root.hidden=false;phase='menu';show('menu');introText();$('teleDifficulty').value=difficulty;renderLevelMenu();$('teleResume').disabled=true;name.textContent=sampleName;$('teleClose').focus();}
function makeSymbols(text,rate){
  const raw=[];let pos=0;
  for(const [index,letter] of [...text].entries()){
    if(letter===' '){pos+=3;continue;}
    const code=MORSE[letter]||'';
    for(const [j,m] of [...code].entries()){raw.push({id:raw.length,unit:pos,char:m,letterIndex:index,letter,target:false,status:'pending',el:null});pos+=m==='.'?2:4;if(j<code.length-1)pos+=1;}
    pos+=3;
  }
  let prev=-10;
  raw.forEach((s,i)=>{if(i-prev>3 && Math.random()<rate){s.target=true;prev=i;}});
  if(!raw.some(s=>s.target)&&raw.length)raw[2]?.id!==undefined&&(raw[Math.min(2,raw.length-1)].target=true);
  return raw;
}
/* Lo sprite ha dimensioni intrinseche 887x530. In Fase C1.1 il nastro è più stretto
   e la corsia dei codici resta centrata nel nastro: il timbro colpisce la battuta
   meccanica dello Start sul lato destro, lasciando sempre visibile il codice. */
function alignInstrument(){
 if(play.hidden || !content.clientWidth)return;
 const w=instrument.getBoundingClientRect().width;
 const baseWidth=w||Math.min(content.clientWidth*.94,470);
 const headX=baseWidth*.151;
 const desiredX=tape.offsetLeft+tape.clientWidth*.80;
 const left=Math.max(0,Math.min(content.clientWidth-baseWidth,desiredX-headX));
 instrument.style.left=left+'px';
 const headY=instrument.offsetTop+instrument.offsetHeight*.622;
 contact.style.top=headY+'px';
}
function showInstrumentPressed(){
 clearTimeout(pressTimer);pressTimer=0;releaseRequested=false;
 sprite.src=PRESSED_SPRITE;
 instrument.classList.add('tele-actuated');
 pressTimer=setTimeout(()=>{pressTimer=0;if(releaseRequested)releaseInstrument(true);},MIN_PRESS_MS);
}
function releaseInstrument(force=false){
 if(!force && pressTimer){releaseRequested=true;return;}
 clearTimeout(pressTimer);pressTimer=0;releaseRequested=false;
 sprite.src=REST_SPRITE;
 instrument.classList.remove('tele-actuated');
}
function hitZone(){
 const tapeRect=tape.getBoundingClientRect(),contactRect=contact.getBoundingClientRect();
 return {center:contactRect.top+contactRect.height/2-tapeRect.top,half:contactRect.height/2};
}
function positionOf(symbol){return state.hitY+state.distance-state.lead-symbol.unit*state.spacing;}
function isHittable(symbol){return Math.abs(positionOf(symbol)-state.hitY)<=state.hitHalf;}
function pulseSuccessFeedback(){
 clearFeedback();
 void tape.offsetWidth;
 tape.classList.add('tele-hit-feedback');
 contact.classList.add('tele-hit-flash');
 instrument.classList.add('tele-hit-feedback');
 feedbackTimer=setTimeout(clearFeedback,190);
}

function render(){
 if(!state)return;
 const h=tape.clientHeight;
 for(const s of state.symbols){const y=positionOf(s);const halfSymbol=s.char==='.'?5:13.5;s.el.style.transform=`translate(-50%,${y-halfSymbol}px)`;s.el.hidden=y < -45||y>h+45;s.el.classList.toggle('hit',s.status==='hit');s.el.classList.toggle('miss',s.status==='miss');}
 const elapsed=state.distance/state.totalDistance;
 tape.style.setProperty('--paper-offset', `${(state.distance%94).toFixed(2)}px`);
 tape.style.setProperty('--paper-offset-fine', `${((state.distance*.42)%16).toFixed(2)}px`);
 $('teleProgressFill').style.width=`${Math.min(100,Math.max(0,elapsed*100))}%`;
 stats.textContent=`Corretti ${state.correct} · Errori ${state.errors}`;
 const targets=state.symbols.filter(s=>s.target).length;
 $('teleGamePoints').textContent=`Punti partita: ${scoring(targets,state.correct,state.errors).score}`;
 // Lettere e nastro usano la stessa distanza: una lettera viene trascritta
 // quando il suo ULTIMO simbolo ha oltrepassato il bordo inferiore della testina.
 let idx=0;
 // Gli ultimi simboli di ogni lettera, nell'ordine trasmesso.
 for(let i=0;i<state.symbols.length;i++){
   const s=state.symbols[i];
   const next=state.symbols[i+1];
   if(next && next.letterIndex===s.letterIndex) continue;
   if(state.distance >= state.lead+s.unit*state.spacing+state.hitHalf){
     idx=s.letterIndex+1;
   }else break;
 }
 if(idx!==lastTranscribedIndex){
   lastTranscribedIndex=idx;
   const message=selectedTelegram().text;
   const written=message.slice(0,idx);
   typed.replaceChildren();
   const completed=document.createElement('span');completed.className='tele-transcribed';
   completed.textContent=written.slice(0,-1);
   const current=document.createElement('span');current.className='tele-current-letter';
   current.textContent=written.slice(-1);
   const unread=document.createElement('span');unread.className='tele-unread';
   unread.textContent=message.slice(idx);
   typed.append(completed,current,unread);
   $('teleTextCounter').textContent=`${idx} / ${message.length} caratteri ricevuti`;
   // La finestra si adatta al testo, senza muovere il nastro.
   const paperBody=$('telePaperContent');paperBody.scrollTop=paperBody.scrollHeight;
 }
 $('teleProgress').setAttribute('aria-valuenow',String(Math.round(Math.min(100,Math.max(0,elapsed*100)))));
 }
function scheduleSpeed(){
 const p=currentProfile();state.nextChange=state.elapsed+(difficulty==='facile'?2.1:difficulty==='normale'?1.35:.9)+Math.random()*1.6;
 state.targetSpeed=Math.max(p.min,Math.min(p.max*levelFactor(),p.speed*levelFactor()*(.65+Math.random()*.85)));
}
function frame(t){
 if(phase!=='running')return;
 const zone=hitZone();state.hitY=zone.center;state.hitHalf=zone.half;
 const dt=Math.min(.05,last?(t-last)/1000:0);last=t;state.elapsed+=dt;
 if(state.elapsed>=state.nextChange)scheduleSpeed();
 const delta=state.targetSpeed-state.speed;
 state.speed+=Math.sign(delta)*Math.min(Math.abs(delta),dt*(difficulty==='facile'?34:difficulty==='normale'?75:125));
 state.distance+=state.speed*dt;
 for(const s of state.symbols){if(s.target&&s.status==='pending'&&state.distance>s.unit*state.spacing+state.lead+state.hitHalf){s.status='miss';state.errors++;}}
 render();
 if(state.distance>state.totalDistance){finish();return;}
 raf=requestAnimationFrame(frame);
}
function begin(){reset();difficulty=$('teleDifficulty').value;levelIndex=Number($('teleMessage').value)||0;show('play');alignInstrument();const p=currentProfile(),message=selectedTelegram();const spacing=22,symbols=makeSymbols(message.text,Math.min(.85,p.rate+levelIndex*.035));const zone=hitZone(),hitY=zone.center,lead=hitY+65;
 state={symbols,spacing,hitY,hitHalf:zone.half,lead,distance:0,elapsed:0,speed:p.speed*levelFactor(),targetSpeed:p.speed*levelFactor(),nextChange:2,correct:0,errors:0,totalDistance:(symbols.at(-1)?.unit||0)*spacing+lead+(tape.clientHeight-hitY)+55};
 track.replaceChildren();for(const s of symbols){const el=document.createElement('span');el.className='tele-symbol '+(s.char==='.'?'dot':'dash')+(s.target?' target':'');el.setAttribute('aria-hidden','true');track.appendChild(el);s.el=el;}
 key.disabled=false;pressed=false;$('teleGamePoints').textContent='Punti partita: 0';info.textContent=`Messaggio ${levelIndex+1} · ${p.label}`;typed.textContent='';lastTranscribedIndex=-1;phase='running';pause.hidden=true;
 // Schermo intero solo su scelta esplicita del giocatore.
 last=0;raf=requestAnimationFrame(frame);render();
}
function hit(){if(phase!=='running'||!state)return;const zone=hitZone();state.hitY=zone.center;state.hitHalf=zone.half;showInstrumentPressed();
 let best=null,dist=Infinity;for(const s of state.symbols){if(s.target&&s.status==='pending'){const d=Math.abs(state.distance-state.lead-s.unit*state.spacing);if(d<dist){best=s;dist=d;}}}
 if(best&&dist<=state.hitHalf){best.status='hit';state.correct++;pulseSuccessFeedback();}else state.errors++;
 render();
}
function finish(){
 stopClock();phase='results';key.disabled=true;
 const targets=state.symbols.filter(s=>s.target).length;
 const correct=state.correct,errors=state.errors;
 const evaluation=scoring(targets,correct,errors);
 const {missed,extra,accuracy,score,stars}=evaluation;
 statsSession.played++;statsSession.correct+=correct;statsSession.errors+=errors;
 const prior=records[difficulty][levelIndex];
 const improved=!prior||score>prior.score||(score===prior.score&&stars>prior.stars);
 if(improved)records[difficulty][levelIndex]={stars,accuracy,score,correct,targets,errors};
 const message=selectedTelegram();
 result={difficulty,level:levelIndex+1,title:message.title,text:message.text,
  correct,errors,missed,extra,targets,accuracy,score,stars,recordImproved:improved,completed:true};
 $('teleResultLevel').textContent=`${profiles[difficulty].label} · Telegramma ${levelIndex+1} di 5 · ${message.title}`;
 const starsElement=$('teleResultStars');
 starsElement.textContent=starsString(stars);
 starsElement.setAttribute('aria-label',`${stars} stelle su 3`);
 $('teleResultScore').textContent=`${score.toLocaleString('it-IT')} / 1.000 punti`;
 $('teleResultRecord').textContent=improved?'Nuovo record della sessione!':'Record della sessione: '+prior.score+' punti';
 resultStats.replaceChildren();
 for(const [label,value] of [
   ['Precisione',accuracy+'%'],['Bersagli colpiti',correct+' / '+targets],
   ['Bersagli mancati',String(missed)],['Pressioni errate',String(extra)]]){
  const item=document.createElement('div');item.className='tele-results-stat';
  const caption=document.createElement('span');caption.textContent=label;
  const number=document.createElement('strong');number.textContent=value;
  item.append(caption,number);resultStats.appendChild(item);
 }
 resultText.textContent=message.text;show('results');introText();
}
function pauseGame(){if(phase!=='running')return;phase='paused';stopClock();pause.hidden=false;}
function resumeGame(){if(phase!=='paused')return;pause.hidden=true;phase='running';last=0;raf=requestAnimationFrame(frame);}
function backMenu(){reset();phase='menu';show('menu');renderLevelMenu();$('teleResume').disabled=true;if(document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});}
$('teleDifficulty').addEventListener('change',e=>{difficulty=e.target.value;levelIndex=0;renderLevelMenu();});
$('teleMessage').addEventListener('change',e=>{levelIndex=Number(e.target.value)||0;updateLevelSummary();});
$('teleStart').addEventListener('click',begin);$('teleAgain').addEventListener('click',begin);$('teleResume').disabled=true;
$('teleClose').addEventListener('click',close);$('teleResultMenu').addEventListener('click',backMenu);$('teleResultExit').addEventListener('click',close);
$('telePause').addEventListener('click',pauseGame);$('telePauseResume').addEventListener('click',resumeGame);$('telePauseRestart').addEventListener('click',begin);$('telePauseExit').addEventListener('click',backMenu);
const fullscreenButton=$('teleFullscreen');
function updateFullscreenButton(){
 const active=document.fullscreenElement===root;
 const label=active?'Esci da schermo intero':'Attiva schermo intero';
 fullscreenButton.setAttribute('aria-label',label);
 fullscreenButton.title=label;
 fullscreenButton.setAttribute('aria-pressed',String(active));
}
fullscreenButton.addEventListener('click',()=>{
 if(document.fullscreenElement===root){document.exitFullscreen().catch(()=>{});}
 else root.requestFullscreen?.().catch(()=>{});
});
document.addEventListener('fullscreenchange',updateFullscreenButton);
updateFullscreenButton();
key.addEventListener('pointerdown',e=>{e.preventDefault();hit();try{key.setPointerCapture(e.pointerId);}catch(_){}});
key.addEventListener('pointerup',()=>releaseInstrument());
key.addEventListener('pointercancel',()=>releaseInstrument());
key.addEventListener('lostpointercapture',()=>releaseInstrument());
document.addEventListener('keyup',e=>{if(e.code==='Space')releaseInstrument();});
window.addEventListener('resize',()=>{if(phase==='running'||phase==='paused'){alignInstrument();if(state){const z=hitZone();state.hitY=z.center;state.hitHalf=z.half;render();}}});
document.addEventListener('fullscreenchange',()=>{if(!root.hidden){requestAnimationFrame(()=>{alignInstrument();if(state){const z=hitZone();state.hitY=z.center;state.hitHalf=z.half;render();}});}});
document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.code==='Space'&&phase==='running'&&!e.repeat){e.preventDefault();hit();}if(e.key==='Escape'&&phase==='running'){e.preventDefault();e.stopImmediatePropagation();pauseGame();}},true);
window.addEventListener('blur',()=>{if(phase==='running')pauseGame();});
window.EsposizioneMinigames.register('telegrafo',{start:open,close,isOpen:()=>!root.hidden,back(){if(phase==='running'){pauseGame();return true;}if(phase==='paused'){backMenu();return true;}close();return true;},getResult:()=>result});
})();
