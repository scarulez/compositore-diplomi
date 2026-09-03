# Compositore Diplomi

App desktop Electron per Windows che genera diplomi PNG in batch da un modello
immagine e da un elenco di partecipanti (CSV/Excel).

## Flusso di lavoro git

Progetto personale con un solo sviluppatore. Le convenzioni sono scelte di
conseguenza: niente cerimonie che servono solo a coordinare più persone.

- **Commit direttamente su `main`.** Niente feature branch di default, niente
  pull request, niente branch protection. Non c'è nessuno che revisiona e la CI
  non gira sulle PR, quindi una PR non verificherebbe nulla.
- Un branch si usa solo quando serve **isolare** del lavoro (refactor lungo che
  potrebbe essere buttato, esperimento da parcheggiare). In quel caso si mergia
  in locale con `git merge`, senza passare da GitHub.
- Messaggi di commit in stile conventional commits (`feat:`, `fix:`, `docs:`,
  `chore:`), coerenti con la storia esistente.

## Pubblicazione di una release

La release è guidata dal tag. `.github/workflows/release.yml` parte su push di un
tag `v*`, ricompila su `windows-latest` e allega gli artefatti alla release.

Sequenza:

1. Aggiorna `version` in `package.json`.
2. Committa il bump.
3. `git push origin main`
4. `git tag vX.Y.Z && git push origin vX.Y.Z`

**Il workflow legge la versione da `package.json`, non dal tag.** Se le due
divergono, lo step "Create release" non trova i file attesi in `dist/` e
fallisce. Il bump va sempre fatto e committato *prima* del tag.

I binari non si caricano mai a mano: li produce la CI.

## Artefatti di build

Non vanno mai committati. Già esclusi da `.gitignore`:

- `node_modules/` — dipendenze di build
- `dist/` — output di electron-builder
- `output/` — build portable prodotte in locale per test

## Comandi

```powershell
npm start              # avvio dai sorgenti
npm run package        # setup NSIS + portable in dist/
.\build.ps1            # pulisce dist/ e ricostruisce entrambi
```
