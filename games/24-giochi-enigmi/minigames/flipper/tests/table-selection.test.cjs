const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {pathToFileURL}=require('node:url'),assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
function setup(entries=[]){
  const nodes=[],images=[],storage=new Map(entries),events={};
  function node(id=''){
    const n={id,hidden:false,style:{},listeners:{},value:'',textContent:'',
      addEventListener(t,fn){this.listeners[t]=fn},querySelector(){return {querySelector(){return {}}}},
      querySelectorAll(){return []},appendChild(){},insertBefore(){},parentNode:{insertBefore(){}},
      setPointerCapture(){}};
    nodes.push(n);return n;
  }
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/id="([^"]+)"/g))node(match[1]);
  const get=id=>nodes.find(n=>n.id===id)||null;
  get('pavilionFlipper').hidden=true;
  const context=new Proxy({createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}},{get(t,p){return t[p]||(()=>{})},set(t,p,v){t[p]=v;return true}});
  get('flipperCanvas').getContext=()=>context;get('flipperCanvas').parentElement={clientWidth:440,clientHeight:840};
  class Audio {constructor(src){this.src=src;this.paused=true}pause(){this.paused=true}play(){this.paused=false;return Promise.resolve()}}
  class Image {constructor(){this.naturalWidth=100;this.naturalHeight=30;images.push(this)}}
  const s={URL,Map,Set,Math,Date,performance,Audio,Image,location:{protocol:'file:'},
    document:{getElementById:get,currentScript:{src:pathToFileURL(path.join(root,'game.js')).href},
      createElement(){return node()},addEventListener(){}},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    requestAnimationFrame(){return 1},cancelAnimationFrame(){},confirm(){return true},
    addEventListener(t,fn){events[t]=fn},matchMedia(){return {matches:false}},
    EsposizioneMinigames:{register(id,game){s.game=game}},images,storage,get};
  s.window=s;vm.createContext(s);
  vm.runInContext(fs.readFileSync(path.join(root,'extra-tables.js'),'utf8'),s);
  vm.runInContext(source.replace(/\}\)\(\);\s*$/,
    'window.api={selectTable,start,showMenu,continueGame,launch,update,record,saveRecord,saveGame,readSave,clearSave,applyAssetManifest,'+
    'snapshot:()=>({id:activeTable.id,phase,score,remaining,ball,saveKey,recordKey}),setScore:v=>score=v,'+
    'presets:tablePresets,images:imageAssets};})();'),s);
  s.game.start();return s;
}
test('Menu con tre scelte, tavole identiche ma oggetti e percorsi indipendenti',()=>{
  const s=setup(),p=s.api.presets;assert.equal(p.length,3);
  assert.equal(p[0].name,'Tavola 1684');assert.equal(p[1].name,'Tavola Test 2');assert.equal(p[2].name,'Tavola Test 3');
  for(const copy of p.slice(1)){
    assert.equal(JSON.stringify(copy.objects),JSON.stringify(p[0].objects));
    assert.notEqual(copy.objects,p[0].objects);assert.notEqual(copy.objects[0],p[0].objects[0]);
    for(const [id,asset] of Object.entries(copy.manifest.assets)){
      assert.notEqual(asset,p[0].manifest.assets[id]);assert.ok(fs.existsSync(path.join(root,asset)));
      const candidate=asset.replace(/\.svg$/,'.png'),original=p[0].manifest.assets[id].replace(/\.svg$/,'.png');
      if(fs.existsSync(path.join(root,original)))assert.ok(fs.readFileSync(path.join(root,candidate)).equals(fs.readFileSync(path.join(root,original))));
    }
    for(const [key,audio] of Object.entries(copy.audio)){
      assert.notEqual(audio,p[0].audio[key]);
      assert.equal(fs.existsSync(path.join(root,audio)),fs.existsSync(path.join(root,p[0].audio[key])));
      if(fs.existsSync(path.join(root,audio)))assert.ok(fs.readFileSync(path.join(root,audio)).equals(fs.readFileSync(path.join(root,p[0].audio[key]))));
    }
  }
});
test('Salvataggi e record separati: cambiare tavola e continuare mantiene ogni partita',()=>{
  const s=setup();
  for(const id of [1,2,3]){
    assert.equal(s.api.selectTable(id),true);s.api.start();s.api.setScore(id*100);s.api.saveRecord();
    s.api.showMenu();assert.equal(s.api.readSave().table,id);assert.equal(s.api.readSave().score,id*100);
  }
  for(const id of [3,1,2]){
    s.api.selectTable(id);assert.equal(s.api.record(),id*100);s.api.continueGame();
    assert.equal(s.api.snapshot().score,id*100);assert.equal(s.api.snapshot().ball.x,421);
    s.api.showMenu();
  }
  s.api.selectTable(2);s.api.clearSave();assert.equal(s.api.readSave(),null);
  s.api.selectTable(1);assert.equal(s.api.readSave().score,100);
});
test('Conserva record storico della prima tavola e ricorda la selezione',()=>{
  const s=setup([['esposizione-flipper-record-v1','9876']]);
  assert.equal(s.api.record(),9876);s.api.selectTable(3);assert.equal(s.api.record(),0);
  assert.equal(s.storage.get('colombiadi1892.flipper.selectedTable.v1'),'3');
  const resumed=setup([...s.storage]);assert.equal(resumed.api.snapshot().id,3);
});
test('Cannone e corsia funzionano su tutte e tre le tavole',()=>{
  const s=setup();
  for(const id of [1,2,3]){
    s.api.selectTable(id);s.api.start();s.api.launch();
    let entered=false;
    for(let i=0;i<120;i++){
      s.api.update(1/60);const ball=s.api.snapshot().ball;
      assert.ok(ball);
      if(!ball.inLauncher&&ball.x<388){entered=true;break}
    }
    assert.ok(entered);s.api.showMenu();
  }
});
test('Manifest di un altra tavola e caricamenti immagine precedenti non si mescolano',()=>{
  const s=setup(),old=s.images[0];s.api.selectTable(2);
  const current=s.api.images.get('ball');old.onload();assert.equal(current.ready,false);
  s.api.applyAssetManifest(s.api.presets[0].manifest);assert.equal(s.api.images.get('ball'),current);
  s.api.start();assert.equal(s.api.selectTable(3),false);assert.equal(s.api.snapshot().id,2);
});
test('Entrambe le pagine caricano le copie prima del motore e mostrano tre opzioni',()=>{
  for(const file of [path.join(root,'index.html'),path.resolve(root,'../../../..','index.html')]){
    const html=fs.readFileSync(file,'utf8');
    assert.ok(html.indexOf('extra-tables.js')<html.indexOf('flipper/game.js')||html.indexOf('extra-tables.js')<html.indexOf('src="game.js"'));
    const select=html.match(/<select id="flipperTableSelect">([\s\S]*?)<\/select>/)[1];
    assert.equal((select.match(/<option /g)||[]).length,3);
  }
});
