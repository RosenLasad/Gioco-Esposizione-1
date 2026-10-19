/* Registro unico delle configurazioni e dei minigiochi. */
(function(){
'use strict';
const configs=new Map(); const minigames=new Map();
window.EsposizionePavilionRegistry=Object.freeze({register(config){if(!config?.key)throw Error('Padiglione senza chiave');configs.set(config.key,config);},get(key){return configs.get(key);},all(){return [...configs.values()];}});
window.EsposizioneMinigames=Object.freeze({register(id,api){minigames.set(id,api);},get(id){return minigames.get(id);},closeAll(){for(const api of minigames.values())api.close();},anyOpen(){for(const api of minigames.values())if(api.isOpen())return true;return false;},closeOpen(){for(const api of minigames.values())if(api.isOpen()){api.close();return true;}return false;}});
})();
