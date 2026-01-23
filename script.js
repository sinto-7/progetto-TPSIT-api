// SVG Icons
const icons = {
    win: `<svg class="icon-small" viewBox="0 0 64 64" fill="gold">
        <polygon points="32,4 39,24 60,24 43,38 50,58 32,46 14,58 21,38 4,24 25,24"/>
    </svg>`,
    lose: `<svg class="icon-small" viewBox="0 0 64 64" fill="#f44336">
        <circle cx="32" cy="32" r="28" stroke="#f44336" stroke-width="4" fill="none"/>
        <line x1="18" y1="18" x2="46" y2="46" stroke="#f44336" stroke-width="4"/>
        <line x1="46" y1="18" x2="18" y2="46" stroke="#f44336" stroke-width="4"/>
    </svg>`,
    draw: `<svg class="icon-small" viewBox="0 0 64 64" fill="#ffc107">
        <circle cx="32" cy="32" r="28" stroke="#ffc107" stroke-width="4" fill="none"/>
        <line x1="16" y1="32" x2="48" y2="32" stroke="#ffc107" stroke-width="4"/>
    </svg>`,
    blackjack: `<svg class="icon-small" viewBox="0 0 64 64">
        <polygon points="32,4 39,24 60,24 43,38 50,58 32,46 14,58 21,38 4,24 25,24" fill="gold"/>
        <polygon points="32,12 36,24 48,24 38,32 42,44 32,36 22,44 26,32 16,24 28,24" fill="#ffd700"/>
    </svg>`
};

const cardBackSVG = `<svg viewBox="0 0 64 64" fill="white">
    <rect x="5" y="5" width="54" height="54" rx="5" fill="none" stroke="white" stroke-width="2"/>
    <line x1="5" y1="5" x2="59" y2="59" stroke="white" stroke-width="1"/>
    <line x1="59" y1="5" x2="5" y2="59" stroke="white" stroke-width="1"/>
    <circle cx="32" cy="32" r="15" fill="none" stroke="white" stroke-width="2"/>
</svg>`;

// Game State
let deckId = "";
let dobloni = 1000;
let currentBet = 0;
let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;
let dealerHiddenCard = null;
let gameInProgress = false;
let playerTurn = true;

// Split state
let isSplit = false;
let splitHands = [];
let currentHandIndex = 0;

let stats = {
    hands: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    bankruptcies: 0

let sideBet = 0;
};

// Initialize
loadStats();
loadGame();
updateDobloniDisplay();
document.getElementById("current-bet").textContent = currentBet;

function updateDobloniDisplay() {
    document.getElementById("dobloni-amount").textContent = dobloni;
}

function addBet(amount) {
    if (amount <= dobloni - currentBet) {
        currentBet += amount;
        document.getElementById("current-bet").textContent = currentBet;
    }
}

function clearBet() {
    currentBet = 0;
    document.getElementById("current-bet").textContent = currentBet;
}

