const form = document.querySelector('#builder-form');
const photoInput = document.querySelector('#photo-input');
const choosePhoto = document.querySelector('#choose-photo');
const nameInput = document.querySelector('#name');
const dropzone = document.querySelector('#dropzone');
const fileName = document.querySelector('#file-name');
const canvas = document.querySelector('#builder-canvas');
const context = canvas.getContext('2d');
const formError = document.querySelector('#form-error');
const previewEmpty = document.querySelector('#preview-empty');
const actions = document.querySelector('#card-actions');
const shareNote = document.querySelector('#share-note');
let photo = null;
let cardReady = false;

const titleFor = role => {
  const value = role.toLowerCase();
  if (value.includes('design')) return 'THE DESIGN BUILDER';
  if (value.includes('ai') || value.includes('ml')) return 'THE AI BUILDER';
  if (value.includes('found')) return 'THE FOUNDING BUILDER';
  if (value.includes('web') || value.includes('frontend')) return 'THE WEB BUILDER';
  return 'THE GOA BUILDER';
};
const wrapTextCenter = (ctx, text, centerX, y, maxWidth, lineHeight) => {
  ctx.textAlign = 'center'; const words = text.split(/\s+/); let line = ''; const lines = [];
  words.forEach((word, index) => { const next = `${line}${line ? ' ' : ''}${word}`; if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next; if (index === words.length - 1) lines.push(line); });
  lines.forEach((ln, index) => ctx.fillText(ln, centerX, y + index * lineHeight));
  return (lines.length - 1) * lineHeight;
};
const fitText = (ctx, text, maxWidth, start, min) => {
  let size = start;
  while (size > min) { ctx.font = `800 ${size}px Arial, sans-serif`; if (ctx.measureText(text).width <= maxWidth) break; size -= 2; }
  return size;
};
function drawCard(name, role, title) {
  const W = canvas.width;   // 1080
  const H = canvas.height;  // 1350
  const M = 72;             // left/right margin
  const CW = W - M * 2;     // content width = 936
  const CX = W / 2;         // horizontal centre = 540

  // ── Background ──────────────────────────────────────────────────────────
  context.fillStyle = '#e5e2d7';
  context.fillRect(0, 0, W, H);

  // ── Top orange stripe ───────────────────────────────────────────────────
  context.fillStyle = '#f35f32';
  context.fillRect(0, 0, W, 18);

  // ── Header row: HH GOA 2026 (left)  ·  BUILDER ID / 2026 (right) ───────
  context.fillStyle = '#11120e';
  context.font = '800 30px Arial, sans-serif';
  context.textAlign = 'left';
  context.fillText('HH GOA 2026', M, 82);

  context.fillStyle = '#45483f';
  context.font = '600 17px Arial, sans-serif';
  context.textAlign = 'right';
  context.fillText('BUILDER ID / 2026', W - M, 80);

  // ── First horizontal divider ─────────────────────────────────────────────
  context.fillStyle = '#11120e';
  context.fillRect(M, 104, CW, 2);

  // ── #FRAMEINGOA label ────────────────────────────────────────────────────
  context.fillStyle = '#f35f32';
  context.font = '800 28px Arial, sans-serif';
  context.textAlign = 'right';
  context.fillText('#FRAMEINGOA', W - M, 152);

  context.fillStyle = '#11120e';
  context.font = '700 20px Arial, sans-serif';
  context.textAlign = 'left';
  context.fillText('HH GOA 2026 · BUILDER PASS', M, 152);

  // ── Second horizontal divider ────────────────────────────────────────────
  context.fillStyle = '#c9c8bc';
  context.fillRect(M, 172, CW, 2);

  // ── Photo block ───────────────────────────────────────────────────────────
  const photoAreaTop  = 192;
  const photoSize     = 460;   // 460px square — leaves ~560px below for text
  const framePad      = 10;
  const outerSize     = photoSize + framePad * 2;   // 480
  const outerX        = (W - outerSize) / 2;
  const outerY        = photoAreaTop;               // 192
  const photoX        = outerX + framePad;
  const photoY        = outerY + framePad;
  // photoAreaBottom = 192 + 480 = 672

  context.fillStyle = '#c9c8bc';
  context.fillRect(outerX, outerY, outerSize, outerSize);
  context.fillStyle = '#dedbd3';
  context.fillRect(photoX, photoY, photoSize, photoSize);
  const sc = Math.max(photoSize / photo.width, photoSize / photo.height);
  context.save();
  context.beginPath();
  context.rect(photoX, photoY, photoSize, photoSize);
  context.clip();
  context.drawImage(
    photo,
    photoX + (photoSize - photo.width  * sc) / 2,
    photoY + (photoSize - photo.height * sc) / 2,
    photo.width  * sc,
    photo.height * sc
  );
  context.restore();
  context.strokeStyle = '#b8b7ab';
  context.lineWidth = 1;
  context.strokeRect(photoX, photoY, photoSize, photoSize);

  const photoAreaBottom = outerY + outerSize;  // 672 — guaranteed bottom of photo frame

  // ── Identity block ────────────────────────────────────────────────────────
  // photoAreaBottom = 672  |  footerLineY = 1272  |  available = 600px
  // accent(5) + gap(55) = 60 → name at ~732
  // name(~85) + gap(64) → role at ~881
  // role(~36) + gap(64) → title at ~981
  // title(~36) + remaining(~219) → footer at 1272  ✓ no overlap possible

  // Orange accent bar — centered, just above name
  const accentW = 80;
  context.fillStyle = '#f35f32';
  context.fillRect(CX - accentW / 2, 760, accentW, 5);

  // ── NAME — baseline at y=800 ──────────────────────────────────────────────
  const uppercaseName = name.toUpperCase();
  const nameSize = fitText(context, uppercaseName, CW - 40, 74, 36);
  context.textAlign = 'center';
  context.fillStyle = '#11120e';
  context.font = `800 ${nameSize}px Arial, sans-serif`;
  context.fillText(uppercaseName, CX, 800);

  // ── ROLE — baseline at y=900 ──────────────────────────────────────────────
  context.fillStyle = '#45483f';
  context.font = '600 28px Arial, sans-serif';
  context.textAlign = 'center';
  const roleExtraH = wrapTextCenter(context, role.toUpperCase(), CX, 900, CW - 80, 38);

  // ── BUILDER TITLE — baseline at y=1010 (+ any role wrap overflow) ─────────
  const titleY = 1010 + roleExtraH;
  context.fillStyle = '#11120e';
  context.font = '800 30px Arial, sans-serif';
  context.textAlign = 'center';
  wrapTextCenter(context, title.toUpperCase(), CX, titleY, CW - 80, 38);

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerLineY = 1272;
  const footerTextY = 1314;

  context.textAlign = 'left';
  context.fillStyle = '#11120e';
  context.fillRect(M, footerLineY, CW, 2);

  context.fillStyle = '#45483f';
  context.font = '700 18px Arial, sans-serif';
  context.fillText('BUILD · SHIP · LAUNCH', M, footerTextY);

  context.textAlign = 'right';
  context.fillStyle = '#11120e';
  context.font = '800 20px Arial, sans-serif';
  context.fillText('#FrameInGoa', W - M, footerTextY);

  context.textAlign = 'left';
}
function readPhoto(file) {
  formError.textContent = ''; shareNote.textContent = '';
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { formError.textContent = 'Please choose an image smaller than 10MB.'; return; }
  if (!/image\/(jpeg|png|heic|heif)/.test(file.type) && !/\.(jpe?g|png|heic|heif)$/i.test(file.name)) { formError.textContent = 'Choose a JPG, PNG, HEIC or HEIF image.'; return; }
  const reader = new FileReader();
  reader.onload = () => { const image = new Image(); image.onload = () => { photo = image; fileName.textContent = file.name; }; image.onerror = () => { formError.textContent = 'This browser cannot read that HEIC/HEIF file. Please choose a JPG or PNG.'; }; image.src = reader.result; };
  reader.readAsDataURL(file);
}
function openPhotoPicker() { photoInput.click(); }
choosePhoto.addEventListener('click', openPhotoPicker);
dropzone.addEventListener('click', event => { if (!event.target.closest('button')) openPhotoPicker(); });
const sanitizeName = value => value.replace(/[^A-Za-z\s'-]/g, '').replace(/\s{2,}/g, ' ');
nameInput.addEventListener('beforeinput', event => {
  if (event.data && sanitizeName(event.data) !== event.data) event.preventDefault();
});
nameInput.addEventListener('paste', event => {
  event.preventDefault();
  const text = sanitizeName(event.clipboardData.getData('text'));
  const start = nameInput.selectionStart;
  const end = nameInput.selectionEnd;
  nameInput.setRangeText(text, start, end, 'end');
  nameInput.dispatchEvent(new Event('input', { bubbles: true }));
});
nameInput.addEventListener('input', () => {
  const cleanName = sanitizeName(nameInput.value);
  if (nameInput.value !== cleanName) nameInput.value = cleanName;
});
photoInput.addEventListener('change', event => readPhoto(event.target.files[0]));
['dragenter','dragover'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.add('dragover'); }));
['dragleave','drop'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.remove('dragover'); }));
dropzone.addEventListener('drop', event => readPhoto(event.dataTransfer.files[0]));
form.addEventListener('submit', event => { event.preventDefault(); const name = form.elements.name.value.trim(), role = form.elements.role.value.trim(); const title = form.elements.title.value.trim() || titleFor(role); if (!photo || !name || !role) { formError.textContent = 'Add a photo, name and role before generating your card.'; return; } if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(name)) { formError.textContent = 'Enter a valid name using letters only. Numbers are not allowed.'; form.elements.name.focus(); return; } form.elements.name.value = name.replace(/\s+/g, ' '); form.elements.title.value = title; drawCard(form.elements.name.value, role, title); previewEmpty.hidden = true; actions.hidden = false; cardReady = true; shareNote.textContent = 'Card ready — scroll down to Share to X or download.'; actions.scrollIntoView({ behavior:'smooth', block:'nearest' }); });
const FRAME_IN_GOA = '#FrameInGoa';
const xShareCaption = () => `Here's a look at my HH Goa 2026 Builder ID!\n\n${FRAME_IN_GOA}`;
function exportCard() { return new Promise(resolve => canvas.toBlob(resolve, 'image/png')); }
async function cardFile() { const blob = await exportCard(); return { blob, file: new File([blob], 'hh-goa-2026-builder-id.png', { type: 'image/png' }) }; }
function downloadBlob(blob, name) { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = name; link.click(); URL.revokeObjectURL(link.href); }
document.querySelector('#download').addEventListener('click', async () => { const { blob } = await cardFile(); downloadBlob(blob, 'hh-goa-2026-builder-id.png'); });
document.querySelector('#share').addEventListener('click', async () => { if (!cardReady) return; const caption = `Building, shipping, and creating at HH Goa 2026.\n\n${FRAME_IN_GOA}`; const { blob, file } = await cardFile(); if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ title: 'My HH Goa 2026 Builder ID', text: caption, files: [file] }); return; } catch (error) { if (error.name === 'AbortError') return; } } downloadBlob(blob, file.name); window.open(`https://x.com/intent/post?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer'); shareNote.textContent = 'Your card was downloaded. Add it to the X post that just opened.'; });
document.querySelector('#share-x').addEventListener('click', () => {
  if (!cardReady) return;
  const caption = xShareCaption();
  window.open(`https://x.com/intent/post?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer');
});
document.querySelector('#reset').addEventListener('click', () => { form.reset(); photo = null; cardReady = false; context.clearRect(0,0,canvas.width,canvas.height); previewEmpty.hidden = false; actions.hidden = true; fileName.textContent = ''; formError.textContent = ''; shareNote.textContent = ''; document.querySelector('#create').scrollIntoView({ behavior:'smooth', block:'start' }); });
