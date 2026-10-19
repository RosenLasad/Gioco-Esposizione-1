/* Configurazione autonoma del padiglione. */
(function(){
'use strict';
const config = {
      name: 'Galleria della Fortuna',
      number: '5',
      ids: ['sport','hotspot-1790363448490'],
      image: 'games/05-galleria-fortuna/images/ingresso.jpg',
      alt: 'Interno panoramico della Galleria della Fortuna',
      status: 'Galleria della Fortuna: panorama esplorabile.'
    };
config.key = 'fortuna';
config.items = [
      {id:'ruota',name:'La Ruota della Fortuna',icon:'☘',color:'green',x:56,y:31,desc:'Affida il tuo destino alla grande ruota centrale e tenta la sorte per vincere premi e gettoni.'},
      {id:'bussolotti',name:'Il Gioco dei Bussolotti',icon:'◔',color:'red',x:12,y:69,desc:'Osserva i bussolotti, segui la pallina e prova a indovinare dov\'è finita.',action:'shellgame'},
      {id:'prestigiatore',name:'Il Prestigiatore',icon:'🎩',color:'red',x:16,y:42,desc:'Assisti ai giochi di prestigio e scopri illusioni e meraviglie del padiglione.'},
      {id:'pesca',name:'Il Pesca-Premi',icon:'🎁',color:'blue',x:84,y:43,desc:'Estrai un premio tra giocattoli, gadget e piccole sorprese dell\'Esposizione.'},
      {id:'shopping',name:'Shopping',icon:'▣',color:'brown',x:83,y:70,desc:'Sfoglia i souvenir e gli oggetti da collezione della Galleria della Fortuna.'},
      {id:'guida',name:'Guida',icon:'ℹ',color:'blue',x:35,y:70,desc:'Scopri il funzionamento delle attrazioni e la storia della Galleria della Fortuna.'}
    ];
window.EsposizionePavilionRegistry.register(config);
})();
