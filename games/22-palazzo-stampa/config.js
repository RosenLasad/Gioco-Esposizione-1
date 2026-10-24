/* Ingresso configurabile – Gruppo A. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "stampa", name: "Palazzo della Stampa", number: "22",
  ids: ["hotspot-1790363534260", "hotspot-1790363539720", "hotspot-1790363544684"],
  image: "games/22-palazzo-stampa/images/ingresso.jpg",
  alt: "Panorama del Palazzo della Stampa",
  status: "Palazzo della Stampa: panorama esplorabile.",
  items: [
    {id:"tipografo",name:"Il Tipografo",icon:"▤",color:"red",x:17,y:70,desc:"Componi titoli e testi con elementi tipografici."},
    {id:"notizia",name:"La Notizia Misteriosa",icon:"⌕",color:"green",x:66,y:77,desc:"Ricostruisci una notizia partendo da indizi e testimonianze."},
    {id:"telegramma",name:"Il Telegramma",icon:"ϟ",color:"blue",x:48,y:47,desc:"Decifra brevi messaggi e sequenze di segnali."},
    {id:"pagina",name:"La Prima Pagina",icon:"▣",color:"brown",x:76,y:44,desc:"Impagina articoli, titoli e immagini in un giornale d’epoca."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:88,y:68,desc:"Giornali, stampe e souvenir del Palazzo della Stampa."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:44,y:74,desc:"Informazioni sulla stampa e sul padiglione."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