async function deal() {
    if (currentBet === 0) {
        alert("Devi piazzare una puntata!");
        return;
    }

    // Deduct bet from dobloni
    dobloni -= currentBet;
    updateDobloniDisplay();

    // Reset state
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

    // Clear displays
    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").className = "";
    document.getElementById("player-score").textContent = "-";
    document.getElementById("dealer-score").textContent = "?";

    // Hide betting, show game buttons
    document.getElementById("betting-section").classList.add("hidden");
    document.getElementById("new-game-section").classList.add("hidden");

    // Get new deck
    const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6");
    const data = await response.json();
    deckId = data.deck_id;

    // Draw initial cards: Player, Dealer, Player, Dealer(hidden)
    const drawResponse = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`);
    const drawData = await drawResponse.json();
    const cards = drawData.cards;

    // Distribute cards with delay for realism
    await dealCardWithDelay(cards[0], "player", 300);
    await dealCardWithDelay(cards[1], "dealer", 300);
    await dealCardWithDelay(cards[2], "player", 300);

    if (sideBet > 0) {
    const c1 = playerCards[0];
    const c2 = playerCards[1];

    if (c1.code === c2.code) {
        dobloni += sideBet * 10;
    } else if (getCardValue(c1.value) === getCardValue(c2.value)) {
        dobloni += sideBet * 5;
    }
    sideBet = 0;
    document.getElementById("sidebet").textContent = "0";
}
    
    // Dealer's hidden card
    dealerHiddenCard = cards[3];
    dealerCards.push(dealerHiddenCard);
    const hiddenCardDiv = document.createElement("div");
    hiddenCardDiv.className = "card-back";
    hiddenCardDiv.id = "hidden-card";
    hiddenCardDiv.innerHTML = cardBackSVG;
    document.getElementById("dealer-cards").appendChild(hiddenCardDiv);

    // Calculate initial scores
    updatePlayerScore();
    document.getElementById("dealer-score").textContent = "?";

    // Check for blackjack
    if (playerScore === 21) {
        await revealDealerCard();
        if (dealerScore === 21) {
            endGame("push", "Entrambi Blackjack! Pareggio.");
        } else {
            endGame("blackjack", "BLACKJACK! Hai vinto!");
        }
        return;
    }

    // Show game buttons
    showGameButtons();
}

async function dealCardWithDelay(card, target, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            const img = document.createElement("img");
            img.src = card.image;
            
            if (target === "player") {
                playerCards.push(card);
                document.getElementById("player-cards").appendChild(img);
            } else {
                dealerCards.push(card);
                document.getElementById("dealer-cards").appendChild(img);
            }
            
            resolve();
        }, delay);
    });
}

function showGameButtons() {
    const gameButtons = document.getElementById("game-buttons");
    gameButtons.classList.remove("hidden");

    // Enable/disable buttons based on game state
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;
    
    // Double down only available on first two cards and if player has enough dobloni
    const canDouble = playerCards.length === 2 && dobloni >= currentBet;
    document.getElementById("double-btn").disabled = !canDouble;
    document.getElementById("double-btn").classList.toggle("hidden", !canDouble);

    // Split available if first two cards have same value
    const canSplit = playerCards.length === 2 && 
                     getCardValue(playerCards[0].value) === getCardValue(playerCards[1].value) &&
                     dobloni >= currentBet &&
                     !isSplit;
    document.getElementById("split-btn").disabled = !canSplit;
    document.getElementById("split-btn").classList.toggle("hidden", !canSplit);
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
    
    const img = document.createElement("img");
    img.src = card.image;
    document.getElementById("player-cards").appendChild(img);

    updatePlayerScore();

    document.getElementById("double-btn").classList.add("hidden");
    document.getElementById("split-btn").classList.add("hidden");

    if (playerScore > 21) {
        await revealDealerCard();
        endGame("lose", "Sballato! Hai perso.");
    } else if (playerScore === 21) {
        await stand();
    }
    
}
async function hitSplitHand() {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    const card = data.cards[0];

    splitHands[currentHandIndex].cards.push(card);
    
    const img = document.createElement("img");
    img.src = card.image;
    document.getElementById(`split-cards-${currentHandIndex}`).appendChild(img);

    updateSplitScores();

    if (splitHands[currentHandIndex].score > 21) {
        await switchToNextSplitHand();
    } else if (splitHands[currentHandIndex].score === 21) {
        await switchToNextSplitHand();
    }
}

async function stand() {
    if (isSplit && currentHandIndex < splitHands.length - 1) {
        await switchToNextSplitHand();
        return;
    }

    playerTurn = false;
    document.getElementById("game-buttons").classList.add("hidden");

    await revealDealerCard();
    await dealerPlay();
    determineWinner();
}

async function doubleDown() {
    // Double the bet
    dobloni -= currentBet;
    currentBet *= 2;
    updateDobloniDisplay();

    // Draw one card and stand
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    const card = data.cards[0];

    playerCards.push(card);
    
    const img = document.createElement("img");
    img.src = card.image;
    document.getElementById("player-cards").appendChild(img);

    updatePlayerScore();

    if (playerScore > 21) {
        await revealDealerCard();
        endGame("lose", "Sballato! Hai perso.");
    } else {
        await stand();
    }
}

async function split() {
    // Deduct additional bet for split hand
    dobloni -= currentBet;
    updateDobloniDisplay();

    isSplit = true;
    
    // Create two hands from the pair
    const card1 = playerCards[0];
    const card2 = playerCards[1];
    
    splitHands = [
        { cards: [card1], score: 0 },
        { cards: [card2], score: 0 }
    ];
    currentHandIndex = 0;

    // Update UI to show split hands
    const container = document.getElementById("player-hands-container");
    container.innerHTML = `
        <div class="split-container">
            <div class="split-hand active" id="split-hand-0">
                <h4>Mano 1</h4>
                <div class="cards" id="split-cards-0"></div>
                <p>Punteggio: <span id="split-score-0">0</span></p>
            </div>
            <div class="split-hand" id="split-hand-1">
                <h4>Mano 2</h4>
                <div class="cards" id="split-cards-1"></div>
                <p>Punteggio: <span id="split-score-1">0</span></p>
            </div>
        </div>
    `;

    // Add cards to split hands
    const img1 = document.createElement("img");
    img1.src = card1.image;
    document.getElementById("split-cards-0").appendChild(img1);

    const img2 = document.createElement("img");
    img2.src = card2.image;
    document.getElementById("split-cards-1").appendChild(img2);

    // Draw one card for first hand
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    const newCard = data.cards[0];
    
    splitHands[0].cards.push(newCard);
    const newImg = document.createElement("img");
    newImg.src = newCard.image;
    document.getElementById("split-cards-0").appendChild(newImg);

    updateSplitScores();
    
    // Update reference for hit/stand
    playerCards = splitHands[0].cards;
    
    document.getElementById("split-btn").classList.add("hidden");
    document.getElementById("double-btn").classList.add("hidden");

    // Check if first hand is 21
    if (splitHands[0].score === 21) {
        await switchToNextSplitHand();
    }
}

function updateSplitScores() {
    splitHands.forEach((hand, index) => {
        hand.score = calculateScore(hand.cards);
        const scoreEl = document.getElementById(`split-score-${index}`);
        if (scoreEl) {
            scoreEl.textContent = hand.score;
        }
    });
    playerScore = splitHands[currentHandIndex].score;
}

async function switchToNextSplitHand() {
    currentHandIndex++;
    
    if (currentHandIndex >= splitHands.length) {
        // All hands played, dealer's turn
        playerTurn = false;
        document.getElementById("game-buttons").classList.add("hidden");
        await revealDealerCard();
        await dealerPlay();
        determineWinner();
        return;
    }

    // Update active hand styling
    document.querySelectorAll(".split-hand").forEach((el, idx) => {
        el.classList.toggle("active", idx === currentHandIndex);
    });

    // Draw card for new hand
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    const newCard = data.cards[0];
    
    splitHands[currentHandIndex].cards.push(newCard);
    const newImg = document.createElement("img");
    newImg.src = newCard.image;
    document.getElementById(`split-cards-${currentHandIndex}`).appendChild(newImg);

    playerCards = splitHands[currentHandIndex].cards;
    updateSplitScores();

    if (splitHands[currentHandIndex].score === 21) {
        await switchToNextSplitHand();
    }
}

    
async function revealDealerCard() {
    const hiddenCardEl = document.getElementById("hidden-card");
    if (hiddenCardEl && dealerHiddenCard) {
        const img = document.createElement("img");
        img.src = dealerHiddenCard.image;
        hiddenCardEl.replaceWith(img);
    }
    updateDealerScore();
}

async function dealerPlay() {
    while (dealerScore < 17) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const data = await response.json();
        const card = data.cards[0];

        dealerCards.push(card);
        
        const img = document.createElement("img");
        img.src = card.image;
        document.getElementById("dealer-cards").appendChild(img);

        updateDealerScore();
    }
}

function determineWinner() {
    if (isSplit) {
        determineSplitWinner();
        return;
    }

    if (dealerScore > 21) {
        endGame("win", "Il banco sballa! Hai vinto!");
    } else if (playerScore > dealerScore) {
        endGame("win", "Hai vinto!");
    } else if (playerScore < dealerScore) {
        endGame("lose", "Hai perso!");
    } else {
        endGame("push", "Pareggio!");
    }
}

function determineSplitWinner() {
    let totalWinnings = 0;
    let results = [];

    splitHands.forEach((hand, index) => {
        const handNum = index + 1;
        if (hand.score > 21) {
            results.push(`Mano ${handNum}: Sballato`);
        } else if (dealerScore > 21) {
            results.push(`Mano ${handNum}: Vinto!`);
            totalWinnings += currentBet / 2 * 2;
        } else if (hand.score > dealerScore) {
            results.push(`Mano ${handNum}: Vinto!`);
            totalWinnings += currentBet / 2 * 2;
        } else if (hand.score < dealerScore) {
            results.push(`Mano ${handNum}: Perso`);
        } else {
            results.push(`Mano ${handNum}: Pareggio`);
            totalWinnings += currentBet / 2;
        }
    });

    dobloni += totalWinnings;
    updateDobloniDisplay();
    saveGame();

    const resultEl = document.getElementById("result");
    resultEl.innerHTML = results.join(" | ");
    resultEl.className = totalWinnings > currentBet ? "win" : totalWinnings < currentBet ? "lose" : "push";
    
    gameInProgress = false;
    document.getElementById("game-buttons").classList.add("hidden");
    document.getElementById("new-game-section").classList.remove("hidden");
}

function endGame(result, message) {
    gameInProgress = false;
    const resultEl = document.getElementById("result");
    
    let winnings = 0;
    
    switch(result) {
        case "blackjack":
            winnings = currentBet * 2.5; // 3:2 payout
            resultEl.innerHTML = icons.blackjack + " " + message;
            resultEl.className = "blackjack";
            break;
        case "win":
            winnings = currentBet * 2;
            resultEl.innerHTML = icons.win + " " + message;
            resultEl.className = "win";
            break;
        case "lose":
            winnings = 0;
            resultEl.innerHTML = icons.lose + " " + message;
            resultEl.className = "lose";
            break;
        case "push":
            winnings = currentBet; // Return bet
            resultEl.innerHTML = icons.draw + " " + message;
            resultEl.className = "push";
            break;

        stats.hands++;

        if (result === "win" || result === "blackjack") stats.wins++;
        if (result === "lose") stats.losses++;
        if (result === "push") stats.pushes++;
        if (result === "blackjack") stats.blackjacks++;
        
        saveStats();
        saveGame();

    }

    dobloni += winnings;
    updateDobloniDisplay();

    document.getElementById("game-buttons").classList.add("hidden");
    document.getElementById("new-game-section").classList.remove("hidden");
}

function newRound() {
    
    // Reset split container if used
    const container = document.getElementById("player-hands-container");
    container.innerHTML = '<div id="player-cards" class="cards"></div>';
    
    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").className = "";
    document.getElementById("player-score").textContent = "-";
    document.getElementById("dealer-score").textContent = "-";

    document.getElementById("betting-section").classList.remove("hidden");
    document.getElementById("new-game-section").classList.add("hidden");
    
    if (dobloni <= 0) {
    stats.bankruptcies++;
    saveStats();
    showBankruptcy();
    }
}

function showBankruptcy() {
    dobloni = 1000;
    updateDobloniDisplay();
    alert("BANCAROTTA! Ti vengono concessi 1000 Dobloni.");
}

function getCardValue(value) {
    if (value === "ACE") return 11;
    if (["KING", "QUEEN", "JACK"].includes(value)) return 10;
    return parseInt(value);
}

function calculateScore(cards) {
    let score = 0;
    let aces = 0;

    cards.forEach(card => {
        if (card.value === "ACE") {
            aces++;
            score += 11;
        } else if (["KING", "QUEEN", "JACK"].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });

    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function updatePlayerScore() {
    playerScore = calculateScore(playerCards);
    document.getElementById("player-score").textContent = playerScore;
}

function updateDealerScore() {
    dealerScore = calculateScore(dealerCards);
    document.getElementById("dealer-score").textContent = dealerScore;
}

function saveStats() {
    localStorage.setItem("blackjackStats", JSON.stringify(stats));
}

function loadStats() {
    const saved = localStorage.getItem("blackjackStats");
    if (saved) stats = JSON.parse(saved);
}

function saveGame() {
    localStorage.setItem("dobloni", dobloni);
    localStorage.setItem("lastBet", currentBet);
}

function loadGame() {
    const d = localStorage.getItem("dobloni");
    const b = localStorage.getItem("lastBet");
    if (d) dobloni = parseInt(d);
    if (b) currentBet = parseInt(b);
}

function addSideBet(amount) {
    if (dobloni >= amount) {
        sideBet += amount;
        dobloni -= amount;
        document.getElementById("sidebet").textContent = sideBet;
        updateDobloniDisplay();
    }
}
function repeatBet() {
    const lastBet = parseInt(localStorage.getItem("lastBet")) || 0;

    if (lastBet === 0) return;

    if (dobloni >= lastBet) {
        currentBet = lastBet;
        document.getElementById("current-bet").textContent = currentBet;
    } else {
        alert("Dobloni insufficienti per ripetere la puntata");
    }
}

function doubleRepeatBet() {
    const lastBet = parseInt(localStorage.getItem("lastBet")) || 0;

    if (lastBet === 0) return;

    if (dobloni >= lastBet * 2) {
        currentBet = lastBet * 2;
        document.getElementById("current-bet").textContent = currentBet;
    } else {
        alert("Dobloni insufficienti per raddoppiare la puntata");
    }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
    if (!gameInProgress) return;
    
    if (e.key === "h" || e.key === "H") {
        if (!document.getElementById("hit-btn").disabled) hit();
    } else if (e.key === "s" || e.key === "S") {
        if (!document.getElementById("stand-btn").disabled) stand();
    } else if (e.key === "d" || e.key === "D") {
        if (!document.getElementById("double-btn").classList.contains("hidden")) doubleDown();
    }
});
