/* Ingresso configurabile – Gruppo A. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "giardino", name: "Giardino delle Curiosità", number: "14",
  ids: ["hotspot-1790363485180"],
  image: "games/14-giardino-curiosita/images/ingresso.jpg",
  alt: "Panorama del Giardino delle Curiosità",
  status: "Giardino delle Curiosità: panorama esplorabile.",
  items: [
    {id:"botanico",name:"Il Botanico",icon:"❧",color:"green",x:16,y:63,desc:"Riconosci fiori e piante attraverso immagini e indizi."},
    {id:"caccia",name:"Caccia agli Oggetti",icon:"⌕",color:"red",x:80,y:39,desc:"Cerca gli oggetti nascosti fra piante e decorazioni."},
    {id:"segreto",name:"Il Giardino Segreto",icon:"♧",color:"green",x:54,y:58,desc:"Risolvi enigmi ambientali e scopri gli angoli segreti del giardino."},
    {id:"fiori",name:"La Collezione dei Fiori",icon:"✿",color:"red",x:79,y:65,desc:"Completa l’album delle specie botaniche incontrate."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:86,y:83,desc:"Semi, stampe botaniche e souvenir del giardino."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:37,y:72,desc:"Informazioni sul giardino e sulle sue collezioni."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
