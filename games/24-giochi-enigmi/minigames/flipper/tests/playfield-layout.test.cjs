const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const objects=JSON.parse(source.match(/const OBJECTS=(\[[^\n]+\]);/)[1]);
function setup(){
  const s={OBJECTS:objects,BOARD_H:840,ball:null,launchReady:false,held:{left:false,right:false},
    angles:{left:0,right:0},performance,hitTimes:new Map(),drains:0,launchEffects:{age:Infinity},canvas:{style:{}},
    setStatus(){},addPoints(){},playSound(){},addTarget(){},
    drain(){s.drains++;s.ball=null}};
  vm.createContext(s);
  const parts=[source.match(/const PLAYFIELD=[^\n]+/)[0],source.match(/const LAYOUT_VERSION=[^\n]+/)[0],
    source.slice(source.indexOf('const byType='),source.indexOf('// Audio esclusivo')),
    source.slice(source.indexOf('function launcherPosition()'),source.indexOf('function start()')),
    source.slice(source.indexOf('function bump('),source.indexOf('function addTarget('))];
  vm.runInContext(parts.join('\n')+'\nglobalThis.table=TABLE;globalThis.bounds=PLAYFIELD;',s);
  return s;
}
test('Dati coerenti e palette immutate; slingshot collegati ai perni e ai nuovi margini',()=>{
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','table-data','tavola-01.json'),'utf8'));
  assert.deepEqual(objects,data.objects);
  const s=setup();assert.deepEqual(JSON.parse(JSON.stringify(s.bounds)),data.board.playfield);
  for(const [side,id,x,angle] of [['left','S1',112,Math.PI/10],['right','S2',328,9*Math.PI/10]]){
    const f=s.table.flippers[side],o=objects.find(o=>o.id===id);
    assert.equal(f.x,x);assert.equal(f.y,765);assert.equal(f.length,80);assert.equal(f.angle,angle);
    assert.equal(o.x2,f.x);assert.equal(o.y2,f.y+1);
  }
  assert.equal(objects.find(o=>o.id==='S1').x,s.bounds.left);
  assert.ok(Math.abs(objects.find(o=>o.id==='S2').x-objects.find(o=>o.id==='R2_copia').x)<2);
});
test('Pallina pronta e lancio nel canale spostato: uscita nel campo senza incastri',()=>{
  for(const fps of [30,60,120]){
    const s=setup();s.newBall();assert.equal(s.ball.x,421);
    assert.ok(s.ball.x+s.ball.r<s.bounds.right);
    assert.ok(s.ball.x-s.ball.r>s.table.launcher.x+5);
    s.launchReady=false;s.ball.vy=-950;
    let entered=false;
    for(let i=0;i<fps*2;i++){
      s.update(1/fps);assert.ok(s.ball,'Il lancio non deve scaricare subito la pallina');
      if(!s.ball.inLauncher&&s.ball.x<s.table.launcher.x-s.ball.r-5){entered=true;break}
    }
    assert.ok(entered,'La pallina deve raggiungere il campo a sinistra della guida');
  }
});
test('Le fasce recuperate ai lati e in alto sono realmente accessibili',()=>{
  const s=setup();
  s.ball={x:20,y:450,vx:-50,vy:0,r:8,trail:[],inLauncher:false};s.update(.01);
  assert.ok(s.ball.x<26,'Nessun rimbalzo contro il vecchio margine sinistro');
  s.ball={x:425,y:450,vx:50,vy:0,r:8,trail:[],inLauncher:false};s.update(.01);
  assert.ok(s.ball.x>414&&s.ball.x<=424);
  s.ball={x:220,y:20,vx:0,vy:-50,r:8,trail:[],inLauncher:false};s.update(.01);
  assert.ok(s.ball.y<32,'Nessun rimbalzo contro il vecchio margine superiore');
});
test('Il bordo inferiore rimane aperto alla perdita della pallina',()=>{
  const s=setup();s.ball={x:220,y:845,vx:0,vy:300,r:8,trail:[],inLauncher:false};
  s.update(.035);assert.equal(s.drains,1);
});
test('Ripresa salvataggi precedenti: sposta solo le palline ancora nel lanciatore',()=>{
  const s=setup();
  const saved={boardHeight:840,ballState:'active',ball:{x:405,y:400,vx:0,vy:-700,inLauncher:true}};
  assert.equal(s.restoredBall(saved).x,421);
  assert.equal(s.restoredBall({...saved,layoutVersion:2,ball:{...saved.ball,x:421}}).x,421);
  assert.equal(s.restoredBall({...saved,ball:{...saved.ball,x:200,inLauncher:false}}).x,200);
  const ready=s.restoredBall({...saved,ballState:'ready'});
  assert.equal(ready.x,421);assert.equal(ready.y,748);assert.equal(ready.vy,0);
});
