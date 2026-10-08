(async function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const menu=$('#menuScreen'),screen=$('#gameScreen'),canvas=$('#gameCanvas'),frame=$('#gameFrame');
  const pauseOverlay=$('#pauseOverlay'),interactionOverlay=$('#interactionOverlay');
  const prompt=$('#prompt'),toast=$('#toast'),fade=$('#fade');
  const orientationDialog=$('#orientationDialog');
  let toastTimer=null,areaBadgeTimer=null,gameMode='player',pendingPlayerStart=null;

  function updateViewportMetrics(){
    const vv=window.visualViewport;
    const w=Math.max(1,Math.round(vv?.width||window.innerWidth));
    const h=Math.max(1,Math.round(vv?.height||window.innerHeight));
    document.documentElement.style.setProperty('--app-width',`${w}px`);
    document.documentElement.style.setProperty('--app-height',`${h}px`);
    return {w,h};
  }
  function fitCanvas(){
    updateViewportMetrics();
    const r=frame.getBoundingClientRect();
    canvas.width=Math.max(1,Math.round(r.width||window.innerWidth));
    canvas.height=Math.max(1,Math.round(r.height||window.visualViewport?.height||window.innerHeight));
  }
  fitCanvas();
  addEventListener('resize',fitCanvas);
  addEventListener('orientationchange',()=>setTimeout(fitCanvas,80));
  if(window.visualViewport){
    visualViewport.addEventListener('resize',fitCanvas);
    visualViewport.addEventListener('scroll',fitCanvas);
  }

  function isMobileLike(){return matchMedia('(pointer: coarse)').matches||innerWidth<=850}
  function currentFullscreenElement(){return document.fullscreenElement||document.webkitFullscreenElement}
  async function toggleFullscreen(){
    try{
      if(!currentFullscreenElement()){
        const el=document.documentElement;
        if(el.requestFullscreen)await el.requestFullscreen();
        else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
      }else{
        if(document.exitFullscreen)await document.exitFullscreen();
        else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
      }
    }catch(_){ui.onToast('Schermo intero non disponibile in questo browser')}
    updateFullscreenLabels();
  }
  function updateFullscreenLabels(){
    const active=!!currentFullscreenElement(),label=active?'Esci da schermo intero':'Schermo intero';
    const m=$('#menuFullscreenBtn'),p=$('#pauseFullscreenBtn'),h=$('#playerFullscreenBtn');
    if(m)m.textContent=label;if(p)p.textContent=label;if(h){h.textContent=active?'⛶':'⛶';h.title=label;h.setAttribute('aria-label',label)}
  }
  document.addEventListener('fullscreenchange',()=>{fitCanvas();updateFullscreenLabels()});
  document.addEventListener('webkitfullscreenchange',()=>{fitCanvas();updateFullscreenLabels()});

  function applyPlayerLayout(layout,remember=false){
    const value=layout==='portrait'?'portrait':'landscape';
    frame.classList.remove('layout-portrait','layout-landscape');
    frame.classList.add(`layout-${value}`);
    if(remember)localStorage.setItem('esposizione-player-layout',value);
  }
  function showOrientationPicker(startFn,force=false){
    if(!isMobileLike()){applyPlayerLayout(innerWidth>=innerHeight?'landscape':'portrait');startFn();return}
    const saved=localStorage.getItem('esposizione-player-layout');
    if(saved&&!force){applyPlayerLayout(saved);startFn();return}
    pendingPlayerStart=startFn;
    $('#rememberLayout').checked=true;
    orientationDialog.showModal();
  }
  function chooseLayout(layout){
    const remember=$('#rememberLayout').checked;
    applyPlayerLayout(layout,remember);
    orientationDialog.close();
    const fn=pendingPlayerStart;pendingPlayerStart=null;if(fn)fn();
  }

  function showAreaBadge(title){
    const badge=$('#playerAreaBadge');if(!badge)return;
    badge.textContent=title;badge.classList.remove('show');
    clearTimeout(areaBadgeTimer);requestAnimationFrame(()=>badge.classList.add('show'));
    areaBadgeTimer=setTimeout(()=>badge.classList.remove('show'),1800);
  }

  const ui={
    onArea(a){
      $('#areaLabel').textContent=a.title;$('#areaSubtitle').textContent=a.subtitle;
      if(gameMode==='player')showAreaBadge(a.title);
      game?.editor?.refreshMeta?.();game?.editor?.refreshFileState?.();
    },
    onZoom(z){if(gameMode==='admin')$('#areaSubtitle').textContent=`${game?.area?.subtitle||'Esposizione · 1892'} · zoom ${Math.round(z*100)}%`},
    onPrompt(text){
      prompt.hidden=!text;prompt.textContent=text;
      const touch=$('#touchInteract');touch?.classList.toggle('ready',!!text);touch?.setAttribute('aria-label',text?text.replace(/^E\s*·\s*/,''):'Interagisci');
    },
    onInteract(h){$('#interactionTitle').textContent=h.title;$('#interactionText').textContent=h.text;interactionOverlay.hidden=false;game.setPaused(true)},
    onToast(text){clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)},
    onFade(v){fade.classList.toggle('on',v)},
    onBoatGate(g,accept,cancel){confirm('Vuoi salire sul battello e raggiungere l’altra area dell’Esposizione?')?accept():cancel()},
    onExitGate(g,accept,cancel){if(!confirm('Vuoi lasciare l’Esposizione e tornare ai Giochi di Genova mApp?')){cancel();return}accept();game.requestSave();if(window.parent!==window){window.parent.postMessage({type:'genova-mapp:game-exit',game:'esposizione'},location.origin)}returnMenu(false)},
    onPause(){if(!screen.classList.contains('active')||game.editorActive)return;if(!interactionOverlay.hidden){closeInteraction();return}pauseOverlay.hidden=!pauseOverlay.hidden;game.setPaused(!pauseOverlay.hidden)}
  };

  // Online: i JSON pubblicati sono la sola fonte per collisioni e percorsi.
  // Offline (file://): il browser puo impedire fetch(); si usa la copia generata
  // dallo script AGGIORNA_MAPPE_OFFLINE.bat, mai un override nascosto del browser.
  if(location.protocol!=='file:'){
    for(const id of ['nord','sud']){
      try{
        const response=await fetch(`data/area_${id}_collisions.json`,{cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const d=await response.json();
        if(d.areaId!==id||!Array.isArray(d.walkable)||!Array.isArray(d.obstacles)||!Array.isArray(d.gates)||!Array.isArray(d.hotspots))throw new Error('Struttura JSON non valida');
        const a=window.EsposizioneAreas[id];
        for(const field of ['spawn','walkable','obstacles','hotspots','gates'])a[field]=d[field];
        console.info(`[Esposizione] Area ${id}: JSON pubblicato caricato`);
      }catch(err){
        console.error(`[Esposizione] Impossibile caricare il JSON dell'Area ${id}:`,err);
        alert(`Attenzione: impossibile caricare il JSON pubblicato dell'Area ${id}.\nVerifica data/area_${id}_collisions.json sul server. La mappa di riserva potrebbe non essere aggiornata.`);
      }
    }
  }
  // Online: le decorazioni pubblicate sono caricate dai file separati.
  if(location.protocol!=='file:'){
    for(const id of ['nord','sud']){
      try{
        const response=await fetch(`data/area_${id}_decor.json`,{cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const data=await response.json();
        if(data.areaId!==id||!Array.isArray(data.objects))throw new Error('JSON Decor non valido');
        window.EsposizioneAreas[id].decor=data.objects;
      }catch(err){console.error(`[Esposizione] Decor ${id}:`,err);}
    }
  }
  // Nessuna collisione viene piu caricata da localStorage.

  const game=new window.EsposizioneGame(canvas,ui);
  const editor=new window.EsposizioneEditor(game,{
    panel:$('#testPanel'),dragHandle:$('#testDragHandle'),close:$('#testClose'),resetPanel:$('#testResetPanel'),lockPanel:$('#testLockPanel'),
    select:$('#toolSelect'),undoHistory:$('#toolUndoHistory'),redoHistory:$('#toolRedoHistory'),saveCurrent:$('#toolSaveCurrent'),saveDecor:$('#toolSaveDecor'),
    obstacle:$('#toolObstacle'),walkable:$('#toolWalkable'),point:$('#toolPoint'),removePoint:$('#toolRemovePoint'),finish:$('#toolFinish'),remove:$('#toolDelete'),
    gateArea:$('#toolGateArea'),gateBoat:$('#toolGateBoat'),gateExit:$('#toolGateExit'),gateEdit:$('#toolGateEdit'),gateWDown:$('#toolGateWDown'),gateWUp:$('#toolGateWUp'),gateHDown:$('#toolGateHDown'),gateHUp:$('#toolGateHUp'),
    hotspot:$('#toolHotspot'),hotspotEdit:$('#toolHotspotEdit'),hotspotRadiusDown:$('#toolHotspotRadiusDown'),hotspotRadiusUp:$('#toolHotspotRadiusUp'),
    decor:$('#toolDecor'),palm:$('#toolPalm'),decorMenu:$('#toolDecorMenu'),palmMenu:$('#toolPalmMenu'),decorItems:[...document.querySelectorAll('[data-decor-kind="lamp"]')],palmItems:[...document.querySelectorAll('[data-decor-kind="palm"]')],scaleDown:$('#toolScaleDown'),scaleUp:$('#toolScaleUp'),anchorDown:$('#toolAnchorDown'),anchorUp:$('#toolAnchorUp'),rotateLeft:$('#toolRotateLeft'),rotateRight:$('#toolRotateRight'),duplicateDecor:$('#toolDuplicateDecor'),
    zoomOut:$('#toolZoomOut'),zoomIn:$('#toolZoomIn'),zoomReset:$('#toolZoomReset'),centerPlayer:$('#toolCenterPlayer'),centerPlayer2:$('#toolCenterPlayer2'),toggleCollisions:$('#toolToggleCollisions'),toggleGates:$('#toolToggleGates'),toggleHotspots:$('#toolToggleHotspots'),toggleDecor:$('#toolToggleDecor'),
    setSpawn:$('#toolSetSpawn'),teleport:$('#toolTeleport'),speed1:$('#toolSpeed1'),speed2:$('#toolSpeed2'),speed4:$('#toolSpeed4'),
    playerScale:$('#testPlayerScale'),playerScaleValue:$('#testPlayerScaleValue'),maxZoom:$('#testMaxZoom'),maxZoomValue:$('#testMaxZoomValue'),
    linkJSON:$('#toolLinkJSON'),export:$('#toolExport'),importBtn:$('#toolImport'),importInput:$('#toolImportInput'),copyJSON:$('#toolCopyJSON'),decorExport:$('#toolDecorExport'),decorImportBtn:$('#toolDecorImport'),decorImportInput:$('#toolDecorImportInput'),
    panelReset:$('#toolPanelReset'),panelCompact:$('#toolPanelCompact'),panelLock:$('#toolPanelLock'),
    status:$('#testStatus'),coords:$('#testCoords'),area:$('#testArea'),selected:$('#testSelected'),saveState:$('#testSaveState'),fileState:$('#testFileState')
  });
  game.editor=editor;

  function setMode(mode){
    gameMode=mode==='admin'?'admin':'player';
    frame.classList.toggle('admin-mode',gameMode==='admin');frame.classList.toggle('player-mode',gameMode==='player');
    $('.player-hud')?.setAttribute('aria-hidden',gameMode==='player'?'false':'true');
    if(gameMode==='admin'){frame.classList.remove('layout-portrait','layout-landscape');editor.toggle(false)}
    game.debug=false;
  }
  function updateMenu(){const s=window.EsposizioneSave.load();$('#continueBtn').disabled=!s;const areaName=s?.area==='sud'?'Area Sud':'Area Nord';$('#saveInfo').textContent=s?`Salvataggio: ${areaName} · ${new Date(s.updatedAt).toLocaleString('it-IT')}`:'Nessuna partita salvata.'}
  function closeInteraction(){interactionOverlay.hidden=true;game.setPaused(false)}
  function showGame(save,mode='player'){
    setMode(mode);menu.classList.remove('active');screen.classList.add('active');pauseOverlay.hidden=true;interactionOverlay.hidden=true;editor.toggle(false);fitCanvas();game.start(save);
  }
  function returnMenu(save){if(save)game.requestSave();editor.toggle(false);game.stop();screen.classList.remove('active');menu.classList.add('active');pauseOverlay.hidden=true;interactionOverlay.hidden=true;frame.classList.remove('admin-mode','player-mode','layout-portrait','layout-landscape');updateMenu()}

  $('#playerGameBtn').onclick=()=>showOrientationPicker(()=>{window.EsposizioneSave.clear();showGame(null,'player')});
  $('#newGameBtn').onclick=()=>{window.EsposizioneSave.clear();showGame(null,'admin')};
  $('#continueBtn').onclick=()=>showOrientationPicker(()=>showGame(window.EsposizioneSave.load(),'player'));
  const resetBtn=$('#resetPositionBtn');if(resetBtn)resetBtn.onclick=()=>{window.EsposizioneSave.clear();updateMenu();$('#saveInfo').textContent='Posizione ripristinata. Puoi iniziare una nuova visita.'};
  $('#guideBtn').onclick=()=>$('#guideDialog').showModal();$('#guideClose').onclick=()=>$('#guideDialog').close();
  $('#menuFullscreenBtn').onclick=toggleFullscreen;$('#playerFullscreenBtn').onclick=toggleFullscreen;$('#pauseFullscreenBtn').onclick=toggleFullscreen;
  $('#playerMenuBtn').onclick=ui.onPause;
  $('#pauseLayoutBtn').onclick=()=>{if(gameMode!=='player'||!isMobileLike()){ui.onToast('Layout smartphone disponibile su schermi piccoli');return}pauseOverlay.hidden=true;game.setPaused(true);showOrientationPicker(()=>{game.setPaused(false)},true)};
  $('#chooseLandscape').onclick=()=>chooseLayout('landscape');$('#choosePortrait').onclick=()=>chooseLayout('portrait');
  $('#orientationCancel').onclick=()=>{pendingPlayerStart=null;orientationDialog.close();if(screen.classList.contains('active'))game.setPaused(false)};

  $('#pauseBtn').onclick=ui.onPause;$('#resumeBtn').onclick=ui.onPause;$('#saveBtn').onclick=()=>{game.requestSave();ui.onToast('Posizione salvata')};
  $('#saveMenuBtn').onclick=()=>returnMenu(true);$('#menuBtn').onclick=()=>returnMenu(false);
  $('#interactionClose').onclick=closeInteraction;interactionOverlay.addEventListener('click',e=>{if(e.target===interactionOverlay)closeInteraction()});
  $('#debugBtn').onclick=()=>{if(gameMode!=='admin')return;game.debug=!game.debug;ui.onToast(game.debug?'Collisioni visibili':'Collisioni nascoste')};
  $('#testBtn').onclick=()=>{if(gameMode==='admin')editor.toggle()};
  $('#touchInteract').onclick=()=>game.interact();

  const joy=$('#joystick'),knob=$('#joystickKnob');let jid=null;
  function joyMove(e){if(jid!==e.pointerId||game.editorActive)return;const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.32,l=Math.hypot(dx,dy)||1;if(l>max){dx=dx/l*max;dy=dy/l*max}knob.style.transform=`translate(${dx}px,${dy}px)`;game.setJoystick(dx/max,dy/max)}
  joy.onpointerdown=e=>{if(game.editorActive)return;jid=e.pointerId;joy.setPointerCapture(jid);joyMove(e)};joy.onpointermove=joyMove;
  function joyEnd(e){if(jid!==e.pointerId)return;jid=null;knob.style.transform='translate(0,0)';game.setJoystick(0,0)}
  joy.onpointerup=joyEnd;joy.onpointercancel=joyEnd;

  // If Netlify injects a small preview badge into the same document, hide only explicitly labelled badge elements.
  function hideNetlifyBadge(){
    document.querySelectorAll('iframe[src*="netlify" i], [aria-label*="Powered by Netlify" i], [title*="Powered by Netlify" i]').forEach(el=>{el.style.setProperty('display','none','important')});
    for(const el of document.querySelectorAll('body *')){if(el.children.length<=2&&el.textContent?.trim()==='Powered by Netlify')el.style.setProperty('display','none','important')}
  }
  hideNetlifyBadge();new MutationObserver(hideNetlifyBadge).observe(document.body,{childList:true,subtree:true});

  setMode('player');frame.classList.remove('player-mode');updateFullscreenLabels();updateMenu();
})();
