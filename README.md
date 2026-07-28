# Compositore Diplomi

Applicazione desktop Windows per creare in batch immagini di diplomi o attestati personalizzati a partire da un modello grafico e da un elenco di partecipanti.

## Funzionalità

- Importa un modello immagine in formato PNG, JPG o WebP.
- Configura fino a tre campi di testo: posizione, font, dimensione, colore e allineamento.
- Posiziona i campi trascinandoli direttamente sull'anteprima.
- Importa i dati da CSV o Excel (`.xlsx` e `.xls`).
- Esporta un'immagine PNG per ogni riga di dati, con nomi file sicuri e non duplicati.
- Scarica dall'app un modello CSV o Excel pronto da compilare.

## Requisiti

- Windows 10 o successivo.
- [Node.js](https://nodejs.org/) LTS per eseguire l'app dai sorgenti.

## Avvio in sviluppo

```powershell
npm install
npm start
```

## Formato dei dati

Il file CSV o Excel deve contenere, nella prima riga, le colonne `campo1`, `campo2` e `campo3`. Le colonne non utilizzate possono rimanere vuote.

```csv
campo1,campo2,campo3
Mario Rossi,Corso di Excel,23 luglio 2026
Giulia Bianchi,Corso di Excel,23 luglio 2026
```

## Uso

1. Seleziona l'immagine modello.
2. Configura e abilita i campi desiderati; trascinali sull'anteprima per definirne la posizione.
3. Importa il file dati oppure scarica uno dei modelli predisposti nell'app.
4. Scegli la cartella di destinazione.
5. Premi **GENERA IMMAGINI**.

Il nome di ogni PNG viene ricavato da `campo1`; se mancante, viene generato automaticamente.

## Creazione del pacchetto Windows

```powershell
npm run package
```

L'installer NSIS viene generato nella cartella `dist`. Per creare un eseguibile portabile:

```powershell
npm run package:portable
```

Gli artefatti di build non sono versionati.
