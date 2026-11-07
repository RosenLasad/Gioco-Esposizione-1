const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
function setup(){
  const shapes=[],sprites=[];
  const s={phase:'playing',launchReady:true,ball:{x:421,y:748,vx:0,vy:0},
    launchEffects:{age:Infinity},canvas:{style:{transform:''}},reducedMotion:{matches:false},
    TABLE:{launcher:{x:401},ballRadius:8},imageAssets:new Map([['launcherCannon',{ready:true,img:{naturalWidth:665,naturalHeight:1368}}]]),
    ctx:{save(){},restore(){},beginPath(){},fill(){},arc(...v){shapes.push(v)},ellipse(...v){shapes.push(v)},
      createRadialGradient(){return {addColorStop(){}}}},
    imageCentered(...v){sprites.push(v);return true},setStatus(){},playSound(){},saveGame(){},sprites,shapes};
  vm.createContext(s);
  vm.runInContext(source.slice(source.indexOf('function launcherPosition()'),source.indexOf('function restoredBall('))+'\n'+
    source.match(/function launch\(\)[^\n]+/)[0],s);
  return s;
}
test('Un solo sparo: potenza e traiettoria invariate, nessun secondo impulso al tasto ripetuto',()=>{
  const s=setup();s.launch();assert.equal(s.ball.vx,0);assert.equal(s.ball.vy,-950);
  assert.equal(s.launchReady,false);assert.equal(s.launchEffects.age,0);
  s.ball.vy=-900;s.advanceLaunchEffects(.02);s.launch();
  assert.equal(s.ball.vy,-900);assert.equal(s.launchEffects.age,.02);
});
test('Cannone dentro la corsia anche durante il rinculo; scala uniforme',()=>{
  const s=setup();s.launch();
  for(let i=0;i<70;i++){
    s.drawLauncherCannon();const [,x,y,w,h]=s.sprites.at(-1);
    assert.ok(x-w/2>=406);assert.ok(x+w/2<=432);assert.ok(y+h/2<832);
    assert.ok(Math.abs(w/h-665/1368)<1e-9);s.advanceLaunchEffects(.01);
  }
  assert.equal(s.launchEffects.age,Infinity);assert.equal(s.canvas.style.transform,'');
});
test('Fumo e lampo terminano; la pallina non viene modificata dagli effetti',()=>{
  const s=setup();s.launch();s.drawLaunchSmoke();assert.ok(s.shapes.length>0);
  const before=JSON.stringify(s.ball);s.advanceLaunchEffects(.7);
  s.shapes.length=0;s.drawLaunchSmoke();assert.equal(s.shapes.length,0);
  assert.equal(JSON.stringify(s.ball),before);
});
test('Movimento ridotto: niente vibrazione e niente rinculo',()=>{
  const s=setup();s.reducedMotion.matches=true;s.drawLauncherCannon();const y=s.sprites.at(-1)[2];
  s.launch();s.advanceLaunchEffects(.08);s.drawLauncherCannon();
  assert.equal(s.sprites.at(-1)[2],y);assert.equal(s.canvas.style.transform,'');
});
test('Pausa, menu e uscita azzerano gli effetti; manifest offline e online coerenti',()=>{
  for(const start of ['function overlay(title,text,finished=false){','function showMenu(){','function close(){'])
    assert.ok(source.includes(start+'resetLaunchEffects();'));
  const offline=JSON.parse(source.match(/const assetFallback=([^\n]+);/)[1]);
  const online=JSON.parse(fs.readFileSync(path.join(root,'manifest/tavola-01-assets.json'),'utf8'));
  assert.equal(offline.assets.launcherCannon,online.assets.launcherCannon);
  assert.ok(fs.existsSync(path.join(root,offline.assets.launcherCannon)));
});
