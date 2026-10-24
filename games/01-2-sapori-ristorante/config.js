/* Ingresso configurabile – Gruppo A. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "sapori12", name: "Padiglione dei Sapori – Ristorante", number: "1.2",
  ids: ["hotspot-1791749832873", "hotspot-1792365612259"],
  image: "games/01-2-sapori-ristorante/images/ingresso.jpg",
  alt: "Panorama del Padiglione dei Sapori – Ristorante",
  status: "Padiglione dei Sapori – Ristorante: panorama esplorabile.",
  items: [
    {id:"tavolo",name:"Siediti al Tavolo",icon:"▤",color:"red",x:70,y:75,desc:"Scopri il menù e le specialità servite nel ristorante."},
    {id:"ospiti",name:"Parla con gli Ospiti",icon:"☏",color:"red",x:79,y:47,desc:"Incontra personaggi e ascolta le loro storie."},
    {id:"cuoco",name:"Il Cuoco dell’Esposizione",icon:"♨",color:"green",x:17,y:44,desc:"Scopri ricette e segreti della cucina dell’Esposizione."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:83,y:27,desc:"Sfoglia gadget, ricette e prodotti della tradizione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:34,y:71,desc:"Informazioni sul ristorante e le sue attività."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
