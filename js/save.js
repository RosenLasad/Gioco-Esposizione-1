(function(){
  'use strict';
  const KEY='genova_esposizione_v025_save';
  const OLD_KEY='genova_esposizione_v02_save';
  const OLD_KEY_V1='genova_esposizione_v01_save';
  const API={
    load(){
      try{
        const current=JSON.parse(localStorage.getItem(KEY)||'null');
        if(current){if(current.area==='centrale')return {...current,area:'nord',x:2556,y:1728,migrated:true};return current;}
        const old=JSON.parse(localStorage.getItem(OLD_KEY)||'null');
        if(old&&old.area==='nord')return {version:25,area:'nord',x:old.x,y:old.y,updatedAt:old.updatedAt,migrated:true};
        const v1=JSON.parse(localStorage.getItem(OLD_KEY_V1)||'null');
        if(v1&&v1.area==='nord')return {version:25,area:'nord',x:Math.round((v1.x||0)*1.8),y:Math.round((v1.y||0)*1.8),updatedAt:v1.updatedAt,migrated:true};
        return null;
      }catch{return null}
    },
    save(data){const out={version:25,updatedAt:new Date().toISOString(),...data};localStorage.setItem(KEY,JSON.stringify(out));return out},
    clear(){localStorage.removeItem(KEY);localStorage.removeItem(OLD_KEY);localStorage.removeItem(OLD_KEY_V1)}
  };
  window.EsposizioneSave=API;
})();
