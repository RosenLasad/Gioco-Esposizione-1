(function(){
'use strict';
  const shellgame=document.getElementById('pavilionShellGame');
  // Gioco dei bussolotti
  const shellCupButtons = [0,1,2].map(i=>document.getElementById(`shellCup${i}`));
  const shellBall = document.getElementById('shellBall');
  const shellMessage = document.getElementById('shellGameMessage');
  const shellStats = document.getElementById('shellGameStats');
  const shellPositions = ['18%','50%','82%'];
  let shellWins = 0;
  let shellLosses = 0;
  let shellState = null;
  let shellTimers = [];

  function clearShellTimers(){
    shellTimers.forEach(id => clearTimeout(id));
    shellTimers = [];
  }

  function updateShellStats(){
    shellStats.textContent = `Vittorie: ${shellWins} · Sconfitte: ${shellLosses}`;
  }

  function renderShell(showBall=false, revealedIds=[]){
    if(!shellState) return;
    const revealSet = new Set(revealedIds);
    for(const cup of shellState.cups){
      const button = shellCupButtons[cup.id];
      button.style.left = shellPositions[cup.slot];
      button.classList.toggle('revealed', revealSet.has(cup.id));
      button.disabled = !shellState.canGuess;
    }
    const ballCup = shellState.cups.find(c => c.id === shellState.ballCupId);
    shellBall.style.left = shellPositions[ballCup.slot];
    shellBall.style.opacity = showBall ? '1' : '0';
  }

  function openShellGame(){
    shellgame.hidden = false;
    newShellRound();
    document.getElementById('shellGameClose').focus();
  }

  function hideShellGame(){
    clearShellTimers();
    shellgame.hidden = true;
    shellState = null;
  }

  function swapCupSlots(aId, bId){
    const a = shellState.cups.find(c => c.id === aId);
    const b = shellState.cups.find(c => c.id === bId);
    const temp = a.slot;
    a.slot = b.slot;
    b.slot = temp;
  }

  function shuffleShell(step=0, total=5){
    if(!shellState) return;
    if(step >= total){
      shellState.canGuess = true;
      shellMessage.textContent = 'Dov’è la pallina? Tocca un bussolotto per indovinare.';
      renderShell(false, []);
      return;
    }
    const picks = [0,1,2].sort(()=>Math.random()-.5).slice(0,2);
    swapCupSlots(picks[0], picks[1]);
    renderShell(false, []);
    shellTimers.push(setTimeout(()=>shuffleShell(step+1, total), 420));
  }

  function newShellRound(){
    clearShellTimers();
    shellState = {
      cups: [{id:0,slot:0},{id:1,slot:1},{id:2,slot:2}],
      ballCupId: Math.floor(Math.random()*3),
      canGuess: false
    };
    updateShellStats();
    shellMessage.textContent = 'Osserva bene: la pallina ti viene mostrata per un istante.';
    renderShell(true, [shellState.ballCupId]);
    shellTimers.push(setTimeout(()=>{
      shellMessage.textContent = 'I bussolotti si muovono... segui con attenzione la pallina.';
      renderShell(false, []);
      shuffleShell(0, 6);
    }, 1100));
  }

  function guessCup(id){
    if(!shellState || !shellState.canGuess) return;
    shellState.canGuess = false;
    const win = id === shellState.ballCupId;
    if(win) shellWins++; else shellLosses++;
    updateShellStats();
    const revealed = win ? [id] : [id, shellState.ballCupId];
    renderShell(true, revealed);
    shellMessage.textContent = win ? 'Bravo! Hai seguito correttamente la pallina.' : 'Peccato! La pallina era sotto un altro bussolotto.';
  }

  shellCupButtons.forEach((button, id) => button.addEventListener('click', ()=>guessCup(id)));
  document.getElementById('shellGameNew').addEventListener('click', newShellRound);
  document.getElementById('shellGameClose').addEventListener('click', hideShellGame);




  function start(){openShellGame();}
  window.EsposizioneMinigames.register('shellgame',{start,close:hideShellGame,isOpen:()=>!shellgame.hidden});
})();
