# progetto-TPSIT-api

# CardPlay Online – Blackjack

Progetto di TPSIT – Classe 5^Ci  
Applicazione web per giocare a **Blackjack** utilizzando una **API REST esterna**.

---

## Descrizione del progetto

**CardPlay Online – Blackjack** è un sito web che permette all'utente di giocare a Blackjack contro il banco.  
Il progetto utilizza una API pubblica per la gestione del mazzo di carte e implementa la logica di gioco tramite JavaScript.

L'obiettivo è dimostrare l'integrazione di API esterne, l'uso di chiamate HTTP asincrone e la gestione della logica applicativa lato client.

---

## Funzionalità principali

### Funzionalità base
- Creazione e mescolamento di un mazzo di carte (6 mazzi)
- Pesca delle carte tramite API
- Visualizzazione grafica delle carte con animazioni
- Calcolo automatico del punteggio del giocatore e del banco
- Gestione degli Assi (valore 1 o 11)
- Carta coperta del banco
- Verifica delle regole complete del Blackjack

### Funzionalità avanzate
- **Sistema di scommesse** con Dobloni virtuali
- **Hit** - Pesca una carta aggiuntiva
- **Stand** - Ferma la mano e passa il turno al banco
- **Double Down** - Raddoppia la puntata e pesca una sola carta
- **Split** - Dividi le coppie e gioca due mani separate
- **Blackjack naturale** - Pagamento 3:2
- **Controlli da tastiera** (H = Hit, S = Stand, D = Double Down)
- **Animazioni e feedback visivi** per vittorie e sconfitte
- **Reset automatico** dei Dobloni quando terminano

### Sistema di puntate
- Chip da 10, 25, 50, 100 e 500 Dobloni
- Saldo iniziale di 1000 Dobloni
- Pagamento 2:1 per vittorie normali
- Pagamento 3:2 per Blackjack naturale
- Rimborso completo in caso di pareggio

---

## API utilizzata

**Deck of Cards API**  
API REST gratuita per la gestione dei mazzi di carte.

**Sito ufficiale:**  
https://deckofcardsapi.com/

**Endpoints utilizzati:**
- `GET /api/deck/new/shuffle/?deck_count=6` - Crea e mescola un nuovo mazzo
- `GET /api/deck/{deck_id}/draw/?count={n}` - Pesca n carte dal mazzo

**Funzionalità API:**
- Creazione nuovo mazzo con più deck
- Mescolamento automatico
- Pesca carte con immagini
- Gestione deck tramite `deck_id` univoco
- Immagini SVG delle carte

---

## Tecnologie utilizzate

- **HTML5** – struttura semantica della pagina
- **CSS3** – stile moderno con gradients e animazioni
  - Flexbox per il layout
  - Animazioni e transizioni
  - Design responsive
- **JavaScript (ES6+)** – logica di gioco e integrazione API
  - Async/await per chiamate asincrone
  - Promise per gestione timing
  - Event listeners
  - DOM manipulation
- **Fetch API** – chiamate HTTP asincrone REST
- **Git & GitHub** – versionamento e condivisione del progetto

---

## Struttura del progetto

```
cardplay-blackjack/
│
├── index.html          # Pagina principale con struttura HTML
├── style.css           # Foglio di stile con layout e animazioni
├── script.js           # Logica di gioco completa e integrazione API
└── README.md           # Documentazione del progetto
```

---

## Come giocare

1. **Piazza la puntata** selezionando le chip desiderate
2. Clicca su **"Distribuisci"** per iniziare la mano
3. Ricevi due carte scoperte, il banco riceve una scoperta e una coperta
4. Scegli la tua azione:
   - **Carta** - Pesca una carta aggiuntiva
   - **Stai** - Ferma la mano
   - **Raddoppia** - Raddoppia la puntata e pesca una sola carta (disponibile solo con 2 carte)
   - **Split** - Dividi le coppie in due mani separate (disponibile solo con carte dello stesso valore)
5. Il banco pesca fino a raggiungere almeno 17
6. Vince chi si avvicina di più a 21 senza sballare (superare 21)

### Regole del Blackjack
- **Blackjack naturale:** Asso + figura/10 con le prime due carte = vincita 3:2
- **Bust (Sballato):** Punteggio > 21 = sconfitta automatica
- **Banco:** Deve pescare fino a 17, poi deve stare
- **Pareggio (Push):** Stesso punteggio = rimborso della puntata
- **Asso:** Vale 11 o 1 automaticamente per evitare di sballare

---

## Installazione e utilizzo

1. Clona il repository:
   ```bash
   git clone https://github.com/tuousername/progetto-TPSIT-api.git
   ```

2. Apri il file `index.html` nel browser

3. Inizia a giocare!

**Nota:** Non è necessario alcun server web, l'applicazione funziona completamente lato client.

---

## Concetti dimostrati

- **Chiamate API asincrone** con Fetch
- **Promise e async/await** per operazioni asincrone
- **Gestione dello stato** dell'applicazione
- **Manipolazione del DOM** dinamica
- **Event handling** e interattività utente
- **Logica condizionale complessa** per le regole del gioco
- **Animazioni CSS** e feedback visivo
- **Responsive design** per diversi dispositivi
- **Gestione degli errori** nelle chiamate API

---

## Obiettivi didattici raggiunti

- Integrazione di API REST esterne
- Utilizzo di chiamate HTTP asincrone
- Gestione di JSON
- Manipolazione del DOM
- Implementazione logica di gioco complessa
- Gestione dello stato dell'applicazione
- Design responsive e user experience
- Versionamento con Git

---

## Autore

Progetto realizzato per il corso di TPSIT  
Classe 5^Ci

---

## Licenza

Progetto didattico open source.
