const $ = (selector) => document.querySelector(selector);

const state = {
  image: null,
  imagePath: null,
  rows: [],
  folder: null,
  selected: 0,
  zoom: 1,
  fields: [createField(0, true)],
  fileNameConfig: { prefix: '', suffix: '', separator: ' ', fieldIndexes: [0] },
  outputConfig: { format: 'png', compression: 'medium' }
};

let fonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Courier New', 'Impact'];

const JPG_LEVELS = [
  { key: 'low', label: 'Bassa', quality: 0.92, hint: 'file più grandi, massima fedeltà.' },
  { key: 'medium', label: 'Media', quality: 0.8, hint: 'compromesso tra dimensione e qualità.' },
  { key: 'high', label: 'Alta', quality: 0.6, hint: 'file più leggeri, possibili aloni sui bordi del testo.' }
];

function jpgLevel(key) {
  return JPG_LEVELS.find((level) => level.key === key) || JPG_LEVELS[1];
}

function createField(index, enabled = false) {
  return {
    name: `Campo ${index + 1}`,
    enabled,
    sample: index === 0 ? 'Nome e Cognome' : `Testo campo ${index + 1}`,
    font: index === 0 ? 'Georgia' : 'Arial',
    bold: false,
    italic: false,
    size: index === 0 ? 42 : 22,
    color: '#20243a',
    align: 'center',
    x: 50,
    y: Math.min(90, 50 + index * 10)
  };
}

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  setTimeout(() => $('#toast').classList.remove('show'), 3200);
}

function fieldHeaders() {
  return state.fields.map((_field, index) => `campo${index + 1}`);
}

function resizeRows() {
  state.rows = state.rows.map((row) => Array.from(
    { length: state.fields.length },
    (_value, index) => row[index] ?? ''
  ));
}

function normalizeSelection() {
  state.selected = Math.max(0, Math.min(state.selected, state.fields.length - 1));
}

function normalizeFileNameConfig() {
  state.fileNameConfig.fieldIndexes = selectedNameIndexes();
}

function renderFields() {
  $('#fields').innerHTML = state.fields.map((field, index) => `
    <div class="field-card ${state.selected === index ? 'selected' : ''}" data-field="${index}">
      <div class="field-top">
        <input class="enabled" type="checkbox" ${field.enabled ? 'checked' : ''} title="Includi nell'immagine generata">
        <span class="field-name">${esc(field.name)}</span>
        ${state.fields.length > 1 ? '<button class="remove-field" type="button" title="Rimuovi campo" aria-label="Rimuovi campo">×</button>' : ''}
      </div>
      <input class="sample" value="${esc(field.sample)}" placeholder="Testo di esempio">
      <div class="settings">
        <select class="font">${fonts.map((font) => `<option ${font === field.font ? 'selected' : ''}>${esc(font)}</option>`).join('')}</select>
        <input class="size" type="number" min="6" max="300" value="${field.size}" title="Dimensione">
        <input class="color" type="color" value="${field.color}" title="Colore">
      </div>
      <div class="text-style" aria-label="Stile testo">
        <button class="style ${field.bold ? 'active' : ''}" data-style="bold" type="button" title="Grassetto" aria-pressed="${field.bold}"><strong>B</strong></button>
        <button class="style ${field.italic ? 'active' : ''}" data-style="italic" type="button" title="Corsivo" aria-pressed="${field.italic}"><em>I</em></button>
      </div>
      <div class="align">${[['left', '≡'], ['center', '≡'], ['right', '≡']].map(([align, label]) => `<button class="al ${field.align === align ? 'active' : ''}" data-align="${align}" type="button" title="Allinea ${align}">${label}</button>`).join('')}</div>
    </div>
  `).join('');

  document.querySelectorAll('.field-card').forEach((card) => {
    const index = Number(card.dataset.field);
    const field = state.fields[index];
    card.addEventListener('click', (event) => {
      if (!event.target.matches('input, select, button')) {
        state.selected = index;
        renderFields();
        renderOverlays();
      }
    });
    card.querySelector('.enabled').onchange = (event) => {
      field.enabled = event.target.checked;
      renderOverlays();
    };
    card.querySelector('.sample').oninput = (event) => {
      field.sample = event.target.value;
      renderOverlays();
    };
    card.querySelector('.font').onchange = (event) => {
      field.font = event.target.value;
      renderOverlays();
    };
    card.querySelector('.size').onchange = (event) => {
      field.size = Math.max(6, Number(event.target.value) || 6);
      renderOverlays();
    };
    card.querySelector('.color').oninput = (event) => {
      field.color = event.target.value;
      renderOverlays();
    };
    card.querySelectorAll('.style').forEach((button) => {
      button.onclick = () => {
        field[button.dataset.style] = !field[button.dataset.style];
        renderFields();
        renderOverlays();
      };
    });
    card.querySelectorAll('.al').forEach((button) => {
      button.onclick = () => {
        field.align = button.dataset.align;
        renderFields();
        renderOverlays();
      };
    });
    card.querySelector('.remove-field')?.addEventListener('click', () => removeField(index));
  });
}

