// SVG Icons
const icons = {
  win: `<svg class="icon-small" viewBox="0 0 64 64" fill="gold"><polygon points="32,4 39,24 60,24 43,38 50,58 32,46 14,58 21,38 4,24 25,24"/></svg>`,
  lose: `<svg class="icon-small" viewBox="0 0 64 64" fill="#f44336"><circle cx="32" cy="32" r="28" stroke="#f44336" stroke-width="4" fill="none"/><line x1="18" y1="18" x2="46" y2="46" stroke="#f44336" stroke-width="4"/><line x1="46" y1="18" x2="18" y2="46" stroke="#f44336" stroke-width="4"/></svg>`,
  draw: `<svg class="icon-small" viewBox="0 0 64 64" fill="#ffc107"><circle cx="32" cy="32" r="28" stroke="#ffc107" stroke-width="4" fill="none"/><line x1="16" y1="32" x2="48" y2="32" stroke="#ffc107" stroke-width="4"/></svg>`,
  blackjack: `<svg class="icon-small" viewBox="0 0 64 64"><polygon points="32,4 39,24 60,24 43,38 50,58 32,46 14,58 21,38 4,24 25,24" fill="gold"/><polygon points="32,12 36,24 48,24 38,32 42,44 32,36 22,44 26,32 16,24 28,24" fill="#ffd700"/></svg>`
};

const cardBackSVG = `<svg viewBox="0 0 64 64" fill="white"><rect x="5" y="5" width="54" height="54" rx="5" fill="none" stroke="white" stroke-width="2"/><line x1="5" y1="5" x2="59" y2="59" stroke="white" stroke-width="1"/><line x1="59" y1="5" x2="5" y2="59" stroke="white" stroke-width="1"/><circle cx="32" cy="32" r="15" fill="none" stroke="white" stroke-width="2"/></svg>`;

// Game State
let deckId = "";
let dobloni = 1000;
let currentBet = 0;
let roundBet = 0;
let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;
let dealerHiddenCard = null;
let gameInProgress = false;
let playerTurn = true;
let isSplit = false;
let splitHands = [];
let currentHandIndex = 0;

// Statistics
const STATS_KEY = 'cardplay_blackjack_stats_v1';
const DEFAULT_STATS = {
  hands: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  busts: 0,
  splits: 0,
  doubles: 0,
  wagered: 0,
  profit: 0,
  updatedAt: null
};

let stats = loadStats();
let roundTotalStake = 0;

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveStats() {
  stats.updatedAt = new Date().toISOString();
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  renderStats();
}

function resetStats() {
  stats = { ...DEFAULT_STATS };
  saveStats();
  toast('Statistiche resettate.');
}

function fmtPct(x) {
  if (!isFinite(x)) return '0%';
  return (x * 100).toFixed(1).replace('.0', '') + '%';
}

function fmtInt(n) {
  return Math.round(n).toString();
}

function renderStats() {
  const hands = stats.hands;
  const wins = stats.wins;
  const losses = stats.losses;
  const pushes = stats.pushes;
  const winrate = hands ? wins / hands : 0;

  document.getElementById('stat-hands').textContent = fmtInt(hands);
  document.getElementById('stat-wins').textContent = fmtInt(wins);
  document.getElementById('stat-losses').textContent = fmtInt(losses);
  document.getElementById('stat-pushes').textContent = fmtInt(pushes);
  document.getElementById('stat-winrate').textContent = fmtPct(winrate);
  document.getElementById('stat-blackjacks').textContent = fmtInt(stats.blackjacks);
  document.getElementById('stat-busts').textContent = fmtInt(stats.busts);
  document.getElementById('stat-splits').textContent = fmtInt(stats.splits);
  document.getElementById('stat-doubles').textContent = fmtInt(stats.doubles);
  document.getElementById('stat-wagered').textContent = fmtInt(stats.wagered);
  document.getElementById('stat-profit').textContent = fmtInt(stats.profit);

  const updated = stats.updatedAt ? new Date(stats.updatedAt) : null;
  document.getElementById('stat-updated').textContent = updated ? updated.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '-';

  const total = Math.max(1, wins + losses + pushes);
  document.getElementById('bar-win').style.width = (wins / total * 100).toFixed(2) + '%';
  document.getElementById('bar-push').style.width = (pushes / total * 100).toFixed(2) + '%';
  document.getElementById('bar-lose').style.width = (losses / total * 100).toFixed(2) + '%';
}

