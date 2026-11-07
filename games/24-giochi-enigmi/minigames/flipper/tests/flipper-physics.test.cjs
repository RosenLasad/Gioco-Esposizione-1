const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');

// Esegue le funzioni reali del motore senza DOM, immagini o salvataggi del giocatore.
const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const objects=JSON.parse(source.match(/const OBJECTS=(\[[^\n]+\]);/)[1]);
function setup(){
  const state={ball:null,held:{left:false,right:false},angles:{left:0,right:0},
    TABLE:{flippers:Object.fromEntries(objects.filter(o=>o.type==='flipper').map(o=>[o.side,o]))}};
  vm.createContext(state);
  vm.runInContext(source.match(/function segment\([^\n]+/)[0]+'\n'+
    source.slice(source.indexOf('const FLIPPER_PHYSICS='),source.indexOf('function update(dt)')),state);
  return state;
}
function contact(s,side,fraction,normalVelocity,angle=0,under=false){
  s.angles[side]=angle;
  const f=s.flipperGeometry(side),ux=(f.tipx-f.x)/s.TABLE.flippers[side].length,
    uy=(f.tipy-f.y)/s.TABLE.flippers[side].length;
  let nx=uy,ny=-ux;if(ny>0){nx=-nx;ny=-ny}if(under){nx=-nx;ny=-ny}
  const x=f.x+(f.tipx-f.x)*fraction,y=f.y+(f.tipy-f.y)*fraction;
  s.ball={x:x+nx*18.9,y:y+ny*18.9,r:8,vx:nx*normalVelocity,vy:ny*normalVelocity};
  return {nx,ny};
}
const speed=b=>Math.hypot(b.vx,b.vy);

test('Palette a riposo inclinate verso il centro e in basso, sempre dentro la cornice',()=>{
  const s=setup();
  const table=JSON.parse(fs.readFileSync(path.join(__dirname,'..','table-data','tavola-01.json'),'utf8'));
  for(const side of ['left','right']){
    const data=s.TABLE.flippers[side];
    assert.equal(data.angle,table.objects.find(o=>o.id===data.id).angle);
    const resting=s.flipperGeometry(side);
    assert.ok(resting.tipy>resting.y,'Punta a riposo sotto il perno');
    // Comprende l'intero rettangolo del PNG (length+25 per 29), non solo la linea fisica.
    for(let i=0;i<=100;i++){
      s.angles[side]=i/100;const f=s.flipperGeometry(side);
      const a=Math.atan2(f.tipy-f.y,f.tipx-f.x);
      const bottom=(f.y+f.tipy)/2+(data.length+25)/2*Math.abs(Math.sin(a))+14.5*Math.abs(Math.cos(a));
      assert.ok(bottom<815.5,'PNG sopra il bordo interno inferiore');
    }
    assert.ok(s.flipperGeometry(side).tipy<data.y,'Punta attiva sopra il perno');
  }
});

test('Tocco leggero: nessun rilancio minimo di 350, anche a paletta tenuta alzata',()=>{
  for(const side of ['left','right'])for(const angle of [0,1]){
    const s=setup();s.held[side]=!!angle;
    const n=contact(s,side,.6,-20,angle);
    s.flipperPhysics(side);
    assert.ok(speed(s.ball)<1e-8);
    assert.ok(Math.abs(s.ball.vx*n.nx+s.ball.vy*n.ny)<1e-8);
  }
});
test('Palette ferme dissipano energia per diverse velocita e punti di contatto',()=>{
  for(const side of ['left','right'])for(const angle of [0,.5,1])
    for(const fraction of [0,.25,.75,1])for(const v of [10,100,400,900]){
      const s=setup();contact(s,side,fraction,-v,angle);
      const before=speed(s.ball);s.flipperPhysics(side);
      assert.ok(speed(s.ball)<=before+1e-8);
      assert.ok(Number.isFinite(s.ball.x)&&Number.isFinite(s.ball.y));
    }
});
test('Un contatto in separazione non riceve energia aggiuntiva',()=>{
  const s=setup();contact(s,'left',.6,120);
  const {vx,vy}=s.ball;s.flipperPhysics('left');
  assert.equal(s.ball.vx,vx);assert.equal(s.ball.vy,vy);
});
test('La spinta attiva cresce verso la punta, su entrambe le palette',()=>{
  for(const side of ['left','right']){
    const speeds=[];
    for(const fraction of [.2,.8]){
      const s=setup();contact(s,side,fraction,0,.4);
      s.flipperPhysics(side,side==='left'?-8:8);
      assert.ok(s.ball.vy<0);speeds.push(speed(s.ball));
    }
    assert.ok(speeds[1]>speeds[0]*3);
    assert.ok(speeds[1]<800);
  }
});
test('Nessun teletrasporto dal lato inferiore sopra la paletta',()=>{
  for(const side of ['left','right']){
    const s=setup(),n=contact(s,side,.6,-100,0,true),before={...s.ball};
    s.flipperPhysics(side);
    assert.ok((s.ball.x-before.x)*n.nx+(s.ball.y-before.y)*n.ny>0);
    assert.ok(Math.hypot(s.ball.x-before.x,s.ball.y-before.y)<1);
  }
});
test('Fine corsa: velocita nulla tenendo premuto, ritorno piu lento e angoli limitati',()=>{
  const s=setup();s.held.left=true;s.held.right=true;
  const moving=s.moveFlippers(1/240);
  assert.ok(Math.abs(moving.left+8)<1e-8);assert.ok(Math.abs(moving.right-8)<1e-8);
  s.moveFlippers(1);assert.equal(s.angles.left,1);assert.equal(s.angles.right,1);
  assert.ok(s.moveFlippers(.02).left===0);
  s.held.left=false;assert.ok(Math.abs(s.moveFlippers(.01).left-5)<1e-8);
  s.moveFlippers(1);assert.equal(s.angles.left,0);
  assert.equal(s.moveFlippers(0).left,0);
});
test('Contatto esattamente sull asse: risposta finita',()=>{
  const s=setup();const f=s.flipperGeometry('left');
  s.ball={x:(f.x+f.tipx)/2,y:(f.y+f.tipy)/2,r:8,vx:0,vy:100};
  s.flipperPhysics('left');
  for(const key of ['x','y','vx','vy'])assert.ok(Number.isFinite(s.ball[key]));
});
test('Colpo simulato coerente a 30, 60 e 120 fotogrammi al secondo',()=>{
  const results=[];
  for(const fps of [30,60,120]){
    const s=setup();contact(s,'left',.65,0);s.held.left=true;
    for(let frame=0;frame<fps/2;frame++){
      const dt=1/fps,steps=Math.max(1,Math.ceil(dt*480)),h=dt/steps;
      for(let i=0;i<steps;i++){
        const omega=s.moveFlippers(h).left;
        s.ball.vy+=620*h;s.ball.x+=s.ball.vx*h;s.ball.y+=s.ball.vy*h;
        s.flipperPhysics('left',omega);
      }
    }
    results.push({...s.ball});
  }
  for(const b of results.slice(1)){
    assert.ok(Math.hypot(b.x-results[0].x,b.y-results[0].y)<8);
    assert.ok(Math.hypot(b.vx-results[0].vx,b.vy-results[0].vy)<20);
  }
});