function addField() {
  state.fields.push(createField(state.fields.length, true));
  state.selected = state.fields.length - 1;
  resizeRows();
  renderFields();
  renderOverlays();
}

function removeField(index) {
  if (state.fields.length === 1) return;
  state.fields.splice(index, 1);
  state.rows = state.rows.map((row) => row.filter((_value, rowIndex) => rowIndex !== index));
  state.fields.forEach((field, fieldIndex) => { field.name = `Campo ${fieldIndex + 1}`; });
  state.fileNameConfig.fieldIndexes = state.fileNameConfig.fieldIndexes
    .filter((fieldIndex) => fieldIndex !== index)
    .map((fieldIndex) => fieldIndex > index ? fieldIndex - 1 : fieldIndex);
  normalizeFileNameConfig();
  normalizeSelection();
  renderFields();
  renderOverlays();
  refreshGenerate();
}

function alignFieldsWithData(columnCount) {
  const oldCount = state.fields.length;
  if (columnCount < oldCount) {
    state.fields = state.fields.slice(0, columnCount);
  } else {
    while (state.fields.length < columnCount) state.fields.push(createField(state.fields.length, false));
  }
  state.fields.forEach((field, index) => { field.name = `Campo ${index + 1}`; });
  normalizeFileNameConfig();
  normalizeSelection();
  return oldCount !== state.fields.length;
}

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function selectedNameIndexes(config = state.fileNameConfig) {
  const indexes = config.fieldIndexes.filter((index) => index >= 0 && index < state.fields.length);
  return indexes.length ? indexes : [0];
}

function buildFileName(row, index, config = state.fileNameConfig) {
  const parts = [];
  const prefix = String(config.prefix || '').trim();
  const suffix = String(config.suffix || '').trim();
  if (prefix) parts.push(prefix);
  selectedNameIndexes(config).forEach((fieldIndex) => {
    const value = String(row[fieldIndex] ?? '').trim();
    if (value) parts.push(value);
  });
  if (suffix) parts.push(suffix);
  return parts.join(config.separator) || `diploma_${index + 1}`;
}

function renderNameFields() {
  const selected = new Set(selectedNameIndexes());
  $('#nameFields').innerHTML = state.fields.map((field, index) => `
    <label class="name-field">
      <input type="checkbox" value="${index}" ${selected.has(index) ? 'checked' : ''}>
      <span>${esc(field.name)}</span>
      <small>${esc(field.sample || `campo${index + 1}`)}</small>
    </label>
  `).join('');
  document.querySelectorAll('#nameFields input').forEach((input) => {
    input.onchange = updateNamePreview;
  });
}

function modalNameConfig() {
  const fieldIndexes = [...document.querySelectorAll('#nameFields input:checked')].map((input) => Number(input.value));
  return {
    prefix: $('#filePrefix').value,
    suffix: $('#fileSuffix').value,
    separator: $('#fileSeparator').value,
    fieldIndexes: fieldIndexes.length ? fieldIndexes : [0]
  };
}

function modalOutputConfig() {
  const level = JPG_LEVELS[Number($('#jpgQuality').value)] || JPG_LEVELS[1];
  return {
    format: $('#fileFormat').value === 'jpg' ? 'jpg' : 'png',
    compression: level.key
  };
}

function updateNamePreview() {
  const name = buildFileName(state.rows[0] || [], 0, modalNameConfig());
  $('#namePreview').textContent = `Anteprima: ${name}.${modalOutputConfig().format}`;
}

function renderOutputOptions() {
  const isJpg = $('#fileFormat').value === 'jpg';
  const level = JPG_LEVELS[Number($('#jpgQuality').value)] || JPG_LEVELS[1];
  $('#qualityRow').classList.toggle('hidden', !isJpg);
  $('#qualityHint').textContent = `Compressione ${level.label.toLowerCase()}: ${level.hint}`;
  updateNamePreview();
}

function openNameModal() {
  $('#filePrefix').value = state.fileNameConfig.prefix;
  $('#fileSuffix').value = state.fileNameConfig.suffix || '';
  $('#fileSeparator').value = state.fileNameConfig.separator;
  $('#fileFormat').value = state.outputConfig.format;
  const levelIndex = JPG_LEVELS.findIndex((level) => level.key === state.outputConfig.compression);
  $('#jpgQuality').value = String(levelIndex < 0 ? 1 : levelIndex);
  renderNameFields();
  renderOutputOptions();
  $('#nameModal').classList.remove('hidden');
  setTimeout(() => $('#filePrefix').focus(), 0);
}

