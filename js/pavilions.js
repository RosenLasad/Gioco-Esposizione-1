(function(){
  'use strict';

  const registry=window.EsposizionePavilionRegistry;
  const minigames=window.EsposizioneMinigames;
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
  const guidePanel = document.getElementById('pavilionGuide');
  const shopPanel = document.getElementById('pavilionShop');


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
  let pavilionHistoryToken = null;
  let historySequence = 0;
  let gameHistoryActive = false;

  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

  function currentItems(){
    return registry.get(active)?.items || [];
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

  function buildGuide(){
    const config = registry.get(active);
    guidePanel.replaceChildren();
    const make = (tag, cls, content, parent=guidePanel) => {
      const el = document.createElement(tag);
      if(cls) el.className = cls;
      if(content !== undefined) el.textContent = content;
      parent.appendChild(el);
      return el;
    };
    make('div', 'guide-kicker', 'ESPOSIZIONE INTERNAZIONALE DI GENOVA · 1892');
    make('h3', 'guide-name', config.name);
    make('p', 'guide-number', `PADIGLIONE N° ${config.number}`);
    make('p', 'guide-intro', config.guideIntro || `Scoprite le attrazioni e le curiosità di ${config.name}.`);
    make('h4', 'guide-section-title', 'Giochi e attività');
    const list = make('div', 'guide-list');
    for(const entry of config.items.filter(i => i.id !== 'guida' && i.id !== 'shopping')){
      const row = make('div', 'guide-entry', undefined, list);
      make('span', `guide-entry-icon hotspot-${entry.color}`, entry.icon, row);
      const texts = make('div', 'guide-entry-texts', undefined, row);
      make('strong', '', entry.name, texts);
      make('p', '', entry.desc, texts);
    }
    const shops = config.items.filter(i => i.id === 'shopping');
    if(shops.length){
      make('h4', 'guide-section-title', 'Bottega e souvenir');
      for(const entry of shops){
        const row = make('div', 'guide-entry', undefined, guidePanel);
        make('span', `guide-entry-icon hotspot-${entry.color}`, entry.icon, row);
        const texts = make('div', 'guide-entry-texts', undefined, row);
        make('strong', '', entry.name, texts);
        make('p', '', entry.desc, texts);
      }
    }
    if(config.guideClosing) make('p', 'guide-closing', config.guideClosing);
  }

  function buildShop(){
    const inventory=window.EsposizioneInventory;
    const products=[
      {id:'medaglia_ricordo_1892',name:'Medaglia Ricordo dell’Esposizione 1892',price:10,category:'Collezionabili',image:'images/ui/inventory/items/collectibles/medaglia_ricordo_1892.png',description:'Medaglia commemorativa dell’Esposizione genovese del 1892.'}
    ];
    // Il cannocchiale è acquistabile solo all'ingresso del Pallone Colombo.
    if(active==='pallonecolombo')products.push({id:'cannocchiale_pallone_colombo',name:'Cannocchiale del Pallone Colombo',price:15,category:'Gadget',image:'images/ui/inventory/items/gadgets/cannocchiale_pallone_colombo.png',description:'Cannocchiale ottocentesco in ottone e cuoio, da conservare nel tuo Inventario.'});
    shopPanel.replaceChildren();
    const kicker=document.createElement('p');kicker.className='shop-kicker';kicker.textContent='ESPOSIZIONE INTERNAZIONALE DI GENOVA · 1892';
    const heading=document.createElement('h2');heading.textContent='Bottega dei Ricordi';
    const subtitle=document.createElement('p');subtitle.className='shop-subtitle';subtitle.textContent=active==='pallonecolombo'?'Souvenir e strumenti del Pallone Colombo':'Un souvenir in ogni padiglione';
    const wallet=document.createElement('p');wallet.className='shop-wallet';
    const refresh=()=>{wallet.textContent=`Disponibilità: ${inventory?.getState()?.lire??0} Lire`;};
    shopPanel.append(kicker,heading,subtitle,wallet);
    const updates=[];
    for(const item of products){
      const product=document.createElement('div');product.className='shop-product';
      const image=document.createElement('img');image.src=item.image;image.alt=item.name;
      const details=document.createElement('div');
      const name=document.createElement('h3');name.textContent=item.name;
      const description=document.createElement('p');description.textContent=item.description;
      const price=document.createElement('strong');price.textContent=`${item.price} Lire · ${item.category}`;
      const qty=document.createElement('p');
      const button=document.createElement('button');button.className='activity-primary shop-buy';button.type='button';button.textContent=`Acquista · ${item.price} Lire`;
      const result=document.createElement('p');result.className='shop-result';result.setAttribute('role','status');
      const update=()=>{qty.textContent=`Posseduti: ${inventory?.getQuantity?.(item.id)??0}`;button.disabled=(inventory?.getState()?.lire??0)<item.price;};
      button.addEventListener('click',()=>{
        const outcome=inventory?.buy(item.id,item.price);
        if(outcome?.ok){result.textContent=`Acquisto riuscito! ${item.name} aggiunto a ${item.category}.`;refresh();for(const fn of updates)fn();}
        else{result.textContent=outcome?.reason==='funds'?'Lire insufficienti.':'Acquisto non disponibile.';refresh();for(const fn of updates)fn();}
      });
      details.append(name,description,price,qty,button,result);product.append(image,details);shopPanel.append(product);
      updates.push(update);
    }
    refresh();for(const fn of updates)fn();
  }

  function showActivity(item, button){
    releaseJoy();
    selected = item;
    returnFocus = button;
    const isGuide = item.id === 'guida';
    const isShop = item.id === 'shopping';
    shopPanel.hidden = !isShop;
    if(isShop)buildShop();
    guidePanel.hidden = !isGuide;
    if(isGuide) buildGuide();
    activityIcon.hidden = isGuide || isShop;
    activityIcon.textContent = item.icon;
    activityIcon.className = 'activity-large-icon hotspot-' + item.color;
    activityTitle.hidden = isGuide || isShop;
    activityTitle.textContent = item.name;
    activityDescription.hidden = isGuide || isShop;
    activityDescription.textContent = item.desc;
    const hasAction = !isGuide && !isShop && !!item.action;
    activityMessage.textContent = hasAction ? '' : 'Attività in preparazione';
    activityMessage.hidden = hasAction || isGuide || isShop;
    activityStart.hidden = !hasAction;
    activityStart.textContent = item.action === 'telegrafo' ? 'Avvia gioco' : 'Avvia attività';
    activity.classList.toggle('guide-mode', isGuide);
    activity.classList.toggle('shop-mode', isShop);
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
    minigames.get(action)?.start();
    if(minigames.anyOpen()) enterGameHistory();
  });

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
    if(!active || !activity.hidden || minigames.anyOpen() || event.button !== 0 || event.target.closest?.('.pavilion-hotspot')) return;
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
    return registry.all().find(def => def.ids.includes(hotspot.id))?.key || null;
  }

  function open(key, onClose){
    const config = registry.get(key);
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
    const hadGameEntry = ownedEntry && gameHistoryActive && !!window.history.state?.esposizioneGameLayer;
    pavilionHistoryToken = null;
    gameHistoryActive = false;
    minigames.closeAll();
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
    if(!fromHistory && ownedEntry) {
      if(hadGameEntry) window.history.go(-2);
      else window.history.back();
    }
    return true;
  }

  // Lo smartphone usa la cronologia, non gli eventi keydown/Escape.
  // Ogni minigioco occupa un livello di history sopra quello del padiglione.
  function enterGameHistory(){
    if(!active || !minigames.anyOpen() || gameHistoryActive) return;
    try {
      window.history.pushState({...window.history.state, esposizioneGameLayer:true}, '', window.location.href);
      gameHistoryActive=true;
    } catch (_) { gameHistoryActive=false; }
  }
  function dismissGameHistory(){
    if(!gameHistoryActive)return;
    gameHistoryActive=false;
    // L'entry sottostante resta quella del padiglione.
    if(active && window.history.state?.esposizioneGameLayer)window.history.back();
  }
  function backInMinigame(){
    for(const id of ['bombarda','battleship','telegrafo','bussolotti','macchinista']){
      const game=minigames.get(id);
      if(game?.isOpen()){
        if(game.back)game.back();else game.close();
        return true;
      }
    }
    return false;
  }
  window.addEventListener('popstate', ()=>{
    if(!active)return;
    if(window.history.state?.esposizionePavilionToken!==pavilionHistoryToken){
      gameHistoryActive=false;
      close(true);
      return;
    }
    // Tornati dall'entry del gioco all'entry del padiglione.
    if(gameHistoryActive){
      gameHistoryActive=false;
      if(backInMinigame() && minigames.anyOpen())enterGameHistory();
    }
  });
  function isOpen(){ return !!active; }

  document.getElementById('pavilionExit').addEventListener('click', close);
  document.getElementById('pavilionInventory').addEventListener('click', ()=>{
    if(!activity.hidden)hideActivity();
    if(!minigames.anyOpen())window.EsposizioneInventory?.open();
  });

  document.addEventListener('keydown', event => {
    if(!active) return;
    if(event.key === 'Escape'){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(minigames.anyOpen())backInMinigame();
      else if(!activity.hidden) hideActivity();
      else close();
      return;
    }
    if(minigames.anyOpen() || !activity.hidden) return;
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
      event.preventDefault();
      event.stopImmediatePropagation();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }, true);

  const definitions = Object.freeze(Object.fromEntries(registry.all().map(config=>[config.key,config])));
  window.EsposizionePavilions = Object.freeze({definitions, resolve, open, close, isOpen, dismissGameHistory});
})();
