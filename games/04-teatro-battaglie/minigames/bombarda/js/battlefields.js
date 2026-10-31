(() => {
  'use strict';
  const ROOT=new URL('../images/battlefields/', document.currentScript.src).href;
  // Le immagini sono opzionali: usare il solo nome file, senza cambiare i percorsi esistenti.
  // assetReady: false evita richieste di rete finche' le immagini non saranno pronte.
  const levels = {};
  for(let id=1;id<=6;id++){
    const folder=ROOT+'level_'+String(id).padStart(2,'0')+'/';
    levels[id]={
      id, enabled: id===1, horizonY: id===1?435:435,
      skyTop:'#526e7f', skyBottom:'#a5b8bc', seaTop:'#567c8d', seaBottom:'#081b2b',
      fog:{enabled:false,opacity:.42,y:435,height:105,driftSpeed:.08},
      images:{sky:folder+'sky.png',sea:folder+'sea.png',background:folder+'background.png',
        fogBehind:folder+'fog.png',foreground:folder+'foreground.png',frame:folder+'frame.png',
        seaBack:folder+'sea_back.png',seaFront:folder+'sea_front.png',coverRight:folder+'cover_right.png',coverLeft:folder+'cover_left.png'},
      assetReady:{sky:false,sea:false,background:false,fogBehind:false,foreground:false,frame:false,seaBack:false,seaFront:false,coverRight:false,coverLeft:false},
      // D0.3/D0.4: metadati predisposti, non ancora applicati a spawn o collisioni.
      shipSpawn:{small:[],large:[]}, obstacles:[]
    };
  }
  // D0.5: livello 1 con immagini opzionali, animazione di cielo e doppio mare.
  // Per le altre missioni restano attivi i fallback Canvas della fase precedente.
  Object.assign(levels[1].assetReady,{sky:true,background:true,fogBehind:true,
    seaBack:true,seaFront:true,foreground:true,frame:true,coverRight:true,coverLeft:false});
  levels[1].horizonY=435;
  levels[1].animation={skySpeed:7,seaBackSpeed:9,seaFrontSpeed:-15,seaFrontOpacity:.50};
  // Il background originale e' un panorama intero (cielo + mare inclusi).
  // Renderizzarlo per intero coprirebbe il cielo ed il mare animati: ricaviamo
  // soltanto la fascia sulla destra, in attesa di un PNG storico gia' ritagliato.
  levels[1].backgroundRightOnly=true;
  // D0.3: navigazione sperimentale solo per la missione 1.
  // Le altre missioni mantengono i percorsi e i parametri precedenti.
  levels[1].navigation={
    horizonY:435,
    small:{zones:[{xMin:.16,xMax:.43},{xMin:.57,xMax:.84}],
      speed:25,endY:1010,startScale:.52,endScale:1.20,
      // D0.4.2: breve passaggio dietro il promontorio, poi virata verso il mare aperto.
      avoidance:{startY:435,endY:700,lookAhead:85,margin:75,turnSpeed:115}},
    large:{
      speed:9,endY:615,startScale:.58,endScale:1.0,
      // D0.4.1: ingresso laterale delle navi grandi.
      // Le navi compaiono dai bordi all'altezza dell'orizzonte, scorrono verso il centro
      // per un breve tratto e poi piegano verso il basso prima di raggiungerlo davvero.
      sideSpawnY:[447,466],
      sideStartX:{left:[-78,-30],right:[750,798]},
      centerTurnBands:{left:[.33,.42],right:[.58,.67]},
      lateralSpeed:[34,46],
      lateralDropSpeed:[3.5,6.5],
      drift:[-3,3]
    }
  };
  // Editor percorsi v1: waypoint esatti del JSON allegato.
  // Le coordinate sono assolute nel Canvas 720x1280.
  levels[1].routes=[{"id":1,"type":"small","points":[[45,426.6666666666667],[45,586.6666666666667],[135,693.3333333333334],[135,800],[135,1226.6666666666667]]},{"id":2,"type":"small","points":[[315,426.6666666666667],[315,586.6666666666667],[315,693.3333333333334],[225,800],[225,1226.6666666666667]]},{"id":3,"type":"small","points":[[720,480],[495,480],[405,480],[405,586.6666666666667],[405,693.3333333333334],[405,1226.6666666666667]]},{"id":4,"type":"small","points":[[225,426.6666666666667],[225,586.6666666666667],[315,800],[315,1226.6666666666667]]},{"id":5,"type":"small","points":[[495,426.6666666666667],[405,480],[315,586.6666666666667],[315,1226.6666666666667]]},{"id":6,"type":"large","points":[[720,480],[495,480],[405,480],[315,586.6666666666667],[225,693.3333333333334]]},{"id":7,"type":"large","points":[[0,480],[135,480],[135,586.6666666666667]]}];
  levels[1].forbidden=[];
  // D0.4: due promontori pilota. Coordinate del Canvas 720x1280.
  // Le sagome sono condivise da disegno e collisioni, evitando disallineamenti.
  // La foschia e' centrata piu in basso: il bordo del mare resta nascosto.
  levels[1].fog={enabled:true,opacity:.90,y:480,height:166,driftSpeed:.03};
  // Ritardo puramente visivo, indipendente dai waypoint e dagli spawn.
  levels[1].shipRevealY=480;
  levels[1].shipRevealFade=60;
  levels[1].obstacles=[
    {id:'promontorio-destro',blocksShots:true,fill:'#405b55',edge:'#718778',
      // Maschera alpha per le cannonate. Il poligono guida solo le navi.
      maskImage:'coverRight',alphaThreshold:40,
      points:[[720,424],[674,441],[632,468],[607,507],[584,569],[578,674],[612,732],[720,749]]}
  ];
  // La sagoma poligonale NON blocca piu le cannonate: e usata solo dalla navigazione.
  function pointInPolygon(x,y,polygon){
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[i],b=polygon[j];
      if(((a[1]>y)!==(b[1]>y)) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  // La forma del PNG e' l'UNICA superficie solida per i proiettili.
  // La sagoma geometrica in obstacles[] e' conservata ESCLUSIVAMENTE
  // per la navigazione/virata delle navi piccole.
  function coverAt(id,x,y){
    if(!enabled(id))return null;
    for(const o of level(id).obstacles||[]){
      if(!o.blocksShots || !o.maskImage)continue;
      const path=obstacleMaskPath(id,o);
      if(!path)continue;
      // Avvia il caricamento anche se il PNG non e' ancora stato disegnato.
      load(path);
      if(status.get(path)!=='ready')continue;
      // Se la lettura alpha non e' consentita (es. file://), non attivare
      // la vecchia collisione invisibile. Per la maschera reale usare HTTP(S).
      if(alphaCoverAt(id,o,x,y)===true)return o;
    }
    return null;
  }
  // Restituisce il bordo interno del promontorio a una data quota Y.
  // La stessa sagoma viene usata per le collisioni delle cannonate.
  function innerCoverEdgeAt(id,side,y){
    if(!enabled(id))return null;
    const obstacle=(level(id).obstacles||[]).find(o=>o.id==='promontorio-'+side);
    if(!obstacle)return null;
    // D0.5.5: per la sola navigazione, il contorno PNG viene semplificato
    // in una fascia di sicurezza: tre righe campionate evitano virate nervose.
    if(side==='destro' && obstacle.maskImage){
      const path=obstacleMaskPath(id,obstacle);
      if(path)load(path);
      const mask=getObstacleMask(id,obstacle);
      if(mask){
        let leftEdge=null;
        for(const offset of [-22,0,22]){
          const row=Math.round(y+offset);
          if(row<0||row>=mask.height)continue;
          for(let x=Math.round(mask.width*.36);x<mask.width;x+=2){
            if(mask.alpha[row*mask.width+x]>=(obstacle.alphaThreshold ?? 40)){
              leftEdge=leftEdge===null?x:Math.min(leftEdge,x);break;
            }
          }
        }
        return leftEdge;
      }
    }
    // Fallback solo per navigazione delle navi, mai per cannonate.
    const xs=[],pts=obstacle.points;
    for(let i=0;i<pts.length;i++){
      const a=pts[i],b=pts[(i+1)%pts.length];
      if((a[1]<=y&&y<b[1])||(b[1]<=y&&y<a[1])){
        xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
    }
    if(!xs.length)return null;
    return side==='sinistro'?Math.max(...xs):Math.min(...xs);
  }
  function firstCoverOnSegment(id,x1,y1,x2,y2){
    if(!enabled(id))return null;
    const dist=Math.hypot(x2-x1,y2-y1),steps=Math.max(1,Math.ceil(dist/4));
    for(let i=0;i<=steps;i++){
      const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;
      const obstacle=coverAt(id,x,y);
      if(obstacle)return {x,y,t,obstacle};
    }
    return null;
  }
  function drawObstacles(ctx,id,onlyId=null){
    if(!enabled(id))return;
    for(const o of level(id).obstacles||[]){
      if(onlyId && o.id!==onlyId)continue;
      ctx.save();ctx.beginPath();
      o.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.closePath();
      const ys=o.points.map(p=>p[1]),top=Math.min(...ys),bottom=Math.max(...ys);
      const grad=ctx.createLinearGradient(0,top,0,bottom);
      grad.addColorStop(0,o.edge);grad.addColorStop(.38,o.fill);grad.addColorStop(1,'#263e3c');
      ctx.fillStyle=grad;ctx.fill();ctx.clip();
      ctx.strokeStyle='rgba(218,209,172,.13)';ctx.lineWidth=2;
      for(let y=top+17;y<bottom;y+=26){
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(720,y+9);ctx.stroke();
      }
      ctx.restore();
      ctx.save();ctx.beginPath();
      o.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.strokeStyle='rgba(179,194,168,.52)';ctx.lineWidth=3;ctx.stroke();ctx.restore();
    }
  }
  function drawFog(ctx,id,front=false){
    if(!enabled(id))return;
    const f=level(id).fog;if(!f||!f.enabled)return;
    const drift=performance.now()*.001*f.driftSpeed;
    ctx.save();
    // Nebbia rinforzata: fascia piu ampia e luminosa per sfumare meglio
    // il passaggio tra cielo e mare all'altezza dell'orizzonte.
    const center=f.y+(front?42:20),half=f.height*(front?.62:.84);
    const opacity=f.opacity*(front?.78:.82);

    // Estensione solo verso il cielo: posizione e bordo inferiore invariati.
    const upperExtension=70;
    const top=center-half-upperExtension;
    const bottom=center+half;
    // Corpo principale della nebbia.
    const gradient=ctx.createLinearGradient(0,top,0,bottom);
    gradient.addColorStop(0,'rgba(218,227,222,0)');
    gradient.addColorStop(.24,`rgba(214,224,220,${opacity*.24})`);
    gradient.addColorStop(.44,`rgba(219,228,224,${opacity*.72})`);
    gradient.addColorStop(.56,`rgba(232,236,231,${opacity})`);
    gradient.addColorStop(.72,`rgba(219,228,224,${opacity*.62})`);
    gradient.addColorStop(1,'rgba(218,227,222,0)');
    ctx.fillStyle=gradient;
    ctx.fillRect(0,top,720,bottom-top);

    // Seconda velatura piu morbida e larga per unire cielo e mare senza stacco netto.
    const outerHalf=half*1.22;
    const outerTop=center-outerHalf-upperExtension;
    const outerBottom=center+outerHalf;
    const outer=ctx.createLinearGradient(0,outerTop,0,outerBottom);
    outer.addColorStop(0,'rgba(224,231,227,0)');
    outer.addColorStop(.38,`rgba(224,231,227,${opacity*.16})`);
    outer.addColorStop(.50,`rgba(236,240,235,${opacity*.34})`);
    outer.addColorStop(.62,`rgba(224,231,227,${opacity*.16})`);
    outer.addColorStop(1,'rgba(224,231,227,0)');
    ctx.fillStyle=outer;
    ctx.fillRect(0,outerTop,720,outerBottom-outerTop);

    // Addensamenti mobili della foschia.
    for(let i=0;i<9;i++){
      const x=((i*121+Math.sin(drift*0.9+i*1.55)*40+30)%940)-110;
      const y=center-26+Math.sin(drift*.75+i*1.7)*22;
      const glow=ctx.createRadialGradient(x,y,10,x,y,92+i%3*34);
      glow.addColorStop(0,`rgba(226,234,230,${opacity*(front?.26:.32)})`);
      glow.addColorStop(.55,`rgba(223,232,228,${opacity*(front?.14:.18)})`);
      glow.addColorStop(1,'rgba(221,230,227,0)');
      ctx.fillStyle=glow;
      ctx.beginPath();
      ctx.ellipse(x,y,118,40,0,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  const images=new Map();
  const status=new Map();

  // Cache delle maschere: una sola lettura dei pixel per PNG.
  // null significa lettura non disponibile: si usa il poligono, senza interrompere il gioco.
  const collisionMasks=new Map();
  function obstacleMaskPath(id,obstacle){
    if(!obstacle || !obstacle.maskImage)return null;
    const cfg=level(id);
    return cfg && cfg.images ? cfg.images[obstacle.maskImage] : null;
  }
  function getObstacleMask(id,obstacle){
    const path=obstacleMaskPath(id,obstacle);
    if(!path || status.get(path)!=='ready')return null;
    const key=`${id}:${obstacle.id}:${path}`;
    if(collisionMasks.has(key))return collisionMasks.get(key);
    const image=images.get(path);
    if(!image || !image.naturalWidth || !image.naturalHeight)return null;
    try{
      const canvas=document.createElement('canvas');
      canvas.width=720;canvas.height=1280;
      const g=canvas.getContext('2d',{willReadFrequently:true});
      if(!g)throw new Error('Canvas 2D non disponibile');
      g.drawImage(image,0,0,canvas.width,canvas.height);
      const rgba=g.getImageData(0,0,canvas.width,canvas.height).data;
      const alpha=new Uint8Array(canvas.width*canvas.height);
      for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
      const mask={width:canvas.width,height:canvas.height,alpha};
      collisionMasks.set(key,mask);
      return mask;
    }catch(err){
      // SecurityError in apertura locale file://, o altri errori di lettura pixel.
      // Non ripetere il tentativo a ogni proiettile/frame.
      collisionMasks.set(key,null);
      console.warn('[Bombarda] Impossibile leggere la maschera PNG: nessuna collisione della copertura finche la lettura alpha non e disponibile. Usa HTTP(S) per il test.',err);
      return null;
    }
  }
  function alphaCoverAt(id,obstacle,x,y){
    const mask=getObstacleMask(id,obstacle);
    if(!mask)return null;
    if(!Number.isFinite(x)||!Number.isFinite(y))return false;
    const ix=Math.round(x),iy=Math.round(y);
    if(ix<0||iy<0||ix>=mask.width||iy>=mask.height)return false;
    return mask.alpha[iy*mask.width+ix]>=(obstacle.alphaThreshold ?? 40);
  }
  function load(path){
    if(!path || images.has(path))return;
    const im=new Image(); images.set(path,im); status.set(path,'loading');
    im.onload=()=>status.set(path,'ready');im.onerror=()=>status.set(path,'missing');im.src=path;
  }
  function level(id){return levels[id] || levels[1];}
  function enabled(id){return !!level(id).enabled;}
  function img(id,key){
    const cfg=level(id);
    if(!cfg.assetReady[key])return null;
    const path=cfg.images[key];if(!path)return null;
    load(path);return status.get(path)==='ready'?images.get(path):null;
  }
  function hasImage(id,key){return !!img(id,key);}
  const maskedBackgrounds=new WeakMap();
  function drawScrolling(ctx,image,y0,visibleHeight,width,height,velocity,opacity=1){
    const scale=height/image.naturalHeight;
    const tileW=image.naturalWidth*scale;
    if(tileW<=0)return;
    const shift=((performance.now()*.001*velocity)%tileW+tileW)%tileW;
    ctx.save();
    ctx.beginPath();ctx.rect(0,y0,width,visibleHeight);ctx.clip();
    ctx.globalAlpha=opacity;
    // Riempie il viewport in entrambi i versi, senza vuoti fra i tile.
    for(let x=-shift-tileW;x<width+tileW;x+=tileW){
      ctx.drawImage(image,x,0,tileW,height);
    }
    ctx.restore();
  }
  function drawLayer(ctx,id,key,w,h){
    const image=img(id,key);if(!image)return false;
    const cfg=level(id),hor=Math.max(1,Math.min(h-1,Number(cfg.horizonY)||435));
    const motion=cfg.animation;
    if(motion && key==='sky'){
      drawScrolling(ctx,image,0,hor,w,h,motion.skySpeed);return true;
    }
    if(motion && (key==='seaBack'||key==='seaFront')){
      drawScrolling(ctx,image,hor,h-hor,w,h,key==='seaBack'?motion.seaBackSpeed:motion.seaFrontSpeed,
        key==='seaFront'?motion.seaFrontOpacity:1);return true;
    }
    ctx.save();
    if(key==='sky'){ctx.beginPath();ctx.rect(0,0,w,hor);ctx.clip();}
    if(key==='sea'){ctx.beginPath();ctx.rect(0,hor,w,h-hor);ctx.clip();}
    if(key==='background' && cfg.backgroundRightOnly){
      // La Lanterna occupa il lato destro dell'immagine originale.
      // Maschera progressiva per non oscurare i layer animati a sinistra.
      let off=maskedBackgrounds.get(image);
      if(!off){
        off=document.createElement('canvas');off.width=w;off.height=h;
        const g=off.getContext('2d');g.drawImage(image,0,0,w,h);
        g.globalCompositeOperation='destination-in';
        const mask=g.createLinearGradient(w*.60,0,w*.86,0);
        mask.addColorStop(0,'rgba(0,0,0,0)');mask.addColorStop(1,'rgba(0,0,0,1)');
        g.fillStyle=mask;g.fillRect(0,0,w,h);
        maskedBackgrounds.set(image,off);
      }
      ctx.drawImage(off,0,0);
    }else ctx.drawImage(image,0,0,w,h);
    ctx.restore();return true;
  }
  function drawBase(ctx,id,w,h){
    const c=level(id),hor=Math.max(1,Math.min(h-1,Number(c.horizonY)||435));
    let g=ctx.createLinearGradient(0,0,0,hor);g.addColorStop(0,c.skyTop);g.addColorStop(1,c.skyBottom);
    ctx.fillStyle=g;ctx.fillRect(0,0,w,hor);
    g=ctx.createLinearGradient(0,hor,0,h);g.addColorStop(0,c.seaTop);g.addColorStop(1,c.seaBottom);
    ctx.fillStyle=g;ctx.fillRect(0,hor,w,h-hor);
    // Tratti d'onda decorativi: esistono soltanto nella resa, non nella fisica.
    for(let i=0;i<15;i++){
      let y=hor+28+i*55; if(y>h)break;
      ctx.beginPath();ctx.moveTo(0,y);
      for(let x=0;x<=w;x+=24)ctx.lineTo(x,y+Math.sin(x*.027+i*1.7+performance.now()*.0008)*7);
      ctx.strokeStyle=`rgba(168,205,219,${i%2?.11:.07})`;ctx.lineWidth=3;ctx.stroke();
    }
    drawLayer(ctx,id,'sky',w,h);
    if(!drawLayer(ctx,id,'seaBack',w,h))drawLayer(ctx,id,'sea',w,h);
    drawLayer(ctx,id,'seaFront',w,h);
    // Il nuovo frame/foreground coprira' la postazione disegnata: non renderizzare
    // la vecchia pavimentazione quando e' disponibile lo scenario del livello 1.
    if(c.animation)return;
    ctx.fillStyle='#5b4a36';ctx.fillRect(0,1040,w,h-1040);
    ctx.fillStyle='#7c674c';ctx.fillRect(0,1040,w,26);
    for(let y=1072;y<h;y+=42){for(let x=(Math.floor(y/42)%2)*-36;x<w;x+=82){
      ctx.fillStyle='rgba(28,20,13,.32)';ctx.fillRect(x,y,78,36);
      ctx.strokeStyle='rgba(210,181,130,.16)';ctx.strokeRect(x,y,78,36);
    }}
  }
  window.BombardaBattlefields={levels,level,enabled,drawBase,drawLayer,hasImage,drawFog,drawObstacles,coverAt,firstCoverOnSegment,innerCoverEdgeAt,status:path=>status.get(path)||'not-requested'};
})();
