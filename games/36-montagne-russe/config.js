/* Ingresso configurabile – Gruppo B. Nessun minigioco avviato in questa fase. */
(function(){
'use strict';
const config = {
  key: "montagnerusse", name: "Montagne Russe", number: "36",
  ids: ["hotspot-1790363414169"],
  image: "games/36-montagne-russe/images/ingresso.jpg",
  alt: "Panorama delle Montagne Russe",
  status: "Montagne Russe: panorama esplorabile.",
  items: [
    {id:"discesa",name:"La Grande Discesa",icon:"⌔",color:"red",x:11,y:24,desc:"Evita ostacoli e raccogli oggetti durante la corsa."},
    {id:"percorso",name:"Il Percorso Perfetto",icon:"⤧",color:"green",x:58,y:25,desc:"Scegli i binari giusti e completa il percorso migliore."},
    {id:"souvenir",name:"Caccia al Souvenir",icon:"⌑",color:"brown",x:92,y:30,desc:"Trova i simboli nascosti e i piccoli oggetti durante il giro."},
    {id:"macchinista",name:"La Sfida del Macchinista",icon:"⚙",color:"brown",x:16,y:58,desc:"Aziona gli scambi e i meccanismi al momento giusto."},
    {id:"shopping",name:"Shopping",icon:"▣",color:"brown",x:78,y:53,desc:"Gadget e souvenir del padiglione."},
    {id:"guida",name:"Guida",icon:"ℹ",color:"blue",x:56,y:70,desc:"Informazioni sulle Montagne Russe e le loro attività."},
  ]
};
window.EsposizionePavilionRegistry.register(config);
})();
