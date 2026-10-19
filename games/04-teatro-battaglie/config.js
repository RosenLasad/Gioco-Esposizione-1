/* Configurazione autonoma del padiglione. */
(function(){
'use strict';
const config = {
      name: 'Teatro delle Battaglie',
      number: '4',
      ids: ['hotspot-1790363509817'],
      image: 'games/04-teatro-battaglie/images/ingresso.jpg',
      alt: 'Interno panoramico del Teatro delle Battaglie',
      status: 'Teatro delle Battaglie: panorama esplorabile.'
    };
config.key = 'battaglie';
config.items = [
      {id:'bombarda',name:'Bombarda!',icon:'☄',color:'red',x:11,y:62,desc:'Prendi la mira con il cannone e colpisci i bersagli della flotta nemica.'},
      {id:'fortezza',name:'Difendi la Fortezza',icon:'♜',color:'green',x:29,y:43,desc:'Proteggi la fortezza dagli attacchi organizzando la sua difesa.'},
      {id:'guida',name:'Guida',icon:'ℹ',color:'blue',x:52,y:51,desc:'Scopri le curiosità e la storia delle battaglie raccontate nel padiglione.'},
      {id:'shopping',name:'Shopping',icon:'▣',color:'brown',x:77,y:42,desc:'Visita il banco dei souvenir e scopri modelli navali e oggetti da collezione.'},
      {id:'navale',name:'Battaglia Navale',icon:'⛵',color:'blue',x:81,y:70,desc:'Sfida il computer su due griglie navali: scopri e affonda tutte le navi avversarie.',action:'battleship'},
      {id:'extra',name:'Extra',icon:'★',color:'gold',x:94,y:46,desc:'Contenuti bonus, curiosità e ricompense speciali del Teatro delle Battaglie.'}
    ];
window.EsposizionePavilionRegistry.register(config);
})();
