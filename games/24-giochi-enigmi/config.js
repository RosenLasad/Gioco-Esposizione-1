/* Ingresso configurabile – Gruppo B. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "giochienigmi", name: "Padiglione dei Giochi e degli Enigmi", number: "24",
  ids: ["hotspot-1790363645096", "hotspot-1790363649161"],
  image: "games/24-giochi-enigmi/images/ingresso.jpg",
  alt: "Panorama del Padiglione dei Giochi e degli Enigmi",
  status: "Padiglione dei Giochi e degli Enigmi: panorama esplorabile.",
  items: [
    {id:"quindici",name:"Il Gioco del Quindici",icon:"▦",color:"red",x:11,y:42,desc:"Ricompone la sequenza corretta dei numeri nel classico rompicapo scorrevole."},
    {id:"hanoi",name:"La Torre di Hanoi",icon:"⌘",color:"green",x:29,y:35,desc:"Risolvi l’enigma dei dischi spostandoli nel giusto ordine."},
    {id:"carte",name:"Le Carte Illustrate",icon:"⚿",color:"red",x:33,y:64,desc:"Scopri le coppie e colleziona le carte illustrate del padiglione."},
    {id:"rompicapi",name:"Rompicapi Meccanici",icon:"⚙",color:"brown",x:86,y:39,desc:"Osserva, analizza e trova la soluzione dei curiosi meccanismi esposti."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:65,y:63,desc:"Gadget e souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:81,y:73,desc:"Informazioni sul Padiglione dei Giochi e degli Enigmi."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
