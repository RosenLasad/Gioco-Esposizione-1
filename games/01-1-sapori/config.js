/* Ingresso configurabile – Gruppo A. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "sapori11", name: "Padiglione dei Sapori – Esposizione gastronomica", number: "1.1",
  ids: ["hotspot-1790363398217"],
  image: "games/01-1-sapori/images/ingresso.jpg",
  alt: "Panorama del Padiglione dei Sapori – Esposizione gastronomica",
  status: "Padiglione dei Sapori – Esposizione gastronomica: panorama esplorabile.",
  items: [
    {id:"ricetta",name:"La Ricetta Segreta",icon:"▤",color:"red",x:17,y:77,desc:"Trova gli ingredienti e gli indizi per completare una ricetta dell’epoca."},
    {id:"cuoco",name:"Il Cuoco dell’Esposizione",icon:"♨",color:"green",x:17,y:43,desc:"Metti in ordine le fasi di preparazione di una ricetta storica."},
    {id:"prodotto",name:"Indovina il Prodotto",icon:"★",color:"gold",x:75,y:48,desc:"Riconosci i prodotti alimentari da immagini e indizi."},
    {id:"dispensa",name:"La Dispensa Misteriosa",icon:"▣",color:"brown",x:88,y:39,desc:"Scopri prodotti e specialità da aggiungere alla collezione gastronomica."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:83,y:73,desc:"Visita il banco gastronomico e i souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:49,y:70,desc:"Informazioni sul Padiglione dei Sapori e le sue attività."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
