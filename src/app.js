/* ================================================================
   NutriFlow — modals, plan builder, command palette, events, boot
   ================================================================ */
let OV = null; // current overlay kind
function sheet(title, body, foot, cls, sub){
  OV = OV || 'sheet';
  $('#ov').innerHTML = '<div class="scrim" data-scrim="1"><div class="sheet ' + (cls || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
    '<div class="sheet-h"><div style="min-width:0;flex:1"><h3>' + esc(title) + '</h3>' + (sub ? '<div class="faint" style="font-size:12.5px;margin-top:2px">' + sub + '</div>' : '') + '</div><button class="btn ghost icon" data-act="close" aria-label="Κλείσιμο">' + ic('x') + '</button></div>' +
    '<div class="sheet-b">' + body + '</div>' + (foot ? '<div class="sheet-f">' + foot + '</div>' : '') + '</div></div>';
  const f = $('#ov [autofocus]') || $('#ov .sheet-b input:not([type=hidden]), #ov .sheet-b select');
  if(f && !('ontouchstart' in window)) setTimeout(() => f.focus(), 30);
}
function closeOv(){ $('#ov').innerHTML = ''; OV = null; S.draft = null; }
function clientSelect(sel, name, allowEmpty){
  const list = S.clients.slice().sort((a, b) => (a.status === 'inactive') - (b.status === 'inactive') || a.name.localeCompare(b.name, 'el'));
  return '<select class="in" name="' + (name || 'clientId') + '"><option value="">' + (allowEmpty ? '— Χωρίς πελάτη (πρότυπο) —' : '— Επιλέξτε πελάτη —') + '</option>' +
    list.map(c => '<option value="' + c.id + '"' + (sel === c.id ? ' selected' : '') + '>' + esc(c.name) + (c.status === 'inactive' ? ' (ανενεργός)' : '') + '</option>').join('') + '</select>';
}
const fl = (label, inner, cls, hint) => '<label class="f ' + (cls || '') + '"><span>' + esc(label) + '</span>' + inner + (hint ? '<em>' + hint + '</em>' : '') + '</label>';
function form(){ const o = {}; $$('#ov [name]').forEach(el => { o[el.name] = el.type === 'checkbox' ? el.checked : String(el.value).trim(); }); return o; }
const numOr = (v, d) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : d; };
function need(ok, msg){ if(!ok){ toast(msg, 'alert'); } return ok; }

/* ---------------- client ---------------- */
function mClient(c){
  c = c || {};
  const isNew = !c.id;
  const body = '<div class="fields">' +
    '<div class="sect">Στοιχεία</div>' +
    fl('Ονοματεπώνυμο', '<input class="in" type="text" name="name" value="' + esc(c.name || '') + '" placeholder="π.χ. Ελένη Παπαδοπούλου" autofocus>', 'full') +
    fl('Κινητό', '<input class="in" type="tel" name="phone" value="' + esc(c.phone || '') + '" placeholder="69x xxx xxxx">') +
    fl('Email', '<input class="in" type="email" name="email" value="' + esc(c.email || '') + '">') +
    fl('Ημερομηνία γέννησης', '<input class="in" type="date" name="birthdate" value="' + esc(c.birthdate || '') + '">') +
    fl('Φύλο', '<select class="in" name="sex"><option value="Γ"' + (c.sex !== 'Α' ? ' selected' : '') + '>Γυναίκα</option><option value="Α"' + (c.sex === 'Α' ? ' selected' : '') + '>Άνδρας</option></select>') +
    '<div class="sect">Σωματομετρικά & στόχος</div>' +
    fl('Ύψος (cm)', '<input class="in" type="number" step="0.5" name="height" value="' + esc(c.height || '') + '">') +
    (isNew ? fl('Αρχικό βάρος (kg)', '<input class="in" type="number" step="0.1" name="w0" placeholder="προαιρετικό">', '', 'δημιουργεί την πρώτη μέτρηση') : fl('Βάρος-στόχος (kg)', '<input class="in" type="number" step="0.1" name="targetWeight" value="' + esc(c.targetWeight || '') + '">')) +
    (isNew ? fl('Βάρος-στόχος (kg)', '<input class="in" type="number" step="0.1" name="targetWeight" value="">') : '') +
    fl('Στόχος', '<select class="in" name="goal">' + GOALS.map(g => '<option' + (c.goal === g ? ' selected' : '') + '>' + g + '</option>').join('') + '</select>') +
    fl('Δραστηριότητα', '<select class="in" name="activity">' + ACT.map(a => '<option value="' + a.v + '"' + (String(c.activity || 1.375) === String(a.v) ? ' selected' : '') + '>' + a.l + '</option>').join('') + '</select>', isNew ? '' : 'full') +
    '<div class="sect">Παρακολούθηση</div>' +
    fl('Έναρξη', '<input class="in" type="date" name="startDate" value="' + esc(c.startDate || today()) + '">') +
    fl('Κατάσταση', '<select class="in" name="status"><option value="active">Ενεργός</option><option value="inactive"' + (c.status === 'inactive' ? ' selected' : '') + '>Ανενεργός</option></select>') +
    fl('Ετικέτες', '<input class="in" type="text" name="tags" value="' + esc((c.tags || []).join(', ')) + '" placeholder="π.χ. Λακτόζη, Hashimoto, Vegetarian">', 'full', 'χωρίστε με κόμμα — εμφανίζονται στην καρτέλα') +
    fl('Ιστορικό & σημειώσεις', '<textarea class="in" name="notes" placeholder="Ιατρικό ιστορικό, φαρμακευτική αγωγή, διατροφικές συνήθειες, προτιμήσεις…">' + esc(c.notes || '') + '</textarea>', 'full') +
  '</div>';
  sheet(isNew ? 'Νέος πελάτης' : 'Επεξεργασία πελάτη', body,
    (!isNew ? '<button class="btn danger" data-act="del-client" data-id="' + c.id + '" data-step="0">' + ic('trash') + 'Διαγραφή</button>' : '') +
    '<span class="spacer"></span><button class="btn" data-act="close">Άκυρο</button><button class="btn pri" data-act="save-client" data-id="' + (c.id || '') + '">' + (isNew ? 'Δημιουργία' : 'Αποθήκευση') + '</button>', 'md');
}
function saveClient(id){
  const f = form();
  if(!need(f.name, 'Συμπληρώστε ονοματεπώνυμο.')) return;
  const prev = id ? client(id) || {} : {};
  const cid = id || uid();
  const data = {name:f.name, phone:f.phone, email:f.email, birthdate:f.birthdate, sex:f.sex, height:numOr(f.height, null),
    targetWeight:numOr(f.targetWeight, null), goal:f.goal, activity:numOr(f.activity, 1.375), startDate:f.startDate || today(),
    status:f.status, tags:f.tags ? f.tags.split(',').map(s => s.trim()).filter(Boolean) : [], notes:f.notes, demo:!!prev.demo};
  put('clients', cid, data);
  if(!id && numOr(f.w0, 0) > 0) put('measurements', uid(), {clientId:cid, date:data.startDate, weight:numOr(f.w0, 0), notes:'Αρχική αξιολόγηση', demo:false});
  closeOv();
  toast(id ? 'Η καρτέλα ενημερώθηκε' : 'Ο πελάτης δημιουργήθηκε');
  if(!id){ S.view = 'client'; S.cid = cid; S.ctab = 'overview'; render(); window.scrollTo(0, 0); }
}
async function deleteClient(id){
  const col = ['measurements','appointments','packages','payments','plans'];
  closeOv(); S.view = 'clients'; S.cid = null;
  const rel = []; col.forEach(k => S[k].filter(x => x.clientId === id).forEach(x => rel.push([k, x.id])));
  await del('clients', id);
  for(const r of rel){ await del(r[0], r[1]); }
  toast('Ο πελάτης διαγράφηκε');
}

