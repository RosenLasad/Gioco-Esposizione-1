/* Ingresso configurabile – Gruppo B. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "pallonecolombo", name: "Pallone Colombo", number: "8",
  ids: ["hotspot-1790363573580"],
  image: "games/08-pallone-colombo/images/ingresso.jpg",
  alt: "Panorama del Pallone Colombo",
  status: "Pallone Colombo: panorama esplorabile.",
  items: [
    {id:"vista",name:"Vista su Genova",icon:"◍",color:"red",x:23,y:30,desc:"Osserva la città dall’alto e scopri alcuni punti notevoli del panorama genovese."},
    {id:"volo",name:"Preparativi del Volo",icon:"◌",color:"green",x:41,y:43,desc:"Scopri come funziona il pallone aerostatico e le fasi che precedono il decollo."},
    {id:"meteo",name:"Meteo e Venti",icon:"☁",color:"brown",x:75,y:22,desc:"Capisci le condizioni del volo tra nuvole, venti e segnali del tempo."},
    {id:"mappe",name:"Naviga con le Mappe",icon:"✢",color:"red",x:87,y:47,desc:"Esplora rotte, destinazioni e strumenti geografici legati ai viaggi."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:82,y:65,desc:"Scopri gadget e souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:59,y:72,desc:"Informazioni sul Pallone Colombo e sulle sue attività."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
