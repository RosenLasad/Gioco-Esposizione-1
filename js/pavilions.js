(function(){
  'use strict';

  const definitions = Object.freeze({
    battaglie: {
      name: 'Teatro delle Battaglie',
      number: '4',
      ids: ['hotspot-1790363509817'],
      image: 'images/pavilions/battaglie.jpg',
      alt: 'Interno panoramico del Teatro delle Battaglie',
      status: 'Teatro delle Battaglie: panorama esplorabile.'
    },
    fortuna: {
      name: 'Galleria della Fortuna',
      number: '5',
      ids: ['sport','hotspot-1790363448490'],
      image: 'images/pavilions/fortuna.jpg',
      alt: 'Interno panoramico della Galleria della Fortuna',
      status: 'Galleria della Fortuna: panorama esplorabile.'
    },
    invenzioni: {
      name: 'Padiglione delle Invenzioni',
      number: '16',
      ids: ['hotspot-1790363352923','hotspot-1790363463228'],
      image: 'images/pavilions/panorama_test.svg',
      alt: 'Panorama di prova del Padiglione delle Invenzioni',
      status: 'Padiglione delle Invenzioni: panorama di prova esplorabile.'
    }
  });

  const pavilionItems = Object.freeze({
    battaglie: [
      {id:'bombarda',name:'Bombarda!',icon:'☄',color:'red',x:11,y:62,desc:'Prendi la mira con il cannone e colpisci i bersagli della flotta nemica.'},
      {id:'fortezza',name:'Difendi la Fortezza',icon:'♜',color:'green',x:29,y:43,desc:'Proteggi la fortezza dagli attacchi organizzando la sua difesa.'},
      {id:'guida',name:'Guida',icon:'ℹ',color:'blue',x:52,y:51,desc:'Scopri le curiosità e la storia delle battaglie raccontate nel padiglione.'},
      {id:'shopping',name:'Shopping',icon:'▣',color:'brown',x:77,y:42,desc:'Visita il banco dei souvenir e scopri modelli navali e oggetti da collezione.'},
      {id:'navale',name:'Battaglia Navale',icon:'⛵',color:'blue',x:81,y:70,desc:'Sfida il computer su due griglie navali: scopri e affonda tutte le navi avversarie.',action:'battleship'},
      {id:'extra',name:'Extra',icon:'★',color:'gold',x:94,y:46,desc:'Contenuti bonus, curiosità e ricompense speciali del Teatro delle Battaglie.'}
    ],
    fortuna: [
      {id:'ruota',name:'La Ruota della Fortuna',icon:'☘',color:'green',x:56,y:31,desc:'Affida il tuo destino alla grande ruota centrale e tenta la sorte per vincere premi e gettoni.'},
      {id:'bussolotti',name:'Il Gioco dei Bussolotti',icon:'◔',color:'red',x:12,y:69,desc:'Osserva i bussolotti, segui la pallina e prova a indovinare dov\'è finita.',action:'shellgame'},
      {id:'prestigiatore',name:'Il Prestigiatore',icon:'🎩',color:'red',x:16,y:42,desc:'Assisti ai giochi di prestigio e scopri illusioni e meraviglie del padiglione.'},
      {id:'pesca',name:'Il Pesca-Premi',icon:'🎁',color:'blue',x:84,y:43,desc:'Estrai un premio tra giocattoli, gadget e piccole sorprese dell\'Esposizione.'},
      {id:'shopping',name:'Shopping',icon:'▣',color:'brown',x:83,y:70,desc:'Sfoglia i souvenir e gli oggetti da collezione della Galleria della Fortuna.'},
      {id:'guida',name:'Guida',icon:'ℹ',color:'blue',x:35,y:70,desc:'Scopri il funzionamento delle attrazioni e la storia della Galleria della Fortuna.'}
    ],
    invenzioni: []
  });

  const view = document.getElementById('pavilionView');
  const viewport = document.getElementById('pavilionViewport');
  const panorama = document.getElementById('pavilionPanorama');
  const joystick = document.getElementById('pavilionJoystick');
  const knob = document.getElementById('pavilionJoystickKnob');
  const hotspotLayer = document.getElementById('pavilionHotspots');
  const activity = document.getElementById('pavilionActivity');
  const activityIcon = document.getElementById('pavilionActivityIcon');
  const activityTitle = document.getElementById('pavilionActivityTitle');
  const activityDescription = document.getElementById('pavilionActivityDescription');
  const activityMessage = document.getElementById('pavilionActivityMessage');
  const activityStart = document.getElementById('pavilionActivityStart');

  const battleship = document.getElementById('pavilionBattleship');
  const shellgame = document.getElementById('pavilionShellGame');

  let active = null;
  let restore = null;
  let offset = 0;
  let maxOffset = 0;
  let drag = null;
  let joyPointer = null;
  let joyValue = 0;
  let joyFrame = 0;
  let joyLast = 0;
  let selected = null;
  let returnFocus = null;
  let board = null;
  let pavilionHistoryToken = null;
  let historySequence = 0;

  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

  function currentItems(){
    return pavilionItems[active] || [];
  }

  function buildHotspots(){
    hotspotLayer.replaceChildren();
    const items = currentItems();
    for(const item of items){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `pavilion-hotspot hotspot-${item.color}`;
      button.textContent = item.icon;
      button.title = item.name;
      button.setAttribute('aria-label', item.name);
      button.style.left = item.x + '%';
      button.style.top = item.y + '%';
      button.addEventListener('click', () => showActivity(item, button));
      hotspotLayer.appendChild(button);
    }
    placeHotspots();
  }

  function placeHotspots(){
    const items = currentItems();
    if(!active || !items.length) return;
    const ratio = (panorama.naturalWidth && panorama.naturalHeight) ? (panorama.naturalWidth / panorama.naturalHeight) : 3;
    const width = viewport.clientHeight * ratio;
    hotspotLayer.style.width = width + 'px';
    hotspotLayer.style.height = viewport.clientHeight + 'px';
    hotspotLayer.style.transform = `translate3d(${-offset}px,0,0)`;
  }

  function showActivity(item, button){
    releaseJoy();
    selected = item;
    returnFocus = button;
    activityIcon.textContent = item.icon;
    activityIcon.className = 'activity-large-icon hotspot-' + item.color;
    activityTitle.textContent = item.name;
    activityDescription.textContent = item.desc;
    const hasAction = !!item.action;
    activityMessage.textContent = hasAction ? '' : 'Attività in preparazione';
    activityMessage.hidden = hasAction;
    activityStart.hidden = !hasAction;
    activityStart.textContent = 'Avvia attività';
    activity.hidden = false;
    document.getElementById('pavilionActivityClose').focus();
  }

  function hideActivity(){
    activity.hidden = true;
    selected = null;
    returnFocus?.focus();
    returnFocus = null;
  }

  document.getElementById('pavilionActivityClose').addEventListener('click', hideActivity);
  activity.addEventListener('pointerdown', event => { if(event.target === activity) hideActivity(); });
  activityStart.addEventListener('click', ()=>{
    if(!selected?.action) return;
    const action = selected.action;
    hideActivity();
    if(action === 'battleship'){
      newBattle();
      battleship.hidden = false;
      document.getElementById('battleshipClose').focus();
    } else if(action === 'shellgame'){
      openShellGame();
    }
  });

  const shipSizes = [5,4,3,3,2];
  function makeFleet(){
    const ships = Array.from({length:100},()=>false);
    for(const length of shipSizes){
      let done = false;
      for(let attempt=0; attempt<1000 && !done; attempt++){
        const horizontal = Math.random() < .5;
        const x = Math.floor(Math.random() * (horizontal ? 11 - length : 10));
        const y = Math.floor(Math.random() * (horizontal ? 10 : 11 - length));
        const cells = Array.from({length}, (_,i)=>(y + (horizontal ? 0 : i)) * 10 + x + (horizontal ? i : 0));
        if(cells.some(pos => ships[pos])) continue;
        cells.forEach(pos => { ships[pos] = true; });
        done = true;
      }
    }
    return ships;
  }

  function newBattle(){
    board = {
      enemy: makeFleet(),
      player: makeFleet(),
      enemyShots: new Set(),
      playerShots: new Set(),
      turn: true,
      over: false,
      token: (board?.token || 0) + 1
    };
    renderBattle('Scegli una casella della flotta avversaria per sparare.');
  }

  function won(fleet, shots){
    return fleet.every((occupied, i) => !occupied || shots.has(i));
  }

  function renderBattle(message){
    if(!board) return;
    document.getElementById('battleshipMessage').textContent = message;
    for(const side of ['enemy','player']){
      const root = document.getElementById(side === 'enemy' ? 'battleshipEnemy' : 'battleshipPlayer');
      root.replaceChildren();
      for(let i=0;i<100;i++){
        const shot = (side === 'enemy' ? board.playerShots : board.enemyShots).has(i);
        const ship = board[side][i];
        const cell = document.createElement(side === 'enemy' ? 'button' : 'span');
        cell.className = 'battle-cell';
        if(side === 'player' && ship) cell.classList.add('ship');
        if(shot){
          cell.classList.add(ship ? 'hit' : 'miss');
          cell.textContent = ship ? '×' : '•';
        }
        if(side === 'enemy'){
          cell.type = 'button';
          cell.setAttribute('aria-label', `Colonna ${i%10+1}, riga ${Math.floor(i/10)+1}`);
          cell.disabled = shot || !board.turn || board.over;
          cell.addEventListener('click', ()=>fire(i));
        }
        root.appendChild(cell);
      }
    }
    document.getElementById('battleshipStats').textContent = `Colpi: ${board.playerShots.size} · Navi colpite: ${[...board.playerShots].filter(i=>board.enemy[i]).length}/17`;
  }

  function fire(i){
    if(!board || board.over || !board.turn || board.playerShots.has(i)) return;
    board.playerShots.add(i);
    board.turn = false;
    if(won(board.enemy, board.playerShots)){
      board.over = true;
      renderBattle('Hai vinto! Hai affondato tutta la flotta nemica.');
      return;
    }
    const candidates = Array.from({length:100}, (_,j)=>j).filter(j => !board.enemyShots.has(j));
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    board.enemyShots.add(target);
    if(won(board.player, board.enemyShots)){
      board.over = true;
      renderBattle('Hai perso: la tua flotta è stata affondata. Riprova!');
      return;
    }
    board.turn = true;
    renderBattle(`${board.enemy[i] ? 'Colpito!' : 'Acqua!'} Il computer ha sparato: ${board.player[target] ? 'ha colpito una tua nave.' : 'acqua.'} Tocca a te.`);
  }

  document.getElementById('battleshipNew').addEventListener('click', newBattle);
  function hideBattle(){
    battleship.hidden = true;
    board = null;
  }
  document.getElementById('battleshipClose').addEventListener('click', hideBattle);

  // Gioco dei bussolotti
  const shellCupButtons = [0,1,2].map(i=>document.getElementById(`shellCup${i}`));
  const shellBall = document.getElementById('shellBall');
  const shellMessage = document.getElementById('shellGameMessage');
  const shellStats = document.getElementById('shellGameStats');
  const shellPositions = ['18%','50%','82%'];
  let shellWins = 0;
  let shellLosses = 0;
  let shellState = null;
  let shellTimers = [];

  function clearShellTimers(){
    shellTimers.forEach(id => clearTimeout(id));
    shellTimers = [];
  }

  function updateShellStats(){
    shellStats.textContent = `Vittorie: ${shellWins} · Sconfitte: ${shellLosses}`;
  }

  function renderShell(showBall=false, revealedIds=[]){
    if(!shellState) return;
    const revealSet = new Set(revealedIds);
    for(const cup of shellState.cups){
      const button = shellCupButtons[cup.id];
      button.style.left = shellPositions[cup.slot];
      button.classList.toggle('revealed', revealSet.has(cup.id));
      button.disabled = !shellState.canGuess;
    }
    const ballCup = shellState.cups.find(c => c.id === shellState.ballCupId);
    shellBall.style.left = shellPositions[ballCup.slot];
    shellBall.style.opacity = showBall ? '1' : '0';
  }

  function openShellGame(){
    shellgame.hidden = false;
    newShellRound();
    document.getElementById('shellGameClose').focus();
  }

  function hideShellGame(){
    clearShellTimers();
    shellgame.hidden = true;
    shellState = null;
  }

  function swapCupSlots(aId, bId){
    const a = shellState.cups.find(c => c.id === aId);
    const b = shellState.cups.find(c => c.id === bId);
    const temp = a.slot;
    a.slot = b.slot;
    b.slot = temp;
  }

  function shuffleShell(step=0, total=5){
    if(!shellState) return;
    if(step >= total){
      shellState.canGuess = true;
      shellMessage.textContent = 'Dov’è la pallina? Tocca un bussolotto per indovinare.';
      renderShell(false, []);
      return;
    }
    const picks = [0,1,2].sort(()=>Math.random()-.5).slice(0,2);
    swapCupSlots(picks[0], picks[1]);
    renderShell(false, []);
    shellTimers.push(setTimeout(()=>shuffleShell(step+1, total), 420));
  }

  function newShellRound(){
    clearShellTimers();
    shellState = {
      cups: [{id:0,slot:0},{id:1,slot:1},{id:2,slot:2}],
      ballCupId: Math.floor(Math.random()*3),
      canGuess: false
    };
    updateShellStats();
    shellMessage.textContent = 'Osserva bene: la pallina ti viene mostrata per un istante.';
    renderShell(true, [shellState.ballCupId]);
    shellTimers.push(setTimeout(()=>{
      shellMessage.textContent = 'I bussolotti si muovono... segui con attenzione la pallina.';
      renderShell(false, []);
      shuffleShell(0, 6);
    }, 1100));
  }

  function guessCup(id){
    if(!shellState || !shellState.canGuess) return;
    shellState.canGuess = false;
    const win = id === shellState.ballCupId;
    if(win) shellWins++; else shellLosses++;
    updateShellStats();
    const revealed = win ? [id] : [id, shellState.ballCupId];
    renderShell(true, revealed);
    shellMessage.textContent = win ? 'Bravo! Hai seguito correttamente la pallina.' : 'Peccato! La pallina era sotto un altro bussolotto.';
  }

  shellCupButtons.forEach((button, id) => button.addEventListener('click', ()=>guessCup(id)));
  document.getElementById('shellGameNew').addEventListener('click', newShellRound);
  document.getElementById('shellGameClose').addEventListener('click', hideShellGame);

  function draw(){
    panorama.style.transform = `translate3d(${-offset}px,-50%,0)`;
    placeHotspots();
  }

  function measure(center=false){
    if(!active) return;
    const oldRatio = maxOffset ? offset / maxOffset : .5;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const ratio = (panorama.naturalWidth && panorama.naturalHeight) ? (panorama.naturalWidth / panorama.naturalHeight) : 3;
    const imageWidth = vh * ratio;
    maxOffset = Math.max(0, imageWidth - vw);
    offset = maxOffset * (center ? .5 : oldRatio);
    draw();
  }

  function step(dir){
    offset = clamp(offset + dir * Math.max(80, viewport.clientWidth * .24), 0, maxOffset);
    draw();
  }

  viewport.addEventListener('pointerdown', event => {
    if(!active || !activity.hidden || !battleship.hidden || !shellgame.hidden || event.button !== 0 || event.target.closest?.('.pavilion-hotspot')) return;
    drag = { id: event.pointerId, x: event.clientX, start: offset };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    event.preventDefault();
  });

  viewport.addEventListener('pointermove', event => {
    if(!drag || drag.id !== event.pointerId) return;
    offset = clamp(drag.start + (drag.x - event.clientX), 0, maxOffset);
    draw();
  });

  function stopDrag(event){
    if(drag && (!event || event.pointerId === drag.id)){
      drag = null;
      viewport.classList.remove('is-dragging');
    }
  }
  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);
  viewport.addEventListener('lostpointercapture', stopDrag);

  function setJoy(value){
    joyValue = clamp(value, -1, 1);
    knob.style.left = `${50 + joyValue * 42}%`;
    joystick.setAttribute('aria-valuenow', String(Math.round(joyValue * 100)));
    joystick.setAttribute('aria-valuetext', Math.abs(joyValue) < .06 ? 'Fermo' : (joyValue < 0 ? 'Sinistra' : 'Destra'));
  }

  function tickJoy(time){
    if(!active || !joyPointer){
      joyFrame = 0;
      joyLast = 0;
      return;
    }
    const dt = joyLast ? Math.min((time - joyLast) / 1000, .05) : 0;
    joyLast = time;
    if(Math.abs(joyValue) > .06){
      const velocity = Math.sign(joyValue) * Math.pow(Math.abs(joyValue), 1.35) * Math.max(240, viewport.clientWidth * 1.1);
      offset = clamp(offset + velocity * dt, 0, maxOffset);
      draw();
    }
    joyFrame = requestAnimationFrame(tickJoy);
  }

  function updateJoyFromPointer(event){
    const rect = joystick.getBoundingClientRect();
    const halfTravel = Math.max(1, rect.width * .42);
    setJoy((event.clientX - (rect.left + rect.width / 2)) / halfTravel);
  }

  function releaseJoy(){
    joyPointer = null;
    if(joyFrame) cancelAnimationFrame(joyFrame);
    joyFrame = 0;
    joyLast = 0;
    setJoy(0);
    joystick.classList.remove('is-active');
  }

  joystick.addEventListener('pointerdown', event => {
    if(!active || event.button !== 0) return;
    joyPointer = event.pointerId;
    updateJoyFromPointer(event);
    joystick.setPointerCapture(event.pointerId);
    joystick.classList.add('is-active');
    if(!joyFrame) joyFrame = requestAnimationFrame(tickJoy);
    event.preventDefault();
  });
  joystick.addEventListener('pointermove', event => { if(joyPointer === event.pointerId) updateJoyFromPointer(event); });
  joystick.addEventListener('pointerup', event => { if(joyPointer === event.pointerId) releaseJoy(); });
  joystick.addEventListener('pointercancel', event => { if(joyPointer === event.pointerId) releaseJoy(); });
  joystick.addEventListener('lostpointercapture', event => { if(joyPointer === event.pointerId) releaseJoy(); });
  joystick.addEventListener('keydown', event => {
    if(!active) return;
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
      event.preventDefault();
      event.stopPropagation();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  document.getElementById('pavilionLookCenter').addEventListener('click', ()=>{
    offset = maxOffset / 2;
    draw();
  });
  window.addEventListener('resize', ()=>measure(false));
  window.addEventListener('blur', releaseJoy);
  panorama.addEventListener('load', ()=>measure(true));

  function resolve(hotspot, area){
    if(area?.id !== 'nord' || !hotspot) return null;
    return Object.entries(definitions).find(([,def]) => def.ids.includes(hotspot.id))?.[0] || null;
  }

  function open(key, onClose){
    const config = definitions[key];
    if(!config || active) return false;
    active = key;
    restore = typeof onClose === 'function' ? onClose : null;
    const token = `esposizione-pavilion-${++historySequence}-${Date.now()}`;
    try {
      window.history.pushState({...window.history.state, esposizionePavilionToken: token}, '', window.location.href);
      pavilionHistoryToken = token;
    } catch (_) {
      pavilionHistoryToken = null;
    }
    view.dataset.pavilion = key;
    buildHotspots();
    document.getElementById('pavilionTitle').textContent = config.name;
    document.getElementById('pavilionHint').textContent = `Padiglione ${config.number} · Ingresso panoramico`;
    if(panorama.getAttribute('src') !== config.image) panorama.setAttribute('src', config.image);
    panorama.alt = config.alt;
    document.getElementById('pavilionStatus').textContent = config.status;
    view.hidden = false;
    measure(true);
    document.getElementById('pavilionExit').focus();
    return true;
  }

  function close(fromHistory=false){
    if(!active) return false;
    const ownedEntry = !!pavilionHistoryToken && window.history.state?.esposizionePavilionToken === pavilionHistoryToken;
    pavilionHistoryToken = null;
    hideBattle();
    hideShellGame();
    activity.hidden = true;
    selected = null;
    returnFocus = null;
    releaseJoy();
    active = null;
    stopDrag();
    view.hidden = true;
    delete view.dataset.pavilion;
    const fn = restore;
    restore = null;
    fn?.();
    if(!fromHistory && ownedEntry) window.history.back();
    return true;
  }

  window.addEventListener('popstate', ()=>{ if(active) close(true); });
  function isOpen(){ return !!active; }

  document.getElementById('pavilionExit').addEventListener('click', close);
  document.getElementById('pavilionInventory').addEventListener('click', ()=>{
    document.getElementById('pavilionStatus').textContent = 'Inventario: collegamento previsto nelle prossime fasi.';
  });

  document.addEventListener('keydown', event => {
    if(!active) return;
    if(event.key === 'Escape'){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(!shellgame.hidden) hideShellGame();
      else if(!battleship.hidden) hideBattle();
      else if(!activity.hidden) hideActivity();
      else close();
      return;
    }
    if(!battleship.hidden || !activity.hidden || !shellgame.hidden) return;
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
      event.preventDefault();
      event.stopImmediatePropagation();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }, true);

  window.EsposizionePavilions = Object.freeze({definitions, resolve, open, close, isOpen});
})();