/* ---------------- measurement ---------------- */
function mMeas(cid){
  const body = '<div class="fields three">' +
    fl('Πελάτης', clientSelect(cid), 'full') +
    fl('Ημερομηνία', '<input class="in" type="date" name="date" value="' + today() + '">') +
    fl('Βάρος (kg) *', '<input class="in" type="number" step="0.1" name="weight" placeholder="72,4" autofocus>') +
    fl('Λίπος (%)', '<input class="in" type="number" step="0.1" name="bodyFat">') +
    fl('Μυϊκή μάζα (kg)', '<input class="in" type="number" step="0.1" name="muscle">') +
    fl('Νερό (%)', '<input class="in" type="number" step="0.1" name="water">') +
    fl('Σπλαχνικό λίπος', '<input class="in" type="number" step="1" name="visceral" placeholder="1–59">') +
    fl('Περίμετρος μέσης (cm)', '<input class="in" type="number" step="0.5" name="waist">') +
    fl('Περίμετρος ισχίων (cm)', '<input class="in" type="number" step="0.5" name="hip">') +
    fl('Σημείωση', '<input class="in" type="text" name="notes" placeholder="π.χ. νηστική, πρωί">') +
  '</div><div class="preview" id="mprev"></div>';
  OV = 'meas';
  sheet('Νέα μέτρηση', body, '<span class="spacer"></span><button class="btn" data-act="close">Άκυρο</button><button class="btn pri" data-act="save-meas">Καταχώριση</button>', 'md', 'Σύσταση σώματος — Tanita / InBody');
  measPreview();
}
function measPreview(){
  const el = $('#mprev'); if(!el) return;
  const f = form(), c = client(f.clientId), w = numOr(f.weight, null);
  const lm = c ? lastM(c.id) : null;
  const b = c ? bmi(w, c.height) : null, bc = bmiCat(b);
  const d = lm && w ? w - lm.weight : null;
  const whr = numOr(f.waist, 0) && numOr(f.hip, 0) ? numOr(f.waist, 0) / numOr(f.hip, 1) : null;
  el.innerHTML = '<div><span>ΔΜΣ</span><b>' + (b ? N1.format(b) : '—') + '</b> <span style="display:inline;color:' + (COLORS[bc[1]] || 'inherit') + ';font-size:12px;text-transform:none;letter-spacing:0">' + (b ? bc[0] : '') + '</span></div>' +
    '<div><span>Από προηγούμενη</span><b style="color:' + (d == null ? 'inherit' : goodDir(c || {}, d) ? 'var(--mint)' : 'var(--amber)') + '">' + (d == null ? '—' : (d > 0 ? '+' : '') + N1.format(d) + ' kg') + '</b></div>' +
    '<div><span>Προηγούμενη</span><b>' + (lm ? N1.format(lm.weight) + ' kg' : '—') + '</b> <span style="display:inline;font-size:11.5px;text-transform:none;letter-spacing:0">' + (lm ? fmtS(lm.date) : '') + '</span></div>' +
    '<div><span>WHR</span><b>' + (whr ? whr.toFixed(2) : '—') + '</b></div>';
}
function saveMeas(){
  const f = form();
  if(!need(f.clientId, 'Επιλέξτε πελάτη.') || !need(numOr(f.weight, 0) > 0, 'Συμπληρώστε βάρος.')) return;
  const n = k => numOr(f[k], null);
  put('measurements', uid(), {clientId:f.clientId, date:f.date || today(), weight:n('weight'), bodyFat:n('bodyFat'), muscle:n('muscle'), water:n('water'), visceral:n('visceral'), waist:n('waist'), hip:n('hip'), notes:f.notes, demo:false});
  closeOv(); toast('Η μέτρηση καταχωρίστηκε', 'scale');
}

