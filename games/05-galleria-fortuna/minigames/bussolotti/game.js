/* Bussolotti V1 - scambi 2D fluidi, senza teletrasporti o cambi della pallina. */
(function(){
'use strict';
const root=document.getElementById('pavilionShellGame');if(!root)return;
const $=id=>document.getElementById(id);
const cups=[0,1,2].map(i=>$(`shellCup${i}`));
const ball=$('shellBall'),message=$('shellGameMessage'),stats=$('shellGameStats');
const positions=[18,50,82];
const settings={facile:{duration:850,min:4,max:6,pause:170,triples:0},normale:{duration:550,min:7,max:10,pause:90,triples:.23},difficile:{duration:350,min:11,max:15,pause:35,triples:.42}};
let phase='closed',phaseBeforePause='intro',state=null,wins=0,losses=0,generation=0,animations=[],timers=new Set(),paused=false;
const rand=n=>Math.floor(Math.random()*n);
function wait(ms){return new Promise(resolve=>{const entry={remaining:ms,started:performance.now(),resolve,id:null};const run=()=>{entry.started=performance.now();entry.id=setTimeout(()=>{timers.delete(entry);resolve(true)},entry.remaining)};timers.add(entry);if(!paused)run();});}
function clearScheduled(){generation++;for(const a of animations){try{a.cancel()}catch(e){}}animations=[];for(const timer of timers){clearTimeout(timer.id);timer.resolve(false)}timers.clear();paused=false;}
function pauseScheduled(){for(const a of animations)a.pause();for(const t of timers){clearTimeout(t.id);t.remaining=Math.max(0,t.remaining-(performance.now()-t.started));t.id=null;}}
function resumeScheduled(){for(const a of animations)a.play();for(const t of timers){if(t.id!==null)continue;t.started=performance.now();t.id=setTimeout(()=>{timers.delete(t);t.resolve(true)},t.remaining);}}
function showMenu(){clearScheduled();phase='menu';state=null;$('shellMenu').hidden=false;$('shellPlay').hidden=true;$('shellPauseOverlay').hidden=true;stopFullscreen();}
function stopFullscreen(){if(document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});}
function open(){root.hidden=false;showMenu();$('shellStart').focus();}
function close(){showMenu();phase='closed';root.hidden=true;}
function syncCupButtons(){if(!state)return;for(const cup of state.cups){const button=cups[cup.id];button.style.left=positions[cup.slot]+'%';button.classList.toggle('revealed',state.revealed.includes(cup.id));button.disabled=phase!=='choosing';} const target=state.cups[state.ballId];ball.style.left=positions[target.slot]+'%';ball.style.opacity=state.showBall?'1':'0';}
function setMessage(text){message.textContent=text;}
function setStats(){stats.textContent=`Vittorie: ${wins} · Sconfitte: ${losses}`;}
function chooseShuffle(){const config=settings[state.difficulty],triple=Math.random()<config.triples;const ids=[0,1,2].sort(()=>Math.random()-.5);return triple?{ids:[0,1,2],delta:Math.random()<.5?1:2}:{ids:ids.slice(0,2),delta:0};}
/* WAAPI animates transforms only: buttons stay in fixed layout slots until animation finishes. */
async function move(step,token){
 const config=settings[state.difficulty],isTriple=step.delta!==0;
 const movements=[];
 const moves=step.ids.map(id=>{const cup=state.cups[id],from=cup.slot,to=isTriple?(from+step.delta)%3:state.cups[step.ids.find(other=>other!==id)].slot;return {cup,from,to};});
 for(const item of moves){
   const el=cups[item.cup.id],distance=el.parentElement.clientWidth*(positions[item.to]-positions[item.from])/100;
   const arc=(isTriple?18:24)*(item.cup.id%2===0?-1:1);
   const timing={duration:config.duration,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'};
   const anim=el.animate([
      {transform:'translate(-50%,0) translate(0px,0px)',offset:0},
      {transform:`translate(-50%,0) translate(${distance/2}px,${arc}px)`,offset:.5},
      {transform:`translate(-50%,0) translate(${distance}px,0px)`,offset:1}
   ],timing);
   animations.push(anim);movements.push(anim.finished.catch(()=>{}));
 }
 await Promise.all(movements);
 if(token!==generation)return false;
 // Change the logical slot only after the visual movement is complete.
 for(const item of moves)item.cup.slot=item.to;
 for(const a of animations){try{a.cancel()}catch(e){}}animations=[];
 syncCupButtons();return true;
}
async function begin(){
 clearScheduled();const token=generation;
 const difficulty=$('shellDifficulty').value,config=settings[difficulty];
 phase='intro';$('shellMenu').hidden=true;$('shellPlay').hidden=false;$('shellPauseOverlay').hidden=true;
 $('shellLevel').textContent=difficulty[0].toUpperCase()+difficulty.slice(1);
 state={cups:[{id:0,slot:0},{id:1,slot:1},{id:2,slot:2}],ballId:rand(3),showBall:true,revealed:[],difficulty};
 state.revealed=[state.ballId];setStats();syncCupButtons();
 setMessage('Memorizza il bussolotto che nasconde la pallina!');
 if(!await wait(1250)||token!==generation)return;
 state.revealed=[];state.showBall=false;phase='shuffling';syncCupButtons();setMessage('Segui la pallina: i bussolotti si stanno mescolando...');
 const count=config.min+rand(config.max-config.min+1);
 for(let i=0;i<count;i++){
   if(token!==generation)return;
   const step=chooseShuffle();if(!await move(step,token))return;
   if(!await wait(config.pause)||token!==generation)return;
 }
 if(!await wait(230)||token!==generation)return;
 phase='choosing';syncCupButtons();setMessage('Dov’è la pallina? Tocca un bussolotto.');
}
function guess(id){
 if(phase!=='choosing'||!state)return;
 phase='result';const found=id===state.ballId;if(found)wins++;else losses++;
 state.showBall=true;state.revealed=found?[id]:[id,state.ballId];setStats();syncCupButtons();
 setMessage(found?'Bravo! Hai trovato la pallina.':'Non questa volta! La pallina era sotto un altro bussolotto.');
}
function pause(){if(phase!=='intro'&&phase!=='shuffling'&&phase!=='choosing')return;phaseBeforePause=phase;paused=true;pauseScheduled();phase='paused';$('shellPauseOverlay').hidden=false;}
function resume(){if(phase!=='paused')return;phase=phaseBeforePause;$('shellPauseOverlay').hidden=true;paused=false;resumeScheduled();syncCupButtons();}

$('shellStart').addEventListener('click',begin);$('shellGameClose').addEventListener('click',close);
$('shellGameNew').addEventListener('click',begin);$('shellBackMenu').addEventListener('click',showMenu);
$('shellPause').addEventListener('click',pause);$('shellResume').addEventListener('click',resume);
$('shellPauseMenu').addEventListener('click',showMenu);
$('shellFullscreen').addEventListener('click',()=>{if(document.fullscreenElement===root)stopFullscreen();else root.requestFullscreen?.().catch(()=>{});});
cups.forEach((el,id)=>el.addEventListener('click',()=>guess(id)));
window.EsposizioneMinigames.register('shellgame',{start:open,close,isOpen:()=>!root.hidden,back(){if(phase==='menu'){close();return true;}showMenu();return true;}});
})();
