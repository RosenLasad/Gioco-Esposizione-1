(function(){
'use strict';
  const telegraph=document.getElementById('pavilionTelegraph');
  // Il Telegrafo Impazzito
  const telegraphButtons = [0,1,2,3].map(i => document.getElementById(`telegraphKey${i}`));
  const telegraphLights = [0,1,2,3].map(i => document.getElementById(`telegraphLight${i}`));
  const telegraphMessage = document.getElementById('telegraphMessage');
  const telegraphStats = document.getElementById('telegraphStats');
  let telegraphState = null;
  let telegraphTimers = [];
  let telegraphWins = 0;
  let telegraphLosses = 0;

  function clearTelegraphTimers(){
    telegraphTimers.forEach(id => clearTimeout(id));
    telegraphTimers = [];
  }

  function setTelegraphEnabled(enabled){
    telegraphButtons.forEach(btn => btn.disabled = !enabled);
  }

  function setTelegraphHighlight(index, on){
    const light = telegraphLights[index];
    const key = telegraphButtons[index];
    light.classList.toggle('is-on', !!on);
    key.classList.toggle('is-active', !!on);
  }

  function clearTelegraphHighlights(){
    telegraphLights.forEach(light => light.classList.remove('is-on'));
    telegraphButtons.forEach(key => key.classList.remove('is-active'));
  }

  function updateTelegraphStats(){
    telegraphStats.textContent = `Messaggi riusciti: ${telegraphWins} · Errori: ${telegraphLosses}`;
  }

  function flashTelegraph(index, duration=320){
    setTelegraphHighlight(index, true);
    telegraphTimers.push(setTimeout(()=>setTelegraphHighlight(index, false), duration));
  }

  function playTelegraphSequence(){
    if(!telegraphState) return;
    clearTelegraphTimers();
    telegraphState.phase = 'playback';
    telegraphState.input = [];
    setTelegraphEnabled(false);
    clearTelegraphHighlights();
    telegraphMessage.textContent = 'Ascolta il messaggio del telegrafo e memorizza la sequenza.';
    let t = 150;
    telegraphState.sequence.forEach((step, idx) => {
      telegraphTimers.push(setTimeout(()=>setTelegraphHighlight(step, true), t));
      telegraphTimers.push(setTimeout(()=>setTelegraphHighlight(step, false), t + 280));
      t += 440;
    });
    telegraphTimers.push(setTimeout(()=>{
      clearTelegraphHighlights();
      telegraphState.phase = 'input';
      setTelegraphEnabled(true);
      telegraphMessage.textContent = 'Ripeti la sequenza premendo i tasti A, B, C, D.';
    }, t + 60));
  }

  function newTelegraphRound(){
    clearTelegraphTimers();
    const length = 3 + Math.floor(Math.random() * 3);
    telegraphState = {
      sequence: Array.from({length}, ()=>Math.floor(Math.random() * 4)),
      input: [],
      phase: 'playback'
    };
    updateTelegraphStats();
    playTelegraphSequence();
  }

  function openTelegraph(){
    telegraph.hidden = false;
    newTelegraphRound();
    document.getElementById('telegraphClose').focus();
  }

  function hideTelegraph(){
    clearTelegraphTimers();
    clearTelegraphHighlights();
    telegraph.hidden = true;
    telegraphState = null;
  }

  function pressTelegraph(index){
    if(!telegraphState || telegraphState.phase !== 'input') return;
    flashTelegraph(index, 180);
    telegraphState.input.push(index);
    const pos = telegraphState.input.length - 1;
    if(telegraphState.sequence[pos] !== index){
      telegraphLosses++;
      updateTelegraphStats();
      telegraphState.phase = 'failed';
      setTelegraphEnabled(false);
      const seqText = telegraphState.sequence.map(i => ['A','B','C','D'][i]).join(' - ');
      telegraphMessage.textContent = `Messaggio errato! Sequenza corretta: ${seqText}. Premi “Nuova sequenza” per riprovare.`;
      return;
    }
    if(telegraphState.input.length === telegraphState.sequence.length){
      telegraphWins++;
      updateTelegraphStats();
      telegraphState.phase = 'won';
      setTelegraphEnabled(false);
      telegraphMessage.textContent = 'Messaggio ricostruito correttamente! Premi “Nuova sequenza” per un nuovo telegrafo.';
    }
  }

  telegraphButtons.forEach((button, index) => button.addEventListener('click', ()=>pressTelegraph(index)));
  document.getElementById('telegraphNew').addEventListener('click', newTelegraphRound);
  document.getElementById('telegraphClose').addEventListener('click', hideTelegraph);


  function start(){openTelegraph();}
  window.EsposizioneMinigames.register('telegrafo',{start,close:hideTelegraph,isOpen:()=>!telegraph.hidden});
})();