/* ---------------- appointment ---------------- */
function mAppt(o){
  o = o || {};
  const a = o.id ? S.appointments.find(x => x.id === o.id) : null;
  const cid = a ? a.clientId : (o.cid || '');
  const type = a ? a.type : 'Επανέλεγχος';
  const body = '<div class="fields">' +
    fl('Πελάτης', clientSelect(cid), 'full') +
    fl('Ημερομηνία', '<input class="in" type="date" name="date" value="' + esc(a ? a.date : (o.date || today())) + '">') +
    fl('Ώρα', '<input class="in" type="time" name="time" step="900" value="' + esc(a ? a.time : (o.time || nextFreeTime(o.date || today()))) + '">') +
    fl('Τύπος', '<select class="in" name="type">' + TYPES.map(t => '<option' + (t === type ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>') +
    fl('Διάρκεια (λεπτά)', '<input class="in" type="number" step="5" name="duration" value="' + (a ? a.duration : TYPE_DUR[type]) + '">') +
    '<div class="full" id="abill"></div>' +
    fl('Σημείωση', '<input class="in" type="text" name="notes" value="' + esc(a ? a.notes || '' : '') + '" placeholder="π.χ. φέρνει εξετάσεις αίματος">', 'full') +
  '</div><div id="aconf"></div>';
  OV = 'appt';
  sheet(a ? 'Αλλαγή ραντεβού' : 'Νέο ραντεβού', body, '<span class="spacer"></span><button class="btn" data-act="close">Άκυρο</button><button class="btn pri" data-act="save-appt" data-id="' + (a ? a.id : '') + '">' + (a ? 'Αποθήκευση' : 'Κλείσιμο ραντεβού') + '</button>', 'md');
  S._apptEdit = a;
  apptBilling();
}
function nextFreeTime(d){
  const slots = ['09:00','09:45','10:30','11:15','12:00','12:45','13:30','17:00','17:45','18:30','19:15','20:00'];
  const taken = new Set(S.appointments.filter(a => a.date === d && a.status !== 'cancelled').map(a => a.time));
  const now = d === today() ? tstr(nowMin()) : '00:00';
  return slots.find(s => !taken.has(s) && s > now) || '10:00';
}
function apptBilling(){
  const el = $('#abill'); if(!el) return;
  const f = form(), c = client(f.clientId), a = S._apptEdit;
  const ap = c ? activePkg(c.id) : null;
  const first = c && !appts(c.id).some(x => x.status === 'done' && (!a || x.id !== a.id));
  const fee = a && a.fee ? a.fee : first ? cfg().firstVisitPrice : cfg().sessionPrice;
  const usePkg = a ? !!a.packageId : !!ap;
  el.innerHTML = c ? (ap ? '<label class="row" style="gap:10px;padding:11px 13px;border-radius:10px;border:1px solid var(--line-2);background:rgba(255,255,255,.02);cursor:pointer"><input type="checkbox" name="usePkg"' + (usePkg ? ' checked' : '') + ' style="accent-color:#5CF0B0;width:16px;height:16px">' +
      '<span style="flex:1"><b style="font-weight:600">Χρέωση στο πακέτο</b><div class="faint" style="font-size:12px">' + esc(ap.name) + ' · ' + pkgUsed(ap) + '/' + ap.sessions + ' χρησιμοποιημένες' + (IX.booked[ap.id] ? ' · ' + IX.booked[ap.id] + ' κλεισμένες' : '') + '</div></span>' +
      '<span class="row" style="gap:6px"><span class="faint" style="font-size:12px">ή</span><input class="in" type="number" name="fee" value="' + fee + '" style="width:84px;height:32px" aria-label="Χρέωση συνεδρίας"><span class="faint">€</span></span></label>'
    : fl('Χρέωση συνεδρίας (€)', '<input class="in" type="number" name="fee" value="' + fee + '">', '', first ? 'πρώτη επίσκεψη' : 'ο πελάτης δεν έχει ενεργό πακέτο')) : '';
  apptConflict();
}
function apptConflict(){
  const el = $('#aconf'); if(!el) return;
  const f = form(), a = S._apptEdit;
  if(!f.date || !f.time){ el.innerHTML = ''; return; }
  const s = tmin(f.time), e = s + numOr(f.duration, 45);
  const hit = S.appointments.filter(x => x.date === f.date && x.status !== 'cancelled' && (!a || x.id !== a.id)).find(x => { const xs = tmin(x.time), xe = xs + (x.duration || 45); return s < xe && e > xs; });
  el.innerHTML = hit ? '<div class="banner" style="margin:0">' + ic('alert') + '<span>Επικαλύπτεται με ' + esc((client(hit.clientId) || {}).name || 'άλλο ραντεβού') + ' στις ' + esc(hit.time) + '.</span></div>' : '';
}
function saveAppt(id){
  const f = form();
  if(!need(f.clientId, 'Επιλέξτε πελάτη.') || !need(f.date && f.time, 'Συμπληρώστε ημερομηνία και ώρα.')) return;
  const c = client(f.clientId), ap = activePkg(c.id);
  const prev = id ? S.appointments.find(x => x.id === id) : null;
  let packageId = null, fee = numOr(f.fee, cfg().sessionPrice);
  if(f.usePkg && (prev && prev.packageId ? true : ap)){ packageId = prev && prev.packageId ? prev.packageId : ap.id; fee = null; }
  const data = {clientId:f.clientId, date:f.date, time:f.time, type:f.type, duration:numOr(f.duration, 45), notes:f.notes, packageId, fee,
    status:prev ? prev.status : (f.date < today() ? 'done' : 'scheduled'), demo:prev ? !!prev.demo : false};
  put('appointments', id || uid(), data);
  closeOv(); toast(id ? 'Το ραντεβού άλλαξε' : 'Κλείστηκε ραντεβού · ' + fmtS(f.date) + ' ' + f.time, 'cal');
}
function mApptDetail(id){
  const a = S.appointments.find(x => x.id === id); if(!a) return;
  const c = client(a.clientId) || {name:'—'}, st = STATUS[a.status] || STATUS.scheduled;
  const pk = a.packageId ? S.packages.find(p => p.id === a.packageId) : null;
  const tc = TYPE_C[a.type] || 'mint';
  const lm = lastM(a.clientId);
  const body = '<div class="row" style="gap:14px">' + av(c.name, 'lg') + '<div style="flex:1;min-width:0"><div style="font-size:19px;font-weight:700;letter-spacing:-.02em">' + esc(c.name) + '</div>' +
      '<div class="row wrap" style="gap:6px;margin-top:6px">' + chip(a.type, tc) + chip(st.l, st.c, true) + (c.goal ? chip(c.goal) : '') + '</div></div></div>' +
    '<div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">' +
      box('Ημερομηνία', fmtL(a.date).replace(/ \d{4}$/, '')) + box('Ώρα', a.time + ' – ' + tstr(tmin(a.time) + (a.duration || 45))) +
      box('Χρέωση', pk ? esc(shortPkg(pk)) + ' ' + (pkgUsed(pk) + (a.status === 'scheduled' ? 1 : 0)) + '/' + pk.sessions : a.fee ? EUR.format(a.fee) : '—') + '</div>' +
    (lm ? '<div class="row faint" style="font-size:12.5px;gap:14px">' + ic('scale', 'width="15" height="15"') + '<span>Τελευταία μέτρηση ' + fmtS(lm.date) + ': <b class="muted">' + N1.format(lm.weight) + ' kg</b>' + (lm.bodyFat ? ' · λίπος ' + N1.format(lm.bodyFat) + '%' : '') + '</span></div>' : '') +
    (a.notes ? '<div class="muted" style="font-size:13px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--line)">' + esc(a.notes) + '</div>' : '') +
    (S.canWrite ? '<div><div class="eyebrow" style="margin-bottom:8px">Κατάσταση</div><div class="row wrap" style="gap:8px">' +
      [['done','Ολοκληρώθηκε','check','mint'], ['noshow','Δεν προσήλθε','x','rose'], ['cancelled','Ακυρώθηκε','x',''], ['scheduled','Προγραμματισμένο','clock','sky']].filter(s => s[0] !== a.status)
        .map(s => '<button class="btn sm" data-act="status" data-id="' + a.id + '" data-s="' + s[0] + '" data-keep="1" style="' + (s[3] ? 'color:var(--' + s[3] + ')' : '') + '">' + ic(s[2]) + s[1] + '</button>').join('') + '</div></div>' : '');
  OV = 'apptd';
  sheet('Ραντεβού', body, (S.canWrite ? '<button class="btn danger" data-act="del-appt" data-id="' + a.id + '" data-step="0">' + ic('trash') + 'Διαγραφή</button><button class="btn" data-act="edit-appt" data-id="' + a.id + '">' + ic('edit') + 'Αλλαγή</button>' : '') +
    '<span class="spacer"></span>' + (S.canWrite && a.status === 'done' ? '<button class="btn" data-act="new-meas" data-cid="' + a.clientId + '">' + ic('scale') + 'Μέτρηση</button>' : '') +
    '<button class="btn pri" data-act="open" data-id="' + a.clientId + '">Καρτέλα πελάτη' + ic('arrow') + '</button>');
}
function box(l, v){ return '<div style="padding:11px 12px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.02)"><div class="eyebrow" style="font-size:9.5px">' + esc(l) + '</div><div style="font-weight:600;margin-top:3px;font-size:13.5px">' + v + '</div></div>'; }
function setStatus(id, s){
  const a = S.appointments.find(x => x.id === id); if(!a) return;
  const part = {status:s};
  if(s === 'done' || s === 'noshow'){
    let pk = a.packageId ? S.packages.find(p => p.id === a.packageId) : null;
    if(pk && pkgUsed(pk) >= pk.sessions && a.status !== 'done' && a.status !== 'noshow') pk = null;
    if(!pk && !a.fee){ const ap = activePkg(a.clientId); if(ap) pk = ap; }
    if(pk){ part.packageId = pk.id; part.fee = null; }
    else { part.packageId = null; part.fee = a.fee || cfg().sessionPrice; }
  }
  patch('appointments', id, part);
  toast(STATUS[s].l + ' · ' + ((client(a.clientId) || {}).name || ''), s === 'done' ? 'check' : s === 'noshow' ? 'x' : 'clock');
}

/* ---------------- package ---------------- */
function mPkg(cid){
  const pr = cfg().presets;
  const p0 = pr[0] || {name:'Πακέτο', sessions:4, price:160};
  const body = '<div class="fields">' +
    fl('Πελάτης', clientSelect(cid), 'full') +
    fl('Πακέτο', '<select class="in" name="preset">' + pr.map((p, i) => '<option value="' + i + '">' + esc(p.name) + ' — ' + EUR.format(p.price) + '</option>').join('') + '<option value="-1">Προσαρμοσμένο…</option></select>', 'full') +
    fl('Όνομα', '<input class="in" type="text" name="name" value="' + esc(p0.name) + '">', 'full') +
    fl('Συνεδρίες', '<input class="in" type="number" name="sessions" value="' + p0.sessions + '">') +
    fl('Τιμή (€)', '<input class="in" type="number" name="price" value="' + p0.price + '">') +
    fl('Ημερομηνία έναρξης', '<input class="in" type="date" name="startDate" value="' + today() + '">') +
    fl('Ήδη χρησιμοποιημένες', '<input class="in" type="number" name="usedOffset" value="0" min="0">', '', 'για μεταφορά από άλλο σύστημα') +
    '<div class="sect">Πληρωμή</div>' +
    '<label class="row full" style="gap:10px;cursor:pointer"><input type="checkbox" name="payNow" checked style="accent-color:#5CF0B0;width:16px;height:16px"><span>Καταχώριση πληρωμής τώρα</span></label>' +
    fl('Ποσό (€)', '<input class="in" type="number" name="amount" value="' + p0.price + '">') +
    fl('Τρόπος', '<select class="in" name="method">' + METHODS.map(m => '<option>' + m + '</option>').join('') + '</select>') +
  '</div>';
  OV = 'pkg';
  sheet('Νέο πακέτο', body, '<span class="spacer"></span><button class="btn" data-act="close">Άκυρο</button><button class="btn pri" data-act="save-pkg">Δημιουργία πακέτου</button>', 'md', 'Οι κλεισμένες συνεδρίες χωρίς πακέτο συνδέονται αυτόματα');
}
function savePkg(){
  const f = form();
  if(!need(f.clientId, 'Επιλέξτε πελάτη.') || !need(numOr(f.sessions, 0) > 0, 'Ορίστε αριθμό συνεδριών.')) return;
  const id = uid(), ses = numOr(f.sessions, 0);
  put('packages', id, {clientId:f.clientId, name:f.name || 'Πακέτο', sessions:ses, price:numOr(f.price, 0), startDate:f.startDate || today(), usedOffset:numOr(f.usedOffset, 0), demo:false});
  if(f.payNow && numOr(f.amount, 0) > 0) put('payments', uid(), {clientId:f.clientId, date:f.startDate || today(), amount:numOr(f.amount, 0), method:f.method, note:f.name, packageId:id, demo:false});
  let room = ses - numOr(f.usedOffset, 0);
  appts(f.clientId).filter(a => a.status === 'scheduled' && !a.packageId && a.date >= (f.startDate || today())).forEach(a => { if(room-- > 0) patch('appointments', a.id, {packageId:id, fee:null}); });
  closeOv(); toast('Το πακέτο δημιουργήθηκε', 'box');
}

/* ---------------- payment ---------------- */
function mPay(cid){
  const body = '<div class="fields">' +
    fl('Πελάτης', clientSelect(cid), 'full') +
    '<div class="full" id="pbal"></div>' +
    fl('Ποσό (€)', '<input class="in" type="number" step="0.5" name="amount" autofocus>') +
    fl('Ημερομηνία', '<input class="in" type="date" name="date" value="' + today() + '">') +
    fl('Τρόπος', '<select class="in" name="method">' + METHODS.map(m => '<option>' + m + '</option>').join('') + '</select>') +
    fl('Περιγραφή', '<input class="in" type="text" name="note" placeholder="π.χ. 2η δόση πακέτου">') +
  '</div>';
  OV = 'pay';
  sheet('Νέα πληρωμή', body, '<span class="spacer"></span><button class="btn" data-act="close">Άκυρο</button><button class="btn pri" data-act="save-pay">Καταχώριση</button>', '');
  payBal(true);
}
function payBal(fill){
  const el = $('#pbal'); if(!el) return;
  const f = form(), c = client(f.clientId);
  if(!c){ el.innerHTML = ''; return; }
  const b = balance(c.id);
  el.innerHTML = '<div class="preview" style="background:' + (b > 0 ? 'var(--rose-dim);border-color:rgba(255,122,147,.22)' : '') + '"><div><span>Υπόλοιπο</span><b style="color:' + (b > 0 ? 'var(--rose)' : 'var(--mint)') + '">' + (b > 0 ? EUR2.format(b) + ' οφειλή' : b < 0 ? EUR2.format(-b) + ' προκαταβολή' : 'Εξοφλημένο') + '</b></div>' +
    '<div><span>Χρεώσεις</span><b>' + EUR.format(charges(c.id)) + '</b></div><div><span>Πληρωμές</span><b>' + EUR.format(paid(c.id)) + '</b></div></div>';
  const am = $('#ov [name="amount"]');
  if(fill && am && b > 0) am.value = b;
}
function savePay(){
  const f = form();
  if(!need(f.clientId, 'Επιλέξτε πελάτη.') || !need(numOr(f.amount, 0) > 0, 'Συμπληρώστε ποσό.')) return;
  put('payments', uid(), {clientId:f.clientId, date:f.date || today(), amount:numOr(f.amount, 0), method:f.method, note:f.note, packageId:null, demo:false});
  closeOv(); toast('Πληρωμή ' + EUR2.format(numOr(f.amount, 0)) + ' καταχωρίστηκε', 'euro');
}

/* ---------------- plan builder ---------------- */
function mPlan(plan, cid){
  S.draft = plan ? JSON.parse(JSON.stringify(plan)) : {id:uid(), clientId:cid || '', title:'Διατροφικό πλάνο', date:today(), targetKcal:null, meals:MEALS.map(n => ({name:n, items:[]})), notes:'', isTemplate:false, _new:true};
  if(!S.draft.meals || !S.draft.meals.length) S.draft.meals = MEALS.map(n => ({name:n, items:[]}));
  if(!plan && cid){ const c = client(cid), lm = lastM(cid); const k = c && lm ? targetK(c, lm.weight) : null; if(k) S.draft.targetKcal = k; }
  S.activeMeal = 0; S.foodQ = ''; S.foodCat = 'all';
  OV = 'plan';
  renderPlan();
}
function renderPlan(){
  const d = S.draft; if(!d) return;
  const scr = $('#ov .scrim'), top = scr ? scr.scrollTop : 0;
  const tpls = S.plans.filter(p => p.isTemplate);
  const c = client(d.clientId), lm = c ? lastM(c.id) : null, sug = c && lm ? targetK(c, lm.weight) : null;
  const body = '<div class="fields" style="grid-template-columns:1.3fr 1.3fr .8fr .8fr">' +
      fl('Πελάτης', clientSelect(d.clientId, 'clientId', true)) +
      fl('Τίτλος', '<input class="in" type="text" name="title" value="' + esc(d.title) + '">') +
      fl('Ημερομηνία', '<input class="in" type="date" name="date" value="' + esc(d.date) + '">') +
      fl('Στόχος kcal', '<input class="in" type="number" step="10" name="targetKcal" value="' + esc(d.targetKcal || '') + '" placeholder="' + (sug || 1800) + '">', '', sug && Number(d.targetKcal) !== sug ? '<a href="#" data-act="pb-sug" data-v="' + sug + '" style="color:var(--mint)">υπολογισμένος: ' + sug + '</a>' : '') +
    '</div>' +
    (d._new && tpls.length ? '<div class="row wrap" style="gap:6px"><span class="faint" style="font-size:12.5px;margin-inline-end:4px">Ξεκινήστε από πρότυπο:</span>' + tpls.map(t => '<button class="btn sm" data-act="pb-tpl" data-id="' + t.id + '">' + ic('file') + esc(t.title) + '</button>').join('') + '</div>' : '') +
    '<div class="pb"><div class="col" style="gap:12px" id="pb-meals">' + d.meals.map((m, mi) => mealBlock(m, mi)).join('') +
      '<label class="f"><span>Οδηγίες προς τον πελάτη</span><textarea class="in" name="notes" placeholder="Νερό, αλκοόλ, ελεύθερο γεύμα, συμπληρώματα…">' + esc(d.notes || '') + '</textarea></label></div>' +
    '<div class="pb-side"><section class="card" id="pb-sum">' + planSummary() + '</section>' +
      '<section class="card"><div class="card-h"><h3>Βάση τροφίμων</h3><span class="sub">προσθήκη σε: <b style="color:var(--mint)">' + esc((d.meals[S.activeMeal] || {}).name || '') + '</b></span></div><div class="card-b col" style="gap:10px">' +
        '<label class="search" style="min-width:0">' + ic('search') + '<input id="fq" type="text" placeholder="Αναζήτηση τροφίμου…" value="' + esc(S.foodQ) + '" autocomplete="off" aria-label="Αναζήτηση τροφίμου"></label>' +
        '<div class="cats">' + Object.keys(CATS).map(k => '<button data-act="pb-cat" data-c="' + k + '" aria-pressed="' + (S.foodCat === k) + '">' + CATS[k] + '</button>').join('') + '</div>' +
        '<div class="food-list" id="flist">' + foodList() + '</div>' +
      '</div></section></div></div>';
  const isNew = d._new;
  $('#ov').innerHTML = '<div class="scrim" data-scrim="1"><div class="sheet wide" role="dialog" aria-modal="true" aria-label="Διατροφικό πλάνο">' +
    '<div class="sheet-h"><div style="flex:1;min-width:0"><h3>' + (d.isTemplate ? 'Πρότυπο πλάνο' : isNew ? 'Νέο διατροφικό πλάνο' : 'Διατροφικό πλάνο') + '</h3><div class="faint" style="font-size:12.5px;margin-top:2px">' + (c ? esc(c.name) + (lm ? ' · ' + N1.format(lm.weight) + ' kg' : '') + ' · ' + esc(c.goal || '') : d.isTemplate ? 'Χωρίς πελάτη' : 'Επιλέξτε πελάτη') + '</div></div><button class="btn ghost icon" data-act="close" aria-label="Κλείσιμο">' + ic('x') + '</button></div>' +
    '<div class="sheet-b">' + body + '</div>' +
    '<div class="sheet-f"><button class="btn" data-act="pb-copy">' + ic('copy') + '<span class="hide-sm">Αντιγραφή κειμένου</span></button>' + (S.dl ? '<button class="btn" data-act="pb-dl">' + ic('down') + '<span class="hide-sm">Λήψη για τον πελάτη</span></button>' : '') +
      (!isNew && S.canWrite ? '<button class="btn danger" data-act="pb-del-plan" data-step="0">' + ic('trash') + '</button>' : '') +
      '<span class="spacer"></span>' + (S.canWrite ? (d.isTemplate ? '' : '<button class="btn" data-act="pb-save-tpl">Αποθήκευση ως πρότυπο</button>') + '<button class="btn pri" data-act="pb-save">' + ic('check') + 'Αποθήκευση</button>' : '') + '</div>' +
    '</div></div>';
  const s = $('#ov .scrim'); if(s) s.scrollTop = top;
}
function mealBlock(m, mi){
  const act = mi === S.activeMeal;
  return '<div class="meal' + (act ? ' active' : '') + '"><div class="meal-h" data-act="pb-meal" data-m="' + mi + '">' +
      '<span class="chip ' + (act ? 'mint' : '') + '" style="width:24px;padding:0;justify-content:center">' + (mi + 1) + '</span><b>' + esc(m.name) + '</b>' +
      (act ? '<span class="faint" style="font-size:11.5px">· τα τρόφιμα από τη βάση μπαίνουν εδώ</span>' : '') +
      '<span class="kc" data-mk="' + mi + '">' + mealK(m) + ' kcal</span>' +
      '<button class="btn ghost sm" data-act="pb-custom" data-m="' + mi + '" title="Προσαρμοσμένο τρόφιμο">' + ic('plus') + '<span class="hide-sm">Δικό σας</span></button></div>' +
    ((m.items || []).length ? '<div class="it head"><span>Τρόφιμο</span><span style="text-align:end">Ποσότητα</span><span style="text-align:end">kcal</span><span style="text-align:end">Π</span><span style="text-align:end">Υ</span><span style="text-align:end">Λ</span><span></span></div>' : '') +
    (m.items || []).map((it, ii) => itemRow(it, mi, ii)).join('') +
    (!(m.items || []).length ? '<div class="faint" style="padding:4px 14px 14px;font-size:12.5px">' + (act ? 'Επιλέξτε τρόφιμα από τη βάση δεξιά.' : 'Κενό — πατήστε για να προσθέσετε τρόφιμα.') + '</div>' : '') +
  '</div>';
}
function itemRow(it, mi, ii){
  const k = mi + ':' + ii;
  if(!it.base){
    return '<div class="it" data-row="' + k + '"><span class="fn"><input class="mini-in" style="text-align:start;font-family:var(--sans)" data-cf="' + k + ':food" value="' + esc(it.food || '') + '" placeholder="Τρόφιμο"></span>' +
      '<label class="qty"><input type="text" data-cf="' + k + ':qtyText" value="' + esc(it.qtyText || '') + '" placeholder="1 μερίδα" style="text-align:start;font-family:var(--sans)"></label>' +
      ['kcal','p','c','f'].map(x => '<input class="mini-in" type="number" data-cf="' + k + ':' + x + '" value="' + esc(it[x] == null ? '' : it[x]) + '" aria-label="' + x + '">').join('') +
      '<button class="btn ghost sm icon" data-act="pb-rm" data-k="' + k + '" aria-label="Αφαίρεση">' + ic('x') + '</button></div>';
  }
  return '<div class="it" data-row="' + k + '"><span class="fn" title="' + esc(it.food) + '">' + esc(it.food) + '</span>' +
    '<label class="qty"><input type="number" min="0" step="' + (it.per === 1 ? '0.5' : '5') + '" data-q="' + k + '" value="' + esc(it.qty) + '" aria-label="Ποσότητα ' + esc(it.food) + '"><span>' + esc(it.unit) + '</span></label>' +
    '<span class="m" data-v="kcal">' + it.kcal + '</span><span class="m" data-v="p">' + N1.format(it.p) + '</span><span class="m" data-v="c">' + N1.format(it.c) + '</span><span class="m" data-v="f">' + N1.format(it.f) + '</span>' +
    '<button class="btn ghost sm icon" data-act="pb-rm" data-k="' + k + '" aria-label="Αφαίρεση">' + ic('x') + '</button></div>';
}
function planSummary(){
  const d = S.draft, t = planTot(d), tk = Number(d.targetKcal) || 0;
  const c = client(d.clientId), lm = c ? lastM(c.id) : null, w = lm ? lm.weight : null;
  const kp = t.p * 4, kc = t.c * 4, kf = t.f * 9, kt = kp + kc + kf || 1;
  const pct = tk ? t.k / tk : 0, dev = tk ? t.k - tk : null;
  const col = dev == null ? 'var(--mint)' : Math.abs(dev) <= 80 ? 'var(--mint)' : dev > 0 ? 'var(--amber)' : 'var(--sky)';
  return '<div class="card-b col" style="gap:14px">' +
    '<div class="row" style="align-items:flex-end"><div><div class="eyebrow">Σύνολο ημέρας</div><div style="font-size:32px;font-weight:750;letter-spacing:-.04em;line-height:1.1;font-variant-numeric:tabular-nums">' + N0.format(t.k) + '<small class="faint" style="font-size:14px;font-weight:600"> kcal</small></div></div><span class="spacer"></span>' +
      (dev != null ? chip((dev > 0 ? '+' : '') + dev + ' από ' + N0.format(tk), Math.abs(dev) <= 80 ? 'mint' : 'amber') : '') + '</div>' +
    (tk ? pbar(Math.min(pct, 1), col) : '') +
    '<div class="row" style="gap:16px">' + donut([{v:kp, color:'var(--mint)', l:'Πρωτεΐνη'}, {v:kc, color:'var(--sky)', l:'Υδατάνθρακες'}, {v:kf, color:'var(--violet)', l:'Λίπος'}], 96,
        '<div class="mono" style="font-size:11px;color:var(--text-2)">P/C/F</div>') +
      '<div class="col" style="gap:7px;flex:1;font-size:12.5px">' +
        macroLine('Πρωτεΐνη', t.p, 'var(--mint)', Math.round(kp / kt * 100) + '%' + (w ? ' · ' + N1.format(t.p / w) + '/kg' : '')) +
        macroLine('Υδατάνθρακες', t.c, 'var(--sky)', Math.round(kc / kt * 100) + '%') +
        macroLine('Λίπος', t.f, 'var(--violet)', Math.round(kf / kt * 100) + '%') + '</div></div>' +
    '<div class="col" style="gap:6px;padding-top:12px;border-top:1px solid var(--line)">' + d.meals.map(m => { const k = mealK(m); return '<div class="row" style="font-size:12px"><span class="muted" style="width:98px">' + esc(m.name) + '</span><div style="flex:1">' + pbar(t.k ? k / t.k : 0, 'var(--mint)') + '</div><span class="mono faint" style="width:66px;text-align:end;font-size:11px">' + k + ' · ' + (t.k ? Math.round(k / t.k * 100) : 0) + '%</span></div>'; }).join('') + '</div>' +
  '</div>';
}
function foodList(){
  const q = S.foodQ.trim().toLowerCase();
  const list = FOODS.filter(f => (S.foodCat === 'all' || f.cat === S.foodCat) && (!q || f.n.toLowerCase().includes(q))).slice(0, 80);
  return list.length ? list.map(f => '<button class="food" data-act="pb-add" data-f="' + esc(f.n) + '"><span style="min-width:0"><b>' + esc(f.n) + '</b><span>' + f.kcal + ' kcal / ' + f.per + ' ' + esc(f.unit) + ' · Π ' + f.p + ' · Υ ' + f.c + ' · Λ ' + f.f + '</span></span><span class="plus">' + ic('plus', 'width="14" height="14"') + '</span></button>').join('')
    : '<div class="faint" style="padding:14px 6px;font-size:12.5px">Δεν βρέθηκε. Χρησιμοποιήστε «Δικό σας» στο γεύμα για προσαρμοσμένο τρόφιμο.</div>';
}
function syncPlanFields(){
  const d = S.draft; if(!d) return;
  const g = n => { const e = $('#ov [name="' + n + '"]'); return e ? e.value : undefined; };
  if(g('clientId') !== undefined) d.clientId = g('clientId');
  if(g('title') !== undefined) d.title = g('title');
  if(g('date') !== undefined) d.date = g('date');
  if(g('targetKcal') !== undefined) d.targetKcal = numOr(g('targetKcal'), null);
  if(g('notes') !== undefined) d.notes = g('notes');
}
function refreshPlanLive(mi){
  const sm = $('#pb-sum'); if(sm) sm.innerHTML = planSummary();
  const mk = $('#ov [data-mk="' + mi + '"]'); if(mk) mk.textContent = mealK(S.draft.meals[mi]) + ' kcal';
}
function planText(d){
  const c = client(d.clientId), t = planTot(d);
  let s = 'ΔΙΑΤΡΟΦΙΚΟ ΠΛΑΝΟ' + (c ? ' — ' + c.name : '') + '\n' + fmtD(d.date) + ' · ' + N0.format(t.k) + ' kcal (Π ' + t.p + ' g · Υ ' + t.c + ' g · Λ ' + t.f + ' g)\n';
  d.meals.forEach(m => { if(!(m.items || []).length) return; s += '\n' + m.name.toUpperCase() + '\n'; m.items.forEach(i => { s += '• ' + i.food + ' — ' + (i.base ? N0.format(i.qty) + ' ' + i.unit : (i.qtyText || '1 μερίδα')) + '\n'; }); });
  if(d.notes) s += '\nΟΔΗΓΙΕΣ\n' + d.notes + '\n';
  s += '\n' + cfg().practiceName;
  return s;
}
function planHtml(d){
  const c = client(d.clientId), t = planTot(d);
  const rows = d.meals.filter(m => (m.items || []).length).map(m => '<section><h2>' + esc(m.name) + '<span>' + mealK(m) + ' kcal</span></h2><ul>' +
    m.items.map(i => '<li><span>' + esc(i.food) + '</span><em>' + esc(i.base ? N0.format(i.qty) + ' ' + i.unit : (i.qtyText || '1 μερίδα')) + '</em></li>').join('') + '</ul></section>').join('');
  return '<!doctype html><html lang="el"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(d.title) + (c ? ' — ' + esc(c.name) : '') + '</title>' +
    '<style>body{font-family:"Segoe UI",Helvetica,Arial,sans-serif;color:#14201c;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.5}' +
    'header{border-bottom:3px solid #1fb57a;padding-bottom:16px;margin-bottom:24px}header small{letter-spacing:.14em;text-transform:uppercase;color:#1fb57a;font-weight:700;font-size:11px}' +
    'h1{margin:6px 0 4px;font-size:28px}header p{margin:0;color:#56655f}.m{display:flex;gap:22px;margin-top:14px}.m div b{display:block;font-size:20px}.m div span{font-size:12px;color:#56655f}' +
    'section{margin-bottom:20px;break-inside:avoid}h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;display:flex;justify-content:space-between;border-bottom:1px solid #dfe6e2;padding-bottom:6px;margin:0 0 8px}h2 span{font-weight:400;color:#56655f;letter-spacing:0;text-transform:none;font-size:13px}' +
    'ul{list-style:none;margin:0;padding:0}li{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dotted #e3e9e6}li em{font-style:normal;color:#56655f}' +
    '.n{background:#effaf5;border-left:3px solid #1fb57a;padding:12px 16px;border-radius:6px;white-space:pre-wrap}footer{margin-top:32px;font-size:12px;color:#7a8a84}</style></head><body>' +
    '<header><small>' + esc(cfg().practiceName) + '</small><h1>' + esc(d.title) + '</h1><p>' + (c ? esc(c.name) + ' · ' : '') + fmtD(d.date) + '</p>' +
    '<div class="m"><div><b>' + N0.format(t.k) + '</b><span>kcal / ημέρα</span></div><div><b>' + t.p + ' g</b><span>πρωτεΐνη</span></div><div><b>' + t.c + ' g</b><span>υδατάνθρακες</span></div><div><b>' + t.f + ' g</b><span>λίπος</span></div></div></header>' +
    rows + (d.notes ? '<h2>Οδηγίες</h2><div class="n">' + esc(d.notes) + '</div>' : '') +
    '<footer>Εξατομικευμένο πλάνο — μην το τροποποιείτε χωρίς συνεννόηση με τον διαιτολόγο σας.</footer></body></html>';
}
function savePlan(asTpl){
  syncPlanFields();
  const d = S.draft;
  if(!asTpl && !d.isTemplate && !need(d.clientId, 'Επιλέξτε πελάτη ή αποθηκεύστε ως πρότυπο.')) return;
  if(!need(planTot(d).k > 0, 'Προσθέστε τουλάχιστον ένα τρόφιμο.')) return;
  const data = {clientId:asTpl ? '' : d.clientId, title:d.title || 'Διατροφικό πλάνο', date:d.date || today(), targetKcal:d.targetKcal || null,
    meals:d.meals.map(m => ({name:m.name, items:(m.items || []).filter(i => i.food)})), notes:d.notes || '', isTemplate:asTpl ? true : !!d.isTemplate, demo:false};
  put('plans', asTpl && !d.isTemplate ? uid() : d.id, data);
  closeOv(); toast(asTpl ? 'Αποθηκεύτηκε ως πρότυπο' : 'Το πλάνο αποθηκεύτηκε', 'plan');
}

/* ---------------- command palette ---------------- */
const PAL = {q:'', i:0, items:[]};
function openPalette(){
  OV = 'pal'; PAL.q = ''; PAL.i = 0;
  $('#ov').innerHTML = '<div class="scrim" data-scrim="1"><div class="sheet pal" role="dialog" aria-modal="true" aria-label="Αναζήτηση και εντολές">' +
    '<div class="pal-in">' + ic('search') + '<input id="palq" type="text" placeholder="Αναζήτηση πελάτη ή εντολής…" autocomplete="off" aria-label="Αναζήτηση"><kbd>Esc</kbd></div>' +
    '<div class="pal-list" id="pall" role="listbox"></div>' +
    '<div class="pal-f"><span><kbd>↑</kbd> <kbd>↓</kbd> επιλογή</span><span><kbd>↵</kbd> άνοιγμα</span><span class="spacer"></span><span>' + S.clients.length + ' πελάτες</span></div></div></div>';
  renderPal(); setTimeout(() => { const i = $('#palq'); if(i) i.focus(); }, 20);
}
function palItems(){
  const q = PAL.q.trim().toLowerCase();
  const acts = [
    {g:'Ενέργειες', l:'Νέος πελάτης', i:'plus', run:() => mClient(null)},
    {g:'Ενέργειες', l:'Νέο ραντεβού', i:'cal', run:() => mAppt({})},
    {g:'Ενέργειες', l:'Νέα μέτρηση', i:'scale', run:() => mMeas('')},
    {g:'Ενέργειες', l:'Νέο έξοδο', i:'receipt', run:() => mExp(null)},
    {g:'Ενέργειες', l:'Νέα πληρωμή', i:'euro', run:() => mPay('')},
    {g:'Ενέργειες', l:'Νέο πακέτο', i:'box', run:() => mPkg('')}
  ].filter(() => S.canWrite);
  const go = NAV.map(n => ({g:'Μετάβαση', l:n.l, i:n.i, hint:n.key, run:() => { closeOv(); goto(n.k); }}));
  let cl = S.clients.slice();
  if(q) cl = cl.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) || (c.tags || []).join(' ').toLowerCase().includes(q));
  else cl = cl.filter(c => c.status !== 'inactive').sort((a, b) => String(lastVisit(b.id)).localeCompare(String(lastVisit(a.id)))).slice(0, 5);
  const cs = cl.slice(0, 8).map(c => { const na = nextA(c.id); return {g:q ? 'Πελάτες' : 'Πρόσφατοι πελάτες', l:c.name, av:c.name, hint:na ? rel(na.date) + ' ' + na.time : (c.goal || ''), run:() => { closeOv(); openClient(c.id); }}; });
  const f = x => !q || x.l.toLowerCase().includes(q);
  return q ? cs.concat(acts.filter(f), go.filter(f)) : acts.slice(0, 4).concat(cs, go);
}
function renderPal(){
  PAL.items = palItems(); if(PAL.i >= PAL.items.length) PAL.i = Math.max(0, PAL.items.length - 1);
  let g = '', h = '';
  PAL.items.forEach((x, i) => {
    if(x.g !== g){ g = x.g; h += '<div class="pal-g">' + esc(g) + '</div>'; }
    h += '<button class="pal-i" role="option" data-act="pal" data-i="' + i + '" aria-selected="' + (i === PAL.i) + '">' + (x.av ? av(x.av, 'sm') : ic(x.i)) + '<span>' + esc(x.l) + '</span>' + (x.hint ? '<span class="hint">' + (x.g === 'Μετάβαση' ? '<kbd>' + esc(x.hint) + '</kbd>' : esc(x.hint)) + '</span>' : '') + '</button>';
  });
  $('#pall').innerHTML = h || '<div class="empty" style="padding:26px">Κανένα αποτέλεσμα για «' + esc(PAL.q) + '»</div>';
  const sel = $('#pall [aria-selected="true"]'); if(sel) sel.scrollIntoView({block:'nearest'});
}

/* ---------------- navigation ---------------- */
function goto(v){ S.view = v; S.cid = null; render(); window.scrollTo(0, 0); }
function openClient(id){ S.view = 'client'; S.cid = id; S.ctab = 'overview'; S.metric = 'weight'; render(); window.scrollTo(0, 0); }

/* two-step confirm */
function confirmStep(el, label){
  if(el.dataset.step === '1') return true;
  el.dataset.step = '1'; el.innerHTML = ic('alert') + (label || 'Σίγουρα;');
  setTimeout(() => { if(el.isConnected && el.dataset.step === '1'){ el.dataset.step = '0'; el.innerHTML = ic('trash') + (el.dataset.orig || 'Διαγραφή'); } }, 3500);
  return false;
}

async function wipeDemo(){
  const cols = ['measurements','appointments','packages','payments','plans','expenses','clients'];
  const jobs = []; cols.forEach(k => S[k].filter(x => x.demo).forEach(x => jobs.push([k, x.id])));
  toast('Διαγραφή ' + jobs.length + ' εγγραφών…', 'trash');
  cols.forEach(k => S[k] = S[k].filter(x => !x.demo)); dirty = true; render();
  if(!S.db) return;
  let fail = 0;
  const run = async j => { for(let t = 0; t < 3; t++){ try{ await S.db.doc(j[0] + '/' + j[1]).delete(); return; }catch(e){ if(e && e.code === 'resource_exhausted') await new Promise(r => setTimeout(r, 800 * (t + 1))); else if(t === 2){ fail++; return; } } } fail++; };
  for(let i = 0; i < jobs.length; i += 4) await Promise.all(jobs.slice(i, i + 4).map(run));
  toast(fail ? 'Ολοκληρώθηκε με ' + fail + ' αποτυχίες — ξαναδοκιμάστε' : 'Τα δεδομένα επίδειξης διαγράφηκαν', fail ? 'alert' : 'check');
}

/* ---------------- actions ---------------- */
const A = {
  go: el => goto(el.dataset.v),
  open: el => { closeOv(); openClient(el.dataset.id); },
  close: () => closeOv(),
  palette: () => openPalette(),
  pal: el => { const x = PAL.items[+el.dataset.i]; if(x) x.run(); },
  filter: el => { S.filter = el.dataset.f; render(); },
  ctab: el => { S.ctab = el.dataset.t; render(); },
  metric: el => { S.metric = el.dataset.m; render(); },
  ptab: el => { S.ptab = el.dataset.t; render(); },
  fin: el => { S.finRange = +el.dataset.n; render(); },
  week: el => { const n = +el.dataset.n; S.week = n === 0 ? monday(today()) : addD(S.week, n * 7); S.calDay = n === 0 ? today() : S.week; render(); },
  calday: el => { S.calDay = el.dataset.d; render(); },
  slot: (el, e) => { if(!S.canWrite) return; const r = el.getBoundingClientRect(); const m = H0 * 60 + Math.max(0, Math.floor((e.clientY - r.top) / HH * 4)) * 15; mAppt({date:el.dataset.d, time:tstr(Math.min(m, (H1 * 60) - 30))}); },
  copy: el => { const t = el.dataset.t; const ok = () => toast('Αντιγράφηκε: ' + t, 'copy'); try{ navigator.clipboard.writeText(t).then(ok, () => toast(t, 'copy')); }catch(e){ toast(t, 'copy'); } },
  'new-client': () => mClient(null),
  'edit-client': el => mClient(client(el.dataset.id)),
  'save-client': el => saveClient(el.dataset.id),
  'del-client': el => { el.dataset.orig = 'Διαγραφή'; if(confirmStep(el, 'Διαγραφή με όλο το ιστορικό;')) deleteClient(el.dataset.id); },
  'new-meas': el => mMeas(el.dataset.cid || S.cid || ''),
  'save-meas': () => saveMeas(),
  'new-appt': el => mAppt({cid:el.dataset.cid || (S.view === 'client' ? S.cid : ''), date:S.view === 'calendar' ? (S.week === monday(today()) ? today() : S.week) : undefined}),
  'edit-appt': el => mAppt({id:el.dataset.id}),
  'save-appt': el => saveAppt(el.dataset.id),
  appt: el => mApptDetail(el.dataset.id),
  status: el => { setStatus(el.dataset.id, el.dataset.s); if(el.dataset.keep) mApptDetail(el.dataset.id); },
  'del-appt': el => { el.dataset.orig = 'Διαγραφή'; if(confirmStep(el)){ del('appointments', el.dataset.id); closeOv(); toast('Το ραντεβού διαγράφηκε', 'trash'); } },
  'new-pkg': el => mPkg(el.dataset.cid || (S.view === 'client' ? S.cid : '')),
  'save-pkg': () => savePkg(),
  'new-pay': el => mPay(el.dataset.cid || (S.view === 'client' ? S.cid : '')),
  'save-pay': () => savePay(),
  del: el => { if(el.dataset.step !== '1'){ el.dataset.step = '1'; el.classList.add('danger'); el.style.width = 'auto'; el.innerHTML = ic('trash') + ' Σίγουρα;'; setTimeout(() => { if(el.isConnected) render(); }, 3000); return; } del(el.dataset.col, el.dataset.id); toast('Διαγράφηκε', 'trash'); },
  'new-plan': el => mPlan(null, el.dataset.cid || (S.view === 'client' ? S.cid : '')),
  'edit-plan': el => { const p = S.plans.find(x => x.id === el.dataset.id); if(p) mPlan(p); },
  'pb-meal': (el, e) => { if(e.target.closest('[data-act="pb-custom"]')) return; syncPlanFields(); S.activeMeal = +el.dataset.m; renderPlan(); },
  'pb-add': el => { syncPlanFields(); const f = FOODMAP[el.dataset.f]; if(!f) return; S.draft.meals[S.activeMeal].items.push(itemFromFood(f)); renderPlan(); const r = $('#ov .meal.active .it:last-of-type input[data-q]'); if(r){ r.focus(); r.select(); } },
  'pb-custom': el => { syncPlanFields(); const mi = +el.dataset.m; S.activeMeal = mi; S.draft.meals[mi].items.push({food:'', qtyText:'', kcal:null, p:null, c:null, f:null, base:null}); renderPlan(); const r = $('#ov .meal.active .it:last-of-type input'); if(r) r.focus(); },
  'pb-rm': el => { syncPlanFields(); const k = el.dataset.k.split(':').map(Number); S.draft.meals[k[0]].items.splice(k[1], 1); renderPlan(); },
  'pb-cat': el => { S.foodCat = el.dataset.c; $$('#ov .cats button').forEach(b => b.setAttribute('aria-pressed', b.dataset.c === S.foodCat)); $('#flist').innerHTML = foodList(); },
  'pb-sug': (el, e) => { e.preventDefault(); syncPlanFields(); S.draft.targetKcal = +el.dataset.v; renderPlan(); },
  'pb-tpl': el => { syncPlanFields(); const t = S.plans.find(x => x.id === el.dataset.id); if(!t) return; S.draft.meals = JSON.parse(JSON.stringify(t.meals)); if(!S.draft.notes) S.draft.notes = t.notes || ''; if(S.draft.title === 'Διατροφικό πλάνο') S.draft.title = t.title; if(!S.draft.targetKcal) S.draft.targetKcal = t.targetKcal; renderPlan(); toast('Φορτώθηκε το πρότυπο', 'file'); },
  'pb-save': () => savePlan(false),
  'pb-save-tpl': () => savePlan(true),
  'pb-del-plan': el => { el.dataset.orig = ''; if(confirmStep(el, 'Διαγραφή;')){ del('plans', S.draft.id); closeOv(); toast('Το πλάνο διαγράφηκε', 'trash'); } },
  'pb-copy': () => { syncPlanFields(); const t = planText(S.draft); try{ navigator.clipboard.writeText(t).then(() => toast('Το πλάνο αντιγράφηκε — επικολλήστε το σε Viber ή email', 'copy'), () => toast('Η αντιγραφή δεν επιτρέπεται εδώ', 'alert')); }catch(e){ toast('Η αντιγραφή δεν επιτρέπεται εδώ', 'alert'); } },
  'pb-dl': async () => {
    syncPlanFields(); if(!S.dl) return;
    const c = client(S.draft.clientId);
    try{ await S.dl.save({filename:'Πλάνο ' + (c ? c.name + ' ' : '') + S.draft.date + '.html', data:planHtml(S.draft)}); toast('Το αρχείο αποθηκεύτηκε', 'down'); }
    catch(e){ if(e && e.code !== 'declined') toast('Η λήψη δεν είναι διαθέσιμη εδώ', 'alert'); }
  },
  'save-settings': () => {
    const s = cfg();
    const presets = $$('.preset').map(r => ({name:$('[data-k="name"]', r).value.trim(), sessions:numOr($('[data-k="sessions"]', r).value, 0), price:numOr($('[data-k="price"]', r).value, 0)})).filter(p => p.name && p.sessions > 0);
    put('settings', 'main', {practiceName:($('#set-name') || {}).value || s.practiceName, sessionPrice:numOr(($('#set-price') || {}).value, s.sessionPrice), firstVisitPrice:numOr(($('#set-first') || {}).value, s.firstVisitPrice), presets, financePin:s.financePin || null});
    toast('Οι ρυθμίσεις αποθηκεύτηκαν', 'gear');
  },
  'preset-add': () => { const box = $('#presets'); const rows = $$('.preset'); const div = document.createElement('div'); div.innerHTML = presetRow({name:'', sessions:4, price:0}, rows.length); box.insertBefore(div.firstChild, box.lastElementChild); },
  'preset-del': el => { const r = el.closest('.preset'); if(r) r.remove(); },
  'new-exp': () => mExp(null),
  'edit-exp': el => { const e = S.expenses.find(x => x.id === el.dataset.id); if(e) mExp(e); },
  'save-exp': el => saveExp(el.dataset.id),
  'del-exp': el => { el.dataset.orig = 'Διαγραφή'; if(confirmStep(el)){ del('expenses', el.dataset.id); closeOv(); toast('Το έξοδο διαγράφηκε', 'trash'); } },
  'exp-filter': el => { S.expFilter = S.expFilter === el.dataset.c && el.dataset.c !== 'all' ? 'all' : el.dataset.c; render(); },
  'exp-recurring': () => copyRecurring(),
  'rep-range': el => { S.repRange = el.dataset.r; render(); },
  'rep-csv': async () => {
    if(!S.dl) return;
    try{ await S.dl.save({filename:'NutriFlow αναφορά ' + repLabel() + '.csv', data:reportCsv()}); toast('Η αναφορά αποθηκεύτηκε', 'down'); }
    catch(e){ if(e && e.code !== 'declined') toast('Η λήψη δεν είναι διαθέσιμη εδώ', 'alert'); }
  },
  lock: () => { S.finUnlocked = false; render(); toast('Τα οικονομικά κλειδώθηκαν', 'lock'); },
  'pin-off': el => { el.dataset.orig = 'Απενεργοποίηση κλειδώματος'; if(confirmStep(el, 'Σίγουρα;')){ const s = clean(cfg()); s.financePin = null; put('settings', 'main', s); toast('Το κλείδωμα απενεργοποιήθηκε', 'unlock'); } },
  wipe: el => { el.dataset.orig = 'Διαγραφή δεδομένων επίδειξης'; if(confirmStep(el, 'Σίγουρα; Διαγράφονται όλα τα δείγματα')) wipeDemo(); }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if(!el){
    if(e.target.matches && e.target.matches('.scrim')) closeOv();
    return;
  }
  const fn = A[el.dataset.act];
  if(fn){ if(el.tagName === 'A') e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if(t.id === 'cq'){ S.q = t.value; render(); return; }
  if(t.id === 'payq'){ S.paySearch = t.value; render(); return; }
  if(t.id === 'expq'){ S.expQ = t.value; render(); return; }
  if(t.id === 'palq'){ PAL.q = t.value; PAL.i = 0; renderPal(); return; }
  if(t.id === 'fq'){ S.foodQ = t.value; $('#flist').innerHTML = foodList(); return; }
  if(OV === 'meas'){ measPreview(); return; }
  if(OV === 'appt'){ if(t.name === 'date' || t.name === 'time' || t.name === 'duration') apptConflict(); return; }
  if(OV === 'plan' && S.draft){
    if(t.dataset.q){
      const k = t.dataset.q.split(':').map(Number), it = S.draft.meals[k[0]].items[k[1]];
      it.qty = Math.max(0, numOr(t.value, 0)); scaleItem(it);
      const row = t.closest('.it');
      if(row){ $('[data-v="kcal"]', row).textContent = it.kcal; ['p','c','f'].forEach(x => $('[data-v="' + x + '"]', row).textContent = N1.format(it[x])); }
      refreshPlanLive(k[0]); return;
    }
    if(t.dataset.cf){
      const k = t.dataset.cf.split(':'), it = S.draft.meals[+k[0]].items[+k[1]];
      it[k[2]] = (k[2] === 'food' || k[2] === 'qtyText') ? t.value : numOr(t.value, null);
      refreshPlanLive(+k[0]); return;
    }
    if(t.name === 'targetKcal'){ S.draft.targetKcal = numOr(t.value, null); const sm = $('#pb-sum'); if(sm) sm.innerHTML = planSummary(); }
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if(t.id === 'csort'){ S.sort = t.value; render(); return; }
  if(OV === 'appt'){
    if(t.name === 'type'){ const d = $('#ov [name="duration"]'); if(d) d.value = TYPE_DUR[t.value] || 45; apptConflict(); }
    if(t.name === 'clientId') apptBilling();
    return;
  }
  if(OV === 'meas' && t.name === 'clientId'){ measPreview(); return; }
  if(OV === 'pay' && t.name === 'clientId'){ payBal(true); return; }
  if(OV === 'pkg' && t.name === 'preset'){
    const p = cfg().presets[+t.value]; if(!p) return;
    const set = (n, v) => { const x = $('#ov [name="' + n + '"]'); if(x) x.value = v; };
    set('name', p.name); set('sessions', p.sessions); set('price', p.price); set('amount', p.price); return;
  }
  if(OV === 'pkg' && t.name === 'price'){ const a = $('#ov [name="amount"]'); if(a) a.value = t.value; return; }
  if(OV === 'plan' && t.name === 'clientId'){ syncPlanFields(); renderPlan(); }
});
document.addEventListener('keydown', e => {
  const typing = e.target.closest && e.target.closest('input,textarea,select,[contenteditable]');
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); OV === 'pal' ? closeOv() : openPalette(); return; }
  if(e.key === 'Escape' && OV){ e.preventDefault(); closeOv(); return; }
  if(OV === 'pal'){
    if(e.key === 'ArrowDown'){ e.preventDefault(); PAL.i = Math.min(PAL.items.length - 1, PAL.i + 1); renderPal(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); PAL.i = Math.max(0, PAL.i - 1); renderPal(); }
    else if(e.key === 'Enter'){ e.preventDefault(); const x = PAL.items[PAL.i]; if(x) x.run(); }
    return;
  }
  if(e.key === 'Enter' && OV && OV !== 'plan' && typing && e.target.tagName === 'INPUT'){ const b = $('#ov .sheet-f .btn.pri'); if(b){ e.preventDefault(); b.click(); } return; }
  if(typing || OV || e.metaKey || e.ctrlKey || e.altKey) return;
  if(e.key === '/'){ e.preventDefault(); openPalette(); return; }
  const n = NAV.find(x => x.key === e.key); if(n){ goto(n.k); return; }
  if(e.key.toLowerCase() === 'n' && S.canWrite){ e.preventDefault(); mClient(null); }
});
/* chart tooltips */
document.addEventListener('mousemove', e => {
  const tip = $('#tip');
  const t = e.target.closest && e.target.closest('[data-tip]');
  if(!t){ if(!tip.hidden) tip.hidden = true; return; }
  const parts = t.getAttribute('data-tip').split('|');
  tip.innerHTML = '<div class="faint" style="font-size:11px">' + esc(parts[0]) + '</div><b>' + esc(parts[1] || '') + '</b>';
  tip.hidden = false;
  const w = tip.offsetWidth, x = Math.min(window.innerWidth - w - 10, e.clientX + 14), y = Math.max(8, e.clientY - 46);
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
});
document.addEventListener('mouseleave', () => { $('#tip').hidden = true; });

