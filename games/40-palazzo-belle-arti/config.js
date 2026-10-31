/* Ingresso configurabile – Palazzo delle Belle Arti. */
(function(){
'use strict';
const config = {
  key: "bellearti", name: "Palazzo delle Belle Arti", number: "40",
  ids: ["bellearti", "hotspot-1790363340218", "hotspot-1790363345918", "hotspot-1790363358045"],
  image: "games/40-palazzo-belle-arti/images/ingresso.jpg",
  alt: "Panorama del Palazzo delle Belle Arti",
  status: "Palazzo delle Belle Arti: panorama esplorabile.",
  guideIntro: 'Entrate nel Palazzo delle Belle Arti, fra dipinti, sculture e dettagli nascosti. Osservate le opere con attenzione e mettete alla prova lo sguardo attraverso puzzle, confronti e curiosità artistiche.',
  guideClosing: 'L’arte premia chi sa guardare oltre la prima impressione.',
  items: [
    {id:"quadro",name:"Il Quadro Scomparso",icon:"▩",color:"red",x:13,y:31,desc:"Ricompone le parti mancanti di un’opera e ritrova il quadro scomparso."},
    {id:"occhio",name:"L’Occhio dell’Artista",action:"occhio-artista",icon:"◉",color:"green",x:35,y:35,desc:"Osserva quadri e sculture per individuare dettagli e particolari."},
    {id:"falsario",name:"Il Falsario",icon:"◍",color:"red",x:63,y:35,desc:"Confronta dettagli e differenze per riconoscere l’opera autentica."},
    {id:"galleria",name:"La Galleria dei Maestri",icon:"▦",color:"brown",x:87,y:24,desc:"Associa opere, autori e stili in una galleria di capolavori."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:89,y:61,desc:"Gadget e souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:49,y:69,desc:"Informazioni sul Palazzo delle Belle Arti e le sue attività."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
