/* Ingresso configurabile – Gruppo B. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "lanterna", name: "Lanterna in Miniatura", number: "38",
  ids: ["hotspot-1790363376264", "hotspot-1790365386756"],
  image: "games/38-lanterna-miniatura/images/ingresso.jpg",
  alt: "Panorama della Lanterna in Miniatura",
  status: "Lanterna in Miniatura: panorama esplorabile.",
  items: [
    {id:"rotte",name:"Le Rotte del Mondo",icon:"◎",color:"red",x:13,y:31,desc:"Ricostruisci itinerari, mari e collegamenti commerciali del mondo."},
    {id:"navigatore",name:"Il Navigatore",icon:"◈",color:"green",x:33,y:34,desc:"Riconosci porti, luoghi e vedute legate ai viaggi e alla navigazione."},
    {id:"bussola",name:"La Bussola Perduta",icon:"✢",color:"red",x:84,y:34,desc:"Segui direzioni e indizi per risolvere enigmi nautici."},
    {id:"baule",name:"Il Baule del Viaggiatore",icon:"⌂",color:"brown",x:79,y:68,desc:"Scopri oggetti, origini e funzioni del bagaglio del viaggiatore."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:91,y:53,desc:"Gadget e souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:49,y:70,desc:"Informazioni sulla Lanterna in Miniatura e sulle sue attività."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
