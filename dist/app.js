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
  const W = canvas.width, H = canvas.height, M = 78, CW = W - M * 2, CX = W / 2;
  context.fillStyle = '#e5e2d7'; context.fillRect(0, 0, W, H);
  context.fillStyle = '#f35f32'; context.fillRect(0, 0, W, 19);
  context.fillStyle = '#11120e'; context.font = '800 28px Arial, sans-serif'; context.textAlign = 'left'; context.fillText('HH GOA 2026', M, 88);
  context.textAlign = 'right'; context.font = '700 18px Arial, sans-serif'; context.fillStyle = '#45483f'; context.fillText('BUILDER ID / 2026', W - M, 86); context.textAlign = 'left';
  context.fillStyle = '#11120e'; context.fillRect(M, 124, CW, 2);
  const framePad = 10, photoSize = 520, outerSize = photoSize + framePad * 2;
  const outerX = (W - outerSize) / 2, outerY = 148, photoX = outerX + framePad, photoY = outerY + framePad;
  context.fillStyle = '#c9c8bc'; context.fillRect(outerX, outerY, outerSize, outerSize);
  context.fillStyle = '#dedbd3'; context.fillRect(photoX, photoY, photoSize, photoSize);
  const scale = Math.max(photoSize / photo.width, photoSize / photo.height);
  context.drawImage(photo, photoX + (photoSize - photo.width * scale) / 2, photoY + (photoSize - photo.height * scale) / 2, photo.width * scale, photo.height * scale);
  context.strokeStyle = '#b8b7ab'; context.lineWidth = 1; context.strokeRect(photoX, photoY, photoSize, photoSize);
  const identityStart = outerY + outerSize + 76;
  const accentW = 88;
  context.fillStyle = '#f35f32'; context.fillRect(CX - accentW / 2, identityStart, accentW, 5);
  const nameY = identityStart + 50;
  const uppercaseName = name.toUpperCase(), nameSize = fitText(context, uppercaseName, CW - 48, 68, 36);
  context.textAlign = 'center'; context.fillStyle = '#11120e'; context.font = `800 ${nameSize}px Arial, sans-serif`; context.fillText(uppercaseName, CX, nameY);
  const roleY = nameY + 44;
  context.fillStyle = '#45483f'; context.font = '700 24px Arial, sans-serif';
  const roleOffset = wrapTextCenter(context, role.toUpperCase(), CX, roleY, CW - 80, 32);
  const titleY = roleY + roleOffset + 38;
  context.fillStyle = '#11120e'; context.font = '800 26px Arial, sans-serif'; wrapTextCenter(context, title.toUpperCase(), CX, titleY, CW - 80, 32);
  context.textAlign = 'left'; context.fillStyle = '#11120e'; context.fillRect(M, 1194, CW, 2);
  context.fillStyle = '#45483f'; context.font = '700 18px Arial, sans-serif'; context.fillText('BUILD · SHIP · LAUNCH', M, 1236);
  context.textAlign = 'right'; context.fillStyle = '#11120e'; context.font = '800 20px Arial, sans-serif'; context.fillText('#FrameInGoa', W - M, 1236); context.textAlign = 'left';
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
document.querySelector('#share-x').addEventListener('click', async () => { if (!cardReady) return; const caption = xShareCaption(); const { blob, file } = await cardFile(); if (navigator.canShare && navigator.canShare({ files: [file], text: caption })) { try { await navigator.share({ title: 'My HH Goa 2026 Builder ID', text: caption, files: [file] }); shareNote.textContent = `${FRAME_IN_GOA} is included in your post.`; return; } catch (error) { if (error.name === 'AbortError') return; } } let copied = false; if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') { try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); copied = true; } catch { /* clipboard unavailable */ } } downloadBlob(blob, file.name); window.open(`https://x.com/intent/post?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer'); shareNote.textContent = copied ? `Image copied to clipboard. Paste it into X — ${FRAME_IN_GOA} is in the caption.` : `Your card was downloaded. Attach the PNG to X — ${FRAME_IN_GOA} is in the caption.`; });
document.querySelector('#reset').addEventListener('click', () => { form.reset(); photo = null; cardReady = false; context.clearRect(0,0,canvas.width,canvas.height); previewEmpty.hidden = false; actions.hidden = true; fileName.textContent = ''; formError.textContent = ''; shareNote.textContent = ''; document.querySelector('#create').scrollIntoView({ behavior:'smooth', block:'start' }); });
