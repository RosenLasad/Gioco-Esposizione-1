/* Configurazione autonoma del padiglione. */
(function(){
'use strict';
const config = {
      name: 'Padiglione delle Invenzioni',
      number: '16',
      ids: ['hotspot-1790363352923','hotspot-1790363463228'],
      image: 'games/16-padiglione-invenzioni/images/ingresso.jpg',
      alt: 'Interno panoramico del Padiglione delle Invenzioni',
      status: 'Padiglione delle Invenzioni: panorama esplorabile.'
    };
config.key = 'invenzioni';
config.items = [
      {id:'telegrafo',name:'Il Telegrafo Impazzito',icon:'◔',color:'red',x:8.5,y:46,desc:'Riproduci la sequenza di impulsi del telegrafo e rimetti in ordine il messaggio.',action:'telegrafo'},
      {id:'macchina',name:'La Macchina Infernale',icon:'⚙',color:'green',x:49.5,y:34,desc:'Esplora il grande motore centrale e scopri i suoi ingranaggi, pistoni e ruote motrici.'},
      {id:'automa',name:"L'Automa Meccanico",icon:'🎩',color:'red',x:87,y:44,desc:"Osserva l'automa in azione e sperimenta i suoi movimenti programmati."},
      {id:'shopping',name:'Shopping',icon:'▣',color:'brown',x:86.5,y:66,desc:"Sfoglia gadget, invenzioni e souvenir del Padiglione delle Invenzioni."},
      {id:'catena',name:'La Catena degli Inventori',icon:'⛓',color:'green',x:64,y:78,desc:'Collega idee, oggetti e inventori in una reazione a catena piena di intuizioni.'},
      {id:'guida',name:'Guida',icon:'ℹ',color:'blue',x:13.5,y:76,desc:"Scopri la storia del padiglione e le meraviglie tecnologiche presentate all'Esposizione."}
    ];
window.EsposizionePavilionRegistry.register(config);
})();