function exportStats() {
  const payload = JSON.stringify(stats, null, 2);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(payload).then(() => {
      toast('Statistiche copiate negli appunti!');
    }).catch(() => {
      prompt('Copia queste statistiche (JSON):', payload);
    });
  } else {
    prompt('Copia queste statistiche (JSON):', payload);
  }
}

function importStats() {
  const raw = prompt('Incolla qui il JSON delle statistiche:');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    stats = { ...DEFAULT_STATS, ...parsed };
    saveStats();
    toast('Statistiche importate!');
  } catch {
    alert('JSON non valido.');
  }
}

function statsBeginRound() {
  roundTotalStake = currentBet;
  stats.wagered += currentBet;
  saveStats();
}

function statsAddStake(extra) {
  roundTotalStake += extra;
  stats.wagered += extra;
  saveStats();
}

function statsFinalizeRound({ outcome, isBlackjack = false, isBust = false, winnings = 0 }) {
  stats.hands += 1;
  if (outcome === 'win') stats.wins += 1;
  if (outcome === 'lose') stats.losses += 1;
  if (outcome === 'push') stats.pushes += 1;
  if (isBlackjack) stats.blackjacks += 1;
  if (isBust) stats.busts += 1;

  stats.profit += (winnings - roundTotalStake);
  saveStats();
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function updateDobloniDisplay() {
  document.getElementById('dobloni-amount').textContent = dobloni;
}

function addBet(amount) {
  if (amount <= dobloni - currentBet) {
    currentBet += amount;
    document.getElementById('current-bet').textContent = currentBet;
  }
}

function clearBet() {
  currentBet = 0;
  document.getElementById('current-bet').textContent = currentBet;
}

async function deal() {
  if (currentBet === 0) {
    alert('Devi piazzare una puntata!');
    return;
  }

  // SALVATAGGIO PUNTATA NEL LOCALSTORAGE
  localStorage.setItem("lastBet", currentBet);

  dobloni -= currentBet;
  updateDobloniDisplay();

  roundBet = currentBet;
  statsBeginRound();

  playerCards = [];
  dealerCards = [];
  playerScore = 0;
  dealerScore = 0;
  dealerHiddenCard = null;
  gameInProgress = true;
  playerTurn = true;
  isSplit = false;
  splitHands = [];
  currentHandIndex = 0;

  document.getElementById('player-hands-container').innerHTML = '<div id="player-cards" class="cards"></div>';
  document.getElementById('player-cards').innerHTML = '';
  document.getElementById('dealer-cards').innerHTML = '';
  document.getElementById('result').innerHTML = '';
  document.getElementById('result').className = '';
  document.getElementById('player-score').textContent = '-';
  document.getElementById('dealer-score').textContent = '?';

  document.getElementById('betting-section').classList.add('hidden');
  document.getElementById('new-game-section').classList.add('hidden');

  const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
  const data = await response.json();
  deckId = data.deck_id;

  const drawResponse = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`);
  const drawData = await drawResponse.json();
  const cards = drawData.cards;

  await dealCardWithDelay(cards[0], 'player', 250);
  await dealCardWithDelay(cards[1], 'dealer', 250);
  await dealCardWithDelay(cards[2], 'player', 250);

  dealerHiddenCard = cards[3];
  dealerCards.push(dealerHiddenCard);
  const hiddenCardDiv = document.createElement('div');
  hiddenCardDiv.className = 'card-back';
  hiddenCardDiv.id = 'hidden-card';
  hiddenCardDiv.innerHTML = cardBackSVG;
  document.getElementById('dealer-cards').appendChild(hiddenCardDiv);

  updatePlayerScore();
  updateDealerScore();
  document.getElementById('dealer-score').textContent = '?';

  if (playerScore === 21) {
    await revealDealerCard();
    if (dealerScore === 21) {
      endGame('push', 'Entrambi Blackjack! Pareggio.');
    } else {
      endGame('blackjack', 'BLACKJACK! Hai vinto!');
    }
    return;
  }

  showGameButtons();
}

async function dealCardWithDelay(card, target, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      const img = document.createElement('img');
      img.src = card.image;

      if (target === 'player') {
        playerCards.push(card);
        document.getElementById('player-cards').appendChild(img);
      } else {
        dealerCards.push(card);
        document.getElementById('dealer-cards').appendChild(img);
      }
      resolve();
    }, delay);
  });
}

function showGameButtons() {
  const gameButtons = document.getElementById('game-buttons');
  gameButtons.classList.remove('hidden');

  document.getElementById('hit-btn').disabled = false;
  document.getElementById('stand-btn').disabled = false;

  const canDouble = playerCards.length === 2 && dobloni >= currentBet;
  document.getElementById('double-btn').disabled = !canDouble;
  document.getElementById('double-btn').classList.toggle('hidden', !canDouble);

  const canSplit = playerCards.length === 2 &&
    getCardValue(playerCards[0].value) === getCardValue(playerCards[1].value) &&
    dobloni >= currentBet &&
    !isSplit;
  document.getElementById('split-btn').disabled = !canSplit;
  document.getElementById('split-btn').classList.toggle('hidden', !canSplit);
}

async function hit() {
  if (isSplit) {
    await hitSplitHand();
    return;
  }

  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  const data = await response.json();
  const card = data.cards[0];

  playerCards.push(card);
  const img = document.createElement('img');
  img.src = card.image;
  document.getElementById('player-cards').appendChild(img);

  updatePlayerScore();

  document.getElementById('double-btn').classList.add('hidden');
  document.getElementById('split-btn').classList.add('hidden');

  if (playerScore > 21) {
    await revealDealerCard();
    endGame('lose', 'Sballato! Hai perso.');
  } else if (playerScore === 21) {
    await stand();
  }
}

async function hitSplitHand() {
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  const data = await response.json();
  const card = data.cards[0];

  splitHands[currentHandIndex].cards.push(card);

  const img = document.createElement('img');
  img.src = card.image;
  document.getElementById(`split-cards-${currentHandIndex}`).appendChild(img);

  updateSplitScores();

  if (splitHands[currentHandIndex].score >= 21) {
    await switchToNextSplitHand();
  }
}

async function stand() {
  if (isSplit && currentHandIndex < splitHands.length - 1) {
    await switchToNextSplitHand();
    return;
  }

  playerTurn = false;
  document.getElementById('game-buttons').classList.add('hidden');

  await revealDealerCard();
  await dealerPlay();
  determineWinner();
}

async function doubleDown() {
  stats.doubles += 1;

  dobloni -= currentBet;
  statsAddStake(currentBet);
  currentBet *= 2;
  updateDobloniDisplay();

  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  const data = await response.json();
  const card = data.cards[0];

  playerCards.push(card);
  const img = document.createElement('img');
  img.src = card.image;
  document.getElementById('player-cards').appendChild(img);

  updatePlayerScore();

  if (playerScore > 21) {
    await revealDealerCard();
    endGame('lose', 'Sballato! Hai perso.');
  } else {
    await stand();
  }
}

async function split() {
  stats.splits += 1;

  dobloni -= currentBet;
  statsAddStake(currentBet);
  updateDobloniDisplay();

  isSplit = true;

  const card1 = playerCards[0];
  const card2 = playerCards[1];

  splitHands = [
    { cards: [card1], score: 0 },
    { cards: [card2], score: 0 }
  ];
  currentHandIndex = 0;

  const container = document.getElementById('player-hands-container');
  container.innerHTML = `
    <div class="split-container">
      <div class="split-hand active" id="split-hand-0">
        <h4>Mano 1</h4>
        <div class="cards" id="split-cards-0"></div>
        <p class="score">Punteggio: <span id="split-score-0">0</span></p>
      </div>
      <div class="split-hand" id="split-hand-1">
        <h4>Mano 2</h4>
        <div class="cards" id="split-cards-1"></div>
        <p class="score">Punteggio: <span id="split-score-1">0</span></p>
      </div>
    </div>
  `;

  const img1 = document.createElement('img');
  img1.src = card1.image;
  document.getElementById('split-cards-0').appendChild(img1);

  const img2 = document.createElement('img');
  img2.src = card2.image;
  document.getElementById('split-cards-1').appendChild(img2);

  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  const data = await response.json();
  const newCard = data.cards[0];

  splitHands[0].cards.push(newCard);
  const newImg = document.createElement('img');
  newImg.src = newCard.image;
  document.getElementById('split-cards-0').appendChild(newImg);

  updateSplitScores();

  playerCards = splitHands[0].cards;

  document.getElementById('split-btn').classList.add('hidden');
  document.getElementById('double-btn').classList.add('hidden');

  if (splitHands[0].score === 21) {
    await switchToNextSplitHand();
  }
}

function updateSplitScores() {
  splitHands.forEach((hand, index) => {
    hand.score = calculateScore(hand.cards);
    const scoreEl = document.getElementById(`split-score-${index}`);
    if (scoreEl) scoreEl.textContent = hand.score;
  });
  playerScore = splitHands[currentHandIndex]?.score ?? 0;
  document.getElementById('player-score').textContent = playerScore;
}

async function switchToNextSplitHand() {
  currentHandIndex++;

  if (currentHandIndex >= splitHands.length) {
    playerTurn = false;
    document.getElementById('game-buttons').classList.add('hidden');
    await revealDealerCard();
    await dealerPlay();
    determineWinner();
    return;
  }

  document.querySelectorAll('.split-hand').forEach((el, idx) => {
    el.classList.toggle('active', idx === currentHandIndex);
  });

  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  const data = await response.json();
  const newCard = data.cards[0];

  splitHands[currentHandIndex].cards.push(newCard);
  const newImg = document.createElement('img');
  newImg.src = newCard.image;
  document.getElementById(`split-cards-${currentHandIndex}`).appendChild(newImg);

  playerCards = splitHands[currentHandIndex].cards;
  updateSplitScores();

  if (splitHands[currentHandIndex].score === 21) {
    await switchToNextSplitHand();
  }
}

async function revealDealerCard() {
  const hiddenCardEl = document.getElementById('hidden-card');
  if (hiddenCardEl && dealerHiddenCard) {
    const img = document.createElement('img');
    img.src = dealerHiddenCard.image;
    hiddenCardEl.replaceWith(img);
  }
  updateDealerScore();
}

async function dealerPlay() {
  while (dealerScore < 17) {
    await new Promise(resolve => setTimeout(resolve, 450));
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    const card = data.cards[0];

    dealerCards.push(card);
    const img = document.createElement('img');
    img.src = card.image;
    document.getElementById('dealer-cards').appendChild(img);

    updateDealerScore();
  }
}

function determineWinner() {
  if (isSplit) {
    determineSplitWinner();
    return;
  }

  if (dealerScore > 21) {
    endGame('win', 'Il banco sballa! Hai vinto!');
  } else if (playerScore > dealerScore) {
    endGame('win', 'Hai vinto!');
  } else if (playerScore < dealerScore) {
    endGame('lose', 'Hai perso!');
  } else {
    endGame('push', 'Pareggio!');
  }
}

function determineSplitWinner() {
  let totalWinnings = 0;
  let results = [];

  const perHandBet = roundBet;

  splitHands.forEach((hand, index) => {
    const handNum = index + 1;
    if (hand.score > 21) {
      results.push(`Mano ${handNum}: Sballato`);
    } else if (dealerScore > 21) {
      results.push(`Mano ${handNum}: Vinto!`);
      totalWinnings += perHandBet * 2;
    } else if (hand.score > dealerScore) {
      results.push(`Mano ${handNum}: Vinto!`);
      totalWinnings += perHandBet * 2;
    } else if (hand.score < dealerScore) {
      results.push(`Mano ${handNum}: Perso`);
    } else {
      results.push(`Mano ${handNum}: Pareggio`);
      totalWinnings += perHandBet;
    }
  });

  dobloni += totalWinnings;
  updateDobloniDisplay();

  const resultEl = document.getElementById('result');
  resultEl.innerHTML = results.join(' | ');
  resultEl.className = totalWinnings > roundTotalStake ? 'win' : totalWinnings < roundTotalStake ? 'lose' : 'push';

  gameInProgress = false;
  document.getElementById('game-buttons').classList.add('hidden');
  document.getElementById('new-game-section').classList.remove('hidden');

  const profit = totalWinnings - roundTotalStake;
  const outcome = profit > 0 ? 'win' : profit < 0 ? 'lose' : 'push';
  const hasBust = splitHands.some(h => h.score > 21);
  statsFinalizeRound({ outcome, isBlackjack: false, isBust: hasBust, winnings: totalWinnings });
}

function endGame(result, message) {
  gameInProgress = false;
  const resultEl = document.getElementById('result');

  let winnings = 0;
  let outcome = 'lose';
  let isBlackjack = false;
  let isBust = false;

  switch (result) {
    case 'blackjack':
      winnings = currentBet * 2.5;
      resultEl.innerHTML = icons.blackjack + ' ' + message;
      resultEl.className = 'blackjack';
      outcome = 'win';
      isBlackjack = true;
      break;
    case 'win':
      winnings = currentBet * 2;
      resultEl.innerHTML = icons.win + ' ' + message;
      resultEl.className = 'win';
      outcome = 'win';
      break;
    case 'lose':
      winnings = 0;
      resultEl.innerHTML = icons.lose + ' ' + message;
      resultEl.className = 'lose';
      outcome = 'lose';
      isBust = (playerScore > 21);
      break;
    case 'push':
      winnings = currentBet;
      resultEl.innerHTML = icons.draw + ' ' + message;
      resultEl.className = 'push';
      outcome = 'push';
      break;
  }

  dobloni += winnings;
  updateDobloniDisplay();

  document.getElementById('game-buttons').classList.add('hidden');
  document.getElementById('new-game-section').classList.remove('hidden');

  statsFinalizeRound({ outcome, isBlackjack, isBust, winnings });
}


function newRound(keepBet = false) {
  if (!keepBet) {
    currentBet = 0;
    document.getElementById('current-bet').textContent = '0';
  }

  document.getElementById('player-hands-container').innerHTML = '<div id="player-cards" class="cards"></div>';
  document.getElementById('player-cards').innerHTML = '';
  document.getElementById('dealer-cards').innerHTML = '';
  document.getElementById('result').innerHTML = '';
  document.getElementById('result').className = '';
  document.getElementById('player-score').textContent = '-';
  document.getElementById('dealer-score').textContent = '-';

  document.getElementById('betting-section').classList.remove('hidden');
  document.getElementById('new-game-section').classList.add('hidden');

  if (dobloni <= 0) {
    dobloni = 1000;
    updateDobloniDisplay();
    alert('Sei rimasto senza Dobloni! Ti diamo 1000 Dobloni per ricominciare.');
  }
}

function repeatBet() {
  const lastBet = parseInt(localStorage.getItem("lastBet")) || 0;

  if (lastBet === 0) {
    newRound();
    return;
  }

  if (dobloni >= lastBet) {
    currentBet = lastBet;
    document.getElementById("current-bet").textContent = currentBet;
    
    newRound(true);
  } else {
    alert("Dobloni insufficienti per ripetere la puntata");
    newRound();
  }
}

function doubleBet() {
  const lastBet = parseInt(localStorage.getItem("lastBet")) || 0;

  if (lastBet === 0) {
    newRound();
    return;
  }

  if (dobloni >= lastBet * 2) {
    currentBet = lastBet * 2;
    document.getElementById("current-bet").textContent = currentBet;
    
    newRound(true);
  } else {
    alert("Dobloni insufficienti per raddoppiare la puntata");
    newRound();
  }
}

function getCardValue(value) {
  if (value === 'ACE') return 11;
  if (['KING', 'QUEEN', 'JACK'].includes(value)) return 10;
  return parseInt(value);
}

function calculateScore(cards) {
  let score = 0;
  let aces = 0;

  cards.forEach(card => {
    if (card.value === 'ACE') {
      aces++;
      score += 11;
    } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function updatePlayerScore() {
  playerScore = calculateScore(playerCards);
  document.getElementById('player-score').textContent = playerScore;
}

function updateDealerScore() {
  dealerScore = calculateScore(dealerCards);
  document.getElementById('dealer-score').textContent = dealerScore;
}

function bindUI() {
  document.getElementById('chip-10').addEventListener('click', () => addBet(10));
  document.getElementById('chip-25').addEventListener('click', () => addBet(25));
  document.getElementById('chip-50').addEventListener('click', () => addBet(50));
  document.getElementById('chip-100').addEventListener('click', () => addBet(100));
  document.getElementById('chip-500').addEventListener('click', () => addBet(500));

  document.getElementById('clear-btn').addEventListener('click', clearBet);
  document.getElementById('deal-btn').addEventListener('click', deal);

  document.getElementById('hit-btn').addEventListener('click', hit);
  document.getElementById('stand-btn').addEventListener('click', stand);
  document.getElementById('double-btn').addEventListener('click', doubleDown);
  document.getElementById('split-btn').addEventListener('click', split);

  document.getElementById('new-round-btn').addEventListener('click', () => newRound(false));
  document.getElementById('repeat-bet-btn').addEventListener('click', repeatBet);
  document.getElementById('double-bet-btn').addEventListener('click', doubleBet);


  document.getElementById('toggle-stats-btn').addEventListener('click', () => {
    document.getElementById('stats-panel').classList.toggle('hidden');
  });
  document.getElementById('reset-stats-btn').addEventListener('click', resetStats);
  document.getElementById('export-stats-btn').addEventListener('click', exportStats);
  document.getElementById('import-stats-btn').addEventListener('click', importStats);

  document.addEventListener('keydown', (e) => {
    if (!gameInProgress) return;
    if (e.key === 'h' || e.key === 'H') {
      if (!document.getElementById('hit-btn').disabled) hit();
    } else if (e.key === 's' || e.key === 'S') {
      if (!document.getElementById('stand-btn').disabled) stand();
    } else if (e.key === 'd' || e.key === 'D') {
      if (!document.getElementById('double-btn').classList.contains('hidden')) doubleDown();
    }
  });
}

updateDobloniDisplay();
bindUI();
renderStats();
