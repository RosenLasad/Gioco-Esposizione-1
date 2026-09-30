(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const menu=$('#menuScreen'),screen=$('#gameScreen'),canvas=$('#gameCanvas');
  const pauseOverlay=$('#pauseOverlay'),interactionOverlay=$('#interactionOverlay');
  const prompt=$('#prompt'),toast=$('#toast'),fade=$('#fade');
  let toastTimer=null;
  function fitCanvas(){canvas.width=innerWidth;canvas.height=innerHeight}
  fitCanvas();addEventListener('resize',fitCanvas);
  const ui={
    onArea(a){$('#areaLabel').textContent=a.title;$('#areaSubtitle').textContent=a.subtitle;game?.editor?.refreshMeta?.();game?.editor?.refreshFileState?.()},
    onZoom(z){$('#areaSubtitle').textContent=`${game?.area?.subtitle||'Esposizione · 1892'} · zoom ${Math.round(z*100)}%`},
    onPrompt(text){prompt.hidden=!text;prompt.textContent=text},
    onInteract(h){$('#interactionTitle').textContent=h.title;$('#interactionText').textContent=h.text;interactionOverlay.hidden=false;game.setPaused(true)},
    onToast(text){clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)},
    onFade(v){fade.classList.toggle('on',v)},
    onBoatGate(g,accept,cancel){confirm('Vuoi salire sul battello e raggiungere l’altra area dell’Esposizione?')?accept():cancel()},
    onExitGate(g,accept,cancel){if(!confirm('Vuoi lasciare l’Esposizione e tornare ai Giochi di Genova mApp?')){cancel();return}accept();game.requestSave();if(window.parent!==window){window.parent.postMessage({type:'genova-mapp:game-exit',game:'esposizione'},location.origin)}returnMenu(false)},
    onPause(){if(!screen.classList.contains('active')||game.editorActive)return;if(!interactionOverlay.hidden){closeInteraction();return}pauseOverlay.hidden=!pauseOverlay.hidden;game.setPaused(!pauseOverlay.hidden)}
  };
  // Applica l'ultima versione salvata dal pannello TEST come override di sviluppo.
  // In questo modo il gioco ricarica subito le modifiche anche se areas.js contiene ancora il fallback incorporato.
  for(const id of ['nord','sud']){try{const raw=localStorage.getItem(`esposizione-editor-area-${id}`);if(!raw)continue;const d=JSON.parse(raw),a=window.EsposizioneAreas?.[id];if(!a)continue;if(d.spawn)a.spawn=d.spawn;if(d.walkable)a.walkable=d.walkable;if(d.obstacles)a.obstacles=d.obstacles;if(d.hotspots)a.hotspots=d.hotspots;if(d.gates)a.gates=d.gates}catch(_){}}
  const game=new window.EsposizioneGame(canvas,ui);
  const editor=new window.EsposizioneEditor(game,{
    panel:$('#testPanel'),dragHandle:$('#testDragHandle'),close:$('#testClose'),resetPanel:$('#testResetPanel'),lockPanel:$('#testLockPanel'),
    select:$('#toolSelect'),undoHistory:$('#toolUndoHistory'),redoHistory:$('#toolRedoHistory'),saveCurrent:$('#toolSaveCurrent'),
    obstacle:$('#toolObstacle'),walkable:$('#toolWalkable'),point:$('#toolPoint'),removePoint:$('#toolRemovePoint'),finish:$('#toolFinish'),remove:$('#toolDelete'),
    gateArea:$('#toolGateArea'),gateBoat:$('#toolGateBoat'),gateExit:$('#toolGateExit'),gateEdit:$('#toolGateEdit'),gateWDown:$('#toolGateWDown'),gateWUp:$('#toolGateWUp'),gateHDown:$('#toolGateHDown'),gateHUp:$('#toolGateHUp'),
    hotspot:$('#toolHotspot'),hotspotEdit:$('#toolHotspotEdit'),hotspotRadiusDown:$('#toolHotspotRadiusDown'),hotspotRadiusUp:$('#toolHotspotRadiusUp'),
    decor:$('#toolDecor'),palm:$('#toolPalm'),scaleDown:$('#toolScaleDown'),scaleUp:$('#toolScaleUp'),anchorDown:$('#toolAnchorDown'),anchorUp:$('#toolAnchorUp'),rotateLeft:$('#toolRotateLeft'),rotateRight:$('#toolRotateRight'),duplicateDecor:$('#toolDuplicateDecor'),
    zoomOut:$('#toolZoomOut'),zoomIn:$('#toolZoomIn'),zoomReset:$('#toolZoomReset'),centerPlayer:$('#toolCenterPlayer'),centerPlayer2:$('#toolCenterPlayer2'),toggleCollisions:$('#toolToggleCollisions'),toggleGates:$('#toolToggleGates'),toggleHotspots:$('#toolToggleHotspots'),toggleDecor:$('#toolToggleDecor'),
    setSpawn:$('#toolSetSpawn'),teleport:$('#toolTeleport'),speed1:$('#toolSpeed1'),speed2:$('#toolSpeed2'),speed4:$('#toolSpeed4'),
    linkJSON:$('#toolLinkJSON'),export:$('#toolExport'),importBtn:$('#toolImport'),importInput:$('#toolImportInput'),copyJSON:$('#toolCopyJSON'),decorExport:$('#toolDecorExport'),decorImportBtn:$('#toolDecorImport'),decorImportInput:$('#toolDecorImportInput'),
    panelReset:$('#toolPanelReset'),panelCompact:$('#toolPanelCompact'),panelLock:$('#toolPanelLock'),
    status:$('#testStatus'),coords:$('#testCoords'),area:$('#testArea'),selected:$('#testSelected'),saveState:$('#testSaveState'),fileState:$('#testFileState')
  });
  game.editor=editor;
  function updateMenu(){const s=window.EsposizioneSave.load();$('#continueBtn').disabled=!s;const areaName=s?.area==='sud'?'Area Sud':'Area Nord';$('#saveInfo').textContent=s?`Salvataggio: ${areaName} · ${new Date(s.updatedAt).toLocaleString('it-IT')}`:'Nessuna partita salvata.'}
  function closeInteraction(){interactionOverlay.hidden=true;game.setPaused(false)}
  function showGame(save){menu.classList.remove('active');screen.classList.add('active');pauseOverlay.hidden=true;interactionOverlay.hidden=true;editor.toggle(false);game.start(save)}
  function returnMenu(save){if(save)game.requestSave();editor.toggle(false);game.stop();screen.classList.remove('active');menu.classList.add('active');pauseOverlay.hidden=true;interactionOverlay.hidden=true;updateMenu()}
  $('#newGameBtn').onclick=()=>{window.EsposizioneSave.clear();showGame(null)};
  $('#continueBtn').onclick=()=>showGame(window.EsposizioneSave.load());
  const resetBtn=$('#resetPositionBtn');if(resetBtn)resetBtn.onclick=()=>{window.EsposizioneSave.clear();showGame(null)};
  $('#guideBtn').onclick=()=>$('#guideDialog').showModal();$('#guideClose').onclick=()=>$('#guideDialog').close();
  $('#pauseBtn').onclick=ui.onPause;$('#resumeBtn').onclick=ui.onPause;$('#saveBtn').onclick=()=>{game.requestSave();ui.onToast('Posizione salvata')};
  $('#saveMenuBtn').onclick=()=>returnMenu(true);$('#menuBtn').onclick=()=>returnMenu(false);
  $('#interactionClose').onclick=closeInteraction;
  interactionOverlay.addEventListener('click',e=>{if(e.target===interactionOverlay)closeInteraction()});
  $('#debugBtn').onclick=()=>{game.debug=!game.debug;ui.onToast(game.debug?'Collisioni visibili':'Collisioni nascoste')};
  $('#testBtn').onclick=()=>editor.toggle();
  $('#touchInteract').onclick=()=>game.interact();
  const joy=$('#joystick'),knob=$('#joystickKnob');let jid=null;
  function joyMove(e){if(jid!==e.pointerId||game.editorActive)return;const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.32,l=Math.hypot(dx,dy)||1;if(l>max){dx=dx/l*max;dy=dy/l*max}knob.style.transform=`translate(${dx}px,${dy}px)`;game.setJoystick(dx/max,dy/max)}
  joy.onpointerdown=e=>{if(game.editorActive)return;jid=e.pointerId;joy.setPointerCapture(jid);joyMove(e)};joy.onpointermove=joyMove;function joyEnd(e){if(jid!==e.pointerId)return;jid=null;knob.style.transform='translate(0,0)';game.setJoystick(0,0)}joy.onpointerup=joyEnd;joy.onpointercancel=joyEnd;
  updateMenu();
})();