/* ---------------- expenses ---------------- */
function mExp(e){
  e = e || {};
  const isNew = !e.id;
  const body = '<div class="fields">' +
    fl('Ποσό (€)', '<input class="in" type="number" step="0.01" name="amount" value="' + esc(e.amount == null ? '' : e.amount) + '" placeholder="0,00" autofocus>') +
    fl('Ημερομηνία', '<input class="in" type="date" name="date" value="' + esc(e.date || today()) + '">') +
    fl('Κατηγορία', '<select class="in" name="category">' + EXP_CATS.map(k => '<option' + ((e.category || 'Άλλο') === k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select>') +
    fl('Τρόπος πληρωμής', '<select class="in" name="method">' + EXP_METHODS.map(k => '<option' + (e.method === k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select>') +
    fl('Προμηθευτής / περιγραφή', '<input class="in" type="text" name="vendor" value="' + esc(e.vendor || '') + '" placeholder="π.χ. Ενοίκιο γραφείου, ΔΕΗ, Λογιστικό γραφείο">', 'full') +
    fl('Σημείωση', '<input class="in" type="text" name="note" value="' + esc(e.note || '') + '" placeholder="π.χ. αρ. παραστατικού">', 'full') +
    '<label class="row full" style="gap:10px;cursor:pointer;padding:11px 13px;border-radius:10px;border:1px solid var(--line-2);background:rgba(255,255,255,.02)"><input type="checkbox" name="recurring"' + (e.recurring ? ' checked' : '') + ' style="accent-color:#6FCBFF;width:16px;height:16px"><span><b style="font-weight:600">Πάγιο μηνιαίο έξοδο</b><div class="faint" style="font-size:12px">Ενοίκιο, εισφορές, λογιστής — καταχωρίζονται κάθε μήνα με ένα κλικ</div></span></label>' +
  '</div>';
  OV = 'exp';
  sheet(isNew ? 'Νέο έξοδο' : 'Επεξεργασία εξόδου', body, (!isNew && S.canWrite ? '<button class="btn danger" data-act="del-exp" data-id="' + e.id + '" data-step="0">' + ic('trash') + 'Διαγραφή</button>' : '') +
    '<span class="spacer"></span><button class="btn" data-act="close">Άκυρο</button><button class="btn pri" data-act="save-exp" data-id="' + (e.id || '') + '">' + (isNew ? 'Καταχώριση' : 'Αποθήκευση') + '</button>', '');
}
function saveExp(id){
  const f = form();
  if(!need(numOr(f.amount, 0) > 0, 'Συμπληρώστε ποσό.')) return;
  const prev = id ? S.expenses.find(x => x.id === id) : null;
  put('expenses', id || uid(), {date:f.date || today(), amount:Math.round(numOr(f.amount, 0) * 100) / 100, category:f.category, method:f.method, vendor:f.vendor, note:f.note, recurring:!!f.recurring, demo:prev ? !!prev.demo : false});
  closeOv(); toast(id ? 'Το έξοδο ενημερώθηκε' : 'Έξοδο ' + EUR2.format(numOr(f.amount, 0)) + ' καταχωρίστηκε', 'receipt');
}
function copyRecurring(){
  const t = today(), ms = monthsBack(2), prevKey = ms[0].key, curKey = ms[1].key;
  const key = e => (e.category + '|' + (e.vendor || '')).toLowerCase();
  const have = new Set(S.expenses.filter(e => String(e.date).slice(0, 7) === curKey).map(key));
  const todo = S.expenses.filter(e => e.recurring && String(e.date).slice(0, 7) === prevKey && !have.has(key(e)));
  if(!todo.length){ toast('Τα πάγια του μήνα έχουν ήδη καταχωριστεί', 'check'); return; }
  const cur = P(t), last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  todo.forEach(e => { const day = Math.min(last, parseInt(String(e.date).slice(8, 10), 10) || 1); put('expenses', uid(), {date:curKey + '-' + String(day).padStart(2, '0'), amount:e.amount, category:e.category, method:e.method, vendor:e.vendor, note:'', recurring:true, demo:false}); });
  toast('Καταχωρίστηκαν ' + todo.length + ' πάγια · ' + EUR.format(sum(todo, e => e.amount)), 'receipt');
}
document.addEventListener('submit', async e => {
  const f = e.target.closest && e.target.closest('[data-form]'); if(!f) return;
  e.preventDefault();
  if(f.dataset.form === 'unlock'){
    const v = ($('#pinin') || {}).value || '';
    if((await pinHash(v)) === cfg().financePin){ S.finUnlocked = true; render(); toast('Ξεκλειδώθηκε', 'unlock'); }
    else { const i = $('#pinin'); if(i){ i.value = ''; i.style.borderColor = 'var(--rose)'; i.focus(); } toast('Λάθος PIN', 'alert'); }
  }
  if(f.dataset.form === 'setpin'){
    const a = ($('#pin1') || {}).value || '', b = ($('#pin2') || {}).value || '';
    if(!/^\d{4,8}$/.test(a)){ toast('Το PIN πρέπει να έχει 4 έως 8 ψηφία.', 'alert'); return; }
    if(a !== b){ toast('Τα δύο PIN δεν ταιριάζουν.', 'alert'); return; }
    const s = clean(cfg()); s.financePin = await pinHash(a);
    S.finUnlocked = true; put('settings', 'main', s); toast('Το κλείδωμα οικονομικών ενεργοποιήθηκε', 'lock');
  }
});

/* ---------------- boot ---------------- */
let rq = 0;
function scheduleRender(){ if(rq) return; rq = requestAnimationFrame(() => { rq = 0; render(); }); }
function renderMe(){
  const m = S.me, el = $('#me');
  if(!m || !m.name){ el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = '<img alt="" src="' + esc(m.avatarUrl) + '"><div style="min-width:0"><b></b><span>' + (m.isOwner ? 'Διαχειριστής' : 'Μέλος ομάδας') + '</span></div>';
  el.querySelector('b').textContent = m.name;
}
(async function boot(){
  if(!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) $('#kbdk').textContent = 'Ctrl K';
  render();
  const use = n => { try{ return (window.claude && window.claude.use) ? window.claude.use(n).catch(() => null) : Promise.resolve(null); }catch(e){ return Promise.resolve(null); } };
  const r = await Promise.all([use('db'), use('user'), use('downloads')]);
  S.db = r[0]; S.user = r[1]; S.dl = r[2];
  if(S.user){
    S.user.me().then(m => { S.me = m; renderMe(); scheduleRender(); }).catch(() => {});
    S.user.can('data.write').then(w => { if(w === false){ S.canWrite = false; scheduleRender(); } }).catch(() => {});
  }
  if(!S.db){ S.loading = false; render(); return; }
  let pending = COLS.length;
  const done1 = () => { if(pending > 0){ pending--; if(pending === 0) S.loading = false; } };
  COLS.forEach(col => {
    try{
      S.db.collection(col).limit(1000).onSnapshot(snap => {
        S[col] = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
        dirty = true; done1(); scheduleRender();
      }, () => { done1(); scheduleRender(); });
    }catch(e){ done1(); }
  });
  setTimeout(() => { if(S.loading){ S.loading = false; render(); } }, 8000);
})();
