# Diploma Batch Generator

Una applicazione desktop Windows per generare massivamente diplomi personalizzati.

## Funzionalità

- **Template Image**: Carica un'immagine statica come base per i diplomi
- **Data File**: Supporta file TXT, CSV e XLS/XLSX con i dati variabili
  - Ogni riga rappresenta un diploma da generare
  - Fino a 3 campi di testo configurabili (campo1, campo2, campo3)
- **Text Fields Configuration**: Per ciascuno dei 3 campi:
  - Abilita/Disabilita il campo
  - Posizione X e Y sull'immagine
  - Font selezionabile
  - Dimensione del font
  - Allineamento (sinistra, centro, destra)
  - Colore del testo (con color picker)
- **Output Folder**: Scegli la cartella dove salvare le immagini generate
- **Preview**: Anteprima dell'immagine template e dei dati caricati
- **Progress Bar**: Barra di avanzamento durante la generazione

## Installazione

```bash
pip install -r requirements.txt
```

## Utilizzo

```bash
python diploma_generator.py
```

## Formato File di Input

### TXT
Ogni riga contiene i valori separati da virgola:
```
Nome Cognome,Data,Corso
Mario Rossi,01/01/2024,Python Base
Luca Bianchi,02/01/2024,JavaScript Avanzato
```

### CSV
Stesso formato del TXT, con intestazioni opzionali:
```csv
name,date,course
Mario Rossi,01/01/2024,Python Base
Luca Bianchi,02/01/2024,JavaScript Avanzato
```

### Excel (XLSX/XLS)
Tre colonne con i dati per ciascun diploma.

## Come Funziona

1. Seleziona l'immagine template del diploma
2. Carica il file con i dati (TXT, CSV o XLSX)
3. Configura i 3 campi di testo:
   - Posizione (coordinate X, Y)
   - Font e dimensione
   - Allineamento
   - Colore
4. Scegli la cartella di output
5. Clicca su "GENERATE DIPLOMAS"

Le immagini verranno salvate come `diploma_0001.png`, `diploma_0002.png`, ecc.

## Requisiti

- Python 3.8+
- Windows (consigliato per i font di sistema)
- Pillow
- pandas
- openpyxl
