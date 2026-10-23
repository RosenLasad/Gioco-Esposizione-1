/* Bombarda S1: modalita test autonoma, stesso motore dell'Esposizione. */
(()=>{'use strict';
 const game=window.BombardaNative;
 if(!game){console.error('Bombarda: motore non caricato');return;}
 const root=document.getElementById('bombardaNative');
 const exit=document.getElementById('returnToPavilion');
 // Il pulsante di ritorno non chiude un padiglione inesistente: apre l'Esposizione.
 if(exit){exit.textContent="Apri l'Esposizione";exit.addEventListener('click',()=>{
   game.close();window.location.href=new URL('index.html',document.baseURI).href;
 });}
 // La pagina e' autonoma: il menu si apre senza coinvolgere il bridge del padiglione.
 game.open();
 // Fullscreen e il canvas sono gestiti dallo stesso game.js della versione integrata.
 window.addEventListener('pagehide',()=>game.close());
})();