function closeNameModal() {
  $('#nameModal').classList.add('hidden');
}

function confirmNameModal() {
  state.fileNameConfig = modalNameConfig();
  state.outputConfig = modalOutputConfig();
  closeNameModal();
  generate();
}

function renderOverlays() {
  const box = $('#overlays');
  box.innerHTML = '';
  state.fields.forEach((field, index) => {
    if (!field.enabled) return;
    const element = document.createElement('div');
    element.className = `overlay ${state.selected === index ? 'selected' : ''}`;
    element.dataset.field = index;
    element.textContent = field.sample || field.name;
    Object.assign(element.style, {
      left: `${field.x}%`, top: `${field.y}%`, fontFamily: field.font,
      fontSize: `${scaledSize(field.size)}px`, color: field.color, textAlign: field.align,
      fontWeight: field.bold ? '700' : '400', fontStyle: field.italic ? 'italic' : 'normal', lineHeight: '1.2',
      transform: field.align === 'center' ? 'translate(-50%,-50%)' : field.align === 'right' ? 'translate(-100%,-50%)' : 'translate(0,-50%)'
    });
    element.addEventListener('pointerdown', startDrag);
    element.addEventListener('click', () => {
      state.selected = index;
      renderFields();
      renderOverlays();
    });
    box.append(element);
  });
}

function scaledSize(size) {
  const image = $('#template');
  return image.naturalWidth ? Math.max(8, size * (image.clientWidth / image.naturalWidth)) : size;
}

function startDrag(event) {
  event.preventDefault();
  const index = Number(event.currentTarget.dataset.field);
  const stage = $('#stage');
  state.selected = index;
  renderFields();
  const move = (moveEvent) => {
    const rect = stage.getBoundingClientRect();
    state.fields[index].x = Math.max(0, Math.min(100, (moveEvent.clientX - rect.left) / rect.width * 100));
    state.fields[index].y = Math.max(0, Math.min(100, (moveEvent.clientY - rect.top) / rect.height * 100));
    renderOverlays();
  };
  const end = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
}

