/* Ingresso configurabile – Gruppo B. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "campocampioni", name: "Campo dei Campioni", number: "25",
  ids: ["hotspot-1790363665594", "hotspot-1790363673057"],
  image: "games/25-campo-campioni/images/ingresso.jpg",
  alt: "Panorama del Campo dei Campioni",
  status: "Campo dei Campioni: panorama esplorabile.",
  items: [
    {id:"bersaglio",name:"Tiro al Bersaglio",icon:"◉",color:"red",x:16,y:37,desc:"Metti alla prova la tua precisione colpendo i bersagli."},
    {id:"velocita",name:"Gara di Velocità",icon:"➤",color:"green",x:43,y:48,desc:"Sfida il tempo sulla pista e arriva al traguardo nel minor tempo possibile."},
    {id:"peso",name:"Lancio del Peso",icon:"◔",color:"red",x:61,y:49,desc:"Forza e tecnica per ottenere la miglior misura."},
    {id:"arco",name:"Tiro con l’Arco",icon:"◎",color:"red",x:85,y:41,desc:"Mira con attenzione e colpisci il bersaglio nel centro."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:72,y:67,desc:"Gadget e souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:84,y:74,desc:"Informazioni sul Campo dei Campioni."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
