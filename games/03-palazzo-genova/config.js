/* Ingresso configurabile – Gruppo A. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "cittagenova", name: "Palazzo della Città di Genova", number: "3",
  ids: ["hotspot-1790363603763"],
  image: "games/03-palazzo-genova/images/ingresso.jpg",
  alt: "Panorama del Palazzo della Città di Genova",
  status: "Palazzo della Città di Genova: panorama esplorabile.",
  items: [
    {id:"riconosci",name:"Riconosci Genova",icon:"♜",color:"green",x:16,y:62,desc:"Riconosci piazze, palazzi e monumenti di Genova."},
    {id:"scomparsa",name:"La Genova Scomparsa",icon:"▤",color:"red",x:81,y:35,desc:"Confronta immagini storiche e scopri come è cambiata la città."},
    {id:"puzzle",name:"Il Puzzle della Città",icon:"▦",color:"blue",x:51,y:74,desc:"Ricostruisci immagini di monumenti ed edifici genovesi."},
    {id:"grifone",name:"Il Grifone Misterioso",icon:"♞",color:"green",x:87,y:75,desc:"Segui gli indizi per scoprire luoghi, simboli e segreti di Genova."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:80,y:54,desc:"Visita il banco dei souvenir della città."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:32,y:72,desc:"Informazioni sul Palazzo della Città di Genova."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
