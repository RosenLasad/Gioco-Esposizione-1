/* Ingresso configurabile – Gruppo A. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "laboratorio", name: "Laboratorio delle Meraviglie", number: "2",
  ids: ["hotspot-1790363613146"],
  image: "games/02-laboratorio-meraviglie/images/ingresso.jpg",
  alt: "Panorama del Laboratorio delle Meraviglie",
  status: "Laboratorio delle Meraviglie: panorama esplorabile.",
  items: [
    {id:"chimico",name:"Il Chimico Distratto",icon:"⚗",color:"red",x:15,y:40,desc:"Riconosci sostanze e strumenti e aiuta lo scienziato a riordinare il laboratorio."},
    {id:"colori",name:"Il Laboratorio dei Colori",icon:"◉",color:"blue",x:42,y:42,desc:"Combina pigmenti e tonalità per ottenere i colori richiesti."},
    {id:"esperimento",name:"L’Esperimento Misterioso",icon:"⚛",color:"brown",x:63,y:43,desc:"Individua i passaggi corretti di un esperimento scientifico."},
    {id:"elettricita",name:"Il Gabinetto dell’Elettricità",icon:"ϟ",color:"green",x:85,y:38,desc:"Collega componenti e attiva piccoli dispositivi elettrici."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:81,y:74,desc:"Scopri souvenir e curiosità scientifiche."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:31,y:71,desc:"Informazioni sul laboratorio e gli esperimenti."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
