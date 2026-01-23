# progetto-TPSIT-api

# CardPlay Online - Blackjack

Progetto di TPSIT - Classe 5^Ci
Applicazione web per giocare a Blackjack utilizzando una API REST esterna.

---

## Descrizione del progetto

CardPlay Online - Blackjack è un sito web che permette all'utente di giocare a Blackjack contro il banco.
Il progetto utilizza una API pubblica per la gestione del mazzo di carte e implementa la logica di gioco tramite JavaScript.
Il codice è stato strutturato separando la logica (JS), lo stile (CSS) e la struttura (HTML) per una migliore manutenibilità.

L'applicazione fa uso del LocalStorage del browser per salvare le statistiche di gioco e le preferenze di puntata tra le sessioni.

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
- Sistema di scommesse con Dobloni virtuali
- Hit - Pesca una carta aggiuntiva
- Stand - Ferma la mano e passa il turno al banco
- Double Down - Raddoppia la puntata e pesca una sola carta
- Split - Dividi le coppie e gioca due mani separate
- Blackjack naturale - Pagamento 3:2
- Controlli da tastiera (H = Hit, S = Stand, D = Double Down)
- Reset automatico dei Dobloni quando terminano

### Gestione Statistiche e Dati
- Pannello statistiche dettagliato (mani giocate, winrate, grafico andamento, profitto netto)
- Salvataggio automatico delle statistiche nel LocalStorage
- Esportazione e Importazione delle statistiche tramite formato JSON
- Persistenza dell'ultima puntata effettuata

### Sistema di puntate e Comandi rapidi
- Chip da 10, 25, 50, 100 e 500 Dobloni
- Funzione Ripeti Puntata: ripropone immediatamente l'ultima scommessa effettuata
- Funzione Raddoppia Puntata: raddoppia l'ultima scommessa per la nuova mano
- Pagamento 2:1 per vittorie normali
- Pagamento 3:2 per Blackjack naturale
- Rimborso completo in caso di pareggio

---

## API utilizzata

Deck of Cards API
API REST gratuita per la gestione dei mazzi di carte.

Sito ufficiale:
https://deckofcardsapi.com/

Endpoints utilizzati:
- GET /api/deck/new/shuffle/?deck_count=6 - Crea e mescola un nuovo mazzo
- GET /api/deck/{deck_id}/draw/?count={n} - Pesca n carte dal mazzo

---

## Tecnologie utilizzate

- HTML5 - struttura semantica della pagina
- CSS3 - foglio di stile esterno con layout Flexbox/Grid e animazioni
- JavaScript (ES6+) - logica di gioco separata in file esterno
  - Async/await per chiamate asincrone
  - Web Storage API (LocalStorage) per la persistenza dei dati
  - JSON manipulation per export/import dati
  - DOM manipulation e Event handling
- Fetch API - chiamate HTTP asincrone REST

---

## Struttura del progetto

- **index.html**: Pagina principale con struttura HTML
- **style.css**: Foglio di stile esterno con layout e design
- **script.js**: Logica di gioco, gestione API e LocalStorage
- **README.md**: Documentazione del progetto

---

## Come giocare

1. Piazza la puntata selezionando le chip desiderate.
2. Clicca su "Distribuisci" per iniziare la mano.
3. Ricevi due carte scoperte, il banco riceve una scoperta e una coperta.
4. Scegli la tua azione:
   - Carta (Hit)
   - Stai (Stand)
   - Raddoppia (Double Down - solo prima mossa)
   - Split (solo con coppia di valore uguale)
5. Il banco pesca fino a raggiungere almeno 17.
6. A fine partita puoi scegliere di iniziare una nuova mano manualmente, oppure usare i tasti rapidi "Ripeti Puntata" o "Raddoppia Puntata".

### Regole del Blackjack implementate
- Blackjack naturale: Asso + figura/10 con le prime due carte = vincita 3:2
- Bust (Sballato): Punteggio > 21 = sconfitta automatica
- Banco: Deve pescare fino a 17 (soft 17 incluso), poi deve stare
- Pareggio (Push): Stesso punteggio = rimborso della puntata
- Asso: Vale 11 o 1 automaticamente per evitare di sballare

---

## Installazione e utilizzo

1. Clona il repository o scarica i file.
2. Assicurati che index.html, style.css e script.js siano nella stessa cartella.
3. Apri il file index.html nel browser.

Nota: Non è necessario alcun server web, l'applicazione funziona completamente lato client.

---

## Autori

Baran Ernest, Nardullo Federico, Taramelli Nicholas, Zanchi Lorenzo
Classe 5^Ci

---

## Licenza

Progetto didattico open source.
