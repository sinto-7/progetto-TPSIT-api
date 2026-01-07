let deckId = "";
let playerScore = 0;
let dealerScore = 0;

async function startGame() {
    playerScore = 0;
    dealerScore = 0;

    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("result").innerText = "";
    updateScores();

    const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    const data = await response.json();
    deckId = data.deck_id;

    drawCard();
    drawCard();
}

async function drawCard() {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    const card = data.cards[0];

    playerScore += getCardValue(card.value);
    updateScores();

    const img = document.createElement("img");
    img.src = card.image;
    document.getElementById("player-cards").appendChild(img);

    if (playerScore > 21) {
        document.getElementById("result").innerText = "❌ Hai sballato! Hai perso.";
    }
}

async function stand() {
    while (dealerScore < 17) {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const data = await response.json();
        const card = data.cards[0];

        dealerScore += getCardValue(card.value);

        const img = document.createElement("img");
        img.src = card.image;
        document.getElementById("dealer-cards").appendChild(img);
    }

    updateScores();
    checkWinner();
}

function getCardValue(value) {
    if (value === "ACE") return 11;
    if (["KING", "QUEEN", "JACK"].includes(value)) return 10;
    return parseInt(value);
}

function updateScores() {
    document.getElementById("player-score").innerText = playerScore;
    document.getElementById("dealer-score").innerText = dealerScore;
}

function checkWinner() {
    let result = "";

    if (dealerScore > 21 || playerScore > dealerScore) {
        result = "🎉 Hai vinto!";
    } else if (playerScore < dealerScore) {
        result = "❌ Hai perso!";
    } else {
        result = "🤝 Pareggio!";
    }

    document.getElementById("result").innerText = result;
}