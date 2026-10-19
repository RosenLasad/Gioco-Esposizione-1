/* Fase 2 - Gestore unico degli ingressi; i minigiochi arriveranno nella fase 5. */
(function(){
  'use strict';
  const definitions=Object.freeze({
    battaglie:{name:'Teatro delle Battaglie',number:'4',ids:['hotspot-1790363509817'],image:'images/pavilions/battaglie.jpg'},
    fortuna:{name:'Galleria della Fortuna',number:'5',ids:['sport','hotspot-1790363448490'],image:'images/pavilions/fortuna.jpg'},
    invenzioni:{name:'Padiglione delle Invenzioni',number:'16',ids:['hotspot-1790363352923','hotspot-1790363463228'],image:'images/pavilions/invenzioni.jpg'}
  });
  const view=document.getElementById('pavilionView');
  const backdrop=document.getElementById('pavilionBackdrop');
  const viewport=document.getElementById('pavilionViewport');
  const panorama=document.getElementById('pavilionPanorama');
  const joystick=document.getElementById('pavilionJoystick');
  const knob=document.getElementById('pavilionJoystickKnob');
  let active=null,restore=null,offset=0,maxOffset=0,drag=null,joyPointer=null,joyValue=0,joyFrame=0,joyLast=0;
  let pavilionHistoryToken=null;
  let historySequence=0;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function draw(){
    panorama.style.transform=`translate3d(${-offset}px,-50%,0)`;

  }
  function measure(center=false){
    if(!active)return;
    const old=maxOffset?offset/maxOffset:.5;
    const vw=viewport.clientWidth,vh=viewport.clientHeight;
    // Il panorama e largo 3000/1050: copre interamente l'altezza della visuale.
    const imageWidth=vh*((panorama.naturalWidth && panorama.naturalHeight) ? panorama.naturalWidth / panorama.naturalHeight : 3000/1050);
    maxOffset=Math.max(0,imageWidth-vw);
    offset=maxOffset*(center?.5:old);
    draw();
  }
  function step(dir){offset=clamp(offset+dir*Math.max(80,viewport.clientWidth*.24),0,maxOffset);draw();}
  viewport.addEventListener('pointerdown',e=>{
    if(!active||e.button!==0)return;
    drag={id:e.pointerId,x:e.clientX,start:offset};
    viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');
    e.preventDefault();
  });
  viewport.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    offset=clamp(drag.start+(drag.x-e.clientX),0,maxOffset);draw();
  });
  function stopDrag(e){if(drag&&(!e||e.pointerId===drag.id)){drag=null;viewport.classList.remove('is-dragging');}}
  viewport.addEventListener('pointerup',stopDrag);
  viewport.addEventListener('pointercancel',stopDrag);
  viewport.addEventListener('lostpointercapture',stopDrag);
  // Joystick orizzontale analogico: spostamento proporzionale alla distanza dal centro.
  function setJoy(value){
    joyValue=clamp(value,-1,1);
    knob.style.left=`${50+joyValue*42}%`;
    joystick.setAttribute('aria-valuenow',String(Math.round(joyValue*100)));
    joystick.setAttribute('aria-valuetext',Math.abs(joyValue)<.06?'Fermo':joyValue<0?'Sinistra':'Destra');
  }
  function tickJoy(time){
    if(!active||!joyPointer){joyFrame=0;joyLast=0;return;}
    const dt=joyLast?Math.min((time-joyLast)/1000,.05):0;
    joyLast=time;
    if(Math.abs(joyValue)>.06){
      // Velocita da 0 fino a circa una larghezza viewport al secondo.
      const velocity=Math.sign(joyValue)*Math.pow(Math.abs(joyValue),1.35)*Math.max(240,viewport.clientWidth*1.1);
      offset=clamp(offset+velocity*dt,0,maxOffset);draw();
    }
    joyFrame=requestAnimationFrame(tickJoy);
  }
  function updateJoyFromPointer(e){
    const rect=joystick.getBoundingClientRect();
    const halfTravel=Math.max(1,rect.width*.42);
    setJoy((e.clientX-(rect.left+rect.width/2))/halfTravel);
  }
  function releaseJoy(){
    joyPointer=null;
    if(joyFrame)cancelAnimationFrame(joyFrame);
    joyFrame=0;joyLast=0;setJoy(0);
    joystick.classList.remove('is-active');
  }
  joystick.addEventListener('pointerdown',e=>{
    if(!active||e.button!==0)return;
    joyPointer=e.pointerId;updateJoyFromPointer(e);
    joystick.setPointerCapture(e.pointerId);
    joystick.classList.add('is-active');
    if(!joyFrame)joyFrame=requestAnimationFrame(tickJoy);
    e.preventDefault();
  });
  joystick.addEventListener('pointermove',e=>{if(joyPointer===e.pointerId)updateJoyFromPointer(e);});
  joystick.addEventListener('pointerup',e=>{if(joyPointer===e.pointerId)releaseJoy();});
  joystick.addEventListener('pointercancel',e=>{if(joyPointer===e.pointerId)releaseJoy();});
  joystick.addEventListener('lostpointercapture',e=>{if(joyPointer===e.pointerId)releaseJoy();});
  joystick.addEventListener('keydown',e=>{
    if(!active)return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      e.preventDefault();e.stopPropagation();
      step(e.key==='ArrowLeft'?-1:1);
    }
  });
  document.getElementById('pavilionLookCenter').addEventListener('click',()=>{offset=maxOffset/2;draw();});
  window.addEventListener('resize',()=>measure(false));
  window.addEventListener('blur',releaseJoy);
  panorama.addEventListener('load',()=>measure(true));
  function resolve(h,area){
    if(area?.id!=='nord'||!h)return null;
    return Object.entries(definitions).find(([,d])=>d.ids.includes(h.id))?.[0]||null;
  }
  function open(key,onClose){
    const config=definitions[key];if(!config||active)return false;
    active=key;restore=typeof onClose==='function'?onClose:null;
    // Una voce di cronologia permette al tasto Indietro Android di chiudere il padiglione.
    const token=`esposizione-pavilion-${++historySequence}-${Date.now()}`;
    try {
      window.history.pushState({...window.history.state,esposizionePavilionToken:token},'',window.location.href);
      pavilionHistoryToken=token;
    } catch (_) { pavilionHistoryToken=null; }
    view.dataset.pavilion=key;
    document.getElementById('pavilionTitle').textContent=config.name;
    document.getElementById('pavilionHint').textContent=`Padiglione ${config.number} · Ingresso sperimentale`;
    // Teatro delle Battaglie: fondale panoramico pulito; altri ingressi in TEST.
    const image = key==='battaglie' ? config.image : 'images/pavilions/panorama_test.svg';
    panorama.alt = key==='battaglie' ? 'Interno panoramico del Teatro delle Battaglie' : 'Panorama TEST';
    if (panorama.getAttribute('src') !== image) panorama.setAttribute('src',image);
    view.hidden=false;
    document.getElementById('pavilionStatus').textContent=key==='battaglie' ? 'Teatro delle Battaglie: panorama esplorabile.' : 'Panorama di prova esplorabile.';
    measure(true);
    document.getElementById('pavilionExit').focus();
    return true;
  }
  function close(fromHistory=false){
    if(!active)return false;
    const ownedEntry=!!pavilionHistoryToken&&window.history.state?.esposizionePavilionToken===pavilionHistoryToken;
    pavilionHistoryToken=null;
    releaseJoy();active=null;stopDrag();view.hidden=true;delete view.dataset.pavilion;
    const fn=restore;restore=null;fn?.();
    // Se l'uscita avviene da un pulsante, rimuove anche la voce aggiunta all'ingresso.
    if(!fromHistory&&ownedEntry)window.history.back();
    return true;
  }
  window.addEventListener('popstate',()=>{if(active)close(true);});
  function isOpen(){return !!active;}
  document.getElementById('pavilionExit').addEventListener('click',close);
  document.getElementById('pavilionInventory').addEventListener('click',()=>{
    document.getElementById('pavilionStatus').textContent='Inventario: collegamento previsto nelle prossime fasi.';
  });
  document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();step(e.key==='ArrowLeft'?-1:1);}},true);
  window.EsposizionePavilions=Object.freeze({definitions,resolve,open,close,isOpen});
})();
