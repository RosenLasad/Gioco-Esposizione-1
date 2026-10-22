/* B7: Bombarda nativo senza iframe. Le schermate appartengono all'index Esposizione. */
(()=>{'use strict';
 const root=document.getElementById('bombardaNative');
 const game=()=>window.BombardaNative;
 function close(){game()?.close();if(document.fullscreenElement===root)document.exitFullscreen?.().catch(()=>{});window.EsposizionePavilions?.dismissGameHistory?.();}
 root.querySelector('#returnToPavilion').addEventListener('click',close);
 window.EsposizioneMinigames.register('bombarda',{
  start(){game()?.open();},close,
  isOpen(){return !root.hidden;},
  back(){if(game()?.back()==='exit')close();}
 });
})();
