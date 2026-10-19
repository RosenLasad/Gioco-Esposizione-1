(function(){
'use strict';
  const battleship=document.getElementById('pavilionBattleship');
  let board=null;
  const shipSizes = [5,4,3,3,2];
  function makeFleet(){
    const ships = Array.from({length:100},()=>false);
    for(const length of shipSizes){
      let done = false;
      for(let attempt=0; attempt<1000 && !done; attempt++){
        const horizontal = Math.random() < .5;
        const x = Math.floor(Math.random() * (horizontal ? 11 - length : 10));
        const y = Math.floor(Math.random() * (horizontal ? 10 : 11 - length));
        const cells = Array.from({length}, (_,i)=>(y + (horizontal ? 0 : i)) * 10 + x + (horizontal ? i : 0));
        if(cells.some(pos => ships[pos])) continue;
        cells.forEach(pos => { ships[pos] = true; });
        done = true;
      }
    }
    return ships;
  }

  function newBattle(){
    board = {
      enemy: makeFleet(),
      player: makeFleet(),
      enemyShots: new Set(),
      playerShots: new Set(),
      turn: true,
      over: false,
      token: (board?.token || 0) + 1
    };
    renderBattle('Scegli una casella della flotta avversaria per sparare.');
  }

  function won(fleet, shots){
    return fleet.every((occupied, i) => !occupied || shots.has(i));
  }

  function renderBattle(message){
    if(!board) return;
    document.getElementById('battleshipMessage').textContent = message;
    for(const side of ['enemy','player']){
      const root = document.getElementById(side === 'enemy' ? 'battleshipEnemy' : 'battleshipPlayer');
      root.replaceChildren();
      for(let i=0;i<100;i++){
        const shot = (side === 'enemy' ? board.playerShots : board.enemyShots).has(i);
        const ship = board[side][i];
        const cell = document.createElement(side === 'enemy' ? 'button' : 'span');
        cell.className = 'battle-cell';
        if(side === 'player' && ship) cell.classList.add('ship');
        if(shot){
          cell.classList.add(ship ? 'hit' : 'miss');
          cell.textContent = ship ? '×' : '•';
        }
        if(side === 'enemy'){
          cell.type = 'button';
          cell.setAttribute('aria-label', `Colonna ${i%10+1}, riga ${Math.floor(i/10)+1}`);
          cell.disabled = shot || !board.turn || board.over;
          cell.addEventListener('click', ()=>fire(i));
        }
        root.appendChild(cell);
      }
    }
    document.getElementById('battleshipStats').textContent = `Colpi: ${board.playerShots.size} · Navi colpite: ${[...board.playerShots].filter(i=>board.enemy[i]).length}/17`;
  }

  function fire(i){
    if(!board || board.over || !board.turn || board.playerShots.has(i)) return;
    board.playerShots.add(i);
    board.turn = false;
    if(won(board.enemy, board.playerShots)){
      board.over = true;
      renderBattle('Hai vinto! Hai affondato tutta la flotta nemica.');
      return;
    }
    const candidates = Array.from({length:100}, (_,j)=>j).filter(j => !board.enemyShots.has(j));
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    board.enemyShots.add(target);
    if(won(board.player, board.enemyShots)){
      board.over = true;
      renderBattle('Hai perso: la tua flotta è stata affondata. Riprova!');
      return;
    }
    board.turn = true;
    renderBattle(`${board.enemy[i] ? 'Colpito!' : 'Acqua!'} Il computer ha sparato: ${board.player[target] ? 'ha colpito una tua nave.' : 'acqua.'} Tocca a te.`);
  }

  document.getElementById('battleshipNew').addEventListener('click', newBattle);
  function hideBattle(){
    battleship.hidden = true;
    board = null;
  }
  document.getElementById('battleshipClose').addEventListener('click', hideBattle);


  function start(){newBattle();battleship.hidden=false;document.getElementById('battleshipClose').focus();}
  window.EsposizioneMinigames.register('battleship',{start,close:hideBattle,isOpen:()=>!battleship.hidden});
})();
