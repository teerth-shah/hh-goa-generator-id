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
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(/\s+/); let line = ''; let offset = 0;
  words.forEach((word, index) => { const next = `${line}${line ? ' ' : ''}${word}`; if (ctx.measureText(next).width > maxWidth && line) { ctx.fillText(line, x, y + offset); offset += lineHeight; line = word; } else line = next; if (index === words.length - 1) ctx.fillText(line, x, y + offset); });
  return offset;
};
const fitText = (ctx, text, maxWidth, start, min) => {
  let size = start;
  while (size > min) { ctx.font = `800 ${size}px Arial, sans-serif`; if (ctx.measureText(text).width <= maxWidth) break; size -= 2; }
  return size;
};
function drawCard(name, role, title) {
  const W = canvas.width, H = canvas.height;
  context.fillStyle = '#e5e2d7'; context.fillRect(0, 0, W, H);
  context.fillStyle = '#f35f32'; context.fillRect(0, 0, W, 19);
  context.fillStyle = '#11120e'; context.font = '800 28px Arial, sans-serif'; context.fillText('HH GOA 2026', 78, 84);
  context.textAlign = 'right'; context.font = '700 18px Arial, sans-serif'; context.fillStyle = '#45483f'; context.fillText('BUILDER ID / 2026', 1002, 82); context.textAlign = 'left';
  context.fillStyle = '#11120e'; context.fillRect(78, 118, 924, 2);
  const photoSize = 610, photoX = (W - photoSize) / 2, photoY = 166;
  context.fillStyle = '#c9c8bc'; context.fillRect(photoX - 12, photoY - 12, photoSize + 24, photoSize + 24);
  context.fillStyle = '#dedbd3'; context.fillRect(photoX, photoY, photoSize, photoSize);
  const photoW = photoSize, photoH = photoSize;
  const scale = Math.max(photoW / photo.width, photoH / photo.height); const width = photo.width * scale, height = photo.height * scale;
  context.drawImage(photo, photoX + (photoW - width) / 2, photoY + (photoH - height) / 2, width, height);
  context.fillStyle = '#f35f32'; context.fillRect(78, 842, 108, 8);
  const uppercaseName = name.toUpperCase(); const nameSize = fitText(context, uppercaseName, 924, 76, 40);
  context.fillStyle = '#11120e'; context.font = `800 ${nameSize}px Arial, sans-serif`; context.fillText(uppercaseName, 78, 936);
  context.fillStyle = '#45483f'; context.font = '700 25px Arial, sans-serif'; wrapText(context, role.toUpperCase(), 78, 990, 900, 34);
  context.fillStyle = '#11120e'; context.font = '800 27px Arial, sans-serif'; wrapText(context, title.toUpperCase(), 78, 1092, 900, 34);
  context.fillStyle = '#11120e'; context.fillRect(78, 1198, 924, 2);
  context.fillStyle = '#45483f'; context.font = '700 18px Arial, sans-serif'; context.fillText('BUILD · SHIP · LAUNCH', 78, 1240);
  context.textAlign = 'right'; context.fillStyle = '#11120e'; context.font = '800 20px Arial, sans-serif'; context.fillText('#FrameInGoa', 1002, 1240); context.textAlign = 'left';
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
form.addEventListener('submit', event => { event.preventDefault(); const name = form.elements.name.value.trim(), role = form.elements.role.value.trim(); const title = form.elements.title.value.trim() || titleFor(role); if (!photo || !name || !role) { formError.textContent = 'Add a photo, name and role before generating your card.'; return; } if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(name)) { formError.textContent = 'Enter a valid name using letters only. Numbers are not allowed.'; form.elements.name.focus(); return; } form.elements.name.value = name.replace(/\s+/g, ' '); form.elements.title.value = title; drawCard(form.elements.name.value, role, title); previewEmpty.hidden = true; actions.hidden = false; cardReady = true; shareNote.textContent = 'Card ready to download or share.'; });
function exportCard() { return new Promise(resolve => canvas.toBlob(resolve, 'image/png')); }
document.querySelector('#download').addEventListener('click', async () => { const blob = await exportCard(); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'hh-goa-2026-builder-id.png'; link.click(); URL.revokeObjectURL(link.href); });
document.querySelector('#share').addEventListener('click', async () => { if (!cardReady) return; const caption = 'Building, shipping, and creating at HH Goa 2026.\n\n#FrameInGoa'; const blob = await exportCard(); const file = new File([blob], 'hh-goa-2026-builder-id.png', { type:'image/png' }); if (navigator.canShare && navigator.canShare({ files:[file] })) { try { await navigator.share({ title:'My HH Goa 2026 Builder ID', text:caption, files:[file] }); return; } catch (error) { if (error.name === 'AbortError') return; } } const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = file.name; link.click(); URL.revokeObjectURL(link.href); window.open(`https://x.com/intent/post?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer'); shareNote.textContent = 'Your card was downloaded. Add it to the X post that just opened.'; });
document.querySelector('#reset').addEventListener('click', () => { form.reset(); photo = null; cardReady = false; context.clearRect(0,0,canvas.width,canvas.height); previewEmpty.hidden = false; actions.hidden = true; fileName.textContent = ''; formError.textContent = ''; shareNote.textContent = ''; document.querySelector('#create').scrollIntoView({ behavior:'smooth', block:'start' }); });
