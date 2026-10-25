(function(){'use strict';
 const $=s=>document.querySelector(s);
 const ITEMS=[{"id": "biglietto_area_nord", "category": "documents", "name": "Biglietto Area Nord", "description": "Biglietto d'ingresso valido per l'Area Nord. Include un ombrello omaggio e 100 Lire dell'Esposizione.", "status": "Valido", "action": "Esamina", "icon": "🎟", "image": "images/ui/inventory/items/documents/biglietto_area_nord.png"}, {"id": "mappa_esposizione", "category": "useful", "name": "Mappa dell'Esposizione", "description": "Pianta dell’Esposizione per orientarsi tra padiglioni, viali e attrazioni.", "status": "Disponibile", "action": "Consulta", "icon": "🗺", "image": "images/ui/inventory/items/useful/mappa_esposizione.png"}, {"id": "ombrello_omaggio", "category": "gadgets", "name": "Ombrello omaggio", "description": "Un ombrello ricordo consegnato assieme al biglietto dell'Area Nord.", "status": "In possesso", "action": "Esamina", "icon": "☂", "image": "images/ui/inventory/items/gadgets/ombrello_omaggio.png"}, {"id": "moneta_benvenuto", "category": "collectibles", "name": "Moneta di benvenuto", "description": "Moneta commemorativa della visita all'Esposizione, da conservare nella collezione.", "status": "Raccolta", "action": "Osserva", "icon": "🪙", "image": "images/ui/inventory/items/collectibles/moneta_benvenuto.png"}, {"id": "chiave_area_sud", "category": "missions", "name": "Chiave misteriosa", "description": "Una chiave trovata per terra. Potrebbe aprire qualcosa nell'Area Sud.", "status": "Da usare", "action": "Esamina", "icon": "🗝", "image": "images/ui/inventory/items/missions/chiave_area_sud.png"}];
 ITEMS.push({
   id:'medaglia_ricordo_1892',
   category:'collectibles',
   name:'Medaglia Ricordo dell’Esposizione 1892',
   description:'Medaglia commemorativa dell’Esposizione di Genova del 1892. Un souvenir acquistabile nelle botteghe di tutti i padiglioni.',
   status:'Souvenir acquistato',
   action:'Osserva',
   icon:'🪙',
   image:'images/ui/inventory/items/collectibles/medaglia_ricordo_1892.png',
   inspectSubtitle:'Souvenir ufficiale dell’Esposizione · Osserva il fronte e il retro della medaglia.',
   inspectViews:[
     {src:'images/ui/inventory/items/collectibles/medaglia_ricordo_1892_front.png',label:'Fronte della medaglia'},
     {src:'images/ui/inventory/items/collectibles/medaglia_ricordo_1892_back.png',label:'Retro della medaglia'}
   ]
 });
 ITEMS.push({id:'cannocchiale_pallone_colombo',category:'gadgets',name:'Cannocchiale del Pallone Colombo',description:'Cannocchiale telescopico in ottone e cuoio, ricordo del Pallone Colombo. Uno strumento per osservare il panorama e immaginare i grandi viaggi dell’Esposizione.',status:'Gadget acquistato',action:'Osserva',icon:'🔭',image:'images/ui/inventory/items/gadgets/cannocchiale_pallone_colombo.png',inspectSubtitle:'Cannocchiale telescopico del Pallone Colombo · Genova 1892',inspectViews:[{src:'images/ui/inventory/items/gadgets/cannocchiale_pallone_colombo.png',label:'Cannocchiale del Pallone Colombo'}]});
 const CATS=[['documents','Documenti','▤'],['useful','Oggetti utili','⌖'],['gadgets','Gadget','✦'],['collectibles','Collezionabili','◈'],['missions','Missioni','⚿']];
 const KEY='esposizione_inventory_v1'; const WELCOME=['mappa_esposizione','moneta_benvenuto','ombrello_omaggio']; const defaults=()=>({version:2,points:100,lire:100,owned:['biglietto_area_nord','chiave_area_sud'],quantities:{},admission:{stamped:false,kitDelivered:false}});
 function load(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&Array.isArray(d.owned)&&Number.isFinite(d.points)&&Number.isFinite(d.lire)?d:defaults()}catch(_){return defaults()}}
 let state=load(),category='documents',opened=false,detail=null,inspectItem=null,inspectIndex=0;
 if(!state.quantities || typeof state.quantities!=='object')state.quantities={};
 // Le vecchie partite possedevano gia' il kit: nessuna rimozione o duplicazione.
 if(!state.admission||typeof state.admission!=='object'){
   const previousKit=WELCOME.every(id=>state.owned.includes(id));
   state.admission={stamped:previousKit,kitDelivered:previousKit};
 }
 const admission=()=>({stamped:!!state.admission.stamped,kitDelivered:!!state.admission.kitDelivered});
 const quantity=id=>Math.max(0,Math.floor(Number(state.quantities?.[id])||0));
 const overlay=$('#inventoryOverlay'),detailLayer=$('#inventoryDetail'),inspectLayer=$('#inventoryInspect');
 function store(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(err){console.warn('Inventario: salvataggio locale non disponibile',err)}}
 function illustration(item,large=false){const box=document.createElement('div');box.className='inventory-item-art'+(large?' big':'');const icon=document.createElement('span');icon.textContent=item.icon;box.appendChild(icon);const image=new Image();image.alt='';image.loading='lazy';image.onload=()=>{box.replaceChildren(image)};image.src=item.image;return box}
 function hasInspectViews(item){return !!(item&&Array.isArray(item.inspectViews)&&item.inspectViews.length)}
 function render(){ $('#inventoryPoints').textContent=state.points.toLocaleString('it-IT');$('#inventoryLire').textContent=state.lire.toLocaleString('it-IT');
 const tabs=$('#inventoryCategories');tabs.replaceChildren();for(const [id,label,icon] of CATS){const b=document.createElement('button');b.type='button';b.className=id===category?'selected':'';b.textContent=icon+' '+label;b.setAttribute('aria-pressed',String(id===category));b.onclick=()=>{category=id;render()};tabs.appendChild(b)}
 const grid=$('#inventoryGrid');grid.replaceChildren();const list=ITEMS.filter(x=>x.category===category&&state.owned.includes(x.id));if(!list.length){const p=document.createElement('p');p.textContent='Nessun oggetto in questa categoria.';grid.appendChild(p)}for(const item of list){const b=document.createElement('button');b.className='inventory-slot';b.type='button';b.append(illustration(item));const name=document.createElement('span');name.textContent=item.name+(quantity(item.id)>1?' × '+quantity(item.id):'');b.appendChild(name);b.onclick=()=>openDetail(item);grid.appendChild(b)}}
 function open(){if(opened||!window.EsposizioneInventoryCanOpen?.())return;opened=true;category='documents';detail=null;inspectItem=null;detailLayer.hidden=true;inspectLayer.hidden=true;overlay.hidden=false;window.EsposizioneInventoryGame?.()?.setPaused(true);render();$('#inventoryClose').focus()}
 function close(){if(!opened)return;opened=false;detail=null;inspectItem=null;detailLayer.hidden=true;inspectLayer.hidden=true;overlay.hidden=true;if(!window.EsposizionePavilions?.isOpen())window.EsposizioneInventoryGame?.()?.setPaused(false)}
 function openDetail(item){detail=item;inspectItem=null;inspectLayer.hidden=true;$('#inventoryDetailName').textContent=item.name;$('#inventoryDetailCategory').textContent=CATS.find(c=>c[0]===item.category)?.[1]||'';$('#inventoryDetailDescription').textContent=item.description;$('#inventoryDetailStatus').textContent='Stato: '+(item.id==='biglietto_area_nord'?(state.admission.stamped?'Timbrato':'Non timbrato'):item.status)+(quantity(item.id)>0?' · Quantità: '+quantity(item.id):'');$('#inventoryDetailImage').replaceChildren(illustration(item,true));$('#inventoryAction').textContent=item.action;detailLayer.hidden=false;$('#inventoryDetailClose').focus()}
 function closeDetail(){detail=null;closeInspect(true);detailLayer.hidden=true;$('#inventoryClose').focus()}
 function updateInspect(){if(!inspectItem||!hasInspectViews(inspectItem))return;const views=inspectItem.inspectViews;const view=views[inspectIndex]||views[0];$('#inventoryInspectTitle').textContent=inspectItem.name;$('#inventoryInspectSubtitle').textContent=inspectItem.inspectSubtitle||'Osserva da vicino l’oggetto selezionato.';$('#inventoryInspectImage').src=view.src;$('#inventoryInspectImage').alt=view.label||inspectItem.name;$('#inventoryInspectCaption').textContent=view.label||'';$('#inventoryInspectRotate').hidden=views.length<2;$('#inventoryInspectRotate').disabled=views.length<2}
 function openInspect(item){if(!hasInspectViews(item))return;inspectItem=item;inspectIndex=0;updateInspect();inspectLayer.hidden=false;$('#inventoryInspectClose').focus()}
 function rotateInspect(){if(!inspectItem||!hasInspectViews(inspectItem))return;inspectIndex=(inspectIndex+1)%inspectItem.inspectViews.length;updateInspect()}
 function closeInspect(silent=false){inspectItem=null;inspectLayer.hidden=true;if(!silent&&detailLayer.hidden===false)$('#inventoryAction').focus()}
 $('#inventoryPlayerBtn').onclick=open;$('#inventoryAdminBtn').onclick=open;$('#inventoryClose').onclick=close;$('#inventoryDetailClose').onclick=closeDetail;$('#inventoryBack').onclick=closeDetail;
 $('#inventoryInspectClose').onclick=()=>closeInspect(false);$('#inventoryInspectBack').onclick=()=>closeInspect(false);$('#inventoryInspectRotate').onclick=rotateInspect;
 $('#inventoryAction').onclick=()=>{if(!detail)return;if(hasInspectViews(detail)){openInspect(detail);return;}const status=detail.action==='Consulta'?'La mappa dettagliata sarà disponibile in una prossima versione.':'Oggetto esaminato. Le interazioni saranno disponibili nelle prossime versioni.';window.alert(status)};
 window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='i'&&!e.repeat&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();if(opened)close();else open()}else if(e.key==='Escape'&&opened){e.preventDefault();e.stopImmediatePropagation();if(!inspectLayer.hidden)closeInspect();else if(!detailLayer.hidden)closeDetail();else close()}},true);
 window.addEventListener('esposizione:inventory-start',e=>{if(opened)close();if(e.detail?.newGame){state=defaults();store()}else state=load()});
 window.EsposizioneInventory={open,close,isOpen:()=>opened,getState:()=>structuredClone(state),getAdmission:admission,
 stampTicketAndGiveWelcome(){
  if(state.admission.stamped&&state.admission.kitDelivered)return {ok:true,already:true,admission:admission()};
  const old=structuredClone(state);
  try{
   const next=structuredClone(state);
   if(!next.owned.includes('biglietto_area_nord'))next.owned.push('biglietto_area_nord');
   for(const id of WELCOME)if(!next.owned.includes(id))next.owned.push(id);
   next.admission={stamped:true,kitDelivered:true};
   localStorage.setItem(KEY,JSON.stringify(next));
   state=next;if(opened)render();
   return {ok:true,already:false,admission:admission()};
  }catch(err){state=old;console.error('Bigliettaio: impossibile salvare timbro e oggetti',err);return {ok:false,reason:'storage'};}
 },buy(id,price){
  if(!ITEMS.some(x=>x.id===id)||!Number.isSafeInteger(price)||price<0)return {ok:false,reason:'invalid'};
  if(!Number.isFinite(state.lire)||state.lire<price)return {ok:false,reason:'funds'};
  state.lire-=price;
  if(!state.owned.includes(id))state.owned.push(id);
  state.quantities[id]=quantity(id)+1;
  store();if(opened)render();
  return {ok:true,lire:state.lire,quantity:quantity(id)};
 },getQuantity:quantity,addItem(id){if(!ITEMS.some(x=>x.id===id))return false;if(!state.owned.includes(id)){state.owned.push(id);store();if(opened)render()}return true},addPoints(n){if(!Number.isFinite(n))return;state.points=Math.max(0,state.points+n);store();if(opened)render()},addLire(n){if(!Number.isFinite(n))return;state.lire=Math.max(0,state.lire+n);store();if(opened)render()}};
})();