async function chooseTemplate() {
  const filePath = await window.diplomi.pickFile([{ name: 'Immagini', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]);
  if (!filePath) return;
  const bytes = await window.diplomi.readFile(filePath);
  const blob = new Blob([bytes]);
  state.image = await createImageBitmap(blob);
  state.imagePath = filePath;
  $('#template').src = URL.createObjectURL(blob);
  $('#templateName').textContent = filePath.split(/[\\/]/).pop();
  $('#template').onload = () => {
    $('#empty').classList.add('hidden');
    $('#stage').classList.remove('hidden');
    renderOverlays();
    refreshGenerate();
  };
}

function sheetRows(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
}

async function chooseData() {
  const filePath = await window.diplomi.pickFile([{ name: 'Dati CSV o Excel', extensions: ['csv', 'xlsx', 'xls'] }]);
  if (!filePath) return;
  try {
    const bytes = await window.diplomi.readFile(filePath);
    const rawRows = sheetRows(XLSX.read(bytes, { type: 'array' }));
    importDataRows(rawRows, filePath.split(/[\\/]/).pop());
  } catch (error) {
    console.error(error);
    toast('Impossibile leggere il file dati. Verifica che la prima riga contenga le intestazioni.');
  }
}

function importDataRows(rawRows, fileName) {
  if (!rawRows.length) throw new Error('File senza intestazioni');
  const columnCount = Math.max(...rawRows.map((row) => row.length));
  if (!columnCount) throw new Error('File senza colonne');
  const dataRows = rawRows.slice(1).filter((row) => row.some((value) => String(value).trim() !== ''));
  const configurationChanged = alignFieldsWithData(columnCount);
  state.rows = dataRows.map((row) => Array.from({ length: columnCount }, (_value, index) => row[index] ?? ''));
  $('#dataName').textContent = `${fileName} · ${state.rows.length} righe · ${columnCount} campi`;
  $('#dataPreview').textContent = state.rows.length
    ? state.rows.slice(0, 3).map((row, index) => `${index + 1}. ${row.filter(Boolean).join(' · ')}`).join('\n') + (state.rows.length > 3 ? '\n…' : '')
    : 'Nessuna riga dati: la configurazione dei campi è stata comunque aggiornata.';
  renderFields();
  renderOverlays();
  refreshGenerate();
  if (configurationChanged) toast(`Configurazione adattata a ${columnCount} campi.`);
  return { columnCount, rowCount: state.rows.length, configurationChanged };
}

async function downloadTemplate(type) {
  const rows = templateRows();
  let base64;
  let name;
  if (type === 'csv') {
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    base64 = btoa(unescape(encodeURIComponent(`\ufeff${csv}`)));
    name = 'modello-diplomi.csv';
  } else {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Diplomi');
    base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
    name = 'modello-diplomi.xlsx';
  }
  const saved = await window.diplomi.saveFile(name, base64);
  if (saved) toast(`Modello salvato: ${saved.split(/[\\/]/).pop()}`);
}

function templateRows() {
  return [
    fieldHeaders(),
    state.fields.map((field, index) => field.sample || `Esempio ${index + 1}`),
    state.fields.map((_field, index) => `Esempio ${index + 1}`)
  ];
}

async function chooseFolder() {
  const folder = await window.diplomi.pickFolder();
  if (!folder) return;
  state.folder = folder;
  $('#folderName').textContent = folder;
  refreshGenerate();
}

function refreshGenerate() {
  $('#generate').disabled = !(state.image && state.rows.length && state.folder);
}

function drawText(context, text, field, scale) {
  context.save();
  const fontStyle = [field.italic ? 'italic' : '', field.bold ? 'bold' : ''].filter(Boolean).join(' ');
  const fontSize = field.size * scale;
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const lineHeight = fontSize * 1.2;
  const centerY = field.y / 100 * state.image.height;
  context.font = `${fontStyle ? `${fontStyle} ` : ''}${fontSize}px ${field.font}`;
  context.fillStyle = field.color;
  context.textBaseline = 'middle';
  context.textAlign = field.align;
  lines.forEach((line, index) => {
    const y = centerY + (index - (lines.length - 1) / 2) * lineHeight;
    context.fillText(line, field.x / 100 * state.image.width, y);
  });
  context.restore();
}

async function generate() {
  const button = $('#generate');
  button.disabled = true;
  button.textContent = 'GENERAZIONE…';
  const { format, compression } = state.outputConfig;
  const isJpg = format === 'jpg';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = state.image.width;
    canvas.height = state.image.height;
    const context = canvas.getContext('2d');
    const images = [];
    for (let index = 0; index < state.rows.length; index++) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (isJpg) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(state.image, 0, 0);
      state.fields.forEach((field, fieldIndex) => {
        if (field.enabled) drawText(context, state.rows[index][fieldIndex] || '', field, 1);
      });
      const dataUrl = isJpg
        ? canvas.toDataURL('image/jpeg', jpgLevel(compression).quality)
        : canvas.toDataURL('image/png');
      images.push({ name: buildFileName(state.rows[index], index), dataUrl });
    }
    const count = await window.diplomi.saveImages(state.folder, images, format);
    toast(`${count} immagini create nella cartella selezionata.`);
  } catch (error) {
    console.error(error);
    toast('Errore durante la generazione.');
  } finally {
    button.innerHTML = '<span>✦</span> GENERA IMMAGINI';
    refreshGenerate();
  }
}

function setZoom(delta) {
  state.zoom = Math.max(0.5, Math.min(1.5, state.zoom + delta));
  $('#stage').style.transform = `scale(${state.zoom})`;
  $('#zoomLabel').textContent = `${Math.round(state.zoom * 100)}%`;
}

$('#addField').onclick = addField;
$('#chooseTemplate').onclick = chooseTemplate;
$('#chooseData').onclick = chooseData;
$('#downloadCsv').onclick = () => downloadTemplate('csv');
$('#downloadXlsx').onclick = () => downloadTemplate('xlsx');
$('#chooseFolder').onclick = chooseFolder;
$('#generate').onclick = openNameModal;
$('#filePrefix').oninput = updateNamePreview;
$('#fileSuffix').oninput = updateNamePreview;
$('#fileSeparator').onchange = updateNamePreview;
$('#fileFormat').onchange = renderOutputOptions;
$('#jpgQuality').oninput = renderOutputOptions;
$('#closeNameModal').onclick = closeNameModal;
$('#cancelGenerate').onclick = closeNameModal;
$('#confirmGenerate').onclick = confirmNameModal;
$('#nameModal').addEventListener('click', (event) => {
  if (event.target.id === 'nameModal') closeNameModal();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNameModal();
});
$('#zoomIn').onclick = () => setZoom(0.1);
$('#zoomOut').onclick = () => setZoom(-0.1);

renderFields();
window.diplomi.getSystemFonts().then((systemFonts) => {
  if (!systemFonts.length) return;
  fonts = [...new Set([...fonts, ...systemFonts])].sort((first, second) => first.localeCompare(second));
  renderFields();
}).catch(() => {});
