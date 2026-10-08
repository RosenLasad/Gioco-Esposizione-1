(function(){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
  function pointInPoly(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];const hit=((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi+1e-9)+xi);if(hit)inside=!inside;}return inside}
  function circleVsPoly(cx,cy,r,p){if(pointInPoly(cx,cy,p))return true;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];const vx=b[0]-a[0],vy=b[1]-a[1];const t=clamp(((cx-a[0])*vx+(cy-a[1])*vy)/(vx*vx+vy*vy||1),0,1);const px=a[0]+vx*t,py=a[1]+vy*t;if(dist(cx,cy,px,py)<r)return true;}return false}

  class Game{
    constructor(canvas,ui){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ui=ui;this.areas=window.EsposizioneAreas;this.keys=new Set();this.images={};this.decorImages={};this.spriteFrames={};this.areaId='nord';
      this.player={x:0,y:0,r:22,speed:275,dir:'down',moving:false,frame:0,anim:0};this.camera={x:0,y:0};this.viewZoom=1;this.gameZoomMin=.68;this.gameZoomMax=2;this.playerScale=.8;this.pinch=null;
      this.last=0;this.running=false;this.paused=false;this.debug=false;this.editorActive=false;this.editor=null;this.transitionLock=0;this.nearHotspot=null;this.joy={x:0,y:0};
      this.loadVisualSettings();this.setupInput();this.setupViewInput();this.preload();
    }
    loadVisualSettings(){
      try{
        const saved=JSON.parse(localStorage.getItem('esposizione-visual-settings')||'null');
        if(saved&&Number.isFinite(saved.playerScale))this.playerScale=clamp(saved.playerScale,.5,1);
        if(saved&&Number.isFinite(saved.zoomMax))this.gameZoomMax=clamp(saved.zoomMax,1.35,2.5);
      }catch(_){/* Impostazioni locali non disponibili */}
      this.player.r=22*this.playerScale;
    }
    setVisualSettings(playerScale,zoomMax){
      this.playerScale=clamp(Number(playerScale)||.8,.5,1);
      this.gameZoomMax=clamp(Number(zoomMax)||2,1.35,2.5);
      this.player.r=22*this.playerScale;
      if(!this.editorActive&&this.viewZoom>this.gameZoomMax)this.setGameZoom(this.gameZoomMax);
      try{localStorage.setItem('esposizione-visual-settings',JSON.stringify({playerScale:this.playerScale,zoomMax:this.gameZoomMax}))}catch(_){}
    }
    preload(){for(const a of Object.values(this.areas)){if(a.map){const im=new Image();im.src=a.map;this.images[a.id]=im;}else this.images[a.id]=null;for(const o of a.decor||[]){if(o.asset&&!this.decorImages[o.asset]){const di=new Image();di.src=o.asset;this.decorImages[o.asset]=di}for(const f of o.animation?.frames||[]){if(!this.decorImages[f]){const fi=new Image();fi.src=f;this.decorImages[f]=fi}}}}const base='images/player/body/';const defs={down:['player_walk_down_01.png','player_walk_down_02.png'],left:['player_walk_left_01.png','player_walk_left_02.png'],up:['player_walk_up_01.png','player_walk_up_02.png'],up_left:['player_walk_up_left_01.png','player_walk_up_left_02.png'],down_left:['player_walk_down_left_01.png','player_walk_down_left_02.png']};for(const [d,list] of Object.entries(defs)){this.spriteFrames[d]=list.map(n=>{const im=new Image();im.src=base+n;return im})}}
    setupInput(){window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Escape'].includes(e.key))e.preventDefault();if(e.key==='Escape'){this.ui.onPause();return}if(this.editorActive)return;this.keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e')this.interact()});window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()))}
    setupViewInput(){
      this.canvas.addEventListener('wheel',e=>{
        if(!this.running||this.editorActive||this.paused)return;
        e.preventDefault();
        const factor=e.deltaY<0?1.08:1/1.08;
        this.setGameZoom((this.viewZoom||1)*factor);
      },{passive:false});
      this.canvas.addEventListener('touchstart',e=>{
        if(!this.running||this.editorActive||this.paused||e.touches.length!==2)return;
        const a=e.touches[0],b=e.touches[1];
        this.pinch={distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),zoom:this.viewZoom||1};
        e.preventDefault();
      },{passive:false});
      this.canvas.addEventListener('touchmove',e=>{
        if(!this.pinch||this.editorActive||e.touches.length!==2)return;
        const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
        if(this.pinch.distance>0)this.setGameZoom(this.pinch.zoom*(d/this.pinch.distance));
        e.preventDefault();
      },{passive:false});
      const end=()=>{this.pinch=null};
      this.canvas.addEventListener('touchend',end,{passive:true});this.canvas.addEventListener('touchcancel',end,{passive:true});
    }
    setGameZoom(v){if(this.editorActive)return;this.viewZoom=clamp(v,this.gameZoomMin,this.gameZoomMax);this.cameraToPlayer();this.ui.onZoom?.(this.viewZoom)}
    start(save){this.keys.clear();this.joy.x=0;this.joy.y=0;this.nearHotspot=null;this.pinch=null;this.viewZoom=1;this.ui.onPrompt('');this.areaId=save?.area&&this.areas[save.area]?save.area:'nord';const a=this.area;this.player.x=save?.x??a.spawn.x;this.player.y=save?.y??a.spawn.y;if(!this.isWalkable(this.player.x,this.player.y,this.player.r)){this.player.x=a.spawn.x;this.player.y=a.spawn.y}this.cameraToPlayer();this.running=true;this.paused=false;this.transitionLock=.8;this.last=performance.now();this.ui.onArea(a);this.ui.onZoom?.(this.viewZoom);requestAnimationFrame(t=>this.loop(t));this.toast('Benvenuto all’Esposizione di Genova · 1892')}
    stop(){this.running=false;this.paused=false;this.keys.clear();this.joy.x=0;this.joy.y=0;this.nearHotspot=null;this.pinch=null;this.ui.onPrompt('')}
    setPaused(v){this.paused=v}
    setEditorActive(v){this.editorActive=v;this.keys.clear();this.joy.x=0;this.joy.y=0;this.nearHotspot=null;this.pinch=null;this.ui.onPrompt('');if(!v){this.viewZoom=1;this.cameraToPlayer();this.ui.onZoom?.(this.viewZoom)}}
    get area(){return this.areas[this.areaId]}
    loop(t){if(!this.running)return;const dt=Math.min(.04,(t-this.last)/1000||0);this.last=t;if(!this.paused&&!this.editorActive)this.update(dt);this.draw();requestAnimationFrame(n=>this.loop(n))}
    update(dt){this.transitionLock=Math.max(0,this.transitionLock-dt);let dx=0,dy=0;if(this.keys.has('a')||this.keys.has('arrowleft'))dx--;if(this.keys.has('d')||this.keys.has('arrowright'))dx++;if(this.keys.has('w')||this.keys.has('arrowup'))dy--;if(this.keys.has('s')||this.keys.has('arrowdown'))dy++;dx+=this.joy.x;dy+=this.joy.y;const len=Math.hypot(dx,dy);this.player.moving=len>.1;if(len>.1){dx/=len;dy/=len;this.setDir(dx,dy);this.move(dx*this.player.speed*dt,dy*this.player.speed*dt);this.player.anim+=dt;if(this.player.anim>.18){this.player.anim=0;this.player.frame=(this.player.frame+1)%2}}this.cameraToPlayer();this.checkHotspots();this.checkGates()}
    setDir(dx,dy){const h=dx<-.35?'left':dx>.35?'right':'';const v=dy<-.35?'up':dy>.35?'down':'';this.player.dir=v&&h?`${v}_${h}`:(v||h||this.player.dir)}
    isWalkable(x,y,r){const a=this.area;const inside=(a.walkable||[]).some(p=>pointInPoly(x,y,p));if(!inside)return false;for(const o of a.obstacles||[]){if(o.type==='circle'&&dist(x,y,o.x,o.y)<r+o.r)return false;if(o.type==='poly'&&circleVsPoly(x,y,r,o.points))return false}for(const o of a.decor||[]){if(o.kind==='fountain'){const sc=o.scale||1,rx=(o.basinRadius??64)*sc+r,ry=(o.basinRadiusY??(o.basinRadius??64))*sc+r,cy=o.y+(o.basinOffsetY??-65)*sc;if(rx>0&&ry>0&&((x-o.x)/rx)**2+((y-cy)/ry)**2<1)return false}else{const cr=(o.collisionRadius||0)*(o.scale||1);if(cr>0&&dist(x,y,o.x,o.y)<r+cr)return false}}return true}
    move(dx,dy){let nx=this.player.x+dx,ny=this.player.y;if(this.isWalkable(nx,ny,this.player.r))this.player.x=nx;nx=this.player.x;ny=this.player.y+dy;if(this.isWalkable(nx,ny,this.player.r))this.player.y=ny}
    cameraToPlayer(){const a=this.area,z=this.viewZoom||1,vw=this.canvas.width/z,vh=this.canvas.height/z;this.camera.x=clamp(this.player.x-vw/2,0,Math.max(0,a.width-vw));this.camera.y=clamp(this.player.y-vh/2,0,Math.max(0,a.height-vh))}
    clampCamera(){const a=this.area,z=this.viewZoom||1,vw=this.canvas.width/z,vh=this.canvas.height/z;this.camera.x=clamp(this.camera.x,0,Math.max(0,a.width-vw));this.camera.y=clamp(this.camera.y,0,Math.max(0,a.height-vh))}
    checkHotspots(){let best=null,bd=1e9;for(const h of this.area.hotspots||[]){const d=dist(this.player.x,this.player.y,h.x,h.y);if(d<h.r+80&&d<bd){best=h;bd=d}}this.nearHotspot=best;this.ui.onPrompt(best?`E · ${best.title}`:'')}
    interact(){if(this.paused||this.editorActive)return;if(this.nearHotspot)this.ui.onInteract(this.nearHotspot)}
    checkGates(){if(this.transitionLock>0)return;for(const g of this.area.gates||[]){if(this.player.x>=g.x&&this.player.x<=g.x+g.w&&this.player.y>=g.y&&this.player.y<=g.y+g.h){this.activateGate(g);break}}}
    activateGate(g){
      this.transitionLock=1;
      if(g.type==='exit'){
        if(this.ui.onExitGate){this.setPaused(true);this.ui.onExitGate(g,()=>{this.setPaused(false);this.transitionLock=1},()=>{this.setPaused(false);this.transitionLock=.8})}else{this.toast(g.message||"Uscita dall'Esposizione");this.transitionLock=.8}
        return;
      }
      const target=this.areas[g.target];
      if(!target||target.ready===false||!target.map){this.toast(`${target?.title||g.target||'Destinazione'} in preparazione`);this.transitionLock=1.2;return}
      if(g.type==='boat'&&this.ui.onBoatGate){this.setPaused(true);this.ui.onBoatGate(g,()=>{this.setPaused(false);this.transitionToArea(g)},()=>{this.setPaused(false);this.transitionLock=.8});return}
      this.transitionToArea(g);
    }
    transitionToArea(g){
      const target=this.areas[g.target];if(!target||target.ready===false||!target.map){this.toast('Destinazione non disponibile');this.transitionLock=1.2;return}
      let spawn=g.targetSpawn||target.spawn;
      if(g.targetGate){const back=(target.gates||[]).find(x=>x.id===g.targetGate);if(back)spawn={x:back.x+back.w/2,y:back.y+back.h/2}}
      this.transitionLock=1;this.ui.onFade(true);setTimeout(()=>{this.areaId=target.id;this.player.x=spawn.x;this.player.y=spawn.y;if(!this.isWalkable(this.player.x,this.player.y,this.player.r)){this.player.x=this.area.spawn.x;this.player.y=this.area.spawn.y}this.cameraToPlayer();this.ui.onArea(this.area);this.ui.onFade(false);this.toast(g.message||this.area.title);this.requestSave()},190)
    }
    requestSave(){return window.EsposizioneSave.save({area:this.areaId,x:Math.round(this.player.x),y:Math.round(this.player.y)})}
    toast(msg){this.ui.onToast(msg)}
    setJoystick(x,y){if(this.editorActive)return;this.joy.x=x;this.joy.y=y}
    draw(){const c=this.ctx,a=this.area,im=this.images[a.id],z=this.viewZoom||1;c.clearRect(0,0,this.canvas.width,this.canvas.height);c.save();c.scale(z,z);c.translate(-this.camera.x,-this.camera.y);if(im&&im.complete)c.drawImage(im,0,0,a.width,a.height);else{c.fillStyle='#d9cba6';c.fillRect(0,0,a.width,a.height)}this.drawDecorGround(c);this.drawHotspots(c);this.drawDepthLayer(c);this.drawDecorFront(c);if(this.debug||this.editorActive)this.drawDebug(c);if(this.editor&&this.editorActive)this.editor.draw(c);c.restore()}
    drawHotspots(c){if(this.editorActive&&this.editor&&!this.editor.visibility.hotspots)return;for(const h of this.area.hotspots||[]){c.save();c.globalAlpha=.8;c.strokeStyle='#be8a2d';c.lineWidth=4;c.beginPath();c.arc(h.x,h.y,22,0,Math.PI*2);c.stroke();c.fillStyle='#fff1bf';c.beginPath();c.arc(h.x,h.y,6,0,Math.PI*2);c.fill();c.restore()}}
    drawDecorGround(c){if(this.editorActive&&this.editor&&!this.editor.visibility.decor)return;for(const o of this.area.decor||[])if(o.kind!=='fountain'&&(o.type==='ground'||o.type==='split'))this.drawDecorObject(c,o,'back')}
    drawDepthLayer(c){
      const items=[{kind:'player',sortY:this.player.y}];
      if(!(this.editorActive&&this.editor&&!this.editor.visibility.decor))for(const o of this.area.decor||[]){
        if(o.kind==='fountain'){
          // Both parts use the actual basin ellipse, not the image's bottom anchor.
          // The lower basin is sorted slightly behind the upper spray, allowing a
          // character between them to appear in front of the basin but behind water.
          const sc=o.scale||1;
          const basinY=o.y+(o.basinOffsetY??-65)*sc;
          const basinRy=(o.basinRadiusY??(o.basinRadius??64))*sc;
          items.push({kind:'decor',obj:o,sortY:basinY-basinRy*.35,part:'fountain-front'});
          items.push({kind:'decor',obj:o,sortY:basinY,part:'fountain-back'});
        }else if((o.type||'ysort')==='ysort')items.push({kind:'decor',obj:o,sortY:o.y});
      }
      items.sort((a,b)=>a.sortY-b.sortY);
      for(const it of items){if(it.kind==='player')this.drawPlayer(c);else this.drawDecorObject(c,it.obj,it.part)}
    }
    drawDecorFront(c){if(this.editorActive&&this.editor&&!this.editor.visibility.decor)return;for(const o of this.area.decor||[])if(o.type==='split')this.drawDecorObject(c,o,'front')}
    decorFrameAsset(o,part){if(part==='back'&&o.backAsset)return o.backAsset;if(part==='front'&&o.frontAsset)return o.frontAsset;const anim=o.animation;if(anim?.frames?.length){const fps=anim.fps||4,idx=Math.floor(performance.now()/1000*fps)%anim.frames.length;return anim.frames[idx]}return o.asset}
    drawDecorObject(c,o,part){const asset=this.decorFrameAsset(o,part);if(!asset)return;let im=this.decorImages[asset];if(!im){im=new Image();im.src=asset;this.decorImages[asset]=im}if(!im.complete)return;const sc=o.scale||1,w=(o.width||im.naturalWidth||1)*sc,h=(o.height||im.naturalHeight||1)*sc,ax=o.anchorX??.5,ay=o.anchorY??1;c.save();c.translate(o.x,o.y);if(o.rotation)c.rotate(o.rotation*Math.PI/180);if(o.kind==='fountain'&&(part==='fountain-back'||part==='fountain-front')){const cut=clamp(o.depthCut??.30,.1,.65)*h;const top=-h*ay;c.beginPath();if(part==='fountain-back')c.rect(-w*ax,top,w,cut);else c.rect(-w*ax,top+cut,w,h-cut);c.clip()}c.drawImage(im,-w*ax,-h*ay,w,h);c.restore()}
    drawPlayer(c){const p=this.player;let dir=p.dir,mirror=false;if(dir==='right'){dir='left';mirror=true}else if(dir==='up_right'){dir='up_left';mirror=true}else if(dir==='down_right'){dir='down_left';mirror=true}const arr=this.spriteFrames[dir]||this.spriteFrames.down;const im=arr[p.moving?p.frame:0];const size=76*this.playerScale;c.save();c.translate(p.x,p.y);if(mirror)c.scale(-1,1);if(im&&im.complete)c.drawImage(im,-size/2,-size*.72,size,size);else{c.fillStyle='#49351f';c.beginPath();c.arc(0,0,p.r,0,Math.PI*2);c.fill()}c.restore()}
    drawDebug(c){c.save();const vis=this.editorActive&&this.editor?this.editor.visibility:{collisions:true,gates:true,hotspots:true,decor:true};c.lineWidth=4;if(vis.collisions){c.strokeStyle='#18d85a';c.fillStyle='#18d85a18';for(const p of this.area.walkable||[]){c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();c.stroke()}c.strokeStyle='#ff3434';c.fillStyle='#ff343425';for(const o of this.area.obstacles||[]){c.beginPath();if(o.type==='circle')c.arc(o.x,o.y,o.r,0,Math.PI*2);else{o.points.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath()}c.fill();c.stroke()}}if(vis.gates){c.fillStyle='#8b2cff66';for(const g of this.area.gates||[])c.fillRect(g.x,g.y,g.w,g.h);c.strokeStyle='#8b2cff';for(const g of this.area.gates||[])c.strokeRect(g.x,g.y,g.w,g.h)}if(vis.hotspots){c.strokeStyle='#d6a64b';c.fillStyle='#d6a64b22';for(const h of this.area.hotspots||[]){c.beginPath();c.arc(h.x,h.y,h.r||110,0,Math.PI*2);c.fill();c.stroke()}}if(vis.decor){c.strokeStyle='#34c7ff';c.fillStyle='#34c7ff33';for(const o of this.area.decor||[]){const sc=o.scale||1,r=(o.collisionRadius||0)*sc;if(o.kind==='fountain'){const rx=(o.basinRadius??64)*sc,ry=(o.basinRadiusY??(o.basinRadius??64))*sc,cy=o.y+(o.basinOffsetY??-65)*sc;c.beginPath();c.ellipse(o.x,cy,rx,ry,0,0,Math.PI*2);c.fill();c.stroke();if(this.editorActive&&this.editor?.selected?.obj===o){c.save();c.fillStyle='#ffffff';c.lineWidth=3/(this.viewZoom||1);for(const [hx,hy] of [[o.x+rx,cy],[o.x,cy+ry]]){c.beginPath();c.arc(hx,hy,8/(this.viewZoom||1),0,Math.PI*2);c.fill();c.stroke()}c.restore()}}else if(r>0){c.beginPath();c.arc(o.x,o.y,r,0,Math.PI*2);c.fill();c.stroke()}c.beginPath();c.moveTo(o.x-8,o.y);c.lineTo(o.x+8,o.y);c.moveTo(o.x,o.y-8);c.lineTo(o.x,o.y+8);c.stroke()}}c.restore()}
  }
  window.EsposizioneGame=Game;
})();
